import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

export type MessageStatusType = 'pending' | 'sent' | 'delivered' | 'seen' | 'failed';

type ChatMessageRow = {
  chatId: string;
  clientId: string | null;
  content: string;
  createdAt: Date;
  deliveredAt: Date | null;
  id: string;
  moderationStatus: string;
  readAt: Date | null;
  senderId: string;
  senderProfilePhotoUrl: string | null;
  senderUserId: string;
  senderUsername: string | null;
  isDeletedForEveryone: number; // MySQL boolean is 0/1
  deletedBySender: number;
  deletedByRecipient: number;
};

@Injectable()
export class ChatService {
  private readonly messageInclude = {
    sender: {
      select: {
        id: true,
        username: true,
        profile: {
          select: {
            profilePhotoUrl: true,
          },
        },
      },
    },
  } as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private mapMessageRow(row: ChatMessageRow) {
    return {
      chatId: row.chatId,
      clientId: row.clientId,
      content: row.content,
      createdAt: row.createdAt,
      deliveredAt: row.deliveredAt,
      id: row.id,
      moderationStatus: row.moderationStatus,
      readAt: row.readAt,
      status: (row.readAt ? 'seen' : row.deliveredAt ? 'delivered' : 'sent') as MessageStatusType,
      sender: {
        id: row.senderUserId,
        profile: {
          profilePhotoUrl: row.senderProfilePhotoUrl,
        },
        username: row.senderUsername,
      },
      senderId: row.senderId,
      isDeletedForEveryone: Boolean(row.isDeletedForEveryone),
      deletedBySender: Boolean(row.deletedBySender),
      deletedByRecipient: Boolean(row.deletedByRecipient),
    };
  }

  private async getMessagesWithSender(chatId: string, userId: string, limit?: number) {
    const limitClause =
      typeof limit === 'number' ? Prisma.sql`LIMIT ${limit}` : Prisma.empty;

    const rows = await this.prisma.$queryRaw<ChatMessageRow[]>(Prisma.sql`
      SELECT
        m.id,
        m.chatId,
        m.senderId,
        m.clientId,
        m.content,
        m.moderationStatus,
        m.createdAt,
        m.deliveredAt,
        m.readAt,
        m.isDeletedForEveryone,
        m.deletedBySender,
        m.deletedByRecipient,
        u.id AS senderUserId,
        u.username AS senderUsername,
        p.profile_photo_url AS senderProfilePhotoUrl
      FROM messages m
      INNER JOIN users u ON u.id = m.senderId
      LEFT JOIN profiles p ON p.userId = u.id
      WHERE m.chatId = ${chatId}
        AND (
          (m.senderId = ${userId} AND m.deletedBySender = 0)
          OR
          (m.senderId <> ${userId} AND m.deletedByRecipient = 0)
        )
      ORDER BY m.createdAt ASC
      ${limitClause}
    `);

    return rows.map(row => this.mapMessageRow(row));
  }

  private async assertChatMessagingAllowed(
    chat: {
      archivedAt: Date | null;
      endedAt: Date | null;
      id: string;
      roomId: string | null;
      status: string;
      user1: {
        id: string;
        isBanned: boolean;
        isSuspended: boolean;
        username: string | null;
      };
      user1Id: string;
      user2: {
        id: string;
        isBanned: boolean;
        isSuspended: boolean;
        username: string | null;
      };
      user2Id: string;
    },
    userId: string,
  ) {
    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new NotFoundException('Chat not found or access denied');
    }

    if (chat.status !== 'active' || chat.endedAt || chat.archivedAt) {
      throw new BadRequestException('This chat is no longer active.');
    }

    const otherUser = chat.user1Id === userId ? chat.user2 : chat.user1;

    if (otherUser.isBanned || otherUser.isSuspended) {
      throw new ForbiddenException(
        'Messaging is unavailable for this user right now.',
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
        'You cannot access this chat because one of you has blocked the other.',
      );
    }

    return otherUser;
  }

  async validateChatAccess(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user1: {
          select: {
            id: true,
            isBanned: true,
            isSuspended: true,
            username: true,
          },
        },
        user2: {
          select: {
            id: true,
            isBanned: true,
            isSuspended: true,
            username: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found or access denied');
    }

    await this.assertChatMessagingAllowed(chat, userId);

    return chat;
  }

  async getRecentMessages(chatId: string, userId: string, limit = 50) {
    return this.getMessagesWithSender(chatId, userId, limit);
  }

  async getMessagesForChat(chatId: string, userId: string) {
    return this.getMessagesWithSender(chatId, userId);
  }

  async createMessage(chatId: string, senderId: string, content: string, clientId?: string) {
    const chat = await this.validateChatAccess(chatId, senderId);
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      throw new BadRequestException('Message content cannot be empty.');
    }

    const message = await this.prisma.message.create({
      data: {
        chatId,
        senderId,
        clientId,
        content: trimmedContent,
      },
      include: this.messageInclude,
    });

    const recipientId = chat.user1Id === senderId ? chat.user2Id : chat.user1Id;
    await this.notificationsService.createNotification({
      userId: recipientId,
      actorId: senderId,
      type: 'NEW_MESSAGE',
      targetId: chatId,
      targetType: 'chat',
      data: {
        actionUrl: `/chat/${chatId}`,
        chatId,
        preview: trimmedContent.slice(0, 140),
      },
    });

    return {
      message: {
        ...message,
        deliveredAt: null,
        readAt: null,
      },
      recipientId,
    };
  }

  async markMessagesDelivered(
    chatId: string,
    userId: string,
    messageIds?: string[],
  ) {
    await this.validateChatAccess(chatId, userId);

    const messageIdClause =
      messageIds && messageIds.length > 0
        ? Prisma.sql`AND m.id IN (${Prisma.join(messageIds)})`
        : Prisma.empty;

    const pendingMessages = await this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT m.id
      FROM messages m
      WHERE m.chatId = ${chatId}
        AND m.senderId <> ${userId}
        AND m.deliveredAt IS NULL
        ${messageIdClause}
    `);

    if (pendingMessages.length === 0) {
      return {
        chatId,
        deliveredAt: null,
        messageIds: [],
      };
    }

    const deliveredAt = new Date();
    const ids = pendingMessages.map(message => message.id);

    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE messages
      SET deliveredAt = COALESCE(deliveredAt, ${deliveredAt})
      WHERE id IN (${Prisma.join(ids)})
    `);

    return {
      chatId,
      deliveredAt,
      messageIds: ids,
    };
  }

  async markMessagesRead(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user1: { select: { id: true, readReceipts: true } },
        user2: { select: { id: true, readReceipts: true } },
      },
    });

    if (!chat) return { chatId, messageIds: [], readAt: null };

    const reader = chat.user1.id === userId ? chat.user1 : chat.user2;
    const sender = chat.user1.id === userId ? chat.user2 : chat.user1;

    // Standard Privacy Rule: If either user has receipts OFF, no Blue Ticks.
    const showReceipts = reader.readReceipts && sender.readReceipts;

    const unreadMessages = await this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT m.id
      FROM messages m
      WHERE m.chatId = ${chatId}
        AND m.senderId <> ${userId}
        AND m.readAt IS NULL
    `);

    if (unreadMessages.length === 0) {
      await this.notificationsService.markChatNotificationsAsRead(userId, chatId);
      return { chatId, messageIds: [], readAt: null, showReceipts };
    }

    const readAt = new Date();
    const ids = unreadMessages.map(message => message.id);

    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE messages
      SET
        deliveredAt = COALESCE(deliveredAt, ${readAt}),
        readAt = COALESCE(readAt, ${readAt})
      WHERE id IN (${Prisma.join(ids)})
    `);

    await this.notificationsService.markChatNotificationsAsRead(userId, chatId);

    return {
      chatId,
      deliveredAt: readAt,
      messageIds: ids,
      readAt,
      showReceipts,
    };
  }

  async getChat(chatId: string, userId: string) {
    const chat = await this.validateChatAccess(chatId, userId);
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            updatedAt: true,
            profile: {
              select: {
                profilePhotoUrl: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            updatedAt: true,
            profile: {
              select: {
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteMessage(messageId: string, userId: string, mode: 'me' | 'everyone') {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) throw new NotFoundException('Message not found');

    if (mode === 'everyone') {
      if (message.senderId !== userId) {
        throw new ForbiddenException('You can only delete your own messages for everyone');
      }
      return this.prisma.message.update({
        where: { id: messageId },
        data: {
          isDeletedForEveryone: true,
          content: 'This message was deleted',
        },
        include: this.messageInclude,
      });
    } else {
      const isSender = message.senderId === userId;
      return this.prisma.message.update({
        where: { id: messageId },
        data: {
          [isSender ? 'deletedBySender' : 'deletedByRecipient']: true,
        },
        include: this.messageInclude,
      });
    }
  }

  async deleteMessagesBulk(messageIds: string[], userId: string, mode: 'me' | 'everyone') {
    return this.prisma.$transaction(async (tx) => {
      const results = [];
      for (const id of messageIds) {
        try {
          const message = await tx.message.findUnique({ where: { id } });
          if (!message) continue;

          if (mode === 'everyone') {
            if (message.senderId === userId) {
              const updated = await tx.message.update({
                where: { id },
                data: { isDeletedForEveryone: true, content: 'This message was deleted' },
              });
              results.push(updated);
            }
          } else {
            const isSender = message.senderId === userId;
            const updated = await tx.message.update({
              where: { id },
              data: { [isSender ? 'deletedBySender' : 'deletedByRecipient']: true },
            });
            results.push(updated);
          }
        } catch (e) {
          console.error(`Bulk Delete Error for ${id}:`, e);
        }
      }
      return results;
    });
  }
}
