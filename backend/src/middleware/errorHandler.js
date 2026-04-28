import { ZodError } from "zod";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

// Central error middleware. The four-arg signature (err, req, res, next) is
// how Express identifies error handlers — it literally counts parameters.
// Mounted last in the chain so anything that calls next(err) or throws (when
// wrapped by asyncHandler) lands here.
//
// Output shape — every error response uses the same JSON envelope:
//   { error: { code, message, requestId, details? } }
// Clients can switch on `code` (stable identifier); `message` is human-readable;
// `requestId` lets a user paste it back to support and ops can find every log
// line for that request; `details` carries field-level info for ValidationError.
//
// Log level discipline:
//   - 4xx (client errors, expected/operational) → warn
//   - 5xx (server errors, unexpected/programmer bugs) → error
// This means alerting on `error` level catches real bugs without the noise of
// every 401/404 flooding the channel.

export const errorHandler = (err, req, res, next) => {
    // Map known error shapes to (status, code, message, details)
    let status, code, message, details;

    if (err instanceof AppError) {
        // Custom errors thrown from controllers — already structured.
        status = err.status;
        code = err.code;
        message = err.message;
        details = err.details;
    } else if (err instanceof ZodError) {
        // Zod errors caught from outside the validate() middleware (e.g., a
        // controller that parses something with Zod and lets the error bubble).
        status = 400;
        code = "VALIDATION_ERROR";
        message = "Validation failed";
        details = err.issues?.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
    } else if (err.name === "MongoServerError" && err.code === 11000) {
        // Mongo duplicate-key error. Surface as 409 Conflict with the field
        // that collided (extracted from err.keyPattern).
        status = 409;
        code = "CONFLICT";
        const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : "field";
        message = `Duplicate value for ${field}`;
    } else if (err.name === "CastError") {
        // Mongoose CastError — usually a bad ObjectId in a route param.
        status = 400;
        code = "INVALID_INPUT";
        message = `Invalid ${err.path}`;
    } else {
        // Unexpected error — programmer bug, dependency failure, etc.
        status = err.status || 500;
        code = err.code || "INTERNAL_ERROR";
        message = status >= 500 ? "Internal server error" : err.message || "Error";
    }

    // Log with the request-scoped logger so the entry carries reqId.
    // Operational errors (4xx + isOperational) → warn. Everything else → error.
    const isOperational = err.isOperational === true || (status >= 400 && status < 500);
    const log = req.log || logger;
    const logPayload = {
        err: {
            name: err.name,
            message: err.message,
            code,
            status,
            stack: err.stack,
        },
    };
    if (isOperational) {
        log.warn(logPayload, `client error: ${code}`);
    } else {
        log.error(logPayload, `server error: ${code}`);
    }

    // Body shape is stable regardless of error type. requestId echoes the
    // X-Request-Id header so a user who hits an error can quote it back.
    const body = {
        error: {
            code,
            message,
            requestId: req.id,
        },
    };
    if (details !== undefined) body.error.details = details;
    // Stack trace only in dev — prod must never leak file paths / lib versions.
    if (process.env.NODE_ENV !== "production") {
        body.error.stack = err.stack;
    }

    res.status(status).json(body);
};
