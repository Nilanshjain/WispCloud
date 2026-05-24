import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { extractErrorMessage } from "../lib/extractError.js";
import { useAuthStore } from "./useAuthStore";
import { EVENTS } from "../lib/socketEvents";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: {},
  unreadCounts: {},

  getUsers: async () => {
    const { isUsersLoading } = get();
    if (isUsersLoading) return; // Prevent concurrent calls

    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      const message = extractErrorMessage(error, null);
      if (error.response?.status === 429) {
        console.warn("Rate limited on getUsers");
      } else if (message) {
        toast.error(message);
      } else {
        console.error("Failed to fetch users:", error);
      }
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      // Handle both old format (array) and new format (object with messages array)
      const messages = Array.isArray(res.data) ? res.data : (res.data.messages || []);
      set({ messages: messages || [] });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to fetch messages"));
      set({ messages: [] }); // Reset to empty array on error
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to send message"));
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // Subscribe to read receipts
    socket.on(EVENTS.MESSAGES_READ, (data) => {
      const { messageIds, readAt } = data;
      set((state) => ({
        messages: state.messages.map((msg) =>
          messageIds.includes(msg._id)
            ? { ...msg, status: "read", readAt }
            : msg
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off(EVENTS.MESSAGES_READ);
  },

  // Mark messages as read
  markMessagesAsRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/read/${userId}`);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  setUserTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    }));
    if (isTyping) {
      setTimeout(() => {
        if (get().typingUsers[userId]) {
          set((state) => ({
            typingUsers: { ...state.typingUsers, [userId]: false },
          }));
        }
      }, 3000);
    }
  },

  incrementUnread: (userId) => {
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [userId]: (state.unreadCounts[userId] || 0) + 1,
      },
    }));
  },

  clearUnread: (userId) => {
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [userId]: 0 },
    }));
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      get().clearUnread(selectedUser._id);
    }
  },
}));