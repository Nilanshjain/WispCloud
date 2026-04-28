import mongoose from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        groupImage: {
            type: String,
            default: "",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Group type: public or private
        type: {
            type: String,
            enum: ['public', 'private'],
            default: 'private',
        },

        // Maximum members allowed
        maxMembers: {
            type: Number,
            default: 100,
            min: 2,
            max: 1000,
        },

        // Group settings
        settings: {
            // Who can send messages
            whoCanMessage: {
                type: String,
                enum: ['all', 'admins_only'],
                default: 'all',
            },
            // Who can add members
            whoCanAddMembers: {
                type: String,
                enum: ['all', 'admins_only', 'owner_only'],
                default: 'admins_only',
            },
            // Approval required to join
            requireApproval: {
                type: Boolean,
                default: false,
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        // Statistics
        stats: {
            totalMembers: {
                type: Number,
                default: 1,
            },
            totalMessages: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

// isActive stays — countDocuments({ isActive: true }) in analytics can answer from the index alone (covered count).
groupSchema.index({ isActive: 1 });

// Text index — single permitted text index, covers group search.
groupSchema.index({ name: 'text', description: 'text' });

// NOTE: dropped index({ type: 1 }) — only 2 distinct values ('public', 'private'), too low-cardinality
// to be selective on its own; no query uses it as a leading filter.
// NOTE: dropped index({ createdAt: -1 }) — _id is monotonic, sort({ _id: -1 }) gives same order.

// Soft-delete: adds deletedAt + deletedBy fields, auto-filters every find/count, exposes softDelete()
// instance method and .withDeleted() query helper. Required because Group is the parent of cascade
// (deleting a group must also soft-delete its memberships + messages).
groupSchema.plugin(softDeletePlugin);

const Group = mongoose.model("Group", groupSchema);

export default Group;
