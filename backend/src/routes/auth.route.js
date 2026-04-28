import express from "express";
import { checkAuth, login, logout, refresh, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { authLimiter, uploadLimiter } from "../middleware/rateLimiter.js";
import {
    validate,
    signupSchema,
    loginSchema,
    updateProfileSchema
} from "../middleware/validation.js";

const router = express.Router();

// Signup with validation and rate limiting
router.post("/signup",
    authLimiter,
    validate(signupSchema),
    signup
);

// Login with validation and rate limiting
router.post("/login",
    authLimiter,
    validate(loginSchema),
    login
);

// Logout — protectRoute populates req.tokenJti/req.tokenExp so logout can revoke them.
router.post("/logout", protectRoute, logout);

// Refresh — exchange refresh cookie for new access token (with rotation).
// No protectRoute: the refresh endpoint authenticates via the refresh cookie itself,
// not via a (probably-expired) access token in the Authorization header.
router.post("/refresh", refresh);

// Update profile with validation, auth, and rate limiting
router.put("/update-profile",
    protectRoute,
    uploadLimiter,
    validate(updateProfileSchema),
    updateProfile
);

// Check auth status
router.get("/check", protectRoute, checkAuth);

// Get available authentication methods
router.get("/methods", (req, res) => {
    const methods = {
        emailPassword: true,
        oauth: {
            google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
        }
    };
    res.json(methods);
});

export default router;