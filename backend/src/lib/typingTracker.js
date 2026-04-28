import { logger } from "./logger.js";

// Server-side typing-indicator tracker. Two responsibilities:
//
// 1. THROTTLE — collapse a burst of typing events from one (sender, target)
//    pair into at most one emit per THROTTLE_MS. The frontend already throttles
//    (typing event fires once per ~2s of activity), but a malicious or buggy
//    client could spam typing 100/sec; this is the server's defense.
//
// 2. AUTO-EXPIRE — when isTyping=true is received, schedule a server-side timer
//    to auto-emit isTyping=false after AUTO_EXPIRE_MS. Fixes the orphaned-
//    indicator problem: user starts typing, refreshes the page, never sends
//    isTyping=false, the receiver's UI shows "X is typing..." forever. The
//    timer is cleared/reset when a follow-up event arrives.
//
// State shape: Map<senderId, Map<targetId, { lastEmit, autoExpireTimer, lastIsTyping }>>
//   - sender = the user emitting the typing event
//   - target = the recipient (DM userId or group groupId) — the typing event
//     describes "sender is typing in conversation with target"
//   - lastEmit = when we last actually forwarded an event to receivers
//   - autoExpireTimer = setTimeout handle for the auto-false emit
//   - lastIsTyping = the last value we forwarded (so identical repeats can be
//     dropped during the throttle window)

const THROTTLE_MS = 1000;
const AUTO_EXPIRE_MS = 5000;

const state = new Map();

const getEntry = (senderId, targetId) => {
    let inner = state.get(senderId);
    if (!inner) {
        inner = new Map();
        state.set(senderId, inner);
    }
    let entry = inner.get(targetId);
    if (!entry) {
        entry = { lastEmit: 0, autoExpireTimer: null, lastIsTyping: false };
        inner.set(targetId, entry);
    }
    return entry;
};

const clearEntry = (senderId, targetId) => {
    const inner = state.get(senderId);
    if (!inner) return;
    const entry = inner.get(targetId);
    if (entry?.autoExpireTimer) {
        clearTimeout(entry.autoExpireTimer);
    }
    inner.delete(targetId);
    if (inner.size === 0) state.delete(senderId);
};

/**
 * Process an incoming typing event. `emit` is the function that actually
 * sends the typing state to receivers — it gets called only when the event
 * passes throttle. Decoupling lets this module stay agnostic of room/socket
 * targeting (DM vs group).
 *
 * Returns true if the emit was forwarded, false if throttled.
 */
export const recordTyping = (senderId, targetId, isTyping, emit) => {
    const entry = getEntry(senderId, targetId);
    const now = Date.now();

    if (isTyping) {
        // Drop duplicate true within throttle window — same state, same sender,
        // same target, just spam from a misbehaving client.
        if (entry.lastIsTyping === true && now - entry.lastEmit < THROTTLE_MS) {
            // Refresh the auto-expire timer so the indicator stays alive.
            if (entry.autoExpireTimer) clearTimeout(entry.autoExpireTimer);
            entry.autoExpireTimer = setTimeout(() => {
                try {
                    emit(false);
                } catch (err) {
                    logger.error({ err, senderId, targetId }, "Typing auto-expire emit failed");
                }
                clearEntry(senderId, targetId);
            }, AUTO_EXPIRE_MS);
            entry.autoExpireTimer.unref?.();
            return false;
        }

        // Forward true, schedule auto-expire that emits false on its own.
        emit(true);
        entry.lastEmit = now;
        entry.lastIsTyping = true;
        if (entry.autoExpireTimer) clearTimeout(entry.autoExpireTimer);
        entry.autoExpireTimer = setTimeout(() => {
            try {
                emit(false);
            } catch (err) {
                logger.error({ err, senderId, targetId }, "Typing auto-expire emit failed");
            }
            clearEntry(senderId, targetId);
        }, AUTO_EXPIRE_MS);
        entry.autoExpireTimer.unref?.();
        return true;
    }

    // isTyping === false: forward immediately and clear state. No throttle
    // because a stop-typing signal should never be dropped (orphan UI risk).
    emit(false);
    clearEntry(senderId, targetId);
    return true;
};

/**
 * Clear all tracked typing state for a sender. Call from disconnect handler
 * so a tab-close doesn't leave orphaned indicators (the auto-expire would
 * eventually fire but disconnect can resolve it immediately).
 */
export const clearTypingForSender = (senderId, emit) => {
    const inner = state.get(senderId);
    if (!inner) return;
    for (const [targetId, entry] of inner.entries()) {
        if (entry.lastIsTyping === true) {
            try {
                emit(targetId, false);
            } catch (err) {
                logger.error({ err, senderId, targetId }, "Typing clear-on-disconnect emit failed");
            }
        }
        if (entry.autoExpireTimer) clearTimeout(entry.autoExpireTimer);
    }
    state.delete(senderId);
};
