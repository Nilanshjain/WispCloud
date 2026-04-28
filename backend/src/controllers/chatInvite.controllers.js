import ChatInvite from "../models/chatInvite.model.js";
import User from "../models/user.model.js";
import { io, userRoom } from "../lib/socket.js";
import { EVENTS } from "../lib/socketEvents.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../lib/errors.js";

export const sendChatInvite = asyncHandler(async (req, res) => {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId.toString()) {
        throw new ValidationError("You cannot invite yourself");
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) throw new NotFoundError("User not found");

    const existingInvite = await ChatInvite.findOne({
        $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
        ],
    });

    if (existingInvite) {
        if (existingInvite.status === "pending") {
            throw new ValidationError("Chat invite already pending");
        }
        if (existingInvite.status === "accepted") {
            throw new ValidationError("You are already connected");
        }
        // Rejected → allow re-send by reopening the existing record.
        if (existingInvite.status === "rejected") {
            existingInvite.status = "pending";
            existingInvite.senderId = senderId;
            existingInvite.receiverId = receiverId;
            await existingInvite.save();

            io.to(userRoom(receiverId)).emit(EVENTS.NEW_CHAT_INVITE, {
                ...existingInvite.toObject(),
                sender: req.user,
            });
            return res.status(200).json(existingInvite);
        }
    }

    const newInvite = await ChatInvite.create({ senderId, receiverId });

    io.to(userRoom(receiverId)).emit(EVENTS.NEW_CHAT_INVITE, {
        ...newInvite.toObject(),
        sender: req.user,
    });

    res.status(201).json(newInvite);
});

export const acceptChatInvite = asyncHandler(async (req, res) => {
    const { id: inviteId } = req.params;
    const userId = req.user._id;

    const invite = await ChatInvite.findById(inviteId);
    if (!invite) throw new NotFoundError("Invite not found");

    if (invite.receiverId.toString() !== userId.toString()) {
        throw new ForbiddenError("You can only accept invites sent to you");
    }
    if (invite.status !== "pending") {
        throw new ValidationError("Invite is no longer pending");
    }

    invite.status = "accepted";
    await invite.save();

    io.to(userRoom(invite.senderId)).emit(EVENTS.CHAT_INVITE_ACCEPTED, {
        inviteId: invite._id,
        acceptedBy: req.user,
    });

    res.status(200).json(invite);
});

export const rejectChatInvite = asyncHandler(async (req, res) => {
    const { id: inviteId } = req.params;
    const userId = req.user._id;

    const invite = await ChatInvite.findById(inviteId);
    if (!invite) throw new NotFoundError("Invite not found");

    if (invite.receiverId.toString() !== userId.toString()) {
        throw new ForbiddenError("You can only reject invites sent to you");
    }
    if (invite.status !== "pending") {
        throw new ValidationError("Invite is no longer pending");
    }

    invite.status = "rejected";
    await invite.save();

    io.to(userRoom(invite.senderId)).emit(EVENTS.CHAT_INVITE_REJECTED, {
        inviteId: invite._id,
        rejectedBy: userId,
    });

    res.status(200).json(invite);
});

export const getPendingInvites = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const invites = await ChatInvite.find({ receiverId: userId, status: "pending" })
        .populate("senderId", "fullName username profilePic")
        .sort({ createdAt: -1 });
    res.status(200).json(invites);
});

export const getSentInvites = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const invites = await ChatInvite.find({ senderId: userId, status: "pending" })
        .populate("receiverId", "fullName username profilePic")
        .sort({ createdAt: -1 });
    res.status(200).json(invites);
});

export const cancelChatInvite = asyncHandler(async (req, res) => {
    const { id: inviteId } = req.params;
    const userId = req.user._id;

    const invite = await ChatInvite.findById(inviteId);
    if (!invite) throw new NotFoundError("Invite not found");

    if (invite.senderId.toString() !== userId.toString()) {
        throw new ForbiddenError("You can only cancel invites you sent");
    }
    if (invite.status !== "pending") {
        throw new ValidationError("Can only cancel pending invites");
    }

    await invite.deleteOne();

    io.to(userRoom(invite.receiverId)).emit(EVENTS.CHAT_INVITE_CANCELLED, { inviteId: invite._id });

    res.status(200).json({ message: "Invite cancelled successfully" });
});
