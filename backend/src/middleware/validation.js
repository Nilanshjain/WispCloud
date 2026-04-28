import { z } from 'zod';
import { ValidationError } from '../lib/errors.js';

/**
 * Validation middleware factory. Throws ValidationError on failure; the central
 * error middleware converts it to the structured 400 response. Don't return the
 * response here — that would bypass the central handler's logging + requestId.
 *
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from ('body', 'query', 'params')
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = req[source];
            const validated = schema.parse(data);
            req[source] = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const details = error.issues ? error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                })) : [];
                return next(new ValidationError('Validation failed', details));
            }
            next(error);
        }
    };
};

// Auth validation schemas
export const signupSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .min(3, 'Email must be at least 3 characters')
        .max(100, 'Email too long'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .trim()
        .toLowerCase(),
    password: z.string()
        .min(12, 'Password must be at least 12 characters')
        .max(100, 'Password too long'),
    fullName: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(50, 'Full name too long')
        .trim(),
});

export const loginSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .min(3, 'Email required'),
    password: z.string()
        .min(1, 'Password required'),
});

export const updateProfileSchema = z.object({
    profilePic: z.string()
        .url('Invalid image URL')
        .optional()
        .or(z.string().startsWith('data:image/', 'Invalid base64 image')),
});

// Message validation schemas
export const sendMessageSchema = z.object({
    text: z.union([
        z.string().trim().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
        z.literal(''),
        z.null(),
        z.undefined()
    ]).optional(),
    image: z.union([
        z.string().url('Invalid image URL'),
        z.string().startsWith('data:image/', 'Invalid base64 image'),
        z.null(),
        z.undefined()
    ]).optional(),
}).refine(
    data => (data.text && data.text.trim()) || data.image,
    { message: 'Either text or image must be provided' }
);

export const userIdParamSchema = z.object({
    id: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
});

export const userProfileParamSchema = z.object({
    userId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
});

// Query parameter schemas
export const paginationSchema = z.object({
    limit: z.string()
        .optional()
        .transform(val => val ? parseInt(val, 10) : 50)
        .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    cursor: z.string()
        .optional(),
});

export const searchQuerySchema = z.object({
    q: z.string()
        .min(2, 'Search query must be at least 2 characters')
        .max(100, 'Search query too long'),
    limit: z.string()
        .optional()
        .transform(val => val ? parseInt(val, 10) : 20)
        .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    cursor: z.string()
        .optional(),
});

// Group schemas
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const groupIdParamSchema = z.object({
    groupId: z.string().regex(objectIdRegex, 'Invalid group ID format'),
});

export const groupMemberParamSchema = z.object({
    groupId: z.string().regex(objectIdRegex, 'Invalid group ID format'),
    memberId: z.string().regex(objectIdRegex, 'Invalid member ID format'),
});

export const groupMessageParamSchema = z.object({
    groupId: z.string().regex(objectIdRegex, 'Invalid group ID format'),
    messageId: z.string().regex(objectIdRegex, 'Invalid message ID format'),
});

export const createGroupSchema = z.object({
    name: z.string().trim().min(3, 'Group name must be at least 3 characters').max(50, 'Group name too long'),
    description: z.string().trim().max(500, 'Description too long').optional(),
    groupImage: z.union([z.string(), z.null(), z.undefined()]).optional(),
    type: z.enum(['public', 'private']).optional(),
    maxMembers: z.number().int().min(2).max(1000).optional(),
    settings: z.object({
        whoCanMessage: z.enum(['all', 'admins_only']).optional(),
        whoCanAddMembers: z.enum(['all', 'admins_only', 'owner_only']).optional(),
        requireApproval: z.boolean().optional(),
    }).optional(),
});

export const updateGroupSchema = createGroupSchema.partial();

export const addMemberSchema = z.object({
    userIds: z.array(z.string().regex(objectIdRegex, 'Invalid user ID')).min(1, 'At least one user ID required').max(50, 'Too many users at once'),
});

export const updateMemberRoleSchema = z.object({
    role: z.enum(['admin', 'member'], { message: 'Invalid role. Must be "admin" or "member"' }),
});

// Matches sendMessageSchema's defensive shape: frontend may pass `null` (default
// state when no image / no reply) which `z.string().optional()` would reject —
// `optional()` allows `undefined` only, not `null`. Union with z.null() makes it
// tolerant. The refine still enforces "must have text OR image" semantics.
export const sendGroupMessageSchema = z.object({
    text: z.union([
        z.string().trim().max(5000, 'Message too long'),
        z.null(),
        z.undefined(),
    ]).optional(),
    image: z.union([
        z.string(),
        z.null(),
        z.undefined(),
    ]).optional(),
    replyTo: z.union([
        z.string().regex(objectIdRegex, 'Invalid reply-to message ID'),
        z.null(),
        z.undefined(),
    ]).optional(),
}).refine(
    data => (data.text && data.text.trim().length > 0) || data.image,
    { message: 'Either text or image must be provided' }
);

// Analytics query schemas
export const analyticsDaysQuerySchema = z.object({
    days: z.string()
        .optional()
        .transform(val => val ? parseInt(val, 10) : 30)
        .refine(val => val > 0 && val <= 365, 'Days must be between 1 and 365'),
});

export const analyticsLimitQuerySchema = z.object({
    limit: z.string()
        .optional()
        .transform(val => val ? parseInt(val, 10) : 10)
        .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

// AI schemas — three endpoints share these required fields; optional question
// for /ask validated again in the controller for the field-specific message.
export const aiConversationSchema = z.object({
    conversationId: z.string().regex(objectIdRegex, 'Invalid conversation ID'),
    conversationType: z.enum(['dm', 'group'], { message: "conversationType must be 'dm' or 'group'" }),
    since: z.string().datetime({ offset: true }).optional().or(z.string().refine(v => !isNaN(Date.parse(v)), 'Invalid since date').optional()),
    lastN: z.number().int().min(1).max(500).optional(),
});

export const aiAskSchema = aiConversationSchema.extend({
    question: z.string().trim().min(1, 'question is required').max(2000, 'question too long'),
});

// ChatInvite schemas
export const sendInviteSchema = z.object({
    receiverId: z.string().regex(objectIdRegex, 'Invalid receiver ID'),
});

export const inviteIdParamSchema = z.object({
    inviteId: z.string().regex(objectIdRegex, 'Invalid invite ID format'),
});

// Socket event schemas — same z.parse() story applied to socket.io payloads.
// Validation runs inside the socket.on(...) handler before any business logic.
// Failure = silent ignore (we don't disconnect; the client could be a buggy
// older version that's still mostly working). Structured warn-log with reqId
// equivalent (socketId) for debugging.

export const socketTypingSchema = z.object({
    receiverId: z.string().regex(objectIdRegex, 'Invalid receiver ID'),
    isTyping: z.boolean(),
});

export const socketGroupTypingSchema = z.object({
    groupId: z.string().regex(objectIdRegex, 'Invalid group ID'),
    isTyping: z.boolean(),
});

export const socketJoinGroupSchema = z.object({
    groupId: z.string().regex(objectIdRegex, 'Invalid group ID'),
});

export const socketLeaveGroupSchema = z.object({
    groupId: z.string().regex(objectIdRegex, 'Invalid group ID'),
});

export default {
    validate,
    signupSchema,
    loginSchema,
    updateProfileSchema,
    sendMessageSchema,
    userIdParamSchema,
    userProfileParamSchema,
    paginationSchema,
    searchQuerySchema,
    groupIdParamSchema,
    groupMemberParamSchema,
    groupMessageParamSchema,
    createGroupSchema,
    updateGroupSchema,
    addMemberSchema,
    updateMemberRoleSchema,
    sendGroupMessageSchema,
    analyticsDaysQuerySchema,
    analyticsLimitQuerySchema,
    aiConversationSchema,
    aiAskSchema,
    sendInviteSchema,
    inviteIdParamSchema,
    socketTypingSchema,
    socketGroupTypingSchema,
    socketJoinGroupSchema,
    socketLeaveGroupSchema,
};
