import Group from "../models/group.model.js";
import GroupMember from "../models/groupMember.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { withTimeout } from "../lib/externalCall.js";
import { io } from "../lib/socket.js";
import { EVENTS } from "../lib/socketEvents.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { ForbiddenError, NotFoundError } from "../lib/errors.js";

export const sendGroupMessage = asyncHandler(async (req, res) => {
    const { text, image, replyTo } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    const membership = await GroupMember.findOne({
        groupId,
        userId: senderId,
        status: "active",
    });
    if (!membership) throw new ForbiddenError("You are not a member of this group");
    if (!membership.permissions.canSendMessages) {
        throw new ForbiddenError("You do not have permission to send messages in this group");
    }

    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    if (group.settings.whoCanMessage === "admins_only" && !["owner", "admin"].includes(membership.role)) {
        throw new ForbiddenError("Only admins can send messages in this group");
    }

    let imageUrl;
    if (image) {
        const uploadResponse = await withTimeout("cloudinary.upload", 30000, () =>
            cloudinary.uploader.upload(image)
        );
        imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
        senderId,
        receiverId: groupId,
        text,
        image: imageUrl,
        isGroupMessage: true,
        replyTo: replyTo || null,
    });
    await newMessage.save();

    group.stats.totalMessages += 1;
    await group.save();

    const populatedMessage = await Message.findById(newMessage._id)
        .populate("senderId", "username profilePic fullName")
        .populate({
            path: "replyTo",
            select: "text image senderId createdAt",
            populate: { path: "senderId", select: "username profilePic fullName" },
        });

    io.to(groupId.toString()).emit(EVENTS.NEW_GROUP_MESSAGE, { message: populatedMessage, groupId });

    res.status(201).json(populatedMessage);
});

export const getGroupMessages = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;
    const { limit = 50, cursor } = req.query;

    const membership = await GroupMember.findOne({
        groupId,
        userId,
        status: { $in: ["active", "pending"] },
    });
    if (!membership) throw new ForbiddenError("You are not a member of this group");

    const query = { receiverId: groupId, isGroupMessage: true };
    if (cursor) query._id = { $lt: cursor };

    const messages = await Message.find(query)
        .populate("senderId", "username profilePic fullName")
        .populate({
            path: "replyTo",
            select: "text image senderId createdAt",
            populate: { path: "senderId", select: "username profilePic fullName" },
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) + 1);

    const hasMore = messages.length > limit;
    const returnedMessages = hasMore ? messages.slice(0, limit) : messages;
    const sortedMessages = returnedMessages.reverse();
    const nextCursor = hasMore ? returnedMessages[returnedMessages.length - 1]._id : null;

    membership.lastReadAt = new Date();
    await membership.save();

    res.status(200).json({
        messages: sortedMessages,
        pagination: { hasMore, nextCursor, limit: parseInt(limit) },
    });
});

export const deleteGroupMessage = asyncHandler(async (req, res) => {
    const { groupId, messageId } = req.params;
    const userId = req.user._id;

    const membership = await GroupMember.findOne({ groupId, userId, status: "active" });
    if (!membership) throw new ForbiddenError("You are not a member of this group");

    const message = await Message.findById(messageId);
    if (!message || message.receiverId.toString() !== groupId) {
        throw new NotFoundError("Message not found");
    }

    const canDelete =
        message.senderId.toString() === userId.toString() ||
        ["owner", "admin"].includes(membership.role);
    if (!canDelete) throw new ForbiddenError("You do not have permission to delete this message");

    await message.softDelete(userId);

    const group = await Group.findById(groupId);
    if (group) {
        group.stats.totalMessages = Math.max(0, group.stats.totalMessages - 1);
        await group.save();
    }

    io.to(groupId.toString()).emit(EVENTS.GROUP_MESSAGE_DELETED, { messageId, groupId });

    res.status(200).json({ message: "Message deleted successfully" });
});

export const markGroupMessagesAsRead = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    const membership = await GroupMember.findOne({ groupId, userId, status: "active" });
    if (!membership) throw new ForbiddenError("You are not a member of this group");

    membership.lastReadAt = new Date();
    await membership.save();

    res.status(200).json({ message: "Messages marked as read" });
});

export const getUnreadGroupMessageCount = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    const membership = await GroupMember.findOne({ groupId, userId, status: "active" });
    if (!membership) throw new ForbiddenError("You are not a member of this group");

    const unreadCount = await Message.countDocuments({
        receiverId: groupId,
        isGroupMessage: true,
        senderId: { $ne: userId },
        createdAt: { $gt: membership.lastReadAt },
    });

    res.status(200).json({ unreadCount });
});
