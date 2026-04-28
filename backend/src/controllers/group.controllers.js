import Group from "../models/group.model.js";
import GroupMember from "../models/groupMember.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { ValidationError, ForbiddenError, NotFoundError } from "../lib/errors.js";

export const createGroup = asyncHandler(async (req, res) => {
    const { name, description, groupImage, type, maxMembers, settings } = req.body;
    const userId = req.user._id;

    const group = await Group.create({
        name,
        description,
        groupImage: groupImage || "",
        createdBy: userId,
        type: type || "private",
        maxMembers: maxMembers || 100,
        settings: settings || {},
    });

    await GroupMember.create({
        groupId: group._id,
        userId,
        role: "owner",
        status: "active",
    });

    const populatedGroup = await Group.findById(group._id)
        .populate("createdBy", "username email profilePic");

    req.log.info({ groupId: group._id.toString(), userId: userId.toString() }, "group created");
    res.status(201).json(populatedGroup);
});

export const updateGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { name, description, groupImage, type, maxMembers, settings } = req.body;
    const userId = req.user._id;

    const membership = await GroupMember.findOne({ groupId, userId, status: "active" });
    if (!membership || !membership.permissions.canEditGroup) {
        throw new ForbiddenError("You do not have permission to edit this group");
    }

    const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        { name, description, groupImage, type, maxMembers, settings },
        { new: true, runValidators: true }
    ).populate("createdBy", "username email profilePic");

    if (!updatedGroup) throw new NotFoundError("Group not found");

    res.status(200).json(updatedGroup);
});

// Soft-delete cascade: memberships + messages updateMany'd, group via softDelete().
export const deleteGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    const membership = await GroupMember.findOne({
        groupId,
        userId,
        role: "owner",
        status: "active",
    });
    if (!membership) {
        throw new ForbiddenError("Only the group owner can delete the group");
    }

    const now = new Date();
    await GroupMember.updateMany(
        { groupId },
        { $set: { deletedAt: now, deletedBy: userId } }
    );
    await Message.updateMany(
        { receiverId: groupId, isGroupMessage: true },
        { $set: { deletedAt: now, deletedBy: userId } }
    );

    const group = await Group.findById(groupId);
    if (group) {
        await group.softDelete(userId);
    }

    req.log.info({ groupId, userId: userId.toString() }, "group deleted (cascade)");
    res.status(200).json({ message: "Group deleted successfully" });
});

export const addMember = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { userIds } = req.body;
    const requestingUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) throw new NotFoundError("Group not found");

    const membership = await GroupMember.findOne({
        groupId,
        userId: requestingUserId,
        status: "active",
    });
    if (!membership || !membership.permissions.canAddMembers) {
        throw new ForbiddenError("You do not have permission to add members");
    }

    const currentMemberCount = await GroupMember.countDocuments({
        groupId,
        status: { $in: ["active", "pending"] },
    });
    if (currentMemberCount + userIds.length > group.maxMembers) {
        throw new ValidationError("Group is at maximum capacity");
    }

    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
        throw new ValidationError("One or more user IDs are invalid");
    }

    const addedMembers = [];
    for (const userId of userIds) {
        const existingMember = await GroupMember.findOne({ groupId, userId });
        if (existingMember) {
            if (existingMember.status === "left" || existingMember.status === "banned") {
                existingMember.status = group.settings.requireApproval ? "pending" : "active";
                existingMember.joinedAt = Date.now();
                await existingMember.save();
                addedMembers.push(existingMember);
            }
            // Skip if already active or pending.
        } else {
            const newMember = await GroupMember.create({
                groupId,
                userId,
                role: "member",
                status: group.settings.requireApproval ? "pending" : "active",
            });
            addedMembers.push(newMember);
        }
    }

    const activeMemberCount = await GroupMember.countDocuments({ groupId, status: "active" });
    group.stats.totalMembers = activeMemberCount;
    await group.save();

    const populatedMembers = await GroupMember.find({
        _id: { $in: addedMembers.map((m) => m._id) },
    }).populate("userId", "username email profilePic");

    req.log.info({ groupId, addedCount: addedMembers.length }, "members added to group");
    res.status(200).json(populatedMembers);
});

export const removeMember = asyncHandler(async (req, res) => {
    const { groupId, memberId } = req.params;
    const requestingUserId = req.user._id;

    const requestingMembership = await GroupMember.findOne({
        groupId,
        userId: requestingUserId,
        status: "active",
    });
    if (!requestingMembership || !requestingMembership.permissions.canRemoveMembers) {
        throw new ForbiddenError("You do not have permission to remove members");
    }

    const targetMembership = await GroupMember.findOne({ groupId, userId: memberId });
    if (!targetMembership) throw new NotFoundError("Member not found in this group");

    if (targetMembership.role === "owner") {
        throw new ForbiddenError("Cannot remove the group owner");
    }
    if (targetMembership.role === "admin" && requestingMembership.role !== "owner") {
        throw new ForbiddenError("Only the owner can remove admins");
    }

    targetMembership.status = "left";
    await targetMembership.save();

    const group = await Group.findById(groupId);
    const activeMemberCount = await GroupMember.countDocuments({ groupId, status: "active" });
    group.stats.totalMembers = activeMemberCount;
    await group.save();

    res.status(200).json({ message: "Member removed successfully" });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
    const { groupId, memberId } = req.params;
    const { role } = req.body;
    const requestingUserId = req.user._id;

    const requestingMembership = await GroupMember.findOne({
        groupId,
        userId: requestingUserId,
        role: "owner",
        status: "active",
    });
    if (!requestingMembership) {
        throw new ForbiddenError("Only the group owner can change member roles");
    }

    const targetMembership = await GroupMember.findOne({
        groupId,
        userId: memberId,
        status: "active",
    });
    if (!targetMembership) throw new NotFoundError("Member not found in this group");
    if (targetMembership.role === "owner") {
        throw new ForbiddenError("Cannot change the owner role");
    }

    targetMembership.role = role;
    await targetMembership.save();

    const populatedMember = await GroupMember.findById(targetMembership._id)
        .populate("userId", "username email profilePic");

    res.status(200).json(populatedMember);
});

export const getGroupDetails = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    const membership = await GroupMember.findOne({
        groupId,
        userId,
        status: { $in: ["active", "pending"] },
    });
    if (!membership) throw new ForbiddenError("You are not a member of this group");

    const group = await Group.findById(groupId)
        .populate("createdBy", "username email profilePic");
    if (!group) throw new NotFoundError("Group not found");

    res.status(200).json({ group, membership });
});

export const getGroupMembers = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    const membership = await GroupMember.findOne({
        groupId,
        userId,
        status: { $in: ["active", "pending"] },
    });
    if (!membership) throw new ForbiddenError("You are not a member of this group");

    const members = await GroupMember.find({ groupId, status: "active" })
        .populate("userId", "username email profilePic")
        .sort({ role: 1, joinedAt: 1 });

    res.status(200).json(members);
});

export const leaveGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    const membership = await GroupMember.findOne({ groupId, userId, status: "active" });
    if (!membership) throw new NotFoundError("You are not a member of this group");

    if (membership.role === "owner") {
        throw new ForbiddenError(
            "Owner cannot leave the group. Transfer ownership or delete the group."
        );
    }

    membership.status = "left";
    await membership.save();

    const group = await Group.findById(groupId);
    const activeMemberCount = await GroupMember.countDocuments({ groupId, status: "active" });
    group.stats.totalMembers = activeMemberCount;
    await group.save();

    res.status(200).json({ message: "Successfully left the group" });
});

export const getUserGroups = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const memberships = await GroupMember.find({ userId, status: "active" })
        .populate({
            path: "groupId",
            populate: { path: "createdBy", select: "username profilePic" },
        });

    const groups = memberships
        .filter((m) => m.groupId) // soft-deleted groups produce null after auto-filter
        .map((m) => ({
            ...m.groupId.toObject(),
            memberRole: m.role,
            memberPermissions: m.permissions,
        }));

    res.status(200).json(groups);
});
