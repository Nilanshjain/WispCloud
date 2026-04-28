import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import http from "http";
import express from "express";
import { createClient } from "redis";
import jwt from "jsonwebtoken";
import GroupMember from "../models/groupMember.model.js";
import User from "../models/user.model.js";
import {
    addUserSocket,
    removeUserSocket,
    setUserOnline,
    setUserOffline,
    getOnlineUsers,
    getUserSockets,
} from "./redis.js";
import { logger } from "./logger.js";
import { isJtiRevoked } from "./jtiBlocklist.js";
import { EVENTS } from "./socketEvents.js";
import {
    socketTypingSchema,
    socketGroupTypingSchema,
    socketJoinGroupSchema,
    socketLeaveGroupSchema,
} from "../middleware/validation.js";
import {
    configurePresenceBroadcaster,
    schedulePresenceBroadcast,
    flushPresenceBroadcast,
} from "./presenceBroadcaster.js";
import { recordTyping, clearTypingForSender } from "./typingTracker.js";

const app = express();
const server = http.createServer(app);

// In-memory user-socket map. Multi-tab support requires Set-of-sockets per user
// (single value would clobber on second tab). M07 makes Redis primary; today
// this is the single-instance hot path for "is user X online".
const userSocketMap = new Map(); // Map<userId, Set<socketId>>

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const socketAllowedOrigins = [FRONTEND_URL, "http://localhost:5173"].filter(Boolean);

const io = new Server(server, {
    cors: { origin: socketAllowedOrigins, credentials: true },
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Wire the presence broadcaster up now that io exists. Module-level init so
// presenceBroadcaster.js stays free of socket.js imports (no circular dep).
configurePresenceBroadcaster({
    io,
    getOnlineUsers,
    event: EVENTS.GET_ONLINE_USERS,
});

/**
 * Per-user room name. Convention: every connected socket joins this room on
 * connect, so controllers can do `io.to(userRoom(id)).emit(...)` and reach
 * every tab/device the user has open without per-call socket-ID lookups.
 */
export const userRoom = (userId) => `user:${userId}`;

/**
 * Socket.IO Redis Adapter for horizontal scaling. At N=1 this is essentially a
 * no-op; at N>1 every emit propagates across all instances via Redis pub/sub.
 */
export const initializeSocketIO = async () => {
    try {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
        const pubClient = createClient({ url: redisUrl });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        logger.info("Socket.IO Redis Adapter initialized, multi-instance support enabled");

        pubClient.on("error", (err) => logger.error({ err }, "Redis pub client error"));
        subClient.on("error", (err) => logger.error({ err }, "Redis sub client error"));
    } catch (error) {
        logger.warn({ err: error.message }, "Redis Adapter init failed, running single-instance");
    }
};

/**
 * @deprecated Use userRoom(userId) + io.to(userRoom(id)).emit(...) instead.
 * Returns one of the user's connected socket IDs. Kept for backward compat
 * with any caller still doing direct socket-ID emits.
 */
export async function getReceiverSocketId(userId) {
    const localSet = userSocketMap.get(userId.toString());
    if (localSet && localSet.size > 0) return [...localSet][0];
    const sockets = await getUserSockets(userId);
    return sockets[0] || null;
}

/**
 * Socket auth middleware — runs the same 5-check pipeline as protectRoute on
 * the HTTP side. Failure rejects the connection (next(new Error)) so the
 * client receives a connect_error event with a discriminator-prefixed message.
 *
 * Checks in order (cheap → expensive, fail-closed at every step):
 *   1. Token present? Read from socket.handshake.auth.token.
 *   2. Signature + exp valid? jwt.verify throws on either; we catch and reject.
 *   3. type === 'access'? Defense-in-depth so a stolen refresh token can't
 *      authenticate a socket connection.
 *   4. jti not revoked? O(1) Redis check via the M03 blocklist.
 *   5. User exists + isActive? Banned users can't connect.
 */
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Unauthorized: no token"));

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return next(new Error("Unauthorized: invalid token"));
        }

        if (decoded.type && decoded.type !== "access") {
            return next(new Error("Unauthorized: wrong token type"));
        }

        if (decoded.jti && (await isJtiRevoked(decoded.jti))) {
            return next(new Error("Unauthorized: token revoked"));
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return next(new Error("Unauthorized: user not found"));
        if (user.isActive === false) return next(new Error("Forbidden: account disabled"));

        socket.user = user;
        socket.userId = user._id.toString();
        return next();
    } catch (error) {
        logger.error({ err: error }, "Socket auth middleware unexpected error");
        return next(new Error("Internal error"));
    }
});

/**
 * Validate an incoming socket-event payload against a Zod schema. Returns the
 * parsed value on success, null on failure (and logs a structured warn).
 * Failure does NOT disconnect the socket — buggy clients should keep their
 * other working features alive.
 */
const parseEvent = (schema, data, socket, eventName) => {
    try {
        return schema.parse(data);
    } catch (err) {
        logger.warn(
            {
                socketId: socket.id,
                userId: socket.userId,
                event: eventName,
                err: err.message,
            },
            "Invalid socket event payload"
        );
        return null;
    }
};

/**
 * Track a connection in the in-memory map. Returns true if this is the user's
 * first socket (presence transition: offline → online), false otherwise.
 */
const trackSocketLocally = (userId, socketId) => {
    let set = userSocketMap.get(userId);
    if (!set) {
        set = new Set();
        userSocketMap.set(userId, set);
    }
    set.add(socketId);
    return set.size === 1;
};

/**
 * Untrack a connection. Returns true if this was the user's last socket
 * (presence transition: online → offline), false if other tabs remain.
 */
const untrackSocketLocally = (userId, socketId) => {
    const set = userSocketMap.get(userId);
    if (!set) return false;
    set.delete(socketId);
    if (set.size === 0) {
        userSocketMap.delete(userId);
        return true;
    }
    return false;
};

io.on("connection", async (socket) => {
    const userId = socket.userId;
    logger.debug({ socketId: socket.id, userId }, "Socket connected");

    try {
        // Per-user room — every socket joins the user's personal room so
        // controllers can fan out to all the user's tabs with one io.to() call.
        socket.join(userRoom(userId));

        // Multi-tab tracking: in-memory + Redis Set. The booleans tell us
        // whether this is the user's first connection (was offline, now online)
        // or just an additional tab (already online; no presence transition).
        const isFirstLocal = trackSocketLocally(userId, socket.id);
        const remoteCount = await addUserSocket(userId, socket.id);
        const isFirstConnection = isFirstLocal && remoteCount === 1;

        if (isFirstConnection) {
            await setUserOnline(userId);
            schedulePresenceBroadcast();
        }

        // Auto-join all of the user's group rooms.
        const userGroups = await GroupMember.find({ userId, status: "active" }).select("groupId");
        for (const membership of userGroups) {
            socket.join(membership.groupId.toString());
        }
        logger.debug(
            { userId, socketId: socket.id, isFirstConnection, groupCount: userGroups.length },
            isFirstConnection ? "User came online" : "User opened additional tab"
        );
    } catch (error) {
        logger.error({ err: error, userId }, "Error handling user connection");
    }

    socket.on("disconnect", async () => {
        logger.debug({ socketId: socket.id, userId }, "Socket disconnected");
        try {
            const isLastLocal = untrackSocketLocally(userId, socket.id);
            const remoteCount = await removeUserSocket(userId, socket.id);
            const isLastConnection = isLastLocal && remoteCount === 0;

            if (isLastConnection) {
                await setUserOffline(userId);
                schedulePresenceBroadcast();
                // Clear any orphaned typing indicators from this user. Receivers
                // get an immediate isTyping=false instead of waiting for the
                // 5s auto-expire to fire.
                clearTypingForSender(userId, (targetId, isTyping) => {
                    // Best-effort emit — we don't know which targets are DMs vs groups.
                    // The convention here: try both; receivers ignore irrelevant ones.
                    io.to(userRoom(targetId)).emit(EVENTS.USER_TYPING, {
                        senderId: userId,
                        isTyping,
                    });
                    io.to(targetId).emit(EVENTS.USER_TYPING_IN_GROUP, {
                        groupId: targetId,
                        senderId: userId,
                        isTyping,
                    });
                });
                logger.debug({ userId }, "User went offline (all tabs closed)");
            } else {
                logger.debug({ userId }, "User closed one tab, still online");
            }
        } catch (error) {
            logger.error({ err: error, userId }, "Error handling user disconnect");
        }
    });

    // DM typing indicator — server-side throttle + auto-expire via typingTracker.
    socket.on(EVENTS.TYPING, async (data) => {
        const parsed = parseEvent(socketTypingSchema, data, socket, EVENTS.TYPING);
        if (!parsed) return;

        recordTyping(userId, parsed.receiverId, parsed.isTyping, (isTypingValue) => {
            io.to(userRoom(parsed.receiverId)).emit(EVENTS.USER_TYPING, {
                senderId: userId,
                isTyping: isTypingValue,
            });
        });
    });

    // Group typing indicator — broadcast to room except sender.
    socket.on(EVENTS.GROUP_TYPING, async (data) => {
        const parsed = parseEvent(socketGroupTypingSchema, data, socket, EVENTS.GROUP_TYPING);
        if (!parsed) return;

        recordTyping(userId, parsed.groupId, parsed.isTyping, (isTypingValue) => {
            socket.to(parsed.groupId).emit(EVENTS.USER_TYPING_IN_GROUP, {
                groupId: parsed.groupId,
                senderId: userId,
                isTyping: isTypingValue,
            });
        });
    });

    // Late group-room join (e.g., user added to a group after they were already connected).
    socket.on(EVENTS.JOIN_GROUP, async (data) => {
        const parsed = parseEvent(socketJoinGroupSchema, data, socket, EVENTS.JOIN_GROUP);
        if (!parsed) return;

        const membership = await GroupMember.findOne({
            groupId: parsed.groupId,
            userId,
            status: "active",
        });
        if (membership) {
            socket.join(parsed.groupId);
            logger.debug({ userId, groupId: parsed.groupId }, "User joined group room");
            socket.emit(EVENTS.GROUP_JOINED, { groupId: parsed.groupId });
        }
    });

    socket.on(EVENTS.LEAVE_GROUP, (data) => {
        const parsed = parseEvent(socketLeaveGroupSchema, data, socket, EVENTS.LEAVE_GROUP);
        if (!parsed) return;
        socket.leave(parsed.groupId);
        logger.debug({ userId, groupId: parsed.groupId }, "User left group room");
    });
});

export { io, app, server, flushPresenceBroadcast };
