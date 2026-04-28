// Socket.IO event-name constants. Single source of truth for every event the
// server emits or listens for. Inline strings are typo-prone (silent failures
// — Socket.IO accepts any event name and returns nothing if no handler exists)
// and force every refactor to be a project-wide search-and-replace.
//
// Naming convention:
//   - server-emitted events use camelCase past-tense or descriptive nouns
//     (newMessage, getOnlineUsers, messagesRead) to read like server-pushed
//     notifications
//   - client-emitted events match the action being performed (typing, joinGroup,
//     leaveGroup) so they read like RPC requests
//
// When adding a new event:
//   1. Add it here under the appropriate section (CLIENT_TO_SERVER vs SERVER_TO_CLIENT)
//   2. Reference it via EVENTS.<NAME> at every emit/listen site
//   3. If the event carries a payload, add a Zod schema in middleware/validation.js
//      under "Socket event schemas"

export const EVENTS = Object.freeze({
    // === Client → Server ===
    // Typing indicators
    TYPING: "typing",
    GROUP_TYPING: "groupTyping",
    // Group room management
    JOIN_GROUP: "joinGroup",
    LEAVE_GROUP: "leaveGroup",

    // === Server → Client ===
    // Presence
    GET_ONLINE_USERS: "getOnlineUsers",
    // DM
    NEW_MESSAGE: "newMessage",
    MESSAGES_READ: "messagesRead",
    USER_TYPING: "userTyping",
    // Groups
    NEW_GROUP_MESSAGE: "newGroupMessage",
    GROUP_MESSAGE_DELETED: "groupMessageDeleted",
    USER_TYPING_IN_GROUP: "userTypingInGroup",
    GROUP_JOINED: "groupJoined",
    // Chat invites
    NEW_CHAT_INVITE: "newChatInvite",
    CHAT_INVITE_ACCEPTED: "chatInviteAccepted",
    CHAT_INVITE_REJECTED: "chatInviteRejected",
    CHAT_INVITE_CANCELLED: "chatInviteCancelled",
});
