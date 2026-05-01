# API Specification

The VibePass API consists of a RESTful HTTP backend for state mutations and a WebSocket interface for real-time events.

## REST Endpoints

### Auth
- `POST /api/v1/auth/request-otp` - Initiates email magic link / OTP.
- `POST /api/v1/auth/verify-otp` - Validates OTP and returns JWT & Refresh tokens.
- `POST /api/v1/auth/logout` - Invalidates the current session token.
- `POST /api/v1/auth/refresh` - Issues a new session token via refresh token.

### Users & Onboarding
- `PUT /api/v1/users/me` - Update nickname, age band, preferences.
- `GET /api/v1/users/me` - Fetch own profile and preferences.
- `POST /api/v1/users/onboard` - Submit initial vibe questions and setup data.
- `GET /api/v1/users/:id/badges` - Fetch public badges of a user (anonymous).

### Match Engine
- `GET /api/v1/matches/pool` - Get current match recommendations based on mood/interests.
- `POST /api/v1/matches/action` - Accept/Like a match or pass on them.
- `GET /api/v1/connections` - Get saved connections.

### Rooms
- `GET /api/v1/rooms/active` - Fetch current themed rooms.
- `POST /api/v1/rooms/:id/join` - Join a specific room.
- `POST /api/v1/rooms/:id/leave` - Leave a room.

### Moderation & Safety
- `POST /api/v1/safety/report` - Submit an abuse report against a user/chat.
- `POST /api/v1/safety/block` - Block a specific user.
- `GET /api/v1/safety/blocked-users` - List blocked users.
- `POST /api/v1/safety/feedback` - Submit post-call/post-chat feedback.

## WebSocket Events (Socket.io)

### Connection
- `auth`: JWT token passed during connection handshake.
- `error`: Emitted to client on auth failures or logic errors.

### Text Chat Namespace (`/chat`)
- **Client to Server:**
  - `chat:join` (chatId)
  - `message:send` (chatId, text)
  - `typing:start` (chatId)
  - `typing:stop` (chatId)
  - `chat:leave` (chatId)
- **Server to Client:**
  - `message:receive` (messageObject)
  - `typing:update` (userId, isTyping)
  - `chat:ended` (reason)
  - `prompt:suggest` (promptObject)

### Voice Signaling Namespace (`/voice`)
- **Client to Server:**
  - `voice:request` (targetUserId)
  - `voice:respond` (targetUserId, accepted: boolean)
  - `voice:offer` (targetUserId, RTCSessionDescription)
  - `voice:answer` (targetUserId, RTCSessionDescription)
  - `voice:ice-candidate` (targetUserId, RTCIceCandidate)
  - `voice:end` (targetUserId)
- **Server to Client:**
  - `voice:incoming_request` (fromUserId)
  - `voice:request_status` (status: accepted/declined)
  - `voice:incoming_offer` (...)
  - `voice:incoming_answer` (...)
  - `voice:incoming_ice_candidate` (...)
  - `voice:call_ended` (reason)
