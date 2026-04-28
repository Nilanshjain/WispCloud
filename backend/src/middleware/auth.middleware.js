import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { isJtiRevoked } from "../lib/jtiBlocklist.js";
import { getCachedUser, cacheUser } from "../lib/redis.js";
import { logger } from "../lib/logger.js";

// protectRoute — five checks in fail-closed order. Any failure returns 401 (or 403 if
// the user is found but inactive — they're authenticated but forbidden by ban policy).
//
//   1. Token present? Authorization: Bearer ... header (cookie fallback retained for
//      backwards compatibility during the localStorage → in-memory migration).
//   2. Signature valid + not expired? jwt.verify throws on either; we catch and 401.
//   3. type === 'access'? Defense-in-depth so a stolen refresh token can't be used here.
//   4. jti not revoked? O(1) Redis SISMEMBER (graceful-degrades if Redis is down).
//   5. User still active in DB? Lets admins ban a user and have their session die
//      within the next access-token cycle (≤15 min) instead of waiting for natural expiry.
//
// Status code discipline:
//   - 401 = "we don't know who you are" (token missing, invalid, expired, revoked, or
//     points to a deleted user). Generic message; never distinguish reasons to the client
//     (don't help an attacker enumerate token states).
//   - 403 = "we know who you are but you're not allowed" (user found but isActive: false).
//     Distinct from 401 because the client should NOT prompt for re-login — re-login won't help.

export const protectRoute = async (req, res, next) => {
    try {
        // Step 1 — extract token.
        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        if (!token && req.cookies?.jwt) {
            token = req.cookies.jwt; // Backwards-compat fallback; remove once frontend migration is verified.
        }
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Step 2 — verify signature + exp. jwt.verify throws on bad signature, expired,
        // malformed, or unsupported alg. We catch and return 401 (not 500 — these are
        // client errors, not server errors).
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Step 3 — token type check. Refresh tokens have type:'refresh' and must not be
        // accepted on protected routes. Older tokens issued before this hardening pass
        // have no `type` claim — accept them as access during the migration window.
        if (decoded.type && decoded.type !== "access") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Step 4 — revocation check. Logout adds the access-token's jti here.
        if (decoded.jti && (await isJtiRevoked(decoded.jti))) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Step 5 — active-user check via cache-aside. Hot path: every authenticated
        // request runs this. Without cache, every request = one Mongo round-trip;
        // at sustained load this is the bottleneck. With cache: 1 Redis GET on hit,
        // or 1 GET + 1 Mongo + 1 SET on miss. TTL = 300s (USER_CACHE_TTL_SECONDS),
        // so a banned user's session can stay alive up to 5 min after isActive
        // flips — every write that mutates a user document MUST call
        // deleteCachedUser(userId) to invalidate (see auth.controller.js,
        // oauth.controller.js for the invalidation sites).
        //
        // Cache stores a plain object (not a Mongoose doc). Downstream controllers
        // do property access only (req.user._id, req.user.email, etc.); no
        // Mongoose methods are needed on req.user.
        let user = await getCachedUser(decoded.userId);
        if (!user) {
            // .select('-password') keeps the bcrypt hash out of the cached object —
            // defense in depth, even though redaction in lib/logger.js would catch it
            // if anything tried to log req.user. .lean() returns a plain object so we
            // skip Mongoose hydration cost on the hot path.
            user = await User.findById(decoded.userId).select("-password").lean();
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            await cacheUser(decoded.userId, user);
        }
        if (user.isActive === false) {
            return res.status(403).json({ message: "Account disabled" });
        }

        req.user = user;
        // Stash decoded JWT claims so logout can revoke this exact jti without re-parsing.
        req.tokenJti = decoded.jti;
        req.tokenExp = decoded.exp;
        next();
    } catch (error) {
        // Truly unexpected (DB connection lost mid-query, etc.) — propagate to
        // central error middleware via next(error). Don't return 500 inline; the
        // error middleware owns the structured response shape + logging.
        const log = req.log || logger;
        log.error({ err: error }, "protectRoute unexpected error");
        return next(error);
    }
};
