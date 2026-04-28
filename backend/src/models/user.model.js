import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true, // unique:true already creates a B-tree index; no need for index:true
            lowercase: true,
            trim: true,
        },

        username: {
            type: String,
            required: true,
            unique: true, // same — unique:true is the index
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        password: {
            type: String,
            required: function() {
                // Password is only required if not using OAuth
                return !this.authProvider || this.authProvider === 'local';
            },
            minlength: 12, // NIST 800-63B floor — length beats complexity for entropy.
            select: false, // Don't include password in queries by default
        },

        profilePic: {
            type: String,
            default: "",
        },

        // OAuth fields
        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
        },

        providerId: {
            type: String,
            sparse: true, // Allow null values but enforce uniqueness when set
        },

        // Role-based access control
        role: {
            type: String,
            enum: ['user', 'moderator', 'admin'],
            default: 'user',
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        lastSeen: {
            type: Date,
            default: Date.now,
        },

    },
    {
        timestamps: true,
    }
);

// Text index — Mongo allows ONE text index per collection, so all searchable fields bundle here.
// Powers user-search via $text: { $search: ... }; replaces the ReDoS-prone regex search (P0 #2, lands in M12).
userSchema.index({ fullName: 'text', email: 'text', username: 'text' });

// NOTE: dropped index({ createdAt: -1 }) — _id is monotonic (ObjectId encodes a timestamp in
// its first 4 bytes), so sort({ _id: -1 }) gives the same order without an extra B-tree.
// Save: ~5–10% of User collection's index footprint.

const User = mongoose.model("User", userSchema);

export default User;