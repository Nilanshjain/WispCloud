import { getRedisClient, isRedisConnected } from "./redis.js";
import { logger } from "./logger.js";

// Per-token revocation list. A jti added here is treated as revoked even if its signature
// is valid and its `exp` is in the future. The Redis key carries a TTL equal to the token's
// remaining life so the blocklist self-prunes — no janitor needed.
//
// Rs.0 budget context: each entry is ~30 bytes. At 1000 logouts/day with 7-day refresh
// tokens worst-case, the working set is ~210 KB. Comfortably inside the 30 MB Upstash
// free tier. SISMEMBER on every protected request is O(1) at the Redis level; the cost
// is one extra command per request.
//
// Graceful degradation: if Redis is down, blocklist checks return `false` (not revoked)
// rather than failing closed. This is a deliberate trade — failing closed would log out
// every user when Redis blips, which is worse than a small revocation gap during the blip.
// The refresh-rotation pattern also limits exposure: a stolen access token only works
// until its 15-minute expiry regardless of blocklist state.

const BLOCKLIST_PREFIX = "revoked_jti:";

const keyFor = (jti) => `${BLOCKLIST_PREFIX}${jti}`;

export const revokeJti = async (jti, ttlSeconds) => {
    if (!isRedisConnected() || !jti) return;
    try {
        const client = getRedisClient();
        // EX sets a TTL in seconds. Value is "1" (placeholder — the key's existence is the signal).
        await client.set(keyFor(jti), "1", { EX: Math.max(1, Math.floor(ttlSeconds)) });
    } catch (error) {
        logger.error({ err: error.message, jti }, "revokeJti error");
    }
};

export const isJtiRevoked = async (jti) => {
    if (!isRedisConnected() || !jti) return false;
    try {
        const client = getRedisClient();
        const exists = await client.exists(keyFor(jti));
        return exists === 1;
    } catch (error) {
        logger.error({ err: error.message, jti }, "isJtiRevoked error");
        return false; // Fail open on Redis errors — see comment at top of file.
    }
};

// Compute remaining seconds until token expiry. Used to size the blocklist TTL so
// the entry expires exactly when the token would have anyway.
export const remainingSecondsUntil = (expUnixSeconds) => {
    const nowSec = Math.floor(Date.now() / 1000);
    return Math.max(0, expUnixSeconds - nowSec);
};
