import mongoose from "mongoose";

const chatInviteSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // NOTE: dropped index:true — covered by compound { senderId, receiverId } prefix.
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // NOTE: dropped index:true — covered by compound { receiverId, status } prefix.
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      // NOTE: dropped index:true — only 3 enum values (low cardinality), serves only as trailing field
      // in compound { receiverId, status }. Standalone status index would scan ~33% of collection per lookup.
    },
  },
  { timestamps: true }
);

// Compound: duplicate-check on send (sendChatInvite checks both directions via $or).
chatInviteSchema.index({ senderId: 1, receiverId: 1 });
// Compound: getPendingInvites filters { receiverId, status: 'pending' }, ESR-ordered.
chatInviteSchema.index({ receiverId: 1, status: 1 });

// No soft-delete — invite cancellation is the user's right; hard delete is the correct semantic
// (a cancelled invite carries no historical value worth preserving).

const ChatInvite = mongoose.model("ChatInvite", chatInviteSchema);

export default ChatInvite;
