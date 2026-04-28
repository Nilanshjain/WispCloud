import { createClient } from 'redis';
import { logger } from './logger.js';

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis client with connection handling
 */
export const connectRedis = async () => {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        redisClient = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 3) {
                        logger.error('Redis: too many reconnection attempts, stopping');
                        return new Error('Too many retries');
                    }
                    return Math.min(retries * 50, 3000);
                }
            }
        });

        redisClient.on('error', (err) => {
            logger.error({ err: err.message }, 'Redis client error');
            isConnected = false;
        });

        redisClient.on('connect', () => {
            logger.debug('Redis connecting');
        });

        redisClient.on('ready', () => {
            logger.info('Redis connected');
            isConnected = true;
        });

        redisClient.on('end', () => {
            logger.warn('Redis disconnected');
            isConnected = false;
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        logger.warn({ err: error.message }, 'Failed to connect to Redis, continuing without it');
        redisClient = null;
        isConnected = false;
        return null;
    }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call connectRedis() first.');
    }
    return redisClient;
};

/**
 * Check if Redis is connected
 */
export const isRedisConnected = () => isConnected;

/**
 * Close Redis connection gracefully
 */
export const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        logger.info('Redis connection closed');
    }
};

// User cache — keyed by userId. Stores a plain serialized object (NOT a
// Mongoose document) because every consumer does property-access only on
// req.user; Mongoose methods (save, virtuals, getters) are not needed on
// the hot path. The trade: a banned user's session stays alive up to TTL
// seconds after isActive flips, because protectRoute reads from cache.
//
// All writes that mutate a user document MUST call deleteCachedUser(userId)
// to invalidate. Forgetting an invalidation is the classic cache-bug
// scenario — a stale isActive=true entry can keep a banned user logged in.

const USER_CACHE_KEY = (userId) => `user:${userId}`;
export const USER_CACHE_TTL_SECONDS = 300; // 5 minutes — balances staleness vs Mongo load.

export const cacheUser = async (userId, userData, ttl = USER_CACHE_TTL_SECONDS) => {
    if (!isRedisConnected()) return; // Fail-open: cache miss is cheap, cache write doesn't have to succeed.
    try {
        const client = getRedisClient();
        await client.setEx(USER_CACHE_KEY(userId), ttl, JSON.stringify(userData));
    } catch (error) {
        logger.error({ err: error, userId }, 'Error caching user');
    }
};

export const getCachedUser = async (userId) => {
    if (!isRedisConnected()) return null;
    try {
        const client = getRedisClient();
        const data = await client.get(USER_CACHE_KEY(userId));
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error({ err: error, userId }, 'Error getting cached user');
        return null;
    }
};

export const deleteCachedUser = async (userId) => {
    if (!isRedisConnected()) return;
    try {
        const client = getRedisClient();
        await client.del(USER_CACHE_KEY(userId));
    } catch (error) {
        logger.error({ err: error, userId }, 'Error deleting cached user');
    }
};

/**
 * Set user online status
 * @param {string} userId - User ID
 */
export const setUserOnline = async (userId) => {
    try {
        const client = getRedisClient();
        await client.sAdd('online_users', userId);
        await client.set(`user:${userId}:lastSeen`, Date.now().toString());
    } catch (error) {
        logger.error({ err: error, userId }, 'Error setting user online');
    }
};

/**
 * Set user offline status
 * @param {string} userId - User ID
 */
export const setUserOffline = async (userId) => {
    try {
        const client = getRedisClient();
        await client.sRem('online_users', userId);
        await client.set(`user:${userId}:lastSeen`, Date.now().toString());
    } catch (error) {
        logger.error({ err: error, userId }, 'Error setting user offline');
    }
};

/**
 * Get all online users
 * @returns {Array<string>} Array of online user IDs
 */
export const getOnlineUsers = async () => {
    try {
        const client = getRedisClient();
        return await client.sMembers('online_users');
    } catch (error) {
        logger.error({ err: error }, 'Error getting online users');
        return [];
    }
};

/**
 * Add a socket to a user's socket set. Returns the post-add count so callers
 * can decide if this was the user's first socket (presence transition).
 *
 * Multi-tab support: one user can have N sockets connected (one per browser
 * tab/device). The Redis set is the authoritative cross-instance store; the
 * in-memory Map<userId, Set<socketId>> in socket.js is the single-instance
 * micro-cache. M07 makes Redis the primary.
 *
 * `socket_user_map` (hash, socketId → userId) stays 1:1 — it's used for the
 * reverse lookup ("which user owns this disconnecting socket").
 */
export const addUserSocket = async (userId, socketId) => {
    try {
        const client = getRedisClient();
        await client.hSet('socket_user_map', socketId, userId);
        await client.sAdd(`user:${userId}:sockets`, socketId);
        return await client.sCard(`user:${userId}:sockets`);
    } catch (error) {
        logger.error({ err: error, userId, socketId }, 'Error adding user socket');
        return 0;
    }
};

/**
 * Remove a socket from a user's socket set. Returns the post-remove count so
 * callers can detect "this was the last tab" and trigger offline broadcast.
 */
export const removeUserSocket = async (userId, socketId) => {
    try {
        const client = getRedisClient();
        await client.hDel('socket_user_map', socketId);
        await client.sRem(`user:${userId}:sockets`, socketId);
        return await client.sCard(`user:${userId}:sockets`);
    } catch (error) {
        logger.error({ err: error, userId, socketId }, 'Error removing user socket');
        return 0;
    }
};

/**
 * Get all socket IDs currently connected for a given user (across tabs/devices).
 * Returns [] if the user is offline or Redis is down.
 */
export const getUserSockets = async (userId) => {
    try {
        const client = getRedisClient();
        return await client.sMembers(`user:${userId}:sockets`);
    } catch (error) {
        logger.error({ err: error, userId }, 'Error getting user sockets');
        return [];
    }
};

/**
 * Reverse lookup — which user owns this socket? Used by the disconnect handler
 * when only the socket reference is available.
 */
export const getUserBySocketId = async (socketId) => {
    try {
        const client = getRedisClient();
        return await client.hGet('socket_user_map', socketId);
    } catch (error) {
        logger.error({ err: error, socketId }, 'Error getting user by socket ID');
        return null;
    }
};

// Legacy single-socket-per-user helpers retained for backward compat. New code
// should use addUserSocket/removeUserSocket/getUserSockets instead. The
// per-user room pattern (io.to(`user:${id}`).emit) replaces direct socket-ID
// lookups for fan-out, so getSocketIdByUserId is rarely needed in business code.
export const mapSocketToUser = async (socketId, userId) => {
    return addUserSocket(userId, socketId);
};

export const getSocketIdByUserId = async (userId) => {
    const sockets = await getUserSockets(userId);
    return sockets[0] || null;
};

export const removeSocketMapping = async (socketId) => {
    try {
        const client = getRedisClient();
        const userId = await client.hGet('socket_user_map', socketId);
        if (userId) {
            return await removeUserSocket(userId, socketId);
        }
    } catch (error) {
        logger.error({ err: error, socketId }, 'Error removing socket mapping');
    }
    return 0;
};

export default {
    connectRedis,
    getRedisClient,
    isRedisConnected,
    disconnectRedis,
    cacheUser,
    getCachedUser,
    deleteCachedUser,
    setUserOnline,
    setUserOffline,
    getOnlineUsers,
    addUserSocket,
    removeUserSocket,
    getUserSockets,
    getUserBySocketId,
    mapSocketToUser,
    getSocketIdByUserId,
    removeSocketMapping
};
