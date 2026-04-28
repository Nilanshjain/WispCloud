import { getRedisClient, isRedisConnected } from "./redis.js";
import { logger } from "./logger.js";

// Generic cache-aside helper. The pattern: check Redis for a key, return on
// hit; on miss, run the fetch function, write the result to Redis with a TTL,
// return the fresh value. Same shape applies to user lookups, analytics
// rollups, group settings, anywhere a read-heavy computation has a stable
// key and bounded staleness tolerance.
//
// Fail-open: if Redis is down, the fetch function still runs and the result
// is returned without caching. The cache layer is an optimization, never a
// correctness gate. A Redis outage degrades performance but does not break
// the app.
//
// Cache-stampede note: if 100 requests hit a cold cache key simultaneously,
// they all fall through to fetchFn. At Rs.0 traffic this is fine; at scale
// the fix is single-flight (one fetch per key, others wait on the same
// promise) — out of scope for M08, flagged for M16.

/**
 * @param {string} key - Redis key (caller controls namespace).
 * @param {number} ttlSeconds - How long to cache the result.
 * @param {() => Promise<unknown>} fetchFn - Function to call on cache miss. Must be JSON-serializable.
 * @returns {Promise<unknown>} The cached or freshly-fetched value.
 */
export const withCache = async (key, ttlSeconds, fetchFn) => {
    if (!isRedisConnected()) {
        return fetchFn();
    }

    try {
        const client = getRedisClient();
        const cached = await client.get(key);
        if (cached !== null) {
            return JSON.parse(cached);
        }
    } catch (error) {
        logger.error({ err: error, key }, "withCache read error, falling through to fetch");
    }

    // Miss (or read errored). Fetch fresh and write back.
    const value = await fetchFn();

    try {
        if (isRedisConnected() && value !== undefined && value !== null) {
            const client = getRedisClient();
            await client.setEx(key, ttlSeconds, JSON.stringify(value));
        }
    } catch (error) {
        logger.error({ err: error, key }, "withCache write error, value still returned");
    }

    return value;
};

/**
 * Invalidate a cache key. Used after writes that mutate the underlying data.
 * Idempotent and fail-open: missing key or Redis down both no-op.
 */
export const invalidateCache = async (key) => {
    if (!isRedisConnected()) return;
    try {
        const client = getRedisClient();
        await client.del(key);
    } catch (error) {
        logger.error({ err: error, key }, "Cache invalidation error");
    }
};
