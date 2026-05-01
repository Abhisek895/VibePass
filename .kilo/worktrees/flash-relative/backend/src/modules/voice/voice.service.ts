import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class VoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async validateChatAccess(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user1: {
          select: { id: true, isBanned: true, isSuspended: true },
        },
        user2: {
          select: { id: true, isBanned: true, isSuspended: true },
        },
      },
    });

    if (!chat || (chat.user1Id !== userId && chat.user2Id !== userId)) {
      throw new NotFoundException('Chat not found or access denied');
    }

    if (chat.status !== 'active' || chat.archivedAt || chat.endedAt) {
      throw new BadRequestException('Voice is unavailable for this chat.');
    }

    const otherUser = chat.user1Id === userId ? chat.user2 : chat.user1;
    if (otherUser.isBanned || otherUser.isSuspended) {
      throw new ForbiddenException(
        'Voice is unavailable for this user right now.',
      );
    }

    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: otherUser.id },
          { blockerId: otherUser.id, blockedId: userId },
        ],
      },
      select: { id: true },
    });

    if (block) {
      throw new ForbiddenException(
        'Voice is unavailable because one of you has blocked the other.',
      );
    }

    return chat;
  }

  async createVoiceInvite(chatId: string, initiatorId: string, targetUserId: string) {
    // Validate chat access
    await this.validateChatAccess(chatId, initiatorId);

    // Check if users are in the chat
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      select: { user1Id: true, user2Id: true },
    });

    if (!chat || (chat.user1Id !== targetUserId && chat.user2Id !== targetUserId)) {
      throw new BadRequestException('Target user not in chat');
    }

    // Create voice session with requested status
    const session = await this.prisma.voiceSession.create({
      data: {
        chatId,
        user1Id: initiatorId,
        user2Id: targetUserId,
        status: 'requested',
      },
    });

    await this.notificationsService.createNotification({
      userId: targetUserId,
      actorId: initiatorId,
      type: 'VOICE_REQUEST',
      targetId: chatId,
      targetType: 'chat',
      data: {
        actionUrl: `/chat/${chatId}`,
        chatId,
      },
    });

    return session;
  }

  async respondToVoiceInvite(sessionId: string, userId: string, action: 'accept' | 'decline') {
    const session = await this.prisma.voiceSession.findUnique({
      where: { id: sessionId },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Voice session not found');
    }

    if (session.user2Id !== userId || session.status !== 'requested') {
      throw new BadRequestException('Invalid session or user');
    }

    if (action === 'accept') {
      await this.prisma.voiceSession.update({
        where: { id: sessionId },
        data: {
          status: 'accepted',
          startedAt: new Date(),
        },
      });
    } else {
      await this.prisma.voiceSession.update({
        where: { id: sessionId },
        data: {
          status: 'declined',
          endedAt: new Date(),
        },
      });
    }

    return { ...session, status: action === 'accept' ? 'accepted' : 'declined' };
  }

  async getVoiceSession(sessionId: string) {
    return this.prisma.voiceSession.findUnique({
      where: { id: sessionId },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } },
        chat: true,
      },
    });
  }

  async endVoiceCall(sessionId: string, userId: string, durationSeconds: number) {
    const session = await this.prisma.voiceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || (session.user1Id !== userId && session.user2Id !== userId)) {
      throw new BadRequestException('Invalid session');
    }

    return this.prisma.voiceSession.update({
      where: { id: sessionId },
      data: {
        status: 'ended',
        endedAt: new Date(),
        durationSeconds,
      },
    });
  }

  async getActiveVoiceSession(chatId: string) {
    return this.prisma.voiceSession.findFirst({
      where: {
        chatId,
        status: { in: ['accepted'] },
      },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } },
      },
    });
  }
}
