import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api/storage';

class VoiceService {
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentSessionId: string | null = null;
  private isInitiator = false;

  // Event callbacks
  onIncomingCall?: (data: any) => void;
  onCallAccepted?: (data: any) => void;
  onCallEnded?: (data: any) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onCallError?: (error: string) => void;

  async connect() {
    const token = getAccessToken();
    if (!token) return;

    if (this.socket?.connected) {
      return;
    }

    this.socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/voice`, {
      auth: { token },
    });

    this.setupSocketListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.endCall();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('voice:incoming_request', (data) => {
      this.onIncomingCall?.(data);
    });

    this.socket.on('voice:request_accepted', async (data) => {
      this.currentSessionId = data.sessionId;
      this.isInitiator = data.initiatorId === this.getCurrentUserId();
      await this.setupPeerConnection(data.rtcConfig);
      this.onCallAccepted?.(data);
    });

    this.socket.on('voice:incoming_offer', async (data) => {
      await this.handleIncomingOffer(data);
    });

    this.socket.on('voice:incoming_answer', async (data) => {
      await this.handleIncomingAnswer(data);
    });

    this.socket.on('voice:incoming_ice_candidate', async (data) => {
      await this.handleIncomingIceCandidate(data);
    });

    this.socket.on('voice:call_ended', (data) => {
      this.endCall();
      this.onCallEnded?.(data);
    });

    this.socket.on('voice:error', (error) => {
      this.onCallError?.(error.message);
    });
  }

  async initiateCall(chatId: string, targetUserId: string) {
    if (!this.socket) await this.connect();

    try {
      // Get microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleSize: 16,
          sampleRate: 48000,
        },
        video: false,
      });

      this.socket?.emit('voice:request', {
        chatId,
        targetUserId,
        audioConfig: {
          sampleRate: 48000,
          channels: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

    } catch (error) {
      this.onCallError?.('Failed to access microphone');
      throw error;
    }
  }

  async acceptCall(inviteId: string) {
    try {
      // Get microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.socket?.emit('voice:respond', {
        inviteId,
        action: 'accept',
        audioDeviceId: 'default',
      });

    } catch (error) {
      this.socket?.emit('voice:respond', {
        inviteId,
        action: 'decline',
      });
      this.onCallError?.('Failed to access microphone');
      throw error;
    }
  }

  declineCall(inviteId: string) {
    this.socket?.emit('voice:respond', {
      inviteId,
      action: 'decline',
    });
  }

  private async setupPeerConnection(rtcConfig: any) {
    this.peerConnection = new RTCPeerConnection(rtcConfig);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.onRemoteStream?.(this.remoteStream);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentSessionId) {
        this.socket?.emit('voice:ice_candidate', {
          sessionId: this.currentSessionId,
          candidate: {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
          },
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
    };

    // Create offer if initiator
    if (this.isInitiator) {
      await this.createAndSendOffer();
    }
  }

  private async createAndSendOffer() {
    if (!this.peerConnection || !this.currentSessionId) return;

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });

      await this.peerConnection.setLocalDescription(offer);

      this.socket?.emit('voice:offer', {
        sessionId: this.currentSessionId,
        sdp: {
          type: offer.type,
          sdp: offer.sdp,
        },
      });
    } catch (error) {
      this.onCallError?.('Failed to create offer');
    }
  }

  private async handleIncomingOffer(data: any) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.sdp)
      );

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket?.emit('voice:answer', {
        sessionId: data.sessionId,
        sdp: {
          type: answer.type,
          sdp: answer.sdp,
        },
      });
    } catch (error) {
      this.onCallError?.('Failed to handle offer');
    }
  }

  private async handleIncomingAnswer(data: any) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.sdp)
      );
    } catch (error) {
      this.onCallError?.('Failed to handle answer');
    }
  }

  private async handleIncomingIceCandidate(data: any) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
    }
  }

  toggleMute(muted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }

    // Notify peer
    if (this.currentSessionId) {
      this.socket?.emit('voice:audio_state', {
        sessionId: this.currentSessionId,
        audioEnabled: !muted,
      });
    }
  }

  async endCall(reason = 'user_initiated') {
    if (this.currentSessionId) {
      // Calculate duration
      const duration = 0; // Would need to track start time

      this.socket?.emit('voice:end', {
        sessionId: this.currentSessionId,
        duration,
        reason,
      });
    }

    // Clean up
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.currentSessionId = null;
    this.isInitiator = false;
  }

  private getCurrentUserId(): string {
    const token = getAccessToken();

    if (!token) {
      return '';
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || '';
    } catch {
      return '';
    }
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  isInCall() {
    return this.currentSessionId !== null;
  }
}

export const voiceService = new VoiceService();
