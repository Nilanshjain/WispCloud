import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

// Token TTLs.
// Access: short enough that a stolen token is worth little; long enough that the refresh
// flow does not fire on every page interaction.
// Refresh: long enough that the user does not have to re-login frequently; short enough
// that an unused stolen refresh token expires within a reasonable window.
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

// Token TTLs in seconds — needed for the Redis blocklist TTL math (set the blocklist
// entry to expire when the token would have expired anyway, so the blocklist self-cleans).
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

// `jti` (JWT ID) is the per-token unique identifier used for revocation.
// `type` claim is defense-in-depth: protectRoute requires type === 'access',
// /auth/refresh requires type === 'refresh'. Stops a stolen refresh token from
// being used directly as an access token, and vice versa.

export const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId, jti: nanoid(), type: "access" },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    );
};

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, jti: nanoid(), type: "refresh" },
        process.env.JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_TTL }
    );
};
