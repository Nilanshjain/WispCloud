import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/rbac.middleware.js";
import {
    validate,
    analyticsDaysQuerySchema,
    analyticsLimitQuerySchema,
} from "../middleware/validation.js";
import {
    getPlatformStats,
    getUserActivity,
    getMessageActivity,
    getGroupStats,
    getUserRoles,
    getAuthProviders,
    getTopUsers,
    getSystemHealth,
} from "../controllers/analytics.controller.js";

const router = express.Router();

// All analytics routes require authentication and admin role.
router.use(protectRoute);
router.use(requireAdmin);

// Platform statistics
router.get("/stats", getPlatformStats);

// User analytics — `days` query param is optional, Zod coerces and clamps.
router.get("/user-activity", validate(analyticsDaysQuerySchema, "query"), getUserActivity);
router.get("/user-roles", getUserRoles);
router.get("/top-users", validate(analyticsLimitQuerySchema, "query"), getTopUsers);

// Message analytics
router.get("/message-activity", validate(analyticsDaysQuerySchema, "query"), getMessageActivity);

// Group analytics
router.get("/group-stats", getGroupStats);

// Authentication analytics
router.get("/auth-providers", getAuthProviders);

// System health
router.get("/system-health", getSystemHealth);

export default router;
