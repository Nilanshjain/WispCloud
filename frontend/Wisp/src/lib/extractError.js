// Pulls the user-facing message out of an axios error response.
//
// The backend's central error middleware wraps every error in
// { error: { code, message, requestId, details? } }. The string callers want
// to surface in a toast lives at response.data.error.message. Reading
// response.data.message (the natural-looking path) returns undefined; reading
// response.data.error returns the wrapper object and `toast(object)` renders
// "[object Object]".
//
// `fallback` is shown when the server didn't speak — network blip, CORS,
// browser offline — i.e. error.response is missing entirely.
export const extractErrorMessage = (error, fallback) =>
    error?.response?.data?.error?.message ?? fallback;
