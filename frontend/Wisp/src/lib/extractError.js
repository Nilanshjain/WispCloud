// Pulls the user-facing message out of an axios error response.
//
// The backend's central error middleware wraps every error in
// { error: { code, message, requestId, details? } }. The string callers want
// to surface in a toast lives at response.data.error.message. Reading
// response.data.message (the natural-looking path) returns undefined; reading
// response.data.error returns the wrapper object and `toast(object)` renders
// "[object Object]".
//
// For VALIDATION_ERROR responses, the per-field Zod messages are in
// data.error.details = [{ field, message }, ...]. The top-level message is
// just "Validation failed" — useless by itself. We prefer the joined detail
// messages when present so the toast says "Password must be at least 12
// characters" instead of "Validation failed".
//
// `fallback` is shown when the server didn't speak — network blip, CORS,
// browser offline — i.e. error.response is missing entirely.
export const extractErrorMessage = (error, fallback) => {
    const errBody = error?.response?.data?.error;
    if (!errBody) return fallback;
    if (Array.isArray(errBody.details) && errBody.details.length > 0) {
        return errBody.details.map((d) => d.message).filter(Boolean).join(", ") || errBody.message || fallback;
    }
    return errBody.message ?? fallback;
};
