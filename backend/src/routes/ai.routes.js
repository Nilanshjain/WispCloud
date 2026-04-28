import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import {
    validate,
    aiConversationSchema,
    aiAskSchema,
} from "../middleware/validation.js";
import { handleSummarize, handleAsk, handleActionItems } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/summarize", protectRoute, aiLimiter, validate(aiConversationSchema), handleSummarize);
router.post("/ask", protectRoute, aiLimiter, validate(aiAskSchema), handleAsk);
router.post("/action-items", protectRoute, aiLimiter, validate(aiConversationSchema), handleActionItems);

export default router;
