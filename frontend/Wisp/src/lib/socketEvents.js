// Frontend mirror of backend/src/lib/socketEvents.js. Kept in sync manually
// (small fixed set; sharing via a published package would be overkill at this
// scale). When you add an event on the backend, add it here too.

export const EVENTS = Object.freeze({
    // === Client → Server ===
    TYPING: "typing",
    GROUP_TYPING: "groupTyping",
    JOIN_GROUP: "joinGroup",
    LEAVE_GROUP: "leaveGroup",

    // === Server → Client ===
    GET_ONLINE_USERS: "getOnlineUsers",
    NEW_MESSAGE: "newMessage",
    MESSAGES_READ: "messagesRead",
    USER_TYPING: "userTyping",
    NEW_GROUP_MESSAGE: "newGroupMessage",
    GROUP_MESSAGE_DELETED: "groupMessageDeleted",
    USER_TYPING_IN_GROUP: "userTypingInGroup",
    GROUP_JOINED: "groupJoined",
    NEW_CHAT_INVITE: "newChatInvite",
    CHAT_INVITE_ACCEPTED: "chatInviteAccepted",
    CHAT_INVITE_REJECTED: "chatInviteRejected",
    CHAT_INVITE_CANCELLED: "chatInviteCancelled",
});
