# VibePass WebSocket & Real-time Events Design

**Transport:** Socket.io (with fallback to polling)  
**Server:** NestJS with @nestjs/websockets  
**Client:** Socket.io client library  

---

## Connection & Authentication

### Initial Connection

```typescript
// Client
const socket = io('ws://localhost:3003', {
  auth: {
    token: '...'  // JWT bearer token
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Server validates JWT before accepting connection
socket.on('connect', () => {
  console.log('Connected, socket ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

---

## Namespaces

### Namespace: `/chat` (Text Messaging)

#### Events: Client → Server

**1. Join Chat**
```typescript
socket.emit('chat:join', {
  chatId: 'chat_789',
  userId: 'user_123'
});
```

**Response from server:**
```typescript
socket.on('chat:joined', {
  chatId: 'chat_789',
  members: ['user_123', 'user_456'],
  messageHistory: [ /* last 50 messages */ ],
  draftMessages: {} // Unsent drafts for user
});
```

---

**2. Send Message**
```typescript
socket.emit('chat:message_send', {
  chatId: 'chat_789',
  content: 'Hey! How are you?',
  clientId: Math.random() // For deduplication
});
```

**Server responds to sender:**
```typescript
socket.on('chat:message_sent', {
  id: 'msg_123',
  content: 'Hey! How are you?',
  createdAt: '2026-03-27T10:00:00Z',
  status: 'sent'
});
```

**Server broadcasts to recipient (same chat):**
```typescript
socket.on('chat:message_received', {
  id: 'msg_123',
  chatId: 'chat_789',
  senderId: 'user_123',
  senderNickname: 'vibe_user_123',
  content: 'Hey! How are you?',
  createdAt: '2026-03-27T10:00:00Z',
  isRead: false
});
```

---

**3. Typing Indicator**

```typescript
socket.emit('chat:typing_start', {
  chatId: 'chat_789'
});

// After 3 seconds or on message send, send stop
socket.emit('chat:typing_stop', {
  chatId: 'chat_789'
});
```

**Server broadcasts to recipient:**
```typescript
socket.on('chat:user_typing', {
  chatId: 'chat_789',
  senderId: 'user_123',
  senderNickname: 'vibe_user_123',
  isTyping: true
});

socket.on('chat:user_typing', {
  chatId: 'chat_789',
  senderId: 'user_123',
  senderNickname: 'vibe_user_123',
  isTyping: false
});
```

---

**4. Read Receipt**

```typescript
socket.emit('chat:read_receipt', {
  chatId: 'chat_789',
  messageIds: ['msg_121', 'msg_122', 'msg_123']
});
```

**Server broadcasts to sender:**
```typescript
socket.on('chat:messages_read', {
  chatId: 'chat_789',
  messageIds: ['msg_121', 'msg_122', 'msg_123'],
  readAt: '2026-03-27T10:05:00Z'
});
```

---

**5. Add Reaction**

```typescript
socket.emit('chat:reaction_add', {
  chatId: 'chat_789',
  messageId: 'msg_123',
  emoji: '❤️'
});
```

**Server broadcasts to both participants:**
```typescript
socket.on('chat:reaction_updated', {
  messageId: 'msg_123',
  emoji: '❤️',
  count: 2,
  users: ['user_123', 'user_456'],
  action: 'added'
});
```

---

**6. Remove Reaction**

```typescript
socket.emit('chat:reaction_remove', {
  chatId: 'chat_789',
  messageId: 'msg_123',
  emoji: '❤️'
});
```

**Server broadcasts:**
```typescript
socket.on('chat:reaction_updated', {
  messageId: 'msg_123',
  emoji: '❤️',
  count: 1,
  users: ['user_456'],
  action: 'removed'
});
```

---

**7. Leave Chat**

```typescript
socket.emit('chat:leave', {
  chatId: 'chat_789'
});
```

**Server responds:**
```typescript
socket.on('chat:left', {
  chatId: 'chat_789',
  leftAt: '2026-03-27T10:30:00Z'
});
```

---

**8. Message Flagged (Moderation)**

```typescript
// Server broadcasts when message is flagged by moderation system
socket.on('chat:message_flagged', {
  messageId: 'msg_456',
  reason: 'inappropriate_content',
  action: 'hidden'
});
```

---

### Namespace: `/voice` (WebRTC Signaling)

#### Events: Client → Server

**1. Request Voice Call**

```typescript
socket.emit('voice:request', {
  chatId: 'chat_789',
  targetUserId: 'user_456',
  audioConfig: {
    sampleRate: 48000,
    channels: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
});
```

**Server sends to recipient:**
```typescript
socket.on('voice:incoming_request', {
  fromUserId: 'user_123',
  fromNickname: 'vibe_user_123',
  chatId: 'chat_789',
  inviteId: 'voice_invite_123',
  expiresIn: 300  // 5 minutes
});
```

---

**2. Respond to Voice Request**

```typescript
// Accept
socket.emit('voice:respond', {
  inviteId: 'voice_invite_123',
  action: 'accept',  // or 'decline'
  audioDeviceId: 'default'
});
```

**Server sends both participants:**
```typescript
// To accepter
socket.on('voice:request_accepted', {
  sessionId: 'session_456',
  initiatorId: 'user_123',
  recipientId: 'user_456',
  rtcConfig: {
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']
      },
      {
        urls: ['turn:turn.example.com:3478'],
        username: 'user',
        credential: 'pass'
      }
    ],
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  },
  startedAt: '2026-03-27T10:35:00Z'
});

// To initiator
socket.on('voice:request_accepted', {
  sessionId: 'session_456',
  recipientId: 'user_456',
  recipientNickname: 'cosmic_soul',
  rtcConfig: { /* same */ },
  startedAt: '2026-03-27T10:35:00Z'
});
```

---

**3. Send WebRTC Offer**

```typescript
socket.emit('voice:offer', {
  sessionId: 'session_456',
  sdp: {
    type: 'offer',
    sdp: 'v=0\r\no=- 123456789 0 IN IP4 127.0.0.1\r\n...'
  }
});
```

**Server forwards to recipient:**
```typescript
socket.on('voice:incoming_offer', {
  sessionId: 'session_456',
  fromUserId: 'user_123',
  sdp: {
    type: 'offer',
    sdp: 'v=0\r\no=- 123456789 0 IN IP4 127.0.0.1\r\n...'
  }
});
```

---

**4. Send WebRTC Answer**

```typescript
socket.emit('voice:answer', {
  sessionId: 'session_456',
  sdp: {
    type: 'answer',
    sdp: 'v=0\r\no=- 987654321 0 IN IP4 127.0.0.1\r\n...'
  }
});
```

**Server forwards to initiator:**
```typescript
socket.on('voice:incoming_answer', {
  sessionId: 'session_456',
  fromUserId: 'user_456',
  sdp: {
    type: 'answer',
    sdp: 'v=0\r\no=- 987654321 0 IN IP4 127.0.0.1\r\n...'
  }
});
```

---

**5. Send ICE Candidate**

```typescript
socket.emit('voice:ice_candidate', {
  sessionId: 'session_456',
  candidate: {
    candidate: 'candidate:842163049 1 udp ...',
    sdpMLineIndex: 0,
    sdpMid: '0'
  }
});
```

**Server forwards to peer:**
```typescript
socket.on('voice:incoming_ice_candidate', {
  sessionId: 'session_456',
  fromUserId: 'user_123',
  candidate: {
    candidate: 'candidate:842163049 1 udp ...',
    sdpMLineIndex: 0,
    sdpMid: '0'
  }
});
```

---

**6. Voice Status Updates**

```typescript
// Mute/Unmute (informational)
socket.emit('voice:audio_state', {
  sessionId: 'session_456',
  audioEnabled: false  // User muted
});

socket.on('voice:peer_audio_state', {
  sessionId: 'session_456',
  peerUserId: 'user_456',
  audioEnabled: false
});
```

---

**7. End Voice Call**

```typescript
socket.emit('voice:end', {
  sessionId: 'session_456',
  duration: 127,  // seconds
  qualityRating: 4,  // 1-5
  reason: 'user_initiated'  // 'user_initiated', 'lost_connection', 'timeout'
});
```

**Server notifies both participants:**
```typescript
socket.on('voice:call_ended', {
  sessionId: 'session_456',
  endedBy: 'user_123',
  duration: 127,
  endedAt: '2026-03-27T10:37:47Z',
  reason: 'user_initiated'
});
```

---

### Namespace: `/rooms` (Public Room Messages)

#### Events: Client → Server

**1. Join Room**

```typescript
socket.emit('room:join', {
  roomId: 'room_1'
});
```

**Server responds:**
```typescript
socket.on('room:joined', {
  roomId: 'room_1',
  roomName: 'Late-Night Overthinkers',
  currentMemberCount: 247,
  recentMessages: [ /* last 30 messages */ ],
  currentPrompt: { /* prompt object */ }
});
```

---

**2. Post Room Message**

```typescript
socket.emit('room:message_send', {
  roomId: 'room_1',
  content: 'Anyone else thinking about their future?',
  clientId: Math.random()
});
```

**Server broadcasts to all in room:**
```typescript
socket.on('room:message_received', {
  roomId: 'room_1',
  id: 'msg_234',
  senderNickname: 'anonymous_123',  // Anonymous, no full ID
  content: 'Anyone else thinking about their future?',
  createdAt: '2026-03-27T02:00:00Z'
});
```

---

**3. Add Reaction in Room**

```typescript
socket.emit('room:reaction_add', {
  roomId: 'room_1',
  messageId: 'msg_234',
  emoji: '👍'
});
```

**Server broadcasts:**
```typescript
socket.on('room:reaction_updated', {
  messageId: 'msg_234',
  emoji: '👍',
  count: 5,
  action: 'added'
});
```

---

**4. Leave Room**

```typescript
socket.emit('room:leave', {
  roomId: 'room_1'
});
```

---

### Namespace: `/notifications` (User Notifications)

#### Events: Server → Client

```typescript
// New match available
socket.on('notification:new_match', {
  userId: 'user_456',
  nickname: 'cosmic_soul',
  compatibilityScore: 78
});

// Voice call request (if not in chat)
socket.on('notification:voice_request', {
  fromUserId: 'user_123',
  fromNickname: 'vibe_user_123',
  inviteId: 'voice_invite_123'
});

// Report action taken
socket.on('notification:report_action', {
  reportId: 'report_123',
  action: 'warn',  // User was warned by mods
  message: 'Your report has been reviewed'
});

// User blocked you
socket.on('notification:user_blocked_you', {
  userId: 'user_456'
});
```

---

## Connection Management

### Reconnection Strategy

```typescript
// Client automatically reconnects with:
// - exponential backoff
// - max 5 attempts
// - syncs missed messages on reconnect

socket.on('reconnect', () => {
  socket.emit('sync:messages', {
    lastMessageAt: lastSeenTimestamp
  });
});
```

### Heartbeat/Ping-Pong

```typescript
// Built into Socket.io
// Default: ping every 25s, timeout after 60s
```

### Cleanup

```typescript
socket.on('disconnect', () => {
  console.log('Disconnected');
  // Persist drafts locally
  // Show "offline" indicator
});
```

---

## Error Handling

### General Error Event

```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // {
  //   code: 'AUTH_FAILED' | 'RATE_LIMITED' | 'INVALID_DATA',
  //   message: 'Human readable message'
  // }
});
```

### Specific Errors

```typescript
socket.on('chat:error', {
  code: 'CHAT_NOT_FOUND',
  message: 'Chat session not found'
});

socket.on('voice:error', {
  code: 'VOICE_DECLINED',
  message: 'User declined voice request'
});

socket.on('room:error', {
  code: 'ROOM_FULL',
  message: 'Room is at capacity'
});
```

---

## Message Deduplication

**Client-side:**
```typescript
const clientId = Math.random().toString(36);
socket.emit('chat:message_send', {
  chatId: 'chat_789',
  content: 'Hello',
  clientId: clientId
});

// Cache sent message with clientId
sentMessages[clientId] = { content: 'Hello', timestamp };
```

**Server-side:**
```typescript
socket.on('chat:message_received', (data) => {
  // deduplicationKey = `${userId}_${clientId}`
  if (cache.has(deduplicationKey)) return;
  // Process and store message
  cache.set(deduplicationKey, messageId);
});
```

---

##Performance Optimizations

1. **Message Batching:** Batch typing indicators (debounce 300ms)
2. **Compression:** Socket.io automatically compresses payloads
3. **Throttling:** Limit typing updates to 1 per 500ms
4. **Pagination:** Load chat history in 50-message chunks
5. **Caching:** Cache room lists, update every 60s

---

## Security

1. **JWT Validation:** Every WebSocket connection requires valid JWT
2. **Rate Limiting:** 100 messages per minute per user
3. **Input Validation:** All payloads validated against Zod schemas
4. **Encryption:** All data in transit encrypted (WSS)
5. **Audit Logging:** All events logged for moderation

---

**Next:** See WEBRTC_SIGNALING.md for detailed voice implementation.
