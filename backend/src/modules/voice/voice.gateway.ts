import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VoiceService } from './voice.service';

@Injectable()
@WebSocketGateway({ namespace: '/voice' })
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Store active sessions and ICE candidates temporarily
  private activeSessions = new Map<string, any>();
  private pendingIceCandidates = new Map<string, any[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly voiceService: VoiceService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ||
        (client.handshake.query.token as string | undefined);
      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          email: true,
          id: true,
          isBanned: true,
          isSuspended: true,
          username: true,
        },
      });

      if (!user || user.isBanned || user.isSuspended) {
        throw new UnauthorizedException('Invalid authentication token');
      }

      client.data.user = {
        email: user.email,
        sub: user.id,
        username: user.username,
      };

      // Join user's room for targeted events
      client.join(`user_${user.id}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Clean up any pending sessions for this user
    const userId = client.data.user?.sub;
    if (userId) {
      // Could clean up active sessions if needed
    }
  }

  @SubscribeMessage('voice:request')
  async handleVoiceRequest(
    @MessageBody() data: { chatId: string; targetUserId: string; audioConfig: any },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;

    try {
      const session = await this.voiceService.createVoiceInvite(data.chatId, userId, data.targetUserId);

      // Store session info
      this.activeSessions.set(session.id, {
        sessionId: session.id,
        chatId: data.chatId,
        initiatorId: userId,
        recipientId: data.targetUserId,
        rtcConfig: this.getRTCConfig(),
      });

      // Notify the target user
      this.server.to(`user_${data.targetUserId}`).emit('voice:incoming_request', {
        inviteId: session.id,
        fromUserId: userId,
        fromNickname: client.data.user.username || 'User',
        chatId: data.chatId,
        expiresIn: 300, // 5 minutes
      });

      // Emit success to initiator
      client.emit('voice:request_sent', {
        sessionId: session.id,
        targetUserId: data.targetUserId,
      });

    } catch (error) {
      client.emit('voice:error', {
        code: 'REQUEST_FAILED',
        message: error.message,
      });
    }
  }

  @SubscribeMessage('voice:respond')
  async handleVoiceRespond(
    @MessageBody() data: { inviteId: string; action: 'accept' | 'decline'; audioDeviceId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;

    try {
      const session = await this.voiceService.respondToVoiceInvite(data.inviteId, userId, data.action);

      if (data.action === 'accept') {
        const sessionData = this.activeSessions.get(data.inviteId);

        // Notify both participants that the call is accepted
        this.server.to(`user_${session.user1Id}`).emit('voice:request_accepted', {
          sessionId: data.inviteId,
          initiatorId: session.user1Id,
          recipientId: session.user2Id,
          recipientNickname: session.user2.username,
          rtcConfig: sessionData.rtcConfig,
          startedAt: session.startedAt.toISOString(),
        });

        this.server.to(`user_${session.user2Id}`).emit('voice:request_accepted', {
          sessionId: data.inviteId,
          recipientId: session.user2Id,
          recipientNickname: session.user1.username,
          rtcConfig: sessionData.rtcConfig,
          startedAt: session.startedAt.toISOString(),
        });

      } else {
        // Notify initiator of decline
        this.server.to(`user_${session.user1Id}`).emit('voice:request_declined', {
          sessionId: data.inviteId,
          reason: 'declined',
        });
      }

    } catch (error) {
      client.emit('voice:error', {
        code: 'RESPONSE_FAILED',
        message: error.message,
      });
    }
  }

  @SubscribeMessage('voice:offer')
  async handleVoiceOffer(
    @MessageBody() data: { sessionId: string; sdp: any },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    const sessionData = this.activeSessions.get(data.sessionId);

    if (!sessionData || (sessionData.initiatorId !== userId && sessionData.recipientId !== userId)) {
      client.emit('voice:error', { code: 'INVALID_SESSION', message: 'Invalid session' });
      return;
    }

    const targetUserId = sessionData.initiatorId === userId ? sessionData.recipientId : sessionData.initiatorId;

    this.server.to(`user_${targetUserId}`).emit('voice:incoming_offer', {
      sessionId: data.sessionId,
      fromUserId: userId,
      sdp: data.sdp,
    });
  }

  @SubscribeMessage('voice:answer')
  async handleVoiceAnswer(
    @MessageBody() data: { sessionId: string; sdp: any },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    const sessionData = this.activeSessions.get(data.sessionId);

    if (!sessionData || (sessionData.initiatorId !== userId && sessionData.recipientId !== userId)) {
      client.emit('voice:error', { code: 'INVALID_SESSION', message: 'Invalid session' });
      return;
    }

    const targetUserId = sessionData.initiatorId === userId ? sessionData.recipientId : sessionData.initiatorId;

    this.server.to(`user_${targetUserId}`).emit('voice:incoming_answer', {
      sessionId: data.sessionId,
      fromUserId: userId,
      sdp: data.sdp,
    });
  }

  @SubscribeMessage('voice:ice_candidate')
  async handleIceCandidate(
    @MessageBody() data: { sessionId: string; candidate: any },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    const sessionData = this.activeSessions.get(data.sessionId);

    if (!sessionData || (sessionData.initiatorId !== userId && sessionData.recipientId !== userId)) {
      return;
    }

    const targetUserId = sessionData.initiatorId === userId ? sessionData.recipientId : sessionData.initiatorId;

    this.server.to(`user_${targetUserId}`).emit('voice:incoming_ice_candidate', {
      sessionId: data.sessionId,
      fromUserId: userId,
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('voice:end')
  async handleVoiceEnd(
    @MessageBody() data: { sessionId: string; duration: number; qualityRating?: number; reason?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;

    try {
      const session = await this.voiceService.endVoiceCall(data.sessionId, userId, data.duration);

      // Notify both participants
      this.server.to(`user_${session.user1Id}`).emit('voice:call_ended', {
        sessionId: data.sessionId,
        endedBy: userId,
        duration: data.duration,
        endedAt: session.endedAt.toISOString(),
        reason: data.reason || 'user_initiated',
      });

      this.server.to(`user_${session.user2Id}`).emit('voice:call_ended', {
        sessionId: data.sessionId,
        endedBy: userId,
        duration: data.duration,
        endedAt: session.endedAt.toISOString(),
        reason: data.reason || 'user_initiated',
      });

      // Clean up
      this.activeSessions.delete(data.sessionId);
      this.pendingIceCandidates.delete(data.sessionId);

    } catch (error) {
      client.emit('voice:error', {
        code: 'END_FAILED',
        message: error.message,
      });
    }
  }

  private getRTCConfig() {
    return {
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
        // Add TURN servers in production
      ],
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    };
  }
}
