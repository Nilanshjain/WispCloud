import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import http from "http";
import express from "express";
import { createClient } from "redis";
import jwt from "jsonwebtoken";
import GroupMember from "../models/groupMember.model.js";
import User from "../models/user.model.js";
import {
    mapSocketToUser,
    removeSocketMapping,
    setUserOnline,
    setUserOffline,
    getOnlineUsers,
    getSocketIdByUserId,
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

const app = express();
const server = http.createServer(app);

// In-memory socket-user mapping (works without Redis, primary lookup for single-instance).
// M07 makes Redis the authoritative store and demotes this to a per-instance micro-cache.
const userSocketMap = new Map();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const socketAllowedOrigins = [FRONTEND_URL, "http://localhost:5173"].filter(Boolean);

const io = new Server(server, {
    cors: { origin: socketAllowedOrigins, credentials: true },
    pingTimeout: 60000,
    pingInterval: 25000,
});

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
 * Get a user's current socket ID. In-memory map first (single-instance hot path);
 * Redis fallback for cross-instance lookups.
 */
export async function getReceiverSocketId(userId) {
    const localSocketId = userSocketMap.get(userId.toString());
    if (localSocketId) return localSocketId;
    return await getSocketIdByUserId(userId);
}

/**
 * Socket auth middleware — runs the same 5-check pipeline as protectRoute on
 * the HTTP side. Failure rejects the connection (next(new Error)) instead of
 * silently falling through to a query-string userId, which used to be a trivial
 * impersonation hole.
 *
 * Checks in order (cheap → expensive, fail-closed at every step):
 *   1. Token present? Read from socket.handshake.auth.token (passed by frontend
 *      as `auth: { token: accessToken }` on connect).
 *   2. Signature + exp valid? jwt.verify throws on either; we catch and reject.
 *   3. type === 'access'? Defense-in-depth so a stolen refresh token can't
 *      authenticate a socket connection.
 *   4. jti not revoked? O(1) Redis check via the M03 blocklist.
 *   5. User exists + isActive? Banned users can't connect.
 *
 * On success, `socket.user` carries the full user document for downstream
 * handlers, and `socket.userId` is preserved as a string for back-compat.
 */
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("Unauthorized: no token"));
        }

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
        if (!user) {
            return next(new Error("Unauthorized: user not found"));
        }
        if (user.isActive === false) {
            return next(new Error("Forbidden: account disabled"));
        }

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
 * parsed value on success, null on failure (and logs a structured warn so
 * malformed clients are observable). Failure does NOT disconnect the socket —
 * a buggy client should keep its other working features alive.
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
 * Connection handler — fires after auth middleware accepts. socket.user and
 * socket.userId are guaranteed populated.
 */
io.on("connection", async (socket) => {
    const userId = socket.userId;
    logger.debug({ socketId: socket.id, userId }, "Socket connected");

    try {
        // Track this user's current socket. M07 will make Redis authoritative;
        // today the in-memory map is the primary single-instance lookup and
        // Redis is the cross-instance backup.
        userSocketMap.set(userId, socket.id);
        await mapSocketToUser(socket.id, userId);
        await setUserOnline(userId);

        // Auto-join all of the user's group rooms so every group event reaches
        // them without per-event broadcast logic in the controllers.
        const userGroups = await GroupMember.find({ userId, status: "active" }).select("groupId");
        for (const membership of userGroups) {
            socket.join(membership.groupId.toString());
        }
        logger.debug({ userId, groupCount: userGroups.length }, "User joined group rooms");

        // Broadcast updated online-user list to everyone. Anti-pattern at scale
        // (N^2 fan-out on every connect/disconnect); M06 batches + M07 scales.
        const onlineUsers = await getOnlineUsers();
        io.emit(EVENTS.GET_ONLINE_USERS, onlineUsers);
        logger.debug({ userId }, "User online");
    } catch (error) {
        logger.error({ err: error, userId }, "Error handling user connection");
    }

    socket.on("disconnect", async () => {
        logger.debug({ socketId: socket.id, userId }, "Socket disconnected");
        try {
            userSocketMap.delete(userId);
            await removeSocketMapping(socket.id);
            await setUserOffline(userId);
            const onlineUsers = await getOnlineUsers();
            io.emit(EVENTS.GET_ONLINE_USERS, onlineUsers);
            logger.debug({ userId }, "User offline");
        } catch (error) {
            logger.error({ err: error, userId }, "Error handling user disconnect");
        }
    });

    // DM typing indicator — direct send to receiver's socket.
    socket.on(EVENTS.TYPING, async (data) => {
        const parsed = parseEvent(socketTypingSchema, data, socket, EVENTS.TYPING);
        if (!parsed) return;

        const receiverSocketId = await getReceiverSocketId(parsed.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit(EVENTS.USER_TYPING, {
                senderId: userId,
                isTyping: parsed.isTyping,
            });
        }
    });

    // Group typing indicator — broadcast to room except sender.
    socket.on(EVENTS.GROUP_TYPING, async (data) => {
        const parsed = parseEvent(socketGroupTypingSchema, data, socket, EVENTS.GROUP_TYPING);
        if (!parsed) return;

        socket.to(parsed.groupId).emit(EVENTS.USER_TYPING_IN_GROUP, {
            groupId: parsed.groupId,
            senderId: userId,
            isTyping: parsed.isTyping,
        });
    });

    // Late group-room join (e.g., user added to a group after they were already connected).
    socket.on(EVENTS.JOIN_GROUP, async (data) => {
        const parsed = parseEvent(socketJoinGroupSchema, data, socket, EVENTS.JOIN_GROUP);
        if (!parsed) return;

        // Verify membership server-side before joining the room. A client cannot
        // self-elevate by emitting joinGroup with arbitrary groupIds.
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

export { io, app, server };
