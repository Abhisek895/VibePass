# VibePass Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Web/Mobile)                   │
│              Next.js Frontend + TypeScript + Tailwind            │
│  (Landing, Auth, Onboarding, Matches, Chat, Rooms, Settings)   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP/WebSocket
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    API GATEWAY LAYER                             │
│          Express.js/NestJS + TypeScript                         │
│  (REST APIs, WebSocket Server, Rate Limiting, Auth Middleware)  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬─────────────────┐
        │              │              │                 │
┌───────▼───┐ ┌───────▼────┐ ┌──────▼─────┐ ┌────────▼──────┐
│  Services │ │ WebSocket  │ │ Moderation │ │ Admin Panel   │
│   Layer   │ │ Manager    │ │ Service    │ │ Service       │
└───────┬───┘ └───────┬────┘ └──────┬─────┘ └────────┬──────┘
        │            │             │                 │
┌───────▼────────────▼─────────────▼─────────────────▼────────┐
│                   DATA PERSISTENCE LAYER                      │
│              PostgreSQL + Redis + Message Queue               │
│    (Users, Chats, Matches, Prompts, Reports, Audit Logs)    │
└────────────────────────────────────────────────────────────────┘

            ┌─────────────────────────────────────┐
            │   EXTERNAL SERVICES                 │
            ├─────────────────────────────────────┤
            │ • Email Service (OTP/Verification)  │
            │ • SMS Service (Optional)             │
            │ • Analytics Service                 │
            │ • CDN (Static Assets)               │
            │ • Cloud Storage (Backups)           │
            └─────────────────────────────────────┘
```

## Layered Architecture

### 1. Presentation Layer (Frontend)
**Framework**: Next.js 14+ with App Router

**Responsibilities**:
- User interface rendering
- Client-side routing
- Mobile-first responsive design
- Real-time UI updates via WebSocket
- Form validation
- Local state management

**Key Components**:
- Landing page
- Auth flow
- Onboarding wizard
- Match discovery cards
- Chat UI
- Voice UI
- Room UI
- Settings & admin dashboard

---

### 2. API Gateway Layer (Backend Entry)
**Framework**: Express.js or NestJS

**Responsibilities**:
- HTTP request routing
- REST API endpoints
- WebSocket connection management
- Request validation
- Authentication middleware
- Rate limiting
- CORS handling
- Request/response logging

**Endpoints Structure**:
```
/api/v1/
├── /auth                  # Login, signup, OTP, sessions
├── /users                 # Profile, settings, preferences
├── /moods                 # Mood listing
├── /prompts               # Prompt retrieval and answers
├── /matches               # Match discovery, scoring
├── /chats                 # Chat history, metadata
├── /rooms                 # Room listing, participation
├── /connections           # Saved connections, favorites
├── /safety                # Reports, blocks, feedback
└── /admin                 # Moderation, analytics (protected)
```

---

### 3. Services Layer (Business Logic)
Organized by domain/feature.

**Key Services**:

#### Authentication Service
- User registration with OTP
- Session management
- JWT token generation/validation
- Password reset (if applicable)

#### Matching Engine Service
- Compatibility scoring
- Match ranking
- Freshness algorithm
- Inventory management

#### Chat Service
- Message persistence
- Real-time delivery
- Typing indicators
- Message moderation
- Chat history cleanup

#### Voice Service
- WebRTC signaling
- Call initiation/acceptance
- Connection quality tracking
- Call termination

#### Prompt Service
- Prompt retrieval
- Answer collection
- Analytics integration
- Daily rotation logic

#### Moderation Service
- Report processing
- Abuse detection
- User reputation scoring
- Action enforcement

#### User Service
- Profile management
- Privacy settings
- Badge management
- Notification preferences

---

### 4. Real-Time Layer (WebSocket)
**Technology**: Socket.io (or native WebSocket)

**Events**:
```
Client → Server:
  • user:online
  • user:offline
  • chat:message
  • chat:typing
  • voice:request
  • voice:accept
  • voice:reject
  • match:save
  • match:unsave
  • report:submit
  • block:user

Server → Client:
  • match:new
  • chat:inbound
  • chat:read-receipt
  • voice:incoming
  • voice:signal
  • user:online (in room)
  • notification:alert
  • moderation:action
```

---

### 5. Data Persistence Layer
**Database**: PostgreSQL

**Responsibilities**:
- Data storage
- Indexing for performance
- Transaction management
- Audit logging
- Backup/recovery

**Cache Layer**: Redis
- Session storage
- Real-time presence
- Rate limiting counters
- Message queue (for async jobs)

---

### 6. External Services
**Email Service**: SendGrid/Mailgun
- OTP delivery
- Verification emails
- Account notifications

**Analytics**: Mixpanel, Amplitude, or custom
- User behavior tracking
- Funnel analysis
- Retention metrics
- Safety metrics

**CDN**: Cloudflare, AWS CloudFront
- Static asset delivery
- API DDoS protection

---

## Data Flow Examples

### Sign Up Flow
```
1. User submits email
2. Frontend → POST /api/v1/auth/signup
3. Backend validates email format
4. Backend generates OTP, stores in Redis (5min TTL)
5. Backend sends OTP via email service
6. User enters OTP
7. Frontend → POST /api/v1/auth/verify-otp
8. Backend verifies OTP, creates user record
9. Backend generates JWT tokens
10. Frontend stores tokens (httpOnly cookies + memory)
11. Redirect to onboarding
```

### Matching Flow
```
1. User completes mood + vibe questions
2. Frontend → POST /api/v1/matches/refresh
3. Backend fetches user's profile & answers
4. Backend runs matching algorithm against active users
5. Backend scores each candidate
6. Backend ranks by compatibility + freshness
7. Backend returns top 10 match cards (with safety filter)
8. Frontend displays match deck
9. User clicks match card
10. WebSocket event: match:viewed (for analytics)
11. User can chat, save, or skip
```

### Chat Flow
```
1. User accepts match, initiates chat
2. Frontend creates chat room, connects to WebSocket
3. Backend creates chat record in database
4. Backend joins user to Socket.io room
5. User types message
6. Frontend → WebSocket emit: chat:message
7. Backend validates message (spam/abuse checks)
8. Backend stores in database
9. Backend broadcasts to other user in room
10. Frontend receives and displays message
11. User sees typing indicator from other party
12. Backend cleans up old messages (configurable retention)
```

### Voice Request Flow
```
1. User in chat clicks "Start Voice Call"
2. Frontend emits: voice:request via WebSocket
3. Backend creates voice_session record (pending)
4. Backend sends notification to other user
5. Other user sees incoming call prompt
6. If accepted: WebSocket emit: voice:accept
7. Backend updates session status (active)
8. Backend sends WebRTC signaling URL
9. Both clients establish P2P connection via WebRTC
10. Voice call active (backend tracks duration)
11. One user hangs up: voice:end
12. Backend updates session, stores metrics
13. Frontend shows post-call feedback form
```

---

## Module Organization

### Frontend (Next.js)
```
src/
├── app/                    # Pages and layouts
│   ├── (landing)/         # Landing page
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Protected routes
│   │   ├── mood/          # Mood selection
│   │   ├── prompts/       # Vibe questions
│   │   ├── matches/       # Match discovery
│   │   ├── chat/[id]/     # Individual chat
│   │   ├── voice/         # Voice UI
│   │   ├── rooms/         # Themed rooms
│   │   ├── connections/   # Saved connections
│   │   ├── settings/      # User settings
│   │   └── admin/         # Admin panel (protected)
│   └── layout.tsx
│
├── components/            # Reusable UI components
│   ├── auth/             # Auth components
│   ├── match/            # Match cards, discovery
│   ├── chat/             # Chat bubbles, input
│   ├── voice/            # Voice call UI
│   ├── room/             # Room components
│   ├── common/           # Buttons, modals, badges
│   └── admin/            # Admin dashboard
│
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Auth logic
│   ├── useSocket.ts      # WebSocket connection
│   ├── useMatches.ts     # Match discovery
│   ├── useChat.ts        # Chat logic
│   ├── useVoice.ts       # Voice call setup
│   └── usePagination.ts
│
├── lib/                  # Utilities
│   ├── api.ts            # API client
│   ├── socket.ts         # Socket.io setup
│   ├── webrtc.ts         # WebRTC utilities
│   ├── validators.ts     # Form validators
│   └── constants.ts      # App constants
│
└── services/             # API services
    ├── auth.ts
    ├── matches.ts
    ├── chat.ts
    ├── voice.ts
    ├── rooms.ts
    └── admin.ts
```

### Backend (Express/NestJS)
```
src/
├── modules/              # Feature modules
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   └── auth.routes.ts
│   ├── users/
│   ├── moods/
│   ├── prompts/
│   ├── matches/
│   ├── chats/
│   ├── voice/
│   ├── rooms/
│   ├── safety/
│   └── admin/
│
├── services/            # Cross-cutting services
│   ├── matching.service.ts
│   ├── moderation.service.ts
│   ├── notification.service.ts
│   ├── cache.service.ts
│   └── email.service.ts
│
├── websocket/           # Real-time infrastructure
│   ├── socket.service.ts
│   ├── namespaces/      # Socket.io namespaces
│   │   ├── chat.namespace.ts
│   │   ├── voice.namespace.ts
│   │   └── notifications.namespace.ts
│   └── events/
│
├── database/            # Data access
│   ├── connection.ts
│   ├── models/          # TypeORM/Prisma models
│   │   ├── User.ts
│   │   ├── Chat.ts
│   │   ├── Match.ts
│   │   ├── Prompt.ts
│   │   ├── Room.ts
│   │   ├── Report.ts
│   │   └── AuditLog.ts
│   └── repositories/    # Data access patterns
│
├── middleware/          # Express middleware
│   ├── auth.middleware.ts
│   ├── rateLimiter.middleware.ts
│   ├── validation.middleware.ts
│   ├── errorHandler.middleware.ts
│   └── logger.middleware.ts
│
├── utils/              # Utilities
│   ├── jwt.ts
│   ├── crypto.ts
│   ├── validators.ts
│   ├── logger.ts
│   └── constants.ts
│
├── app.ts              # Express setup
└── server.ts           # Server entry point
```

---

## State Management

### Frontend
- **React Context**: Auth state, user profile
- **React Hooks**: Local component state
- **localStorage**: Persistent user preferences
- **InMemory Cache**: API response caching

### Backend
- **Database (PostgreSQL)**: Persistent state
- **Redis**: Session state, presence, rate limits
- **In-Memory**: Event listeners, active connections

---

## Scalability Considerations

### Horizontal Scaling
1. **Stateless API servers**: Multiple instances behind load balancer
2. **Redis Cluster**: Session and cache across nodes
3. **Database Replication**: Read replicas for scaling reads
4. **WebSocket Load Balancing**: Sticky sessions or Redis adapter

### Database Performance
1. **Indexing**: On user_id, chat_id, created_at, status
2. **Partitioning**: Chats by date (monthly or quarterly)
3. **Caching**: Frequently accessed data in Redis
4. **Connection Pooling**: PgBouncer or equivalent

### Real-Time Optimization
1. **Message Queuing**: Redis Queue or Bull for async jobs
2. **Message Compression**: Gzip-compress large payloads
3. **Selective Broadcasting**: Only send to relevant users
4. **Connection Limits**: Rate limit by user's connections

---

## Error Handling & Resilience

### Circuit Breakers
- Rate limiter circuit breaker
- External service timeouts
- Database connection failover

### Retry Logic
- Exponential backoff for failed requests
- Message queue for async operations
- Webhook delivery retries

### Monitoring & Alerting
- Real-time error tracking (Sentry)
- Performance monitoring (DataDog/New Relic)
- Custom dashboards for safety metrics
- On-call rotation for incidents

---

## Summary

The VibePass architecture is designed to be:
- **Scalable**: Horizontal scaling for growth
- **Reliable**: Redundancy, graceful degradation
- **Secure**: Multiple layers of protection
- **Performant**: Optimized queries, caching, real-time
- **Maintainable**: Clear separation of concerns

Each layer has a specific responsibility, making the system modular and testable.
