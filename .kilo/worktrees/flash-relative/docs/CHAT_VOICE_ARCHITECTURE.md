# Chat & Voice Architecture

VibePass is built on real-time connections, implemented securely without video.

## Real-Time Infrastructure (WebSocket)
- **Library**: Socket.io over Node.js.
- **Auth**: The JWT token is validated during the socket handshake. Disconnected users are marked offline automatically.
- **Data Persistence**: Text chats are temporarily cached in Redis and periodically batch-inserted into PostgreSQL. Chat histories can be disabled via user "retention preferences".

## Text Chat Flow
1. User A is matched with User B.
2. A generic room `chat_{matchId}` is created.
3. Both users join the room namespace.
4. Clients emit `message:send`. Server validates, broadcasts `message:receive` to the room, and inserts into DB.
5. Clients emit `typing:start`/`stop` for rapid UI updates.

## Voice Chat Flow (WebRTC)
Our voice chats use WebRTC for peer-to-peer audio transmission. The server acts *only* as a signaling intermediary.

### Technology Stack
- **Signaling**: Socket.io custom namespace.
- **Transmission**: Vanilla WebRTC standard APIs (`RTCPeerConnection`).
- **Traversal**: Managed TURN/STUN servers (e.g., Twilio Network Traversal or standard coturn) to bypass NAT/Firewalls.

### Simplified Signaling Handshake
1. **Consent Phase**:
   - Client A sends `voice:request` to Server. Server routes to Client B.
   - Client B displays UX modal.
   - Client B sends `voice:respond(accepted: true)`. Server routes to Client A.
2. **Offer/Answer Phase**:
   - Client A creates an `RTCSessionDescription` (Offer) and sends to Server (`voice:offer`). Server routes to Client B.
   - Client B processes the Offer, creates an Answer, sends `voice:answer` to Server. Server routes to Client A.
3. **ICE Candidates**:
   - Both clients begin gathering ICE candidates (network paths) and exchanging them via Server (`voice:ice-candidate`).
4. **Connection**:
   - The audio track is attached to an `<audio>` HTML tag in the DOM. The connection is direct.

### Security and Privacy in Voice
- The WebRTC stream is encrypted end-to-end inherently via DTLS/SRTP.
- The server records metadata only (start time, duration, user IDs).
- No recording is implemented for the MVP.
- Video tracks are hard-blocked during stream acquisition (`{ audio: true, video: false }`).
