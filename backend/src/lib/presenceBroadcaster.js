import { logger } from "./logger.js";

// Debounced presence broadcaster.
//
// Problem: io.emit(EVENTS.GET_ONLINE_USERS, list) fires on every connect AND
// every disconnect, sending the FULL online-user list to EVERY connected
// client. At N concurrent users with K connect/disconnect events per second,
// that's N×K emits/sec carrying the full N-element list — quadratic in
// bandwidth and in receiver-side CPU (each client diffs the list to update UI).
//
// Solution: collect presence-change signals within a short window (1s) and
// emit ONCE per window with the latest snapshot. Worst-case emit frequency
// is capped at ~1Hz regardless of connect/disconnect churn.
//
// Trade: a connect → user appears "online" up to 1 second later in everyone
// else's UI. Acceptable for an online-dot indicator. Real-time delivery of
// the actual messages is unaffected (those are direct emits to the user's room).
//
// We store the io reference + getOnlineUsers callback at module load (passed
// from socket.js init). This keeps the file zero-dependency on socket.js
// (avoids circular imports).

const DEBOUNCE_MS = 1000;
let timerId = null;
let pendingFlush = false;
let ioRef = null;
let getOnlineUsersFn = null;
let eventName = null;

/**
 * Wire up the broadcaster from socket.js after io is constructed. Idempotent.
 */
export const configurePresenceBroadcaster = ({ io, getOnlineUsers, event }) => {
    ioRef = io;
    getOnlineUsersFn = getOnlineUsers;
    eventName = event;
};

/**
 * Signal that presence changed. Coalesces multiple calls within DEBOUNCE_MS
 * into a single emit at the end of the window. Safe to call from any
 * connect/disconnect handler without rate-limit thinking.
 */
export const schedulePresenceBroadcast = () => {
    if (!ioRef || !getOnlineUsersFn || !eventName) {
        // Not yet configured — caller is broadcasting before init. Skip.
        return;
    }

    pendingFlush = true;
    if (timerId) return; // Already scheduled within current window.

    timerId = setTimeout(async () => {
        timerId = null;
        if (!pendingFlush) return;
        pendingFlush = false;

        try {
            const onlineUsers = await getOnlineUsersFn();
            ioRef.emit(eventName, onlineUsers);
        } catch (error) {
            logger.error({ err: error }, "Presence broadcast failed");
        }
    }, DEBOUNCE_MS);
    timerId.unref?.(); // Don't keep the process alive just for this timer.
};

/**
 * Force-flush the pending broadcast immediately. Used at shutdown so the
 * final state reaches clients before io.close().
 */
export const flushPresenceBroadcast = async () => {
    if (timerId) {
        clearTimeout(timerId);
        timerId = null;
    }
    if (!pendingFlush || !ioRef || !getOnlineUsersFn || !eventName) return;
    pendingFlush = false;

    try {
        const onlineUsers = await getOnlineUsersFn();
        ioRef.emit(eventName, onlineUsers);
    } catch (error) {
        logger.error({ err: error }, "Presence flush failed");
    }
};
