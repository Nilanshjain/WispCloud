// Custom error classes. Controllers throw these instead of inlining
// `res.status(N).json({...})` for client errors. The central error middleware
// (middleware/errorHandler.js) maps them to HTTP responses with a structured shape.
//
// Why classes instead of plain objects: `instanceof` checks in the error middleware,
// stack traces preserved (extends Error), `code` field is a stable identifier for
// clients/observability separate from the human-readable `message`.

export class AppError extends Error {
    constructor(message, { status = 500, code = "INTERNAL_ERROR", details = undefined } = {}) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
        this.details = details;
        // Mark as "expected" — the error middleware uses this to decide log level
        // (warn for expected/client errors, error for unexpected/server errors).
        this.isOperational = true;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message = "Validation failed", details = undefined) {
        super(message, { status: 400, code: "VALIDATION_ERROR", details });
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, { status: 401, code: "UNAUTHORIZED" });
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, { status: 403, code: "FORBIDDEN" });
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, { status: 404, code: "NOT_FOUND" });
    }
}

export class ConflictError extends AppError {
    constructor(message = "Conflict", details = undefined) {
        super(message, { status: 409, code: "CONFLICT", details });
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message = "Too many requests") {
        super(message, { status: 429, code: "TOO_MANY_REQUESTS" });
    }
}
