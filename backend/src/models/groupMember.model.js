import mongoose from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const groupMemberSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
            // NOTE: dropped index:true here — covered by compound index { groupId: 1, userId: 1 } via prefix rule.
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            // NOTE: dropped index:true here — covered by compound index { userId: 1, status: 1 } via prefix rule.
        },

        // Member role in the group
        role: {
            type: String,
            enum: ['owner', 'admin', 'member'],
            default: 'member',
        },

        // Custom nickname in the group
        nickname: {
            type: String,
            trim: true,
            maxlength: 30,
        },

        // Join status
        status: {
            type: String,
            enum: ['active', 'pending', 'banned', 'left'],
            default: 'active',
        },

        // Permissions
        permissions: {
            canSendMessages: {
                type: Boolean,
                default: true,
            },
            canAddMembers: {
                type: Boolean,
                default: false,
            },
            canRemoveMembers: {
                type: Boolean,
                default: false,
            },
            canEditGroup: {
                type: Boolean,
                default: false,
            },
        },

        // Mute settings
        isMuted: {
            type: Boolean,
            default: false,
        },

        mutedUntil: {
            type: Date,
        },

        // Timestamps
        joinedAt: {
            type: Date,
            default: Date.now,
        },

        lastReadAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes — ESR-ordered, each one matches a real query in group.controllers.js / socket.js.
// { groupId, userId } unique — prevents duplicate memberships; serves "is user X in group Y" check.
// { groupId, status } — getGroupMembers (status='active'), capacity countDocuments.
// { userId, status } — getUserGroups (sidebar), socket.js connect-time group join.
// { groupId, role } — owner/admin permission checks.
groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
groupMemberSchema.index({ groupId: 1, status: 1 });
groupMemberSchema.index({ userId: 1, status: 1 });
groupMemberSchema.index({ groupId: 1, role: 1 });

// Soft-delete: GroupMember is the cascade target — deleting a Group must also soft-delete its members,
// otherwise getUserGroups + the socket connect path would still surface ghost memberships.
groupMemberSchema.plugin(softDeletePlugin);

// Pre-save middleware to set permissions based on role.
// 🚩 KNOWN FOOTGUN: this only fires on .save(); bypassed by updateMany / findOneAndUpdate / findByIdAndUpdate.
// Migration to instance-method or pre('findOneAndUpdate') hook lands in M12 RBAC pass.
groupMemberSchema.pre('save', function(next) {
    if (this.isModified('role')) {
        switch(this.role) {
            case 'owner':
                this.permissions = {
                    canSendMessages: true,
                    canAddMembers: true,
                    canRemoveMembers: true,
                    canEditGroup: true,
                };
                break;
            case 'admin':
                this.permissions = {
                    canSendMessages: true,
                    canAddMembers: true,
                    canRemoveMembers: true,
                    canEditGroup: true,
                };
                break;
            case 'member':
                this.permissions = {
                    canSendMessages: true,
                    canAddMembers: false,
                    canRemoveMembers: false,
                    canEditGroup: false,
                };
                break;
        }
    }
    next();
});

const GroupMember = mongoose.model("GroupMember", groupMemberSchema);

export default GroupMember;
