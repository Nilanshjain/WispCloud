# WispCloud

Real-time messaging — direct messages, group chats, and an in-app AI assistant — built on Express, MongoDB, and Socket.IO.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-pub%2Fsub%20%2B%20cache-DC382D?logo=redis&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-realtime-010101?logo=socket.io&logoColor=white)

The feature set is what you'd expect from a chat app. Most of the engineering went into what sits underneath it: the backend is designed to run as several interchangeable instances, the authentication path can revoke tokens and still work when Redis is down, and an in-app assistant can summarize or answer questions about a conversation with an LLM.

---

## Features

**Messaging**
- Direct messages and group chats, with threaded replies and image attachments
- Typing indicators and online/offline presence, both correct across multiple open tabs
- Cursor-paginated message history and read receipts

**Accounts and groups**
- Email/password accounts (bcrypt-hashed, 12-character minimum) and Google OAuth 2.0 sign-in
- Chat invitations between users
- Group roles — owner, admin, member — enforced on the server

**AI assistant**
- Summarize a conversation, ask free-text questions about it, or extract action items
- Works on long conversations that exceed the model's context window

---

## Architecture

The parts worth explaining are the ones that aren't obvious from the feature list.

### Real-time delivery and horizontal scaling

Socket.IO runs behind its Redis adapter, so WispCloud can run as several identical instances: a message emitted on one instance still reaches clients connected to another, because the adapter relays it over Redis pub/sub. Nothing about a session is pinned to a single process. Online presence lives in Redis as a per-user set of socket IDs, and the online/offline transition is driven by the *size* of that set rather than a local boolean — so a user with three tabs open stays online until the last tab closes, even when those tabs are spread across different instances. Each user also has a personal Socket.IO room, which lets a controller deliver a new message to every device a recipient has open with a single emit.

### Authentication and access control

Sign-in issues a short-lived JWT access token alongside a longer-lived refresh token; a `type` claim keeps a refresh token from being replayed against a protected route. Every protected request runs a five-step, fail-closed check — token present, signature and expiry valid, correct type, JWT ID not revoked, user still active — and the Socket.IO handshake runs the same pipeline. Logout writes the token's ID to a Redis blocklist whose entry is given a TTL equal to the token's remaining life, so revoked tokens expire themselves with no background cleanup job. The per-request user lookup on that path is served cache-aside from Redis instead of hitting MongoDB every time. The revocation check fails open if Redis is unreachable — a short revocation gap during a cache blip is a better outcome than logging out every active user.

Beyond authentication: role checks gate group actions, every REST body and Socket.IO payload is validated with Zod, responses carry Helmet security headers, CORS is restricted to the configured origin, and rate limiting is Redis-backed and keyed by IP plus user ID, with tighter ceilings on the auth and AI routes.

### AI assistant

The assistant uses Google's Gemini through LangChain. A conversation longer than the model's context window is handled with a map-reduce pass: the transcript is split into chunks, each chunk is summarized on its own, and those summaries are recombined with the most recent messages before the final request. Every model call has a 30-second timeout and is rate-limited per user, and the action-item endpoint asks for JSON and parses it defensively, so a malformed model response degrades into readable output instead of an error.

### Data and caching

MongoDB is accessed through Mongoose with compound and partial indexes. Message history is cursor-paginated rather than offset-paged, so scrolling far back stays cheap. Deletes are soft — a Mongoose plugin scopes every query to non-deleted documents and exposes an explicit `.withDeleted()` escape hatch for analytics. Read-heavy endpoints, such as the analytics rollups, go through a small cache-aside helper with short TTLs.

### Operability

The service exposes two separate probes: `/healthz` for liveness and `/readyz` for readiness. Readiness reports MongoDB and Redis connectivity plus a drain flag, so an orchestrator stops routing traffic before the process shuts down. Shutdown is graceful — it flips the drain flag, flushes pending presence broadcasts, closes Socket.IO and the HTTP server, disconnects MongoDB and Redis, and falls back to a hard exit if cleanup stalls. Logging is structured (pino), with a request ID on every line that is also returned in error responses through a single error handler with a consistent JSON shape. Configuration is checked at startup; the process refuses to boot if a required environment variable is missing.

---

## Tech stack

| Layer | Choices |
|---|---|
| Backend | Node.js 20, Express, Socket.IO |
| Database | MongoDB (Mongoose) |
| Cache / pub-sub | Redis |
| AI | Google Gemini via LangChain |
| Auth | JWT, Passport (Google OAuth 2.0), bcrypt |
| Validation | Zod |
| Frontend | React 19, Vite, Zustand, Tailwind CSS, DaisyUI |
| Tooling | Docker Compose, pino, Helmet |

---

## Running locally

### With Docker Compose (recommended)

Brings up MongoDB, Redis, the backend, the frontend, and a mongo-express admin UI.

```bash
docker compose up
```

- Frontend — http://localhost:5173
- Backend — http://localhost:5001
- Mongo admin — http://localhost:8081

### Manual setup

Requires MongoDB and Redis running locally, or connection strings pointed at cloud instances.

```bash
# Backend
cd backend
cp .env.example .env      # then fill in the values
npm install
npm run dev

# Frontend (separate terminal)
cd frontend/Wisp
npm install
npm run dev
```

To populate sample users, groups, and messages for local testing:

```bash
cd backend && npm run seed
```

### Environment

`backend/.env.example` lists every required variable, and the backend will not start until each one is set. The essentials:

```
MONGODB_URI       MongoDB connection string
REDIS_URL         Redis connection string
JWT_SECRET        signing secret for access/refresh tokens
SESSION_SECRET    Express session secret (used by Passport)
FRONTEND_URL      allowed CORS / CSP origin
GEMINI_API_KEY    Google Gemini key for the AI assistant
CLOUDINARY_*      image-upload credentials
GOOGLE_CLIENT_*   Google OAuth credentials (optional — OAuth is skipped if unset)
```

### Deployment

The frontend is deployed to Vercel as a static build (`npm run build`). The backend runs as a standard Node service and can be hosted on Render or any equivalent Node platform.

---

## API overview

All application routes are under `/api`.

| Route group | Purpose |
|---|---|
| `/api/auth` | Signup, login, logout, session check, profile |
| `/api/auth/oauth/google` | Google OAuth sign-in (enabled when credentials are set) |
| `/api/messages` | Send direct messages, fetch paginated history |
| `/api/users` | User search and profiles |
| `/api/invites` | Send, accept, and reject chat invitations |
| `/api/groups` | Group CRUD, membership, and group messages |
| `/api/analytics` | Platform and usage rollups |
| `/api/ai` | Conversation summary, Q&A, action-item extraction |
| `/healthz`, `/readyz` | Liveness and readiness probes |

---

## Project structure

```
backend/src
  config/         Passport (Google OAuth) strategy
  controllers/    Route handlers
  lib/            Socket.IO, Redis, DB, logging, caching, error types
  middleware/     Auth, RBAC, rate limiting, validation, error handler
  models/         Mongoose schemas
  routes/         Express routers
  services/       AI service (Gemini + LangChain)
  seeds/          Sample-data script
frontend/Wisp     React + Vite single-page app
```

---

## Status and roadmap

WispCloud runs on free-tier infrastructure — MongoDB Atlas M0, a small Redis instance, and a single backend instance — so the horizontal-scaling design is in place but currently exercised at single-instance scale. Next on the list:

- Automated tests (Vitest + Supertest)
- Sentry error tracking
- Published load-test results

---

## License

MIT
