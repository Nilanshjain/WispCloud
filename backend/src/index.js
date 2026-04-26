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
import { app, server, initializeSocketIO } from "./lib/socket.js";
import { globalLimiter } from "./middleware/rateLimiter.js";

// Load environment variables. Refuses to boot if any key listed in `.env.example` is missing.
// `allowEmptyValues: false` (default) — a key set to empty is treated as missing.
dotenvSafe.config({
    example: ".env.example",
});

// Configure Passport strategies
configureGoogleStrategy();

const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

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

// Global rate limiting - Apply to all requests
app.use(globalLimiter);

// Drain flag, flipped to true on SIGTERM/SIGINT so /readyz can signal "drain me" to load balancers.
let shuttingDown = false;

// Routes
app.use("/api/auth", authRoutes);

// Only enable OAuth routes if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.use("/api/auth/oauth", oauthRoutes);
    console.log('✅ OAuth routes enabled');
} else {
    console.log('⚠️  OAuth routes disabled - credentials not configured');
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


// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server with database and Redis connections
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Connect to Redis
        await connectRedis();

        // Initialize Socket.IO with Redis Adapter
        await initializeSocketIO();

        // Start the HTTP server
        server.listen(PORT, () => {
            console.log(`\n🚀 WispCloud Server running on port ${PORT}`);
            console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Frontend URL: ${FRONTEND_URL}\n`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
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
    console.log(`\n⚠️  ${signal} received. Draining...`);

    // Hard-exit guard. .unref() so the timer itself doesn't keep the process alive.
    const hardExit = setTimeout(() => {
        console.error('❌ Graceful shutdown timed out after 25s. Forcing exit.');
        process.exit(1);
    }, 25_000);
    hardExit.unref();

    server.close(async (err) => {
        if (err) console.error('HTTP server close error:', err);
        try {
            await mongoose.connection.close();
            console.log('✅ MongoDB closed');
            await disconnectRedis();
            console.log('✅ Shutdown complete');
            process.exit(0);
        } catch (closeErr) {
            console.error('❌ Error during dependency cleanup:', closeErr);
            process.exit(1);
        }
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the application
startServer();
