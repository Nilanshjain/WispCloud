import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisConnected } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { TooManyRequestsError } from '../lib/errors.js';

// Single source of truth for limiter definitions. Each entry produces one
// rate-limit instance built once in initializeRateLimiters() and reached via
// the corresponding named export below. Adding a limiter is a one-line
// addition to this table plus a matching `export const X = makeProxy('X')`.
const LIMITER_CONFIGS = {
    // Global — coarse safety net mounted on /api at index.js.
    globalLimiter: {
        windowMs: 15 * 60 * 1000,
        max: process.env.NODE_ENV === 'development' ? 5000 : 500,
        message: 'Too many requests from this IP, please try again later.',
    },
    // Auth — strict to defeat brute-force credential attacks.
    // skipSuccessfulRequests: a legit user with the right password isn't
    // counted; only failed attempts (4xx) consume budget.
    authLimiter: {
        windowMs: 15 * 60 * 1000,
        max: process.env.NODE_ENV === 'development' ? 100 : 20,
        message: 'Too many authentication attempts, please try again later.',
        skipSuccessfulRequests: true,
    },
    // Message send — high-volume legitimate use, but bot-like flooding caps here.
    messageLimiter: {
        windowMs: 60 * 1000,
        max: 50,
        message: 'Too many messages sent, please slow down.',
    },
    // Profile-pic upload — Cloudinary credit budget protection.
    uploadLimiter: {
        windowMs: 60 * 60 * 1000,
        max: 10,
        message: 'Too many uploads, please try again later.',
    },
    // General API — per-route ceiling beyond the coarse globalLimiter.
    apiLimiter: {
        windowMs: 60 * 1000,
        max: 200,
        message: 'API rate limit exceeded, please try again later.',
    },
    // User-data fetch (sidebar, recent chats) — frequent UI reads need higher cap.
    userDataLimiter: {
        windowMs: 60 * 1000,
        max: process.env.NODE_ENV === 'development' ? 500 : 100,
        message: 'Too many requests for user data, please try again later.',
    },
    // AI route — 10/min/user is the hard ceiling. Gemini free tier is 15 RPM
    // project-wide, so at N>=2 concurrent active AI users we can exceed the
    // upstream quota. aiLimiter caps individual abuse; upstream quota is
    // handled separately by Gemini error responses surfacing as "AI
    // temporarily unavailable".
    aiLimiter: {
        windowMs: 60 * 1000,
        max: 10,
        message: 'AI request limit reached. Please wait before asking again.',
    },
};

// Each limiter instance lives here once initializeRateLimiters() has run.
// Named exports below are proxy middlewares that look up by key — the
// indirection hands out a stable reference at module-load time (so route
// files can `import { authLimiter }` synchronously) while deferring actual
// rateLimit(...) construction until after connectRedis() finishes. Without
// this deferral, the store branch would pick the in-memory fallback at
// module load (before Redis connects) and never switch back; at N>1
// instances, limits would silently become per-instance.
const limiterInstances = {};
let limitersInitialized = false;

const buildLimiter = ({ windowMs, max, message, skipSuccessfulRequests = false }) => {
    const baseConfig = {
        windowMs,
        max,
        message,
        standardHeaders: true,  // RateLimit-* headers (IETF draft)
        legacyHeaders: false,   // X-RateLimit-* (legacy) off
        skipSuccessfulRequests,
        // IP+user keying combats two problems at once: NAT (multiple users
        // sharing one egress IP would otherwise share one counter, and one
        // heavy user would lock out the rest of their office) and IP-rotation
        // (an attacker switching networks to dodge an IP-only limit).
        //
        // ipKeyGenerator(req.ip) folds IPv6 addresses down to a /64 prefix so
        // a single subscriber whose carrier rotates the interface-identifier
        // bits doesn't fragment into many buckets, and a /128-unique attacker
        // can't trivially rotate within a /64 to bypass.
        keyGenerator: (req) => {
            const ip = ipKeyGenerator(req.ip);
            return req.user?._id ? `${ip}-${req.user._id}` : ip;
        },
        // Route 429s through the central errorHandler instead of writing the
        // response directly. This makes the body shape identical to every
        // other error response — { error: { code, message, requestId } } —
        // so the frontend reads error.response.data.error.message uniformly.
        handler: (req, res, next, options) => {
            next(new TooManyRequestsError(options.message || 'Too many requests'));
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
            // Memory-store fallback is fail-open by design: refusing all
            // traffic because Redis is down would be worse UX than degrading
            // to per-instance counters. But the fallback should be loud — on
            // a multi-instance deployment, silently sliding into per-instance
            // limits is the kind of thing only noticed when an attack succeeds.
            logger.error({ err: error.message }, 'Rate limiter Redis init failed, falling back to memory store');
            return rateLimit(baseConfig);
        }
    }

    logger.warn('Rate limiter using memory store (Redis not connected). Per-instance counts at N>1.');
    return rateLimit(baseConfig);
};

// Proxy middleware: stable reference exported at module-load, dispatches to
// the real instance once initializeRateLimiters() has populated the table.
// Throws synchronously if invoked before init — that path indicates a boot-
// order regression. The startServer assertion catches this earlier; the throw
// here is defense in depth.
const makeProxy = (key) => (req, res, next) => {
    if (!limitersInitialized) {
        throw new Error(`Rate limiter '${key}' invoked before initializeRateLimiters() — fix startServer ordering`);
    }
    return limiterInstances[key](req, res, next);
};

export const globalLimiter = makeProxy('globalLimiter');
export const authLimiter = makeProxy('authLimiter');
export const messageLimiter = makeProxy('messageLimiter');
export const uploadLimiter = makeProxy('uploadLimiter');
export const apiLimiter = makeProxy('apiLimiter');
export const userDataLimiter = makeProxy('userDataLimiter');
export const aiLimiter = makeProxy('aiLimiter');

// Build every limiter instance from LIMITER_CONFIGS. Must be called once,
// AFTER connectRedis() finishes (so the Redis-store branch picks up the live
// client) and BEFORE server.listen() (so the first request finds the
// instances ready). Idempotent — safe to call twice.
export function initializeRateLimiters() {
    if (limitersInitialized) return;
    for (const [key, config] of Object.entries(LIMITER_CONFIGS)) {
        limiterInstances[key] = buildLimiter(config);
    }
    limitersInitialized = true;
}

export const isRateLimitersInitialized = () => limitersInitialized;

export default {
    globalLimiter,
    authLimiter,
    messageLimiter,
    uploadLimiter,
    apiLimiter,
    userDataLimiter,
    aiLimiter,
    initializeRateLimiters,
    isRateLimitersInitialized,
};
