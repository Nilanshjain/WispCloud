import express from "express";
import cookieParser from "cookie-parser";
import dotenvSafe from "dotenv-safe";
import helmet from "helmet";
import session from "express-session";
import mongoose from "mongoose";
import { connectDB } from "./lib/db.js";
import { connectRedis, disconnectRedis, isRedisConnected } from "./lib/redis.js";
import cors from "cors";
import passport from "./config/passport.js";
import { configureGoogleStrategy } from "./config/passport.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/user.routes.js";
import chatInviteRoutes from "./routes/chatInvite.routes.js";
import oauthRoutes from "./routes/oauth.routes.js";
import groupRoutes from "./routes/group.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import { app, server, io, initializeSocketIO, flushPresenceBroadcast } from "./lib/socket.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import { logger, httpLogger } from "./lib/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables. Refuses to boot if any key listed in `.env.example` is missing.
// `allowEmptyValues: false` (default) — a key set to empty is treated as missing.
dotenvSafe.config({
    example: ".env.example",
});

// Configure Passport strategies
configureGoogleStrategy();

const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Request-scoped logger + request ID. Mounted FIRST so every subsequent middleware
// + route handler has req.log available and the X-Request-Id header is set early.
// Probe endpoints (/healthz, /readyz) are excluded from auto-logs (see logger.js)
// to keep keep-alive cron output quiet.
app.use(httpLogger);

// Security middleware - Helmet.js
//sets rules in the response header to protect against common vulnerabilities
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", FRONTEND_URL],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, 
    crossOriginResourcePolicy: { policy: "cross-origin" },  
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));  //for twilio and stripe 
app.use(cookieParser());

// Session middleware (required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
const allowedOrigins = [FRONTEND_URL, 'http://localhost:5173'].filter(Boolean);
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Global rate limiting — mounted on /api so probe endpoints (/healthz, /readyz)
// stay exempt. Render's keep-alive cron pings /healthz every 14 minutes; without
// this exemption it would count against the 500/15min IP budget AND a real
// burst from a buggy client could mask probe failures during a live incident.
app.use("/api", globalLimiter);

// Drain flag, flipped to true on SIGTERM/SIGINT so /readyz can signal "drain me" to load balancers.
let shuttingDown = false;

// Routes
app.use("/api/auth", authRoutes);

// Only enable OAuth routes if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.use("/api/auth/oauth", oauthRoutes);
    logger.info('OAuth routes enabled');
} else {
    logger.warn('OAuth routes disabled, credentials not configured');
    // Provide helpful error message when OAuth routes are accessed but disabled
    app.use("/api/auth/oauth", (req, res) => {
        res.status(503).json({
            message: "OAuth authentication is not configured",
            details: "Google OAuth credentials are not set. Please use email/password authentication or contact the administrator to enable OAuth.",
            availableAuth: ["email/password"]
        });
    });
}

app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invites", chatInviteRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);


app.get("/healthz", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
    });
});


app.get("/readyz", (req, res) => {
    const checks = {
        mongo: mongoose.connection.readyState === 1,
        redis: isRedisConnected(),
        notDraining: !shuttingDown,
    };
    const ok = checks.mongo && checks.redis && checks.notDraining;
    res.status(ok ? 200 : 503).json({
        status: ok ? "ready" : "not_ready",
        checks,
    });
});


// 404 handler — uses the structured shape via the central error middleware.
// Importing inline to avoid pulling NotFoundError into the top of the file
// just for one mount.
app.use((req, res, next) => {
    import("./lib/errors.js").then(({ NotFoundError }) => {
        next(new NotFoundError(`Route not found: ${req.method} ${req.url}`));
    });
});

// Central error middleware — must be last, must have 4 args (Express identifies
// error handlers by parameter count). Maps thrown errors → structured JSON
// `{ error: { code, message, requestId, details? } }` + correct status code,
// + logs via req.log so the entry carries the request ID.
app.use(errorHandler);

// Start server with database and Redis connections
const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();
        await initializeSocketIO();

        server.listen(PORT, () => {
            logger.info({
                port: PORT,
                env: process.env.NODE_ENV || "development",
                frontend: FRONTEND_URL,
            }, "WispCloud server started");
        });

    } catch (error) {
        logger.fatal({ err: error }, "Failed to start server");
        process.exit(1);
    }
};

// Graceful shutdown.
// Render sends SIGTERM and follows with SIGKILL ~30s later. We have one shot to:
//   1. stop accepting new connections (server.close drains in-flight requests)
//   2. close Mongo and Redis so the platform doesn't see hung sockets in logs
//   3. exit before SIGKILL hits, otherwise we drop responses mid-write
const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Shutdown signal received, draining");

    // Hard-exit guard. .unref() so the timer itself doesn't keep the process alive.
    const hardExit = setTimeout(() => {
        logger.error("Graceful shutdown timed out after 25s, forcing exit");
        process.exit(1);
    }, 25_000);
    hardExit.unref();

    // Flush any pending presence-broadcast debounce so the final online-user
    // list reaches clients BEFORE we close their sockets. Otherwise the last
    // 0–1000ms of presence changes never get sent.
    try {
        await flushPresenceBroadcast();
    } catch (flushErr) {
        logger.error({ err: flushErr }, "Error flushing presence broadcast");
    }

    // Close Socket.IO first so connected clients receive a disconnect event and
    // can render their offline state. io.close() also stops accepting new socket
    // upgrades. Without this, sockets get yanked at process exit and clients see
    // an opaque transport close, which fires their own retry/reconnect storm.
    try {
        io.close();
        logger.info("Socket.IO closed");
    } catch (sockErr) {
        logger.error({ err: sockErr }, "Error closing Socket.IO");
    }

    server.close(async (err) => {
        if (err) logger.error({ err }, "HTTP server close error");
        try {
            await mongoose.connection.close();
            logger.info("MongoDB connection closed");
            await disconnectRedis();
            logger.info("Shutdown complete");
            process.exit(0);
        } catch (closeErr) {
            logger.error({ err: closeErr }, "Error during dependency cleanup");
            process.exit(1);
        }
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the application
startServer();
