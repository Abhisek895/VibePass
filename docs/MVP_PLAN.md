# VibePass MVP Build Plan

## Phase 1: Foundation (Weeks 1-2)
- **Goal**: Scaffolding, infrastructure initialization, and CI/CD pipelines.
- **Repository**: Monorepo split into Frontend (Next.js) & Backend (Express).
- **Database**: Spin up PostgreSQL. Run V1 migrations (`users`, `matches`, `chat_sessions`).
- **Auth**: Implement Magic Link flow. JWT creation and secure cookie setup.

## Phase 2: Core Engineering (Weeks 3-4)
- **Onboarding**: Create the Nickname, Mood, and Interest APIs.
- **Matching Engine**: Implement the Rule-Based weighted score logic.
- **Chat WebSockets**: Finalize the Socket.io implementation. Create the real-time text UI (Typing indicators, basic read/delivered logic).

## Phase 3: The Secret Sauce (Weeks 5-6)
- **Voice Consent**: Build the UI/UX for requesting a voice call.
- **WebRTC Integration**: Integrate STUN/TURN, set up the RTCPeerConnection over the custom WebSocket signaling channel.
- **Prompt System**: Display dynamic vibe prompts inline during active text chats to stimulate conversation.

## Phase 4: Safety & Polish (Weeks 7-8)
- **Moderation Tools**: Implement the 'Report', 'Block', and 'Panic Exit' API mutations and UI hooks.
- **Admin Dashboard**: Build a lightweight internal tool for reviewing flagged tickets.
- **Performance Opt**: Audit mobile responsiveness, refine dark-mode UI spring animations, configure Redis for production socket session stores.

## Phase 5: Testing & Launch (Week 9)
- **Beta Testing**: Internal group simulation for chat latency and WebRTC connection reliability on distinct NAT environments.
- **Soft Launch**: Deploy to Vercel (Frontend) and Render/Fly.io (Backend). Waitlist release.
