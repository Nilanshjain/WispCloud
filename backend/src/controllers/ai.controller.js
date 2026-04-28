import Message from "../models/message.model.js";
import GroupMember from "../models/groupMember.model.js";
import { summarizeConversation, answerQuestion, extractActionItems } from "../services/ai.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { ValidationError, ForbiddenError } from "../lib/errors.js";

/**
 * Fetch messages for AI processing with authorization checks. Throws on unauthorized
 * access; returns the message array on success.
 */
async function fetchConversationMessages(conversationId, conversationType, userId, options = {}) {
    const { since, lastN = 200 } = options;

    if (conversationType === "group") {
        const membership = await GroupMember.findOne({
            groupId: conversationId,
            userId,
            status: "active",
        });
        if (!membership) {
            throw new ForbiddenError("You are not a member of this group");
        }

        const query = { receiverId: conversationId, isGroupMessage: true };
        if (since) query.createdAt = { $gte: new Date(since) };

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(lastN)
            .populate("senderId", "fullName username");
        return messages.reverse();
    }

    // DM conversation
    const query = {
        $or: [
            { senderId: userId, receiverId: conversationId },
            { senderId: conversationId, receiverId: userId },
        ],
    };
    if (since) query.createdAt = { $gte: new Date(since) };

    const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(lastN)
        .populate("senderId", "fullName username");
    return messages.reverse();
}

const validateConversationParams = (body, requiredKeys = []) => {
    const { conversationId, conversationType } = body;
    if (!conversationId || !conversationType) {
        throw new ValidationError("conversationId and conversationType are required");
    }
    if (!["dm", "group"].includes(conversationType)) {
        throw new ValidationError("conversationType must be 'dm' or 'group'");
    }
    for (const key of requiredKeys) {
        if (!body[key]) throw new ValidationError(`${key} is required`);
    }
};

export const handleSummarize = asyncHandler(async (req, res) => {
    const { conversationId, conversationType, since, lastN } = req.body;
    const userId = req.user._id;

    validateConversationParams(req.body);

    const messages = await fetchConversationMessages(conversationId, conversationType, userId, { since, lastN });
    const summary = await summarizeConversation(messages, { since });

    res.status(200).json({
        summary,
        messageCount: messages.length,
        timeRange: {
            from: messages.length > 0 ? messages[0].createdAt : null,
            to: messages.length > 0 ? messages[messages.length - 1].createdAt : null,
        },
    });
});

export const handleAsk = asyncHandler(async (req, res) => {
    const { conversationId, conversationType, question } = req.body;
    const userId = req.user._id;

    validateConversationParams(req.body, ["question"]);

    const messages = await fetchConversationMessages(conversationId, conversationType, userId, { lastN: 300 });
    const answer = await answerQuestion(messages, question);

    res.status(200).json({ answer, messageCount: messages.length });
});

export const handleActionItems = asyncHandler(async (req, res) => {
    const { conversationId, conversationType } = req.body;
    const userId = req.user._id;

    validateConversationParams(req.body);

    const messages = await fetchConversationMessages(conversationId, conversationType, userId, { lastN: 200 });
    const actionItems = await extractActionItems(messages);

    res.status(200).json({ actionItems, messageCount: messages.length });
});
