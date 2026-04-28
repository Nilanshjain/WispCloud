import mongoose from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            // NOTE: dropped index:true — covered by compound { senderId, receiverId, createdAt } prefix.
        },

        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            // 🚩 KNOWN DESIGN DEBT: polymorphic — references either User (DMs) or Group (group msgs).
            // No `ref` because Mongoose ref must point to a single model. populate() doesn't work here.
            // Fix would be either (a) add a discriminator field + custom resolver, or (b) split into
            // two collections. Both are M16 system-design conversations, not M02 scope.
            // NOTE: dropped index:true — covered by compound { receiverId, senderId, createdAt } prefix.
        },

        isGroupMessage: {
            type: Boolean,
            default: false,
            // NOTE: dropped index:true — only 2 distinct values (Boolean), useless as standalone index;
            // serves only as trailing filter in compound { receiverId, isGroupMessage, createdAt }.
        },

        text: {
            type: String,
            trim: true,
        },

        image: {
            type: String,
        },

        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null,
        },

        status: {
            type: String,
            enum: ['sent', 'delivered', 'read'],
            default: 'sent',
        },

        readAt: {
            type: Date,
        },

        // NLP/Recall fields
        entities: [{
            type: {
                type: String,
                enum: ['person', 'place', 'organization', 'topic', 'temporal'],
            },
            value: String,
            category: String,
        }],

        concepts: [{
            type: String,
        }],

        importance: {
            type: Number,
            min: 0,
            max: 100,
            default: 50,
            // NOTE: dropped index:true — covered by compound { importance, createdAt } prefix.
        },

        sentiment: {
            type: String,
            enum: ['positive', 'negative', 'neutral'],
            default: 'neutral',
        },

        keywords: [{
            type: String,
        }],

        relatedMessages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        }],

        processingVersion: {
            type: String,
            default: '1.0',
        },

        processedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// DM conversation fetch — getMessages uses $or with both directions, so both compounds earn their keep.
// ESR: E=senderId+receiverId (equality), S=createdAt (sort).
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });

// Unread messages — markMessagesAsRead filters { receiverId, status: { $ne: 'read' } }.
messageSchema.index({ receiverId: 1, status: 1 });

// Group messages — getGroupMessages: { receiverId: groupId, isGroupMessage: true } sort by createdAt DESC.
// PARTIAL: only indexes non-deleted documents — smaller index, faster scan, lower storage on M0.
// This is the hot read path; partial saves real bytes as the soft-deleted set grows.
messageSchema.index(
    { receiverId: 1, isGroupMessage: 1, createdAt: -1 },
    { partialFilterExpression: { deletedAt: null } }
);

// NLP recall indexes — multikey indexes (Mongo auto-detects array fields).
// Used by AI/Concept memory-graph queries; stay until M11 audits the AI stack.
messageSchema.index({ concepts: 1 });
messageSchema.index({ 'entities.value': 1 });
messageSchema.index({ importance: -1, createdAt: -1 });
messageSchema.index({ keywords: 1 });

// NOTE: dropped index({ createdAt: -1 }) — _id is monotonic, sort({ _id: -1 }) gives same order.

// Soft-delete: deleteGroupMessage and deleteGroup cascade now soft-delete instead of hard-delete.
// Auto-filter on every find* keeps deleted messages out of chat history without controller changes.
messageSchema.plugin(softDeletePlugin);

const Message = mongoose.model("Message", messageSchema);

export default Message;

