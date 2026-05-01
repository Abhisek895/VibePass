# VibePass Product Architecture

**Core Promise:** Match by vibe. Reveal by choice.

---

## 1. Product Overview

VibePass is a privacy-first vibe-matching platform for users aged 18-28. It enables authentic connection through:
- **Anonymous-first** design (nicknames only, no forced identity reveal)
- **Vibe-based matching** (mood, interests, communication style)
- **Mutual-consent voice** (text first, explicit voice request/acceptance)
- **Privacy controls** (optional reveal only after trust)
- **Smart moderation** (trust scoring, abuse detection, admin tools)

**Premium Experience Markers:**
- Dark elegant theme with soft gradients
- Intimate, emotionally intelligent copy
- Mobile-first responsive design
- Smooth animations and micro-interactions
- No video, no public feeds, no follower counts

---

## 2. Core User Journeys

### Journey 1: New User Signup → First Match
```
Landing → Email OTP → Age/Nickname → Onboarding Form → Mood Selection 
→ Vibe Questions → Matches Feed → Text Chat → (Voice Option)
```

### Journey 2: Returning User
```
Login → Check Onboarding Status → Home Screen → Fresh Matches / Saved Chats 
→ Text or Voice Chat → Save / Report
```

### Journey 3: Voice Consent Flow
```
Text Chat → "Request Voice" Button (if enough trust)
→ Recipient Sees Request → Accept/Decline → WebRTC Connection
```

### Journey 4: Mutual Reveal
```
Ongoing Chat → First Name / Photo / Handle Reveal (Mutual Consent)
→ Save to Trusted Circle → Easier Future Interactions
```

---

## 3. Feature Pillars

| Pillar | Details |
|--------|---------|
| **Authentication** | Email OTP, age verification, nickname uniqueness, session management |
| **Onboarding** | Nickname, age band, pronouns, intent, gender pref, interests, language, timezone, voice comfort, safety acknowledgment |
| **Mood System** | 12 moods (bored, lonely, curious, want friends, deep talk, soft energy, fun chat, flirting, music talk, need advice, overthinking, study buddy) |
| **Matching Engine** | Rule-based scoring: mood, intent, interests, vibe answers, communication style, availability, voice comfort, language, age filters, reputation |
| **Text Chat** | WebSocket-based, typing indicators, reactions, prompts, read receipts, save/block/report |
| **Voice Chat** | WebRTC 1:1, mutual consent, mute/unmute, duration timer, in-call reporting |
| **Themed Rooms** | Late-night overthinkers, no judgment zone, music lovers, green/red flag, study chill, soft talk, honest hour, roast playlist |
| **Saved Connections** | Reopen chats, revisit trusted people, limited history |
| **Safety** | Block, report, trust scoring, abuse detection, rate limits, audit logs |
| **Admin Dashboard** | Reports queue, flagged content, user actions, room/prompt management, analytics |

---

## 4. Technology Stack

### Frontend
- **Framework:** Next.js 14 + TypeScript
- **Styling:** Tailwind CSS + custom animations
- **State Management:** Zustand + React Query
- **Real-time:** Socket.io client
- **Voice:** WebRTC (TalkJS/Daily.co or custom signaling)
- **Forms:** React Hook Form + Zod
- **UI Components:** Headless UI / Radix UI

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** NestJS with modules, guards, interceptors
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis (sessions, rate limiting, pub/sub)
- **Real-time:** Socket.io server
- **Authentication:** JWT + HTTP-only cookies
- **Rate Limiting:** Redis-based token bucket
- **Task Queue:** Bull queues (moderation, email, analytics)

### Deployment
- **Frontend:** Vercel (Next.js optimized)
- **Backend:** Docker + Railway/Render/DigitalOcean
- **Database:** Managed PostgreSQL
- **Redis:** Managed cache layer
- **CDN:** Vercel edge network
- **Monitoring:** Sentry + LogRocket

---

## 5. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  Landing → Auth → Onboarding → Home → Chat / Voice / Settings  │
└────────────────────────────┬──────────────────────────────────┘
                             │
                    ┌────────┼────────┐
                    ▼        ▼        ▼
            HTTP/REST  WebSocket  Auth Headers
                    │        │        │
┌───────────────────┴────────┴────────┴──────────────────────────┐
│                      Backend (NestJS)                           │
│  API Routes │ WebSocket Events │ Auth Guards │ Business Logic  │
└───────────┬────────┬────────┬──────────┬──────────┬────────────┘
            │        │        │          │          │
      ┌─────▼──┬─────▼────┬───▼──────┬───▼────┬─────▼─────┐
      │         │          │          │        │           │
    Auth   Matching  Text Chat   Voice Sig.  Moderation  Analytics
      │         │          │          │        │           │
      └────┬────┴────┬─────┴────┬─────┴──┬─────┴────┬──────┘
           │         │          │        │          │
      ┌────▼─────────▼──────────▼────────▼──────────▼─────┐
      │       PostgreSQL Database + Prisma ORM            │
      │  Users │ Profiles │ Chats │ Messages │ Reports    │
      │  Mod Logs │ Analytics │ Sessions │ Audit         │
      └────────────┬──────────────────────────────────────┘
                   │
      ┌────────────▼──────────────────┐
      │  Redis (Cache / Sessions)     │
      │  Rate Limit │ Pub/Sub         │
      └──────────────────────────────┘
```

---

## 6. Matching Algorithm (MVP)

**Scoring Formula:**
```
total_score = (
  mood_match * 0.25 +
  intent_match * 0.20 +
  interests_overlap * 0.20 +
  vibe_similarity * 0.15 +
  communication_style * 0.10 +
  availability_bonus * 0.05 +
  reputation_factor * 0.05
)
```

**Conditions:**
- Must pass trust/reputation thresholds
- Language compatibility required
- Optional age band filters respected
- Blocked / reported users excluded
- Online presence prioritized (recent activity)
- Voice comfort preference considered

---

## 7. Safety & Moderation Pipeline

```
User Message / Report
        │
        ▼
  ┌──────────────────┐
  │ Content Filter   │ ← Regex patterns, keyword lists
  └────────┬─────────┘
           │
        ┌──┴──┐
        │ OK? │
        └──┬──┘
           │
      ┌────┴──────────────────┐
    YES                       NO
    (continue)         (flag for review)
                            │
                    ┌───────▼──────────┐
                    │ Moderation Queue │
                    │ (with context)   │
                    └────────┬─────────┘
                             │
                    ┌────────▼────────┐
                    │  Admin Review   │
                    │ (dashboard)     │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
         WARN              BLOCK             ESCALATE
           │                │                 │
      Sent to          User blocked      Human review
      user chat        (can appeal)      (legal team)
```

---

## 8. Session & Auth Flow

```
1. User enters email
   ↓
2. Backend generates OTP (6 digits, exp 10 min)
   ↓
3. Backend sends OTP via email (Nodemailer/SendGrid)
   ↓
4. User receives OTP, enters code
   ↓
5. Backend verifies OTP + creates/updates session
   ↓
6. Backend issues JWT (7 days) + HTTP-only session cookie
   ↓
7. Frontend stores JWT in memory, cookie in HTTP-only
   ↓
8. All API requests include JWT + session validation
   ↓
9. WebSocket connection authenticated with query param
   ↓
10. Session expires → user redirected to login
```

---

## 9. Real-time Architecture

### WebSocket Events (Text Chat)
```
Client → Server:
  - chat:message_send (content, chatId)
  - chat:typing_start
  - chat:typing_stop
  - chat:read_receipt

Server → Client:
  - chat:message_received (id, sender, content, timestamp)
  - chat:user_typing (nickname, typing: bool)
  - chat:user_read (timestamp)
  - chat:message_flagged (hidden, reason)
```

### WebSocket Events (Voice Signaling)
```
Client A → Server:
  - voice:request_call (recipientId)

Server → Client B:
  - voice:incoming_call (callerId, nickname, audio_params)

Client B → Server:
  - voice:accept_call (callerId)
  - voice:decline_call (callerId)

Server → Client A:
  - voice:call_accepted (recipientId)

Both → Exchange WebRTC:
  - voice:offer
  - voice:answer
  - voice:ice_candidate
```

---

## 10. Analytics & Metrics

**Key Funnels:**
- Signup completion rate
- Onboarding completion rate
- First match within 24h
- Chat initiation rate
- Voice request rate
- Voice acceptance rate
- Connection save rate
- Next-day retention
- 7-day retention

**Safety Metrics:**
- Report rate (per 1k chats)
- Block rate
- Abuse signal rate
- Moderation queue length
- Admin action time-to-resolution

**Engagement Metrics:**
- Daily active users (DAU)
- Weekly active users (WAU)
- Average session duration
- Room participation rate
- Daily prompt engagement
- Match click-through rate

---

## 11. Deployment Architecture

### Development
- Frontend: `npm run dev` (Next.js dev server, 3000)
- Backend: `npm run start:dev` (NestJS watch mode, 3001)
- Database: SQLite (local dev)
- Redis: Docker container

### Staging / Production
```
Vercel (Frontend)
   ↓ (API calls + WebSocket)
   ↓
Docker Container (Backend on Railway/Render)
   ├── NestJS server:3000
   ├── Socket.io listener
   └── Job queue worker
   
PostgreSQL (Managed)
   ↑
   └─ Prisma migrations pre-deployment

Redis (Managed)
   ↑
   └─ Session store, cache, rate limiting

S3 / CDN (Optional)
   ↑
   └─ User uploads (future: profile photos)
```

---

## 12. Error Handling & Resilience

**Client-side:**
- Network error retry (exponential backoff)
- Local optimistic updates
- Fallback UI for unavailable features
- User-friendly error messages

**Server-side:**
- Circuit breakers for external services
- Graceful degradation (e.g., if email fails, queue retry)
- Input validation on all endpoints
- Database transaction rollback on failure
- Structured logging + Sentry

---

## 13. Security Principles

✓ **Authentication:** JWT + HTTP-only cookies + email verification  
✓ **Authorization:** Role-based access control (User, Moderator, Admin)  
✓ **Data Privacy:** Encryption at rest (database), in transit (HTTPS/WSS)  
✓ **Rate Limiting:** Token bucket per user + IP  
✓ **Input Validation:** Zod schemas on all inputs  
✓ **CORS:** Strict origin whitelist  
✓ **CSRF:** SameSite cookies  
✓ **Audit Logs:** All user actions logged  
✓ **Secret Management:** Environment variables, no hardcoding

---

## 14. Performance Targets

- **Page Load Time:** < 2s (Lighthouse 90+)
- **API Response:** < 200ms (p95)
- **WebSocket Latency:** < 50ms (message delivery)
- **Database Query:** < 100ms (with indexes)
- **Concurrent Users:** 10k+ (horizontal scaling)

---

## 15. Success Criteria (MVP Launch)

✓ All authentication flows working  
✓ Onboarding → home smooth experience  
✓ Matching algorithm functioning correctly  
✓ Text chat stable and responsive  
✓ Voice signaling working (offer/answer)  
✓ Basic reporting and blocking  
✓ Admin dashboard with moderation queue  
✓ Zero critical security vulnerabilities  
✓ 99% uptime SLA  
✓ < 2s page loads  

---

**Next:** See USER_FLOW.md and DATABASE_SCHEMA.md for detailed specifications.
