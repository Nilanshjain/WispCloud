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

/**
 * Cache user data with TTL (Time To Live)
 * @param {string} userId - User ID
 * @param {object} userData - User data to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
export const cacheUser = async (userId, userData, ttl = 300) => {
    try {
        const client = getRedisClient();
        const key = `user:${userId}`;
        await client.setEx(key, ttl, JSON.stringify(userData));
    } catch (error) {
        logger.error({ err: error, userId }, 'Error caching user');
    }
};

/**
 * Get cached user data
 * @param {string} userId - User ID
 * @returns {object|null} User data or null if not found
 */
export const getCachedUser = async (userId) => {
    try {
        const client = getRedisClient();
        const key = `user:${userId}`;
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error({ err: error, userId }, 'Error getting cached user');
        return null;
    }
};

/**
 * Delete cached user data
 * @param {string} userId - User ID
 */
export const deleteCachedUser = async (userId) => {
    try {
        const client = getRedisClient();
        const key = `user:${userId}`;
        await client.del(key);
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
 * Map socket ID to user ID
 * @param {string} socketId - Socket ID
 * @param {string} userId - User ID
 */
export const mapSocketToUser = async (socketId, userId) => {
    try {
        const client = getRedisClient();
        await client.hSet('socket_user_map', socketId, userId);
        await client.set(`user:${userId}:socketId`, socketId);
    } catch (error) {
        logger.error({ err: error, socketId, userId }, 'Error mapping socket to user');
    }
};

/**
 * Get user ID by socket ID
 * @param {string} socketId - Socket ID
 * @returns {string|null} User ID or null
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

/**
 * Get socket ID by user ID
 * @param {string} userId - User ID
 * @returns {string|null} Socket ID or null
 */
export const getSocketIdByUserId = async (userId) => {
    try {
        const client = getRedisClient();
        return await client.get(`user:${userId}:socketId`);
    } catch (error) {
        logger.error({ err: error, userId }, 'Error getting socket ID by user ID');
        return null;
    }
};

/**
 * Remove socket mapping
 * @param {string} socketId - Socket ID
 */
export const removeSocketMapping = async (socketId) => {
    try {
        const client = getRedisClient();
        const userId = await client.hGet('socket_user_map', socketId);
        if (userId) {
            await client.hDel('socket_user_map', socketId);
            await client.del(`user:${userId}:socketId`);
        }
    } catch (error) {
        logger.error({ err: error, socketId }, 'Error removing socket mapping');
    }
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
    mapSocketToUser,
    getUserBySocketId,
    getSocketIdByUserId,
    removeSocketMapping
};
