import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { apiLimiter, messageLimiter } from "../middleware/rateLimiter.js";
import {
    validate,
    createGroupSchema,
    updateGroupSchema,
    addMemberSchema,
    updateMemberRoleSchema,
    sendGroupMessageSchema,
    groupIdParamSchema,
    groupMemberParamSchema,
    groupMessageParamSchema,
    paginationSchema,
} from "../middleware/validation.js";
import {
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    updateMemberRole,
    getGroupDetails,
    getGroupMembers,
    leaveGroup,
    getUserGroups,
} from "../controllers/group.controllers.js";
import {
    sendGroupMessage,
    getGroupMessages,
    deleteGroupMessage,
    markGroupMessagesAsRead,
    getUnreadGroupMessageCount,
} from "../controllers/groupMessage.controllers.js";

const router = express.Router();

// All group routes require auth + apiLimiter (200/min/user). Message-send route
// gets the stricter messageLimiter (50/min) inline since it's the high-volume
// write path. The group-message GET path inherits the apiLimiter only — reads
// don't need the message-specific cap.
router.use(protectRoute, apiLimiter);

// Group management
router.post("/", validate(createGroupSchema), createGroup);
router.put("/:groupId", validate(groupIdParamSchema, "params"), validate(updateGroupSchema), updateGroup);
router.delete("/:groupId", validate(groupIdParamSchema, "params"), deleteGroup);
router.get("/user/groups", getUserGroups);
router.get("/:groupId", validate(groupIdParamSchema, "params"), getGroupDetails);

// Member management
router.get("/:groupId/members", validate(groupIdParamSchema, "params"), getGroupMembers);
router.post("/:groupId/members", validate(groupIdParamSchema, "params"), validate(addMemberSchema), addMember);
router.delete("/:groupId/members/:memberId", validate(groupMemberParamSchema, "params"), removeMember);
router.put("/:groupId/members/:memberId/role", validate(groupMemberParamSchema, "params"), validate(updateMemberRoleSchema), updateMemberRole);
router.post("/:groupId/leave", validate(groupIdParamSchema, "params"), leaveGroup);

// Group messages — write path gets the stricter messageLimiter on top of apiLimiter.
router.post("/:groupId/messages",
    messageLimiter,
    validate(groupIdParamSchema, "params"),
    validate(sendGroupMessageSchema),
    sendGroupMessage
);
router.get("/:groupId/messages",
    validate(groupIdParamSchema, "params"),
    validate(paginationSchema, "query"),
    getGroupMessages
);
router.delete("/:groupId/messages/:messageId", validate(groupMessageParamSchema, "params"), deleteGroupMessage);
router.put("/:groupId/messages/read", validate(groupIdParamSchema, "params"), markGroupMessagesAsRead);
router.get("/:groupId/messages/unread", validate(groupIdParamSchema, "params"), getUnreadGroupMessageCount);

export default router;
