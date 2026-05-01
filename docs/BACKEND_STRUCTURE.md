# Backend Structure (NestJS Edition)

VibePass utilizes Node.js with TypeScript and the **NestJS** framework for a highly scalable, enterprise-grade, domain-driven architecture.

## Directory Layout

```text
backend/src/
├── main.ts                     # Entry point, bootstrap Nest application
├── app.module.ts               # Root module
├── common/                     # Cross-module shared resources
│   ├── decorators/             # Custom decorators (@User, @Roles)
│   ├── filters/                # Global exception filters
│   ├── guards/                 # JwtAuthGuard, RolesGuard
│   ├── interceptors/           # Response serialization, logging
│   └── interfaces/             # Global TS interfaces
├── config/                     # Environment configuration / validation (Joi/Zod)
├── database/                   # Prisma ORM setup
│   ├── prisma.service.ts
│   └── schema.prisma           # ERD Models defined here
├── modules/                    # Domain-driven features
│   ├── auth/                   # OTP, Magic links, JWT issuance
│   ├── users/                  # Nickname, age, settings
│   ├── profiles/               # Public-facing profiles and vibe scores
│   ├── moods/                  # Mood dictionaries
│   ├── prompts/                # Question logic
│   ├── matching/               # Discovery algorithm
│   ├── chat/                   # Text chat persistence
│   ├── voice/                  # WebRTC metadata
│   ├── rooms/                  # Themed room logic
│   ├── moderation/             # Reporting, blocks, trust score
│   └── admin/                  # Elevated routes for dashboard
├── websocket/                  # Socket.io gateways
│   ├── chat.gateway.ts         # Text chat events
│   ├── voice.gateway.ts        # WebRTC signaling events
│   └── ws.guard.ts             # Auth guard for socket connections
├── jobs/                       # BullMQ Processors (Analytics, cleanup)
├── services/                   # Third-party integrations (Redis, Email)
└── utils/                      # Helper functions
```

## NestJS Highlights
- **IoC Container**: Dependency injection ensures cleanly testable modules.
- **Prisma ORM**: Strongly typed schema, replacing TypeORM. Prisma speeds up MVP DB operations while preserving relational integrity.
- **WebSocket Gateways**: NestJS `@WebSocketGateway()` natively wraps Socket.io, allowing us to use class-based controllers for real-time signaling.
- **BullMQ**: For heavy match calculations or sending async notifications.
