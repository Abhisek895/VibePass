# VibePass

**"Match by vibe. Reveal by choice."**

A private vibe-matching web platform for users aged 18-28 to connect through mood, personality, and conversation energy before revealing identity.

## Product Overview

VibePass is a premium, privacy-first social discovery platform where:
- Users join with **nickname-only** identity
- Choose **mood** and **conversation purpose**
- Answer **5 quick vibe prompts**
- Get **instant compatibility matches**
- Start **anonymous text chat**
- Unlock **voice chat** only by mutual consent
- Reveal identity **only by choice**

### Core Promise
"Match by vibe. Reveal by choice."

### Key Differentiators
1. **Privacy-First**: No forced identity reveal. Anonymous-by-default.
2. **Chemistry-First**: Matches based on mood, interests, and vibe compatibility.
3. **Text & Voice Only**: No video, no image sharing (MVP).
4. **Consent-Based**: Everything requires mutual agreement.
5. **Moderated & Safe**: Strong abuse prevention and safety tools.
6. **Addictive but Healthy**: Daily fresh prompts and moods, not manipulation.

## Project Structure

```
VibePass/
├── docs/                    # Architecture, design, and planning docs
├── frontend/                # Next.js + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/            # App routes
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and helpers
│   │   └── services/       # API and external services
│   └── public/
├── backend/                 # Node.js + TypeScript + Express
│   ├── src/
│   │   ├── modules/        # Feature modules (auth, chat, matches, etc.)
│   │   ├── services/       # Business logic
│   │   ├── websocket/      # Real-time infrastructure
│   │   ├── database/       # Models and repository
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Shared utilities
│   ├── database/
│   │   ├── migrations/     # DB schema migrations
│   │   └── seeds/          # Seed data
│   └── tests/              # Test files
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+ (or PostgreSQL - modify schema.prisma if needed)
- Redis (for sessions and real-time)

### Setup

See [SETUP.md](docs/SETUP.md) for detailed installation instructions.

```bash
# Install dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..

# Set up environment variables (see docs/SETUP.md)

# Set up database
cd backend
npx prisma migrate dev --name init
npx prisma generate

# Start services
# Terminal 1: Redis (redis-server)
# Terminal 2: Backend
npm run start:dev

# Terminal 3: Frontend
cd ../frontend
npm run dev
```

Open `http://localhost:3002` in your browser.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io Client
- **Voice**: Simple-Peer (WebRTC)
- **State**: React hooks + Context API
- **UI Library**: Headless UI, Radix UI

### Backend
- **Framework**: Express.js or NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache/Sessions**: Redis
- **Real-time**: Socket.io
- **Auth**: JWT + Refresh Tokens
- **Voice Signaling**: Custom WebRTC via WebSocket

## Core Features

1. **Landing Page**: Hero, how it works, safety promise, CTA
2. **Authentication**: Email OTP, nickname setup, age gate 18+
3. **Onboarding**: Vibe setup, interest selection, voice comfort
4. **Mood Selection**: Visual mood picker (bored, lonely, curious, etc.)
5. **Vibe Questions**: Dynamic prompt system (5 quick Q&A)
6. **Matching Engine**: Rule-based compatibility scoring
7. **Text Chat**: Real-time anonymous chat with typing indicators
8. **Voice Chat**: Mutual-consent 1:1 voice calls
9. **Themed Rooms**: Small group text/voice spaces
10. **Daily Fresh Content**: Rotating prompts, rooms, themes
11. **Safety Center**: Report, block, mute, panic exit
12. **Moderation Dashboard**: Admin review and enforcement
13. **Saved Connections**: Maintain and re-engage matched users
14. **Vibe Badges**: Meaningful reputation (not follower counts)

## Key Design Principles

### Privacy
- Nickname-only by default
- No public phone, email, or location
- No forced identity reveal
- User controls all disclosure

### Safety
- Age gate 18+
- Strong abuse detection
- Moderation pipeline
- Blocking and reporting tools
- Audit logs for transparency

### UX
- Mobile-first design
- Low-friction interactions
- Emotionally warm tone
- Premium, minimal aesthetic
- Addictive but healthy engagement

### Performance
- WebSocket real-time infrastructure
- Optimized matching algorithm
- Efficient message storage
- CDN for static assets
- Database indexing

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Specification](docs/API_SPECIFICATION.md)
- [Frontend Structure](docs/FRONTEND_STRUCTURE.md)
- [Backend Structure](docs/BACKEND_STRUCTURE.md)
- [Matching Engine](docs/MATCHING_ENGINE.md)
- [Chat & Voice Architecture](docs/CHAT_VOICE_ARCHITECTURE.md)
- [Moderation System](docs/MODERATION_SYSTEM.md)
- [Admin Dashboard](docs/ADMIN_DASHBOARD.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Strategy](docs/TESTING.md)
- [Security Checklist](docs/SECURITY.md)
- [Environment Variables](docs/ENV_VARIABLES.md)

## Development Roadmap

### MVP (Phase 1)
- Landing page
- Authentication
- Onboarding
- Mood & vibe selection
- Matching engine (rule-based)
- Text chat
- Basic safety tools
- Admin moderation basics

### Phase 2 (0-2 weeks after launch)
- Voice chat with WebRTC
- Themed rooms
- Daily prompts
- Saved connections
- Vibe badges

### Phase 3 (2-4 weeks)
- Advanced matching (ML-based)
- Room recording and replay
- Premium features
- Analytics dashboard

## Security

This application handles sensitive user data and requires strict security practices.

See [SECURITY.md](docs/SECURITY.md) for:
- Authentication strategy
- Rate limiting
- Input validation
- XSS/CSRF protection
- Encryption standards
- Moderation logging
- Consent tracking

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Environment setup
- Database migrations
- Docker configuration
- CI/CD pipeline
- Monitoring and logging
- Scaling strategy

## Contact & Support

- **Product Email**: product@vibepass.app
- **Support Email**: support@vibepass.app
- **Moderation Report**: safety@vibepass.app

---

**Core Promise**: "Match by vibe. Reveal by choice."

**Made with ❤️ for authentic connection.**
