# Product Requirements Document (PRD)

## Product: VibePass
**Core Promise:** "Match by vibe. Reveal by choice."

### High-level Goals
1. Provide a private, safe, and emotionally intelligent matching platform for demographics aged 18-28.
2. Build connection through text and voice, entirely omitting visual/video prejudices up front.
3. Foster organic, unpressured connection via dynamic prompts, moods, and mutual-consent reveal options.

### In Scope for MVP
- **Auth**: Email magic links / OTP. Nickname identity.
- **Profiling**: Mood selection, topic interests, conversational goal (deep, casual, flirty).
- **Match Engine**: Algorithm pairing users based on shared mood and prompt tags.
- **Chat**: Real-time anonymous text chat.
- **Voice**: WebRTC voice calling gated behind explicit mutual consent.
- **Reveal Options**: Controlled UX flow to share First Name or Instagram Handle.
- **Safety**: Robust Reporting, Blocking, Mute, Panic Exit.
- **Rooms**: Minimal themed chat rooms if time permits.

### Out of Scope for MVP
- Video chat.
- Pictures/Image sharing in text chat.
- Public followers, feeds, un-curated social media profiles.
- Machine Learning / AI model matching (rule-based algorithm for MVP).
- Monetization/Premium tiers.

### Functional Requirements
- **FR1 (Auth)**: Users must verify via email or mobile before proceeding. Name capture must be limited to a Nickname initially.
- **FR2 (Matching)**: The system must not match the same users together multiple times in a week if they passed on each other.
- **FR3 (Chat)**: Messages must be delivered in real-time (< 200ms latency) via WebSockets.
- **FR4 (Voice)**: Voice requests must display an Acceptance modal. Failure to accept within 60s auto-declines the request anonymously.
- **FR5 (Safety)**: A "Report" functionality must instantly disconnect the current match and hide their information from the reporting user.

### Non-Functional Requirements
- **NFR1 (Design)**: The interface must utilize dark mode aesthetics with warm tone accents.
- **NFR2 (Mobile First)**: The UI must prioritize mobile aspect ratios and thumb-reach zones.
- **NFR3 (Privacy)**: No real name, email, phone number, or precise location is accessible via any public or peer-to-peer API endpoint.
