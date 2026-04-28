import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";
import {
    generateAccessToken,
    generateRefreshToken,
    REFRESH_TOKEN_TTL_SECONDS,
} from "../lib/utils.js";
import { revokeJti, remainingSecondsUntil } from "../lib/jtiBlocklist.js";
import { deleteCachedUser, getCachedUser, cacheUser } from "../lib/redis.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../lib/asyncHandler.js";
import {
    UnauthorizedError,
    ConflictError,
    ValidationError,
} from "../lib/errors.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const refreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth/refresh",
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
});

const issueTokens = (res, userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    return accessToken;
};

export const signup = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body;

    // Field presence + length checks already enforced by Zod (signupSchema in
    // middleware/validation.js) before this controller runs.
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
        if (existingUser.email === email) throw new ConflictError("Email already exists");
        if (existingUser.username === username) throw new ConflictError("Username already taken");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        fullName,
        email,
        username,
        password: hashPassword,
    });

    const accessToken = issueTokens(res, newUser._id);

    req.log.info({ userId: newUser._id.toString() }, "user signed up");

    res.status(201).json({
        accessToken,
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        username: newUser.username,
        profilePic: newUser.profilePic,
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    // Account-enumeration defense: identical 401 + identical message regardless
    // of which check failed.
    if (!user) throw new UnauthorizedError("Invalid credentials");
    if (user.isActive === false) throw new UnauthorizedError("Invalid credentials");

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) throw new UnauthorizedError("Invalid credentials");

    const accessToken = issueTokens(res, user._id);
    req.log.info({ userId: user._id.toString() }, "user logged in");

    res.status(200).json({
        accessToken,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic,
    });
});

// Logout has server-side effect: revoke the access-token jti so any stolen
// copy is dead immediately, and clear the refresh cookie.
export const logout = asyncHandler(async (req, res) => {
    if (req.tokenJti && req.tokenExp) {
        const remaining = remainingSecondsUntil(req.tokenExp);
        await revokeJti(req.tokenJti, remaining);
    }

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

    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/api/auth/refresh",
    });

    req.log.info({ userId: req.user?._id?.toString() }, "user logged out");
    res.status(200).json({ message: "Logged out successfully" });
});

// /api/auth/refresh — exchange a valid refresh cookie for a fresh access token
// AND rotate the refresh token (issue a new refresh + revoke the old jti).
export const refresh = asyncHandler(async (req, res) => {
    const refreshCookie = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshCookie) throw new UnauthorizedError("Unauthorized");

    let decoded;
    try {
        decoded = jwt.verify(refreshCookie, process.env.JWT_SECRET);
    } catch {
        throw new UnauthorizedError("Unauthorized");
    }

    if (decoded.type !== "refresh") throw new UnauthorizedError("Unauthorized");

    const { isJtiRevoked } = await import("../lib/jtiBlocklist.js");
    if (decoded.jti && (await isJtiRevoked(decoded.jti))) {
        throw new UnauthorizedError("Unauthorized");
    }

    // Cache-aside on the refresh path. Refresh fires every ~15 min per active
    // session — far less hot than protectRoute, but still worth caching so a
    // user's many tabs sharing a refresh window each only hit Mongo once.
    // The cached object includes more than _id/isActive, but that's fine —
    // protectRoute caches the full doc and we read from the same key.
    let user = await getCachedUser(decoded.userId);
    if (!user) {
        user = await User.findById(decoded.userId).select("-password").lean();
        if (user) await cacheUser(decoded.userId, user);
    }
    if (!user || user.isActive === false) throw new UnauthorizedError("Unauthorized");

    await revokeJti(decoded.jti, remainingSecondsUntil(decoded.exp));
    const accessToken = issueTokens(res, user._id);

    res.status(200).json({ accessToken });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) throw new ValidationError("Profile pic is required");

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
    );

    // Invalidate the cache so the next protectRoute call re-fetches and the
    // updated profilePic shows up in req.user immediately. Without this, the
    // user could see their old pic for up to 5 minutes after upload.
    await deleteCachedUser(userId);

    res.status(200).json(updatedUser);
});

export const checkAuth = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});
