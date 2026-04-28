import {create} from "zustand";
import { axiosInstance } from '../lib/axios.js';
import toast from "react-hot-toast";
import {io} from "socket.io-client";
import { useChatStore } from "./useChatStore";
import { EVENTS } from "../lib/socketEvents";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001"

// Access token lives in this Zustand store, NOT in localStorage.
// Trade: dies on page reload (we re-mint via /auth/refresh on app mount, since the
// refresh cookie survives reloads). Win: XSS in a live session can read the access
// token but cannot persist-steal it (no localStorage entry to scrape after the tab
// closes). The httpOnly refresh cookie is unreadable from JS regardless.

export const useAuthStore = create((set, get) => ({
    authUser: null,
    accessToken: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    setAccessToken: (token) => {
        set({ accessToken: token });
        // Keep the live socket's auth payload in sync. socket.auth is read on
        // every reconnect attempt — without this update, the socket would hold
        // the stale (expired) token in its handshake payload after a refresh,
        // and the next reconnect would fail auth even though we just minted a
        // valid access token. Idempotent: setting auth on an already-connected
        // socket has no effect on the active connection, only on future ones.
        const socket = get().socket;
        if (socket) {
            socket.auth = { ...socket.auth, token };
        }
    },

    // App boot: try to silently rehydrate via the refresh cookie. If the cookie is
    // valid, /refresh returns a new access token + the user data via /auth/check.
    // If not, we land logged-out — same UX as a fresh visit.
    checkAuth: async () => {
        try {
            // Probe via /refresh — if there's a valid refresh cookie, this hands us
            // a fresh access token AND rotates the cookie. axios response interceptor
            // is not in the loop here because we expect this call to either 200 or 401.
            const refreshRes = await axiosInstance.post("/auth/refresh");
            set({ accessToken: refreshRes.data.accessToken });

            // Now that we have an access token, fetch the user document.
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            // No valid refresh cookie OR /auth/check failed. Either way: not authed.
            set({ authUser: null, accessToken: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({
                accessToken: res.data.accessToken,
                authUser: {
                    _id: res.data._id,
                    fullName: res.data.fullName,
                    email: res.data.email,
                    username: res.data.username,
                    profilePic: res.data.profilePic,
                },
            });
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
            // Server revokes the access-token jti and clears the refresh cookie.
            await axiosInstance.post("/auth/logout");
        } catch (error) {
            // Even if the server call fails, wipe local state — user clicked logout, honor it.
            console.log("Logout server call failed:", error?.message);
        }
        set({ authUser: null, accessToken: null });
        toast.success("Logged out successfully");
        get().disconnectSocket();
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({
                accessToken: res.data.accessToken,
                authUser: {
                    _id: res.data._id,
                    fullName: res.data.fullName,
                    email: res.data.email,
                    username: res.data.username,
                    profilePic: res.data.profilePic,
                },
            });
            toast.success("Logged in successfully");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    setAuthUser: (user) => {
        set({ authUser: user });
        if (user) {
            get().connectSocket();
        }
    },

    connectSocket: () => {
        const { authUser, socket: existingSocket, accessToken } = get();
        if (!authUser) return;

        if (existingSocket?.connected) {
            console.log('Socket already connected');
            return;
        }
        if (existingSocket) {
            existingSocket.disconnect();
        }

        const socket = io(BASE_URL, {
            // Note: query.userId is purely for backward-compat logging; the
            // server now identifies the user from the verified JWT in auth.token,
            // not from this query string (which was a trivial impersonation hole
            // before M05).
            query: { userId: authUser._id },
            auth: { token: accessToken },
            // Reconnect strategy — exponential backoff with jitter so a server
            // restart doesn't produce a thundering-herd reconnect storm.
            // - reconnection: enabled by default, kept explicit for clarity
            // - reconnectionAttempts: Infinity → keep trying; the response
            //   interceptor + server-side rejection are what stop the loop if
            //   the user's session is actually dead
            // - reconnectionDelay: 1s starting delay
            // - reconnectionDelayMax: 5s cap so backoff doesn't run away
            // - randomizationFactor: 0.5 → each delay is 50%-150% of the
            //   computed value, spreading reconnects across a window
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            randomizationFactor: 0.5,
        });

        set({ socket });

        socket.on(EVENTS.GET_ONLINE_USERS, (userIds) => {
            set({ onlineUsers: userIds });
        });

        socket.on(EVENTS.NEW_MESSAGE, (newMessage) => {
            const chatStore = useChatStore.getState();
            const senderId =
                typeof newMessage.senderId === "object"
                    ? newMessage.senderId._id
                    : newMessage.senderId;

            if (chatStore.selectedUser && senderId === chatStore.selectedUser._id) {
                useChatStore.setState({
                    messages: [...chatStore.messages, newMessage],
                });
            } else {
                chatStore.incrementUnread(senderId);
            }
        });

        socket.on(EVENTS.USER_TYPING, (data) => {
            useChatStore.getState().setUserTyping(data.senderId, data.isTyping);
        });

        socket.on("connect", () => {
            console.log('Socket connected:', socket.id);
        });

        // Server rejects the connection (auth middleware next(new Error(...)))
        // by emitting connect_error with the error message. Distinguish transient
        // network errors (keep reconnecting) from "your auth is dead" errors
        // (stop reconnecting + bounce to login). The server's auth middleware
        // sends "Unauthorized: ..." or "Forbidden: ..." prefixes.
        socket.on("connect_error", (error) => {
            const msg = error?.message || "";
            const isAuthRejection = msg.startsWith("Unauthorized") || msg.startsWith("Forbidden");
            console.warn("Socket connection error:", msg);

            if (isAuthRejection) {
                // Stop the reconnect loop and force the user back to a logged-out
                // state. Don't call /auth/logout server-side — the token is
                // already invalid; just wipe local state and let UI re-render.
                socket.disconnect();
                set({ authUser: null, accessToken: null, socket: null });
                toast.error("Session expired. Please log in again.");
            }
            // Else: socket.io's built-in reconnect-with-backoff will keep trying.
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },
}));
