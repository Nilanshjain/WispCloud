import {
    generateAccessToken,
    generateRefreshToken,
    REFRESH_TOKEN_TTL_SECONDS,
} from "../lib/utils.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { ValidationError, NotFoundError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const refreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth/refresh",
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
});

/**
 * Handle OAuth callback success.
 *
 * Sets the refresh cookie server-side, then redirects with the access token in the URL.
 * The frontend's OAuthSuccessPage strips the URL via history.replaceState the moment
 * it mounts (defense against URL leakage to history / Referer / logs).
 *
 * Long-term hardening (deferred): replace the URL access token with a short-lived
 * one-time exchange code that the frontend POSTs to a dedicated endpoint to get the
 * access token in a response body. URL would never carry a JWT. M14+ scope.
 *
 * Tells the browser not to leak this URL anywhere (Referer header on outbound requests,
 * etc.) — the access token sits in the URL for one navigation only, but during that
 * window any external resource the success page loads would otherwise leak it.
 */
// OAuth callback redirects on every outcome (success and error) — it's not a
// JSON endpoint, so we don't use asyncHandler + central error middleware here.
// Errors get logged + redirected to the login page with an error query param.
export const oauthCallback = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.isActive === false) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

        // Header strips Referer on outbound requests from the success page so the URL
        // (which contains the access token) doesn't leak to fonts/images/analytics.
        res.setHeader("Referrer-Policy", "no-referrer");

        req.log?.info({ userId: user._id.toString() }, "OAuth login success");
        res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${accessToken}`);
    } catch (error) {
        (req.log || logger).error({ err: error }, "OAuth callback error");
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
};

export const oauthFailure = (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
};

export const linkOAuthAccount = asyncHandler(async (req, res) => {
    const { provider } = req.params;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
        authProvider: provider,
        providerId: req.user.providerId,
    });

    res.status(200).json({ message: `${provider} account linked successfully` });
});

export const unlinkOAuthAccount = asyncHandler(async (req, res) => {
    const { provider } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    if (user.authProvider !== provider) {
        throw new ValidationError("Account not linked with this provider");
    }
    if (!user.password) {
        throw new ValidationError("Cannot unlink OAuth account without setting a password first");
    }

    user.authProvider = "local";
    user.providerId = null;
    await user.save();

    res.status(200).json({ message: `${provider} account unlinked successfully` });
});
