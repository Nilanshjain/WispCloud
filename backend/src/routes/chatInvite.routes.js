import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate, userIdParamSchema } from "../middleware/validation.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import {
  sendChatInvite,
  acceptChatInvite,
  rejectChatInvite,
  getPendingInvites,
  getSentInvites,
  cancelChatInvite,
} from "../controllers/chatInvite.controllers.js";

const router = express.Router();

// All invite routes are auth-required + apiLimiter capped (200/min) — defense
// against invite spam. Per-route limits could be tighter on the write paths
// (send/accept/reject/cancel) but globalLimiter + apiLimiter already provide
// two layers; tighter caps land in M12 if abuse is observed.
router.use(protectRoute, apiLimiter);

router.post("/send/:id", validate(userIdParamSchema, 'params'), sendChatInvite);
router.put("/accept/:id", acceptChatInvite);
router.put("/reject/:id", rejectChatInvite);
router.get("/pending", getPendingInvites);
router.get("/sent", getSentInvites);
router.delete("/cancel/:id", cancelChatInvite);

export default router;
