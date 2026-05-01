# VibePass WebRTC Signaling Design

**Standard:** WebRTC peer-to-peer with STUN/TURN signaling via Socket.io  
**Codec:** Opus (audio, preferred), VP8/VP9 (N/A for audio-only)  
**Transport:** SRTP (encrypted)  

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User A (Initiator)                      │
│  JavaScript RTCPeerConnection Instance                          │
│  - getUserMedia() → audio stream                                │
│  - createOffer() → SDP offer                                    │
└────────────────────────────┬──────────────────────────────────┘
                             │
                    Socket.io WebSocket
                     (Signaling Channel)
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
┌────────▼──────┐                        ┌──────▼────────┐
│ NestJS        │ Stores session state   │ NestJS        │
│ WebSocket     │ ICE candidates         │ WebSocket     │
│ Handler       │ SDP offers/answers     │ Handler       │
└────────┬──────┘                        └──────┬────────┘
         │                                       │
         └───────────────────┬───────────────────┘
                             │
                    Socket.io WebSocket
                     (Signaling Channel)
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                         User B (Responder)                     │
│  JavaScript RTCPeerConnection Instance                        │
│  - getUserMedia() → audio stream                              │
│  - createAnswer() → SDP answer                                │
└─────────────────────────────────────────────────────────────┘

              ===== After Connection Established =====

┌─────────────────────────────────────────────────────────────────┐
│                    Direct P2P Connection                        │
│    RTP/SRTP Audio Packets (encrypted, low-latency)            │
│    Media Path (NOT through server)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Voice Flow Diagram

```
User A ("Request Voice")
     │
     ├─ emit voice:request
     │    └─ Server stores invite state
     │
User B ("Receive Notification")
     │
     ├─ Dialog: [Accept] [Decline]
     │
     ├─ Accept: emit voice:respond { action: 'accept' }
     │
┌────▼──────────────────────────────────────────────────────────┐
│        Both Users: ICE Gathering Phase                        │
│  - Browser collects candidate IPs/ports                       │
│  - Sends ICE candidates via Socket.io                         │
└────┬──────────────────────────────────────────────────────────┘
│
├─ User A: createOffer()
│    └─ emit voice:offer { sdp: offer }
│         └─ Server forwards to User B
│
├─ User B: receives offer
│    ├─ setRemoteDescription(offer)
│    └─ createAnswer()
│         └─ emit voice:answer { sdp: answer }
│              └─ Server forwards to User A
│
├─ User A: receives answer
│    └─ setRemoteDescription(answer)
│
├─ Both: Exchange ICE candidates
│    └─ emit voice:ice_candidate { candidate }
│         └─ Server relays to peer
│
└─ Connection established!
   - RTCPeerConnection.ontrack fires
   - audio element plays peer's stream
   - Both send RTP packets directly
```

---

## Step-by-Step Implementation

### Phase 1: Request & Accept

**User A (Caller):**
```typescript
const initiateVoiceCall = async (chatId: string, userId: string) => {
  try {
    // 1. Get user media (microphone)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleSize: 16,
        sampleRate: 48000
      },
      video: false
    });

    // Store stream & emit request
    localStream = stream;
    socket.emit('voice:request', {
      chatId: chatId,
      targetUserId: userId,
      audioConfig: {
        sampleRate: 48000,
        channels: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    // Show "Awaiting response..." UI
    showVoiceCallPending();

  } catch (error) {
    console.error('Failed to get media:', error);
    showError('Microphone access denied');
  }
};
```

**User B (Callee):**
```typescript
// Listen for incoming request
socket.on('voice:incoming_request', async (data) => {
  const { fromUserId, fromNickname, inviteId, expiresIn } = data;
  
  // Show incoming call notification
  showIncomingCallDialog({
    fromNickname,
    onAccept: () => acceptVoiceCall(inviteId),
    onDecline: () => declineVoiceCall(inviteId),
    expiresIn
  });
});

const acceptVoiceCall = async (inviteId: string) => {
  try {
    // Get microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: false
    });
    
    localStream = stream;
    
    // Emit acceptance
    socket.emit('voice:respond', {
      inviteId: inviteId,
      action: 'accept',
      audioDeviceId: 'default'
    });

    // Transition to RTC setup
    showVoiceConnectingUI();
    
  } catch (error) {
    socket.emit('voice:respond', {
      inviteId: inviteId,
      action: 'decline'
    });
    showError('Microphone access denied');
  }
};
```

---

### Phase 2: RTC Connection Setup

**Both Users:**
```typescript
// Listen for acceptance (both participants receive this)
socket.on('voice:request_accepted', async (data) => {
  const { sessionId, rtcConfig, startedAt } = data;

  // Create RTCPeerConnection
  peerConnection = new RTCPeerConnection({
    iceServers: rtcConfig.iceServers,
    iceTransportPolicy: rtcConfig.iceTransportPolicy,
    bundlePolicy: rtcConfig.bundlePolicy,
    rtcpMuxPolicy: rtcConfig.rtcpMuxPolicy
  });

  // Add local stream tracks
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // Listen for remote stream
  peerConnection.ontrack = (event) => {
    console.log('Remote track received:', event.track.kind);
    remoteStream = event.streams[0];
    
    // Play remote audio
    const audioElement = document.createElement('audio');
    audioElement.autoplay = true;
    audioElement.playsinline = true;
    audioElement.srcObject = remoteStream;
    
    showRemoteAudioPlaying();
  };

  // ICE candidate gathering
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('New ICE candidate:', event.candidate);
      socket.emit('voice:ice_candidate', {
        sessionId: sessionId,
        candidate: {
          candidate: event.candidate.candidate,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid
        }
      });
    }
  };

  // Connection state monitoring
  peerConnection.onconnectionstatechange = () => {
    console.log('Connection state:', peerConnection.connectionState);
    switch (peerConnection.connectionState) {
      case 'connected':
        showVoiceConnected();
        recordStartTime();
        break;
      case 'disconnected':
        showVoiceDisconnected();
        break;
      case 'failed':
        handleConnectionFailed();
        break;
      case 'closed':
        handleConnectionClosed();
        break;
    }
  };

  peerConnection.onicegatheringstatechange = () => {
    console.log('ICE gathering state:', peerConnection.iceGatheringState);
  };

  // Store session ID
  currentVoiceSession = {
    sessionId,
    startedAt: new Date(startedAt),
    peerConnection,
    localStream,
    remoteStream: null
  };

  // Now create offer or answer based on role
  if (isInitiator) {
    createAndSendOffer(sessionId);
  }
  // Responder waits for offer
});
```

---

### Phase 3: SDP Exchange

**Initiator (User A):**
```typescript
const createAndSendOffer = async (sessionId: string) => {
  try {
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false
    });

    await peerConnection.setLocalDescription(offer);

    socket.emit('voice:offer', {
      sessionId: sessionId,
      sdp: {
        type: offer.type,
        sdp: offer.sdp
      }
    });

    console.log('Offer sent');
  } catch (error) {
    console.error('Failed to create offer:', error);
    endVoiceCall('error');
  }
};
```

**Responder (User B):**
```typescript
socket.on('voice:incoming_offer', async (data) => {
  const { sessionId, sdp } = data;

  try {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(sdp)
    );

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit('voice:answer', {
      sessionId: sessionId,
      sdp: {
        type: answer.type,
        sdp: answer.sdp
      }
    });

    console.log('Answer sent');
  } catch (error) {
    console.error('Failed to create answer:', error);
    endVoiceCall('error');
  }
});
```

**Initiator receives answer:**
```typescript
socket.on('voice:incoming_answer', async (data) => {
  const { sdp } = data;

  try {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(sdp)
    );
    console.log('Answer received and set');
  } catch (error) {
    console.error('Failed to set remote description:', error);
    endVoiceCall('error');
  }
});
```

---

### Phase 4: ICE Candidate Exchange

**Both participants continuously send ICE candidates:**
```typescript
// Send candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('voice:ice_candidate', {
      sessionId: currentVoiceSession.sessionId,
      candidate: {
        candidate: event.candidate.candidate,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
        sdpMid: event.candidate.sdpMid
      }
    });
  }
};

// Receive candidates
socket.on('voice:incoming_ice_candidate', async (data) => {
  const { candidate } = data;
  try {
    await peerConnection.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  } catch (error) {
    console.error('Failed to add ICE candidate:', error);
  }
});
```

---

### Phase 5: Call Management

**Mute/Unmute Audio:**
```typescript
const toggleAudio = (enabled: boolean) => {
  localStream.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });

  // Notify peer (informational)
  socket.emit('voice:audio_state', {
    sessionId: currentVoiceSession.sessionId,
    audioEnabled: enabled
  });

  updateMuteButtonUI(enabled);
};

socket.on('voice:peer_audio_state', (data) => {
  const { peerUserId, audioEnabled } = data;
  updatePeerAudioIndicator(peerUserId, audioEnabled);
});
```

**Display Call Timer:**
```typescript
const startCallTimer = () => {
  const startTime = currentVoiceSession.startedAt;
  callTimerInterval = setInterval(() => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    displayCallDuration(formatTime(duration));
  }, 1000);
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
```

**End Call:**
```typescript
const endVoiceCall = async (reason = 'user_initiated') => {
  try {
    // Stop media streams
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
    }

    // Clear timer
    clearInterval(callTimerInterval);

    // Get call duration
    const duration = Math.floor(
      (Date.now() - currentVoiceSession.startedAt) / 1000
    );

    // Get call statistics (optional)
    const stats = await getCallStats(peerConnection);

    // Notify peer
    socket.emit('voice:end', {
      sessionId: currentVoiceSession.sessionId,
      duration: duration,
      qualityRating: getUserQualityRating(),  // 1-5
      reason: reason,
      stats: {
        bytesReceived: stats.bytesReceived,
        bytesSent: stats.bytesSent,
        packetsLost: stats.packetsLost
      }
    });

    // Show feedback dialog
    showCallEndDialog({
      duration,
      peer: peerNickname
    });

    // Reset state
    currentVoiceSession = null;

  } catch (error) {
    console.error('Error ending call:', error);
  }
};

socket.on('voice:call_ended', (data) => {
  const { endedBy, duration, reason } = data;
  
  // Clean up UI
  hideVoiceCallUI();
  
  // Show summary
  showVoiceCallSummary({
    duration,
    peer: peerNickname,
    initiator: endedBy
  });
});
```

---

## Call Statistics

**Retrieve call stats for quality assessment:**

```typescript
const getCallStats = async (peerConnection: RTCPeerConnection) => {
  const stats = {
    bytesReceived: 0,
    bytesSent: 0,
    packetsLost: 0,
    jitter: 0,
    roundTripTime: 0,
    availableOutgoingBitrate: 0
  };

  const report = await peerConnection.getStats();
  
  report.forEach((monitor) => {
    // Inbound RTP
    if (monitor.type === 'inbound-rtp' && monitor.kind === 'audio') {
      stats.bytesReceived = monitor.bytesReceived;
      stats.packetsLost = monitor.packetsLost;
      stats.jitter = monitor.jitter;
    }
    // Outbound RTP
    if (monitor.type === 'outbound-rtp' && monitor.kind === 'audio') {
      stats.bytesSent = monitor.bytesSent;
    }
    // Candidate pairs
    if (monitor.type === 'candidate-pair' && monitor.state === 'succeeded') {
      stats.roundTripTime = monitor.currentRoundTripTime;
      stats.availableOutgoingBitrate = monitor.availableOutgoingBitrate;
    }
  });

  return stats;
};
```

---

## Error Handling

**Connection failures:**
```typescript
peerConnection.onconnectionstatechange = () => {
  if (peerConnection.connectionState === 'failed') {
    handleConnectionFailed();
  }
};

const handleConnectionFailed = async () => {
  console.error('WebRTC connection failed');
  
  // Try ICE restart
  const offer = await peerConnection.createOffer({ iceRestart: true });
  await peerConnection.setLocalDescription(offer);
  
  socket.emit('voice:offer', {
    sessionId: currentVoiceSession.sessionId,
    sdp: offer
  });

  showUI('Reconnecting...');
};
```

**Microphone permission denied:**
```typescript
navigator.mediaDevices.getUserMedia({ audio: true })
  .catch((error) => {
    if (error.name === 'NotAllowedError') {
      showError('Microphone access denied. Check browser permissions.');
    } else if (error.name === 'NotFoundError') {
      showError('No microphone found');
    } else {
      showError('Microphone error: ' + error.message);
    }
  });
```

---

## STUN/TURN Configuration

**Production STUN/TURN servers:**

```typescript
const iceServers = [
  // Google STUN (free)
  { urls: ['stun:stun.l.google.com:19302'] },
  { urls: ['stun:stun1.l.google.com:19302'] },
  
  // Twilio TURN (paid)
  {
    urls: ['turn:turnserver.example.com'],
    username: 'user@example.com',
    credential: 'AUTH_TOKEN'
  },
  
  // Self-hosted TURN (coturn)
  {
    urls: ['turn:turn.vibepass.com:3478?transport=udp'],
    username: 'vibepass',
    credential: 'turn_secret'
  }
];
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|---------|------|
| WebRTC Audio | ✅ | ✅ | ✅ | ✅ |
| getUserMedia | ✅ | ✅ | ✅ | ✅ |
| RTCPeerConnection | ✅ | ✅ | ✅ | ✅ |
| Opus codec | ✅ | ✅ | ✅ | ✅ |
| Echo Cancellation | ✅ | ✅ | ✅ | ✅ |

---

**Next:** See FRONTEND_STRUCTURE.md for file organization.
