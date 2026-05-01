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
import { ChatService } from './chat.service';

@Injectable()
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
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
      client.join(`user:${user.id}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Optional: handle disconnect logic
  }

  private getAuthenticatedUser(client: Socket) {
    const user = client.data.user as
      | { email: string; sub: string; username: string | null }
      | undefined;

    if (!user?.sub) {
      client.emit('chat:error', {
        code: 'UNAUTHORIZED',
        message: 'Authentication required for chat.',
      });
      return null;
    }

    return user;
  }

  @SubscribeMessage('chat:join')
  async handleJoinChat(
    @MessageBody() data: { chatId: string; markAsRead?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getAuthenticatedUser(client);
    if (!user) return;

    try {
      const chat = await this.chatService.validateChatAccess(data.chatId, user.sub);
      if (!chat) {
        client.emit('chat:error', { code: 'CHAT_NOT_FOUND', message: 'Chat not found' });
        return;
      }

      console.log(`[ChatGateway] User ${user.sub} JOINED ${data.chatId}`);
      await this.prisma.user.update({ where: { id: user.sub }, data: { updatedAt: new Date() } });
      client.join(data.chatId);

      // Receipts
      const delivered = await this.chatService.markMessagesDelivered(data.chatId, user.sub);
      if (delivered.messageIds.length > 0) {
        this.server.to(data.chatId).emit('chat:messages_delivered', delivered);
      }

      if (data.markAsRead) {
        const read = await this.chatService.markMessagesRead(data.chatId, user.sub);
        if (read.messageIds.length > 0) {
          this.server.to(data.chatId).emit('chat:messages_read', read);
        }
      }

      const messages = await this.chatService.getRecentMessages(data.chatId, user.sub);
      client.emit('chat:joined', { chatId: data.chatId, messageHistory: messages });
    } catch (err) {
      console.error('[ChatGateway] Join Error:', err);
      client.emit('chat:error', { code: 'INTERNAL_ERROR', message: 'Join failed' });
    }
  }

  @SubscribeMessage('chat:message_send')
  async handleSendMessage(
    @MessageBody() data: { chatId: string; content: string; clientId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getAuthenticatedUser(client);
    if (!user) return { error: 'Unauthorized' };

    try {
      await this.prisma.user.update({ where: { id: user.sub }, data: { updatedAt: new Date() } });
      const { message, recipientId } = await this.chatService.createMessage(data.chatId, user.sub, data.content, data.clientId);
      const payload = { ...message, chatId: data.chatId, clientId: data.clientId, status: 'sent' };

      console.log(`[Socket:LIVE] Message ${message.id} in ${data.chatId}`);
      this.server.to(data.chatId).emit('chat:message_received', payload);
      return payload;
    } catch (error) {
      console.error('[ChatGateway] Send Error:', error);
      return { error: 'Send failed' };
    }
  }

  @SubscribeMessage('chat:message_delete')
  async handleDeleteMessage(
    @MessageBody() data: { chatId: string; messageId: string; mode: 'me' | 'everyone' },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getAuthenticatedUser(client);
    if (!user) return { error: 'Unauthorized' };

    try {
      const updatedMessage = await this.chatService.deleteMessage(data.messageId, user.sub, data.mode);
      this.server.to(data.chatId).emit('chat:message_deleted', {
        messageId: data.messageId,
        mode: data.mode,
        userId: user.sub,
        updatedMessage: data.mode === 'everyone' ? updatedMessage : null,
      });
      return { success: true };
    } catch (error) {
      console.error('[ChatGateway] Delete Error:', error);
      return { error: 'Delete failed' };
    }
  }

  @SubscribeMessage('chat:typing_start')
  handleStartTyping(@MessageBody() data: { chatId: string }, @ConnectedSocket() client: Socket) {
    const user = this.getAuthenticatedUser(client);
    if (!user) return;
    client.to(data.chatId).emit('chat:user_typing', { chatId: data.chatId, senderId: user.sub, isTyping: true });
  }

  @SubscribeMessage('chat:typing_stop')
  handleStopTyping(@MessageBody() data: { chatId: string }, @ConnectedSocket() client: Socket) {
    const user = this.getAuthenticatedUser(client);
    if (!user) return;
    client.to(data.chatId).emit('chat:user_typing', { chatId: data.chatId, senderId: user.sub, isTyping: false });
  }

  @SubscribeMessage('chat:read')
  async handleReadMessages(@MessageBody() data: { chatId: string }, @ConnectedSocket() client: Socket) {
    const user = this.getAuthenticatedUser(client);
    if (!user) return;
    const read = await this.chatService.markMessagesRead(data.chatId, user.sub);
    if (read.messageIds.length > 0) {
      this.server.to(data.chatId).emit('chat:messages_read', read);
    }
  }

  @SubscribeMessage('chat:delivered')
  async handleDeliveredMessages(@MessageBody() data: { chatId: string }, @ConnectedSocket() client: Socket) {
    const user = this.getAuthenticatedUser(client);
    if (!user) return;
    const delivered = await this.chatService.markMessagesDelivered(data.chatId, user.sub);
    if (delivered.messageIds.length > 0) {
      this.server.to(data.chatId).emit('chat:messages_delivered', delivered);
    }
  }

  @SubscribeMessage('chat:messages_delete_bulk')
  async handleDeleteMessagesBulk(
    @MessageBody() data: { chatId: string; messageIds: string[]; mode: 'me' | 'everyone' },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getAuthenticatedUser(client);
    if (!user) return { error: 'Unauthorized' };

    try {
      const updatedMessages = await this.chatService.deleteMessagesBulk(data.messageIds, user.sub, data.mode);
      
      this.server.to(data.chatId).emit('chat:messages_deleted_bulk', {
        messageIds: data.messageIds,
        mode: data.mode,
        userId: user.sub,
        updatedMessages: data.mode === 'everyone' ? updatedMessages : []
      });

      return { success: true };
    } catch (error) {
      console.error('[ChatGateway] Bulk Delete Error:', error);
      return { error: 'Failed to delete messages' };
    }
  }
}
