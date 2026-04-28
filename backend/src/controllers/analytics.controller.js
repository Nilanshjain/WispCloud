import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import GroupMember from "../models/groupMember.model.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const getPlatformStats = asyncHandler(async (req, res) => {
    // Lifetime totals — bypass soft-delete auto-filter via .withDeleted() so the
    // headline numbers stay stable when something gets soft-deleted. User has no
    // soft-delete plugin so its counts don't need the bypass.
    const [totalUsers, totalMessages, totalGroups, activeUsers, oauthUsers] = await Promise.all([
        User.countDocuments(),
        Message.find().withDeleted().countDocuments(),
        Group.find().withDeleted().countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ authProvider: { $ne: "local" } }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await Message.find({ createdAt: { $gte: today } })
        .withDeleted()
        .countDocuments();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    res.status(200).json({
        totalUsers,
        activeUsers,
        totalMessages,
        messagesToday,
        totalGroups,
        oauthUsers,
        newUsersThisWeek,
    });
});

export const getUserActivity = asyncHandler(async (req, res) => {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const userActivity = await User.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    res.status(200).json(userActivity);
});

export const getMessageActivity = asyncHandler(async (req, res) => {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const messageActivity = await Message.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    isGroupMessage: "$isGroupMessage",
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { "_id.date": 1 } },
    ]);

    res.status(200).json(messageActivity);
});

export const getGroupStats = asyncHandler(async (req, res) => {
    const [totalGroups, activeGroups, avgGroupSize, topGroups] = await Promise.all([
        Group.find().withDeleted().countDocuments(),
        Group.countDocuments({ isActive: true }),
        GroupMember.aggregate([
            { $match: { status: "active" } },
            { $group: { _id: "$groupId", memberCount: { $sum: 1 } } },
            { $group: { _id: null, avgSize: { $avg: "$memberCount" } } },
        ]),
        Group.find()
            .sort({ "stats.totalMessages": -1 })
            .limit(10)
            .populate("createdBy", "username")
            .select("name stats createdBy"),
    ]);

    res.status(200).json({
        totalGroups,
        activeGroups,
        avgGroupSize: avgGroupSize[0]?.avgSize || 0,
        topGroups,
    });
});

export const getUserRoles = asyncHandler(async (req, res) => {
    const roleDistribution = await User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    res.status(200).json(roleDistribution);
});

export const getAuthProviders = asyncHandler(async (req, res) => {
    const authProviders = await User.aggregate([
        { $group: { _id: "$authProvider", count: { $sum: 1 } } },
    ]);
    res.status(200).json(authProviders);
});

export const getTopUsers = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const topUsers = await Message.aggregate([
        { $group: { _id: "$senderId", messageCount: { $sum: 1 } } },
        { $sort: { messageCount: -1 } },
        { $limit: parseInt(limit) },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },
        {
            $project: {
                _id: 1,
                messageCount: 1,
                username: "$user.username",
                fullName: "$user.fullName",
                profilePic: "$user.profilePic",
            },
        },
    ]);

    res.status(200).json(topUsers);
});

export const getSystemHealth = asyncHandler(async (req, res) => {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    let dbStats = {};
    try {
        dbStats = await User.db.db.stats();
    } catch (error) {
        req.log.warn({ err: error.message }, "Could not fetch DB stats");
    }

    res.status(200).json({
        uptime: Math.floor(uptime),
        memory: {
            rss: Math.floor(memoryUsage.rss / 1024 / 1024),
            heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024),
        },
        database: {
            dataSize: dbStats.dataSize ? Math.floor(dbStats.dataSize / 1024 / 1024) : 0,
            storageSize: dbStats.storageSize ? Math.floor(dbStats.storageSize / 1024 / 1024) : 0,
        },
        nodeVersion: process.version,
        platform: process.platform,
    });
});
