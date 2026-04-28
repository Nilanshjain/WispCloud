import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisConnected } from '../lib/redis.js';
import { logger } from '../lib/logger.js';

// Lazy-built rate limiters.
//
// The previous version called rateLimit(...) at module load time and chose
// the store (Redis vs in-memory) based on isRedisConnected() at THAT moment.
// Module load happens before connectRedis() runs in startServer, so
// isRedisConnected() was always false, and every limiter was permanently
// stuck on the in-memory store — even after Redis came up. At N>1 instances,
// rate limits became per-instance: a user could split their attack across
// instances and effectively multiply their allowed throughput by N.
//
// The fix is lazy construction. createRateLimiter returns a wrapper middleware
// that builds the underlying rateLimit(...) on the FIRST request hitting
// that limiter. By first request, the boot sequence (connectDB, connectRedis,
// initializeSocketIO, server.listen) has finished and isRedisConnected()
// reflects the real state. Once built, the inner limiter is memoized for
// the rest of the process life — no per-request rebuild cost.

const buildLimiter = ({
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
}) => {
    const baseConfig = {
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,  // RateLimit-* headers (modern, IETF-draft)
        legacyHeaders: false,   // X-RateLimit-* (legacy, off)
        skipSuccessfulRequests,
        skipFailedRequests,
        // IP+user keying: combats the NAT problem (corporate users sharing one
        // egress IP would otherwise share a single counter and one heavy user
        // would lock out the rest of their office) AND the IP-rotation problem
        // (an attacker switching networks to dodge an IP-only limit). Authed
        // users get their userId mixed in; anonymous traffic falls back to IP.
        keyGenerator: (req) => {
            if (req.user && req.user._id) return `${req.ip}-${req.user._id}`;
            return req.ip;
        },
    };

    if (isRedisConnected()) {
        try {
            const redisClient = getRedisClient();
            return rateLimit({
                ...baseConfig,
                store: new RedisStore({
                    // @ts-expect-error - RedisStore expects different client type
                    sendCommand: (...args) => redisClient.sendCommand(args),
                }),
            });
        } catch (error) {
            logger.warn({ err: error.message }, 'Rate limiter Redis init failed, falling back to memory store');
            return rateLimit(baseConfig);
        }
    }

    logger.warn('Rate limiter using memory store (Redis not connected). Per-instance counts at N>1.');
    return rateLimit(baseConfig);
};

/**
 * Create a rate limiter that builds its underlying express-rate-limit instance
 * lazily, on the first request that hits it. Memoized after first build.
 *
 * @param {Object} options - Rate limit options (windowMs, max, message, etc.)
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
    let underlying = null;
    return (req, res, next) => {
        if (!underlying) {
            underlying = buildLimiter(options);
        }
        return underlying(req, res, next);
    };
};

// Global rate limiter — coarse safety net mounted on /api at index.js.
// 500 req / 15 min / (IP+user) in production; lenient in dev.
export const globalLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 5000 : 500,
    message: 'Too many requests from this IP, please try again later.',
});

// Auth limiter — strict to defeat brute-force credential attacks.
// skipSuccessfulRequests: true means a legit user with the right password isn't
// rate-limited if they happen to log in while the limiter window is active —
// only failed attempts (4xx responses) count toward the window.
export const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 100 : 20,
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
});

// Message send — high-volume legitimate use, but bot-like flooding caps here.
export const messageLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 50,
    message: 'Too many messages sent, please slow down.',
});

// Profile-pic upload — cloudinary credit budget protection.
export const uploadLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many uploads, please try again later.',
});

// General-purpose API limiter — applied to user.routes, group.routes,
// chatInvite.routes which need a per-route ceiling beyond the coarse globalLimiter.
export const apiLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 200,
    message: 'API rate limit exceeded, please try again later.',
});

// User-data fetch (sidebar, recent chats) — frequent UI reads need higher cap.
export const userDataLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 500 : 100,
    message: 'Too many requests for user data, please try again later.',
});

// AI route limiter — 10/min/user is the hard ceiling. Note: Gemini free tier
// is 15 RPM project-wide, so at N>=2 concurrent active AI users we can exceed
// the upstream quota. The aiLimiter caps individual abuse; the upstream quota
// is a separate concern handled by Gemini error responses (which the AI
// service surfaces to the user as "AI temporarily unavailable").
export const aiLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    message: 'AI request limit reached. Please wait before asking again.',
});

export default {
    globalLimiter,
    authLimiter,
    messageLimiter,
    uploadLimiter,
    apiLimiter,
    userDataLimiter,
    aiLimiter,
};
