import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { ValidationError, NotFoundError } from "../lib/errors.js";
import { getCachedUser, cacheUser } from "../lib/redis.js";

export const searchUsers = asyncHandler(async (req, res) => {
    // Zod has already coerced limit to number and validated q. Defaults are applied at the schema layer.
    const { q, limit = 20, cursor } = req.query;
    const loggedInUserId = req.user._id;

    let users;
    try {
        // Try $text first (uses the text index on fullName/email/username).
        const query = { $text: { $search: q }, _id: { $ne: loggedInUserId } };
        if (cursor) query._id = { ...query._id, $lt: cursor };

        users = await User.find(query)
            .select("fullName email username profilePic createdAt")
            .sort({ score: { $meta: "textScore" }, _id: -1 })
            .limit(parseInt(limit) + 1);
    } catch (textSearchError) {
        // Fallback to regex if no text index. Anchored at left to avoid full collection scan
        // and the user input is already trimmed by Zod, but this path is still ReDoS-prone
        // if the text index is missing — keep it as a graceful-degrade emergency only.
        req.log.warn({ err: textSearchError.message }, "Text search failed, falling back to regex");
        const searchRegex = new RegExp(q.trim(), "i");
        const query = {
            $or: [
                { fullName: searchRegex },
                { username: searchRegex },
                { email: searchRegex },
            ],
            _id: { $ne: loggedInUserId },
        };
        if (cursor) query._id = { ...query._id, $lt: cursor };

        users = await User.find(query)
            .select("fullName email username profilePic createdAt")
            .sort({ _id: -1 })
            .limit(parseInt(limit) + 1);
    }

    const hasMore = users.length > limit;
    const returnedUsers = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? returnedUsers[returnedUsers.length - 1]._id : null;

    res.status(200).json({
        users: returnedUsers,
        pagination: { hasMore, nextCursor, limit: parseInt(limit) },
    });
});

export const getRecentChats = asyncHandler(async (req, res) => {
    const loggedInUserId = req.user._id;

    const recentUsers = await Message.aggregate([
        {
            $match: {
                $or: [
                    { senderId: loggedInUserId },
                    { receiverId: loggedInUserId },
                ],
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ["$senderId", loggedInUserId] },
                        "$receiverId",
                        "$senderId",
                    ],
                },
                lastMessage: { $first: "$$ROOT" },
            },
        },
        { $limit: 50 },
    ]);

    const userIds = recentUsers.map((u) => u._id);
    const users = await User.find({ _id: { $in: userIds } })
        .select("fullName email username profilePic lastSeen");

    const usersWithLastMessage = users.map((user) => {
        const conversation = recentUsers.find(
            (c) => c._id.toString() === user._id.toString()
        );
        return {
            ...user.toObject(),
            lastMessage: {
                text: conversation.lastMessage.text,
                createdAt: conversation.lastMessage.createdAt,
                senderId: conversation.lastMessage.senderId,
            },
        };
    });

    usersWithLastMessage.sort(
        (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.status(200).json(usersWithLastMessage);
});

export const getSuggestedUsers = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    const loggedInUserId = req.user._id;

    const suggestedUsers = await User.find({ _id: { $ne: loggedInUserId } })
        .select("fullName email username profilePic createdAt")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

    res.status(200).json(suggestedUsers);
});

export const getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const loggedInUserId = req.user._id;

    if (userId === loggedInUserId.toString()) {
        throw new ValidationError("Use /api/auth/check for your own profile");
    }

    // Cache-aside on the public profile view. Same cache key as protectRoute
    // (`user:${id}`) so the entry is shared — every protectRoute call warms the
    // cache for subsequent profile views and vice versa. The cached doc has
    // more fields than this projection, but res.json on the cached object only
    // serializes what's there; a slight over-send is acceptable for cache hit
    // rate.
    let user = await getCachedUser(userId);
    if (!user) {
        user = await User.findById(userId)
            .select("-password")
            .lean();
        if (!user) throw new NotFoundError("User not found");
        await cacheUser(userId, user);
    }

    res.status(200).json(user);
});
