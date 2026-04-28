import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";
import {
    generateAccessToken,
    generateRefreshToken,
    REFRESH_TOKEN_TTL_SECONDS,
} from "../lib/utils.js";
import { revokeJti, remainingSecondsUntil } from "../lib/jtiBlocklist.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

// Refresh-cookie config. httpOnly so JS can't read it (XSS-safe). secure so it only
// rides HTTPS. sameSite:'none' is required for cross-origin (Vercel→Render); browsers
// reject sameSite:'none' without secure, so the pair is mandatory together. Path
// scopes the cookie to /api/auth/refresh so it doesn't ship on every request to the API.
const REFRESH_COOKIE_NAME = "refreshToken";
const refreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth/refresh",
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000, // ms
});

// Issue a fresh access+refresh pair and set the refresh cookie. Used by signup, login,
// OAuth callback, and refresh — anywhere we mint a new session.
const issueTokens = (res, userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    return accessToken;
};

export const signup = async (req,res) => {
    const {fullName,email,password,username} = req.body
    try {
     // Field presence + length checks already enforced by Zod (signupSchema in
     // middleware/validation.js) before this controller runs. Removing the duplicate
     // checks here so there's a single source of truth for input validation rules.
    const existingUser = await User.findOne({$or: [{email}, {username}]})

    if (existingUser) {
        if(existingUser.email === email) {
            return res.status(400).json({message: "Email already exists"});
        }
        if(existingUser.username === username) {
            return res.status(400).json({message: "Username already taken"});
        }
    }

    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password,salt)

    const newUser = new User({
        fullName,
        email,
        username,
        password: hashPassword
    })

    if(newUser){
        await newUser.save();
        const accessToken = issueTokens(res, newUser._id);

        res.status(201).json({
            accessToken,
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            username: newUser.username,
            profilePic: newUser.profilePic,
        })


    } else{
        res.status(400).json({message:"Invalid user data"});
    }
   } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({message:"internal server error"});
   }
};

export const login = async (req,res) => {
    const {email,password} = req.body
    try {

    const user = await User.findOne({email}).select("+password")
    // Account-enumeration defense: identical 401 + identical message regardless of
    // whether the user exists or the password is wrong. bcrypt.compare on the wrong-password
    // branch keeps timing roughly constant; we don't bcrypt the no-user branch though,
    // which leaks ~80ms — acceptable for junior scope, full timing equalization is M14.
    if(!user){
        return res.status(401).json({message: "Invalid credentials"});
    }

    if(user.isActive === false){
        // Same shape as invalid creds — don't tell an attacker the account exists but is banned.
        return res.status(401).json({message: "Invalid credentials"});
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect){
        return res.status(401).json({message: "Invalid credentials"});
    }

    const accessToken = issueTokens(res, user._id);

    res.status(200).json({
        accessToken,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic,
    });

   } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({message: "Internal server error"});
   }
};

// Logout actually has server-side effect now: revoke the access-token jti so any
// stolen copy is dead immediately, and clear the refresh cookie so the browser stops
// auto-attaching it on /auth/refresh calls.
export const logout = async (req,res) => {
   try {
    // protectRoute (which runs before this handler) stashed the jti + exp on req.
    if (req.tokenJti && req.tokenExp) {
        const remaining = remainingSecondsUntil(req.tokenExp);
        await revokeJti(req.tokenJti, remaining);
    }

    // Best-effort revoke of the refresh token too. We have to verify it to read the jti.
    const refreshCookie = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshCookie) {
        try {
            const decoded = jwt.verify(refreshCookie, process.env.JWT_SECRET);
            if (decoded.jti && decoded.exp) {
                await revokeJti(decoded.jti, remainingSecondsUntil(decoded.exp));
            }
        } catch {
            // Refresh cookie was invalid/expired anyway — nothing to revoke.
        }
    }

    // Clear the refresh cookie. Same options shape as set-time, otherwise the browser
    // won't recognize it as the same cookie and won't clear it.
    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/api/auth/refresh",
    });

    res.status(200).json({message: "Logged out successfully"});
   } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({message: "Internal server error"});
   }
};

// /api/auth/refresh — exchange a valid refresh cookie for a fresh access token AND
// rotate the refresh token (issue a new refresh + revoke the old jti). Rotation makes
// reuse detection possible: if a stolen refresh token is presented after the legitimate
// one was rotated, the stolen one's jti is in the blocklist and gets rejected.
export const refresh = async (req, res) => {
    try {
        const refreshCookie = req.cookies?.[REFRESH_COOKIE_NAME];
        if (!refreshCookie) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshCookie, process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Defense in depth — only refresh tokens may refresh. Stops a stolen access
        // token (somehow placed in the cookie) from being upgraded.
        if (decoded.type !== "refresh") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Reuse detection (lite): if this refresh-token's jti was already revoked, it's
        // either a replay of a logged-out token or a stolen-and-rotated token. Reject.
        const { isJtiRevoked } = await import("../lib/jtiBlocklist.js");
        if (decoded.jti && (await isJtiRevoked(decoded.jti))) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Confirm the user still exists and is active. A banned user shouldn't be able
        // to refresh their way back in.
        const user = await User.findById(decoded.userId).select("_id isActive");
        if (!user || user.isActive === false) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Rotate: revoke the presented refresh-token's jti, issue a new pair.
        await revokeJti(decoded.jti, remainingSecondsUntil(decoded.exp));
        const accessToken = issueTokens(res, user._id);

        res.status(200).json({ accessToken });
    } catch (error) {
        console.log("Error in refresh controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async(req,res) => {

    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message: "Profile pic is required"});


        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true});

        res.status(200).json(updatedUser)


    } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({message: "Internal server error"}); 
        
    }
};

export const checkAuth = (req,res) => {
    try {

        res.status(200).json(req.user);
        
    } catch (error) {
        console.log("error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error"});

    }

}