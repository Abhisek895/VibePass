# Security Strategy

VibePass handles extremely sensitive private data. The "Reveal by Choice" promise only works if the system architecture forces privacy intrinsically.

## 1. Network & Transport Security
- **Encryption**: Every endpoint must be strictly TLS 1.2+ (HTTPS, WSS).
- **WebRTC**: Audio streams natively utilize SRTP and DTLS encryption. The server does not possess the decryption keys to the audio stream; it is strictly Peer-to-Peer unless utilizing an explicit SFU later (which we aren't for MVP).
- **CORS**: Heavily restrict CORS origins to the deployed frontend domain and verified local dev environments. Use CSRF tokens on state-mutating REST calls.

## 2. PII Isolation (Personally Identifiable Information)
- Email addresses and IPs must never be passed to the frontend via API responses, except `GET /me` for account settings.
- The `Match` object sent to the client must only contain the ID, Nickname, Mood, Shared Interests, and Vibe Score. Do not append internal DB properties.

## 3. Abuse Prevention
- **Rate Limiting**: Configured heavily at the NGINX / Express middleware layer natively backed by Redis.
  - Auth Endpoints: 5 requests per 15 minutes.
  - Chat socket: 20 messages per 10 seconds.
- **Sanitization**: All text payloads (chat, nicknames, feedback) must be scrubbed of script tags and SQL injection patterns. Utilize `DOMPurify` (frontend) and strict regex constraints (backend).

## 4. WebRTC Leak Prevention
- Because WebRTC reveals public IPs in ICE candidates, use TURN servers (Twilio) to relay traffic when the users do not want to expose IPs directly, or default to generic STUN/TURN setups that mask direct peer IPs if strict anonymization is required by the product logic. MVP will enforce a TURN relay to hide raw IPs.
