import pino from "pino";
import pinoHttp from "pino-http";
import { nanoid } from "nanoid";

// Bare logger — for module-load-time logs (boot sequence, dependency connect/close)
// and for non-request-scoped contexts (socket.io handlers, BullMQ workers).
//
// In dev, pretty-printed via pino-pretty for readable terminal output.
// In production, raw JSON for log aggregators (one JSON object per line).
//
// Levels: pino exposes trace/debug/info/warn/error/fatal. Default level is 'info'
// in prod and 'debug' in dev. Override via LOG_LEVEL env var.
//
// Why pino over winston/bunyan: pino is the fastest Node logger by a wide margin
// because it serializes to JSON synchronously without object reflection on the
// hot path. The performance gap matters at high request volumes (we don't see
// it on Rs.0, but it's the right default).

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
    level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
    // pino-pretty in dev for human-readable output. In prod, leave as raw JSON
    // so log aggregators (Render's log stream, future Datadog/Logtail) can parse.
    transport: isDev
        ? {
              target: "pino-pretty",
              options: {
                  colorize: true,
                  translateTime: "HH:MM:ss.l",
                  ignore: "pid,hostname",
              },
          }
        : undefined,
    // Redact sensitive fields by path in case they ever sneak into a log call.
    // pino does this at serialization time without traversing the whole object.
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "req.body.password",
            "*.password",
            "*.token",
            "*.accessToken",
            "*.refreshToken",
        ],
        censor: "[REDACTED]",
    },
});

// pinoHttp middleware — attaches `req.log` (a child logger with request context)
// to every request and emits an automatic info/error log per request.
//
// The `genReqId` callback assigns a unique ID per request (nanoid). This ID
// propagates through req.log as a `reqId` field so every log line during the
// request is correlatable. We also expose it as `req.id` for the error middleware
// to include in the response body, so a user reporting "I got a 500" can give
// the request ID and we can find every log line for that exact request.
//
// `serializers` keeps log output compact — without them pino logs the full Node
// IncomingMessage / ServerResponse objects which is ~200 lines of noise.
export const httpLogger = pinoHttp({
    logger,
    genReqId: (req, res) => {
        // Honor an upstream X-Request-Id header if a load balancer / proxy already
        // assigned one (lets us correlate across the LB/edge). Otherwise mint our own.
        const upstream = req.headers["x-request-id"];
        const id = typeof upstream === "string" && upstream.length > 0 ? upstream : nanoid();
        // Echo the ID back to the client so error responses can reference it.
        res.setHeader("X-Request-Id", id);
        return id;
    },
    customLogLevel: (req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    },
    customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
    customErrorMessage: (req, res, err) => `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
    // Quiet the noisy auto-logs on probe endpoints so /healthz and /readyz from the
    // keep-alive cron don't drown out real traffic.
    autoLogging: {
        ignore: (req) => req.url === "/healthz" || req.url === "/readyz",
    },
    serializers: {
        req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            // Skip headers/body — too noisy + privacy concerns. Redaction config
            // catches them anyway if anything tries to log them explicitly.
        }),
        res: (res) => ({
            statusCode: res.statusCode,
        }),
    },
});
