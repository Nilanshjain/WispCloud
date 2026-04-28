import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
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

// Group management routes — Zod gates body, params, and (where present) query.
router.post("/",
    protectRoute,
    validate(createGroupSchema),
    createGroup
);
router.put("/:groupId",
    protectRoute,
    validate(groupIdParamSchema, "params"),
    validate(updateGroupSchema),
    updateGroup
);
router.delete("/:groupId",
    protectRoute,
    validate(groupIdParamSchema, "params"),
    deleteGroup
);
router.get("/user/groups", protectRoute, getUserGroups);
router.get("/:groupId",
    protectRoute,
    validate(groupIdParamSchema, "params"),
    getGroupDetails
);

// Member management
router.get("/:groupId/members",
    protectRoute,
    validate(groupIdParamSchema, "params"),
    getGroupMembers
);
router.post("/:groupId/members",
    protectRoute,
    validate(groupIdParamSchema, "params"),
    validate(addMemberSchema),
    addMember
);
router.delete("/:groupId/members/:memberId",
    protectRoute,
    validate(groupMemberParamSchema, "params"),
    removeMember
);
router.put("/:groupId/members/:memberId/role",
    protectRoute,
    validate(groupMemberParamSchema, "params"),
    validate(updateMemberRoleSchema),
    updateMemberRole
);
router.post("/:groupId/leave",
    protectRoute,
    validate(groupIdParamSchema, "params"),
    leaveGroup
);

// Group message routes
router.post("/:groupId/messages",
    protectRoute,
    validate(groupIdParamSchema, "params"),
    validate(sendGroupMessageSchema),
    sendGroupMessage
);
router.get("/:groupId/messages",
    protectRoute,
    validate(groupIdParamSchema, "params"),
    validate(paginationSchema, "query"),
    getGroupMessages
);
router.delete("/:groupId/messages/:messageId",
    protectRoute,
    validate(groupMessageParamSchema, "params"),
    deleteGroupMessage
);
router.put("/:groupId/messages/read",
    protectRoute,
    validate(groupIdParamSchema, "params"),
    markGroupMessagesAsRead
);
router.get("/:groupId/messages/unread",
    protectRoute,
    validate(groupIdParamSchema, "params"),
    getUnreadGroupMessageCount
);

export default router;
