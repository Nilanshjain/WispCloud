import express from "express";
import {
  searchUsers,
  getRecentChats,
  getSuggestedUsers,
  getUserProfile
} from "../controllers/user.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate, searchQuerySchema, userProfileParamSchema } from "../middleware/validation.js";
import { apiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Search users by name or email — apiLimiter (200/min) caps abuse on the
// most expensive user route (text-index lookup). Restored after the
// "removed for development" comment from the M01 era.
router.get("/search", apiLimiter, validate(searchQuerySchema, 'query'), searchUsers);

// Get recent conversations
router.get("/recent", getRecentChats);

// Get suggested users
router.get("/suggested", getSuggestedUsers);

// Get user profile by ID
router.get("/profile/:userId", validate(userProfileParamSchema, 'params'), getUserProfile);

export default router;
