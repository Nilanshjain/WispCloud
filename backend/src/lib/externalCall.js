import { logger } from "./logger.js";

// Minimal external-call timeout helper. Races the promise against a timeout;
// whichever resolves/rejects first wins. The underlying network call may
// continue server-side (we can't always cancel third-party SDK requests at
// the socket level), but the user's request returns predictably fast on
// upstream stalls.
//
// Full M10 (retry-with-jitter + circuit breaker) was scoped out — the 30-second
// hang on Cloudinary stall is the actual demo-killer; that's what this fixes.
//
// Usage:
//   const result = await withTimeout("cloudinary.upload", 30000, () =>
//       cloudinary.uploader.upload(image)
//   );
export const withTimeout = (label, timeoutMs, fn) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            const err = new Error(`${label} timed out after ${timeoutMs}ms`);
            err.code = "EXTERNAL_TIMEOUT";
            err.status = 504;
            err.isOperational = true;
            logger.warn({ label, timeoutMs }, "External call timed out");
            reject(err);
        }, timeoutMs);
        timer.unref?.();

        Promise.resolve()
            .then(() => fn())
            .then(
                (val) => {
                    clearTimeout(timer);
                    resolve(val);
                },
                (err) => {
                    clearTimeout(timer);
                    reject(err);
                }
            );
    });
};
