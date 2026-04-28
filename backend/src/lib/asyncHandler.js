// asyncHandler — wraps an async Express route handler so rejections route to
// Express's error middleware via next(err) instead of producing an unhandled
// promise rejection that hangs the request (the Express 4 async problem).
//
// Usage:
//   router.get('/x', asyncHandler(async (req, res) => {
//       const data = await maybeFails();
//       res.json(data);
//   }));
//
// Without this, an async handler that throws/rejects:
//   router.get('/x', async (req, res) => {
//       throw new Error('boom');  // Express never sees this — request hangs.
//   });
//
// Express 5 (still in beta as of writing) handles this natively. Until then,
// every async route handler must either wrap in try/catch + call next(err)
// manually, or be wrapped by this helper.

export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
