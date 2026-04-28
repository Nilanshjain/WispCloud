import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import ChatInvite from "../models/chatInvite.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const getUsersForSidebar = asyncHandler(async (req, res) => {
    const loggedInUserId = req.user._id;

    // Find all accepted invites (both directions).
    let acceptedInvites = [];
    try {
        acceptedInvites = await ChatInvite.find({
            $or: [
                { senderId: loggedInUserId, status: "accepted" },
                { receiverId: loggedInUserId, status: "accepted" },
            ],
        });
    } catch (err) {
        req.log.error({ err }, "ChatInvite query error");
    }

    const connectedUserIds = acceptedInvites.map((invite) =>
        invite.senderId.toString() === loggedInUserId.toString()
            ? invite.receiverId
            : invite.senderId
    );

    // Legacy support: users with existing message history (pre-invite-system).
    const existingConversations = await Message.distinct("senderId", {
        receiverId: loggedInUserId,
    }).catch(() => []);
    const sentMessages = await Message.distinct("receiverId", {
        senderId: loggedInUserId,
    }).catch(() => []);

    const conversationUserIds = [
        ...new Set([
            ...existingConversations.map((id) => id.toString()),
            ...sentMessages.map((id) => id.toString()),
        ]),
    ];

    const allConnectedUserIds = [
        ...new Set([
            ...connectedUserIds.map((id) => id.toString()),
            ...conversationUserIds,
        ]),
    ];

    if (allConnectedUserIds.length === 0) {
        return res.status(200).json([]);
    }

    const users = await User.find({ _id: { $in: allConnectedUserIds } }).select("-password");
    res.status(200).json(users);
});

export const getMessages = asyncHandler(async (req, res) => {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const { limit = 50, cursor } = req.query;

    const query = {
        $or: [
            { senderId: myId, receiverId: userToChatId },
            { senderId: userToChatId, receiverId: myId },
        ],
    };

    if (cursor) query._id = { $lt: cursor };

    const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) + 1)
        .populate({
            path: "replyTo",
            select: "text image senderId createdAt",
            populate: {
                path: "senderId",
                select: "username fullName profilePic",
            },
        });

    const hasMore = messages.length > limit;
    const returnedMessages = hasMore ? messages.slice(0, limit) : messages;
    const sortedMessages = returnedMessages.reverse();
    const nextCursor = hasMore ? returnedMessages[returnedMessages.length - 1]._id : null;

    res.status(200).json({
        messages: sortedMessages,
        pagination: { hasMore, nextCursor, limit: parseInt(limit) },
    });
});

export const sendMessage = asyncHandler(async (req, res) => {
    const { text, image, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
        replyTo: replyTo || null,
    });

    await newMessage.save();
    await newMessage.populate({
        path: "replyTo",
        select: "text image senderId createdAt",
        populate: {
            path: "senderId",
            select: "username fullName profilePic",
        },
    });

    const receiverSocketId = await getReceiverSocketId(receiverId);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
});

export const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    const result = await Message.updateMany(
        { senderId, receiverId, status: { $ne: "read" } },
        { $set: { status: "read", readAt: new Date() } }
    );

    const readMessages = await Message.find({
        senderId,
        receiverId,
        status: "read",
    }).select("_id");

    const senderSocketId = await getReceiverSocketId(senderId);
    if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", {
            readBy: receiverId,
            messageIds: readMessages.map((m) => m._id),
            readAt: new Date(),
        });
    }

    res.status(200).json({
        message: "Messages marked as read",
        count: result.modifiedCount,
    });
});
