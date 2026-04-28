import {
    generateAccessToken,
    generateRefreshToken,
    REFRESH_TOKEN_TTL_SECONDS,
} from "../lib/utils.js";
import User from "../models/user.model.js";

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
export const oauthCallback = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
        if (user.isActive === false) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

        // Header strips Referer on outbound requests from the success page so the URL
        // (which contains the access token) doesn't leak to fonts/images/analytics.
        res.setHeader("Referrer-Policy", "no-referrer");

        res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${accessToken}`);
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
};

/**
 * Handle OAuth failure
 */
export const oauthFailure = (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
};

/**
 * Link OAuth account to existing account
 */
export const linkOAuthAccount = async (req, res) => {
    try {
        const { provider } = req.params;
        const userId = req.user._id;

        await User.findByIdAndUpdate(userId, {
            authProvider: provider,
            providerId: req.user.providerId
        });

        res.status(200).json({ message: `${provider} account linked successfully` });
    } catch (error) {
        console.error('Error linking OAuth account:', error);
        res.status(500).json({ error: 'Failed to link account' });
    }
};

/**
 * Unlink OAuth account
 */
export const unlinkOAuthAccount = async (req, res) => {
    try {
        const { provider } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (user.authProvider !== provider) {
            return res.status(400).json({ error: 'Account not linked with this provider' });
        }

        if (!user.password) {
            return res.status(400).json({
                error: 'Cannot unlink OAuth account without setting a password first'
            });
        }

        user.authProvider = 'local';
        user.providerId = null;
        await user.save();

        res.status(200).json({ message: `${provider} account unlinked successfully` });
    } catch (error) {
        console.error('Error unlinking OAuth account:', error);
        res.status(500).json({ error: 'Failed to unlink account' });
    }
};
