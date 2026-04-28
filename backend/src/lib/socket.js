import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import http from "http";
import express from "express";
import { createClient } from "redis";
import jwt from "jsonwebtoken";
import GroupMember from "../models/groupMember.model.js";
import {
    mapSocketToUser,
    removeSocketMapping,
    setUserOnline,
    setUserOffline,
    getOnlineUsers,
    getSocketIdByUserId
} from "./redis.js";
import { logger } from "./logger.js";

const app = express();
const server = http.createServer(app);

// In-memory socket-user mapping (works without Redis, primary lookup for single-instance)
const userSocketMap = new Map();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const socketAllowedOrigins = [FRONTEND_URL, "http://localhost:5173"].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: socketAllowedOrigins,
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

/**
 * Initialize Redis Adapter for Socket.IO horizontal scaling
 */
export const initializeSocketIO = async () => {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        // Create pub/sub clients for Socket.IO adapter
        const pubClient = createClient({ url: redisUrl });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        logger.info('Socket.IO Redis Adapter initialized, multi-instance support enabled');

        pubClient.on('error', (err) => logger.error({ err }, 'Redis pub client error'));
        subClient.on('error', (err) => logger.error({ err }, 'Redis sub client error'));
    } catch (error) {
        logger.warn({ err: error.message }, 'Redis Adapter init failed, running single-instance');
    }
};

/**
 * Get receiver's socket ID from Redis
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Socket ID or null
 */
export async function getReceiverSocketId(userId) {
    // Check in-memory map first (always available, even without Redis)
    const localSocketId = userSocketMap.get(userId.toString());
    if (localSocketId) return localSocketId;

    // Fall back to Redis for multi-instance deployments
    return await getSocketIdByUserId(userId);
}

/**
 * Socket.IO auth middleware - verify JWT token
 */
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
        } catch (err) {
            // Token invalid, fall back to query userId
        }
    }
    next();
});

/**
 * Socket.IO connection handler with Redis-backed presence
 */
io.on("connection", async (socket) => {
    logger.debug({ socketId: socket.id }, 'Socket connected');

    const userId = socket.userId || socket.handshake.query.userId;

    if (userId && userId !== 'undefined') {
        try {
            userSocketMap.set(userId, socket.id);
            await mapSocketToUser(socket.id, userId);
            await setUserOnline(userId);

            const userGroups = await GroupMember.find({ userId, status: 'active' }).select('groupId');
            for (const membership of userGroups) {
                socket.join(membership.groupId.toString());
            }
            logger.debug({ userId, groupCount: userGroups.length }, 'User joined group rooms');

            const onlineUsers = await getOnlineUsers();
            io.emit("getOnlineUsers", onlineUsers);
            logger.debug({ userId }, 'User online');
        } catch (error) {
            logger.error({ err: error, userId }, 'Error handling user connection');
        }
    }

    socket.on("disconnect", async () => {
        logger.debug({ socketId: socket.id }, 'Socket disconnected');

        if (userId && userId !== 'undefined') {
            try {
                userSocketMap.delete(userId);
                await removeSocketMapping(socket.id);
                await setUserOffline(userId);
                const onlineUsers = await getOnlineUsers();
                io.emit("getOnlineUsers", onlineUsers);
                logger.debug({ userId }, 'User offline');
            } catch (error) {
                logger.error({ err: error, userId }, 'Error handling user disconnect');
            }
        }
    });

    // Handle typing indicator (DM)
    socket.on("typing", async (data) => {
        const receiverSocketId = await getReceiverSocketId(data.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", {
                senderId: userId,
                isTyping: data.isTyping
            });
        }
    });

    // Handle group typing indicator
    socket.on("groupTyping", async (data) => {
        const { groupId, isTyping } = data;

        // Broadcast to all group members except sender
        socket.to(groupId).emit("userTypingInGroup", {
            groupId,
            senderId: userId,
            isTyping
        });
    });

    // Handle joining a new group (when user is added to group)
    socket.on("joinGroup", async (data) => {
        const { groupId } = data;

        // Verify user is a member of this group
        const membership = await GroupMember.findOne({
            groupId,
            userId,
            status: 'active',
        });

        if (membership) {
            socket.join(groupId);
            logger.debug({ userId, groupId }, 'User joined group room');
            socket.emit("groupJoined", { groupId });
        }
    });

    socket.on("leaveGroup", (data) => {
        const { groupId } = data;
        socket.leave(groupId);
        logger.debug({ userId, groupId }, 'User left group room');
    });
});

export { io, app, server };


