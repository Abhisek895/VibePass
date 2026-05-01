import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { Notification, Prisma } from '@prisma/client';
import { FindManyNotificationsDto } from './dto/find-many.dto';

type NotificationActor = {
  email: string;
  id: string;
  profile: {
    profilePhotoUrl: string | null;
  } | null;
  username: string | null;
};

type NotificationWithActor = Notification & {
  actor: NotificationActor;
};

type CreateNotificationInput = {
  actorId: string;
  data?: Record<string, unknown>;
  targetId?: string;
  targetType?: string;
  type: string;
  userId: string;
};

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) { }

  async findManyForUser(
    userId: string,
    options: FindManyNotificationsDto,
  ) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(options.unread !== undefined && { read: !options.unread }),
      ...(options.types?.length && { type: { in: options.types } }),
    };

    const take = options.limit || 20;
    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      include: {
        actor: {
          select: {
            email: true,
            id: true,
            username: true,
            profile: {
              select: {
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    });

    const hasMore = notifications.length > take;
    const page = hasMore ? notifications.slice(0, take) : notifications;

    return {
      notifications: page.map(notification => this.mapNotification(notification)),
      nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
      hasMore,
    };
  }

  async countUnread(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(userId: string, id: string) {
    await this.assertOwnership(userId, id);

    const notification = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
      include: {
        actor: {
          select: {
            email: true,
            id: true,
            username: true,
            profile: {
              select: {
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    });

    return this.mapNotification(notification);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { count: count.count };
  }

  async delete(userId: string, id: string) {
    await this.assertOwnership(userId, id);

    const notification = await this.prisma.notification.delete({
      where: { id },
      include: {
        actor: {
          select: {
            email: true,
            id: true,
            username: true,
            profile: {
              select: {
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    });

    return this.mapNotification(notification);
  }

  async createNotification(input: CreateNotificationInput) {
    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        actorId: input.actorId,
        type: input.type,
        targetId: input.targetId,
        targetType: input.targetType,
        data: input.data ? JSON.stringify(input.data) : null,
      },
    });
  }

  async markChatNotificationsAsRead(userId: string, chatId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        type: 'NEW_MESSAGE',
        targetId: chatId,
        targetType: 'chat',
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { count: result.count };
  }

  private async assertOwnership(userId: string, id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }
  }

  private mapNotification(notification: NotificationWithActor) {
    const payload = this.parsePayload(notification.data);
    const actorName =
      notification.actor.username?.trim() ||
      notification.actor.email.split('@')[0];

    const actionUrl = this.resolveActionUrl(notification, payload);

    return {
      id: notification.id,
      type: notification.type,
      actor: {
        id: notification.actor.id,
        username: actorName,
        avatar: notification.actor.profile?.profilePhotoUrl || undefined,
        profileImage: notification.actor.profile?.profilePhotoUrl || undefined,
      },
      targetUserId: notification.userId,
      targetPost:
        notification.targetType === 'post' ? notification.targetId : null,
      targetChat:
        notification.targetType === 'chat' ? notification.targetId : null,
      targetRoom:
        notification.targetType === 'room' ? notification.targetId : null,
      message: this.resolveMessage(notification.type, actorName, payload),
      read: notification.read,
      actionUrl,
      data: payload,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  private parsePayload(data: string | null) {
    if (!data) {
      return {} as Record<string, unknown>;
    }

    try {
      const parsed = JSON.parse(data);
      return parsed && typeof parsed === 'object'
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  private resolveActionUrl(
    notification: Notification,
    payload: Record<string, unknown>,
  ) {
    if (typeof payload.actionUrl === 'string' && payload.actionUrl.trim()) {
      return payload.actionUrl;
    }

    if (notification.targetType === 'chat' && notification.targetId) {
      return `/chat/${notification.targetId}`;
    }

    if (notification.targetType === 'post' && notification.targetId) {
      return `/feed?post=${notification.targetId}`;
    }

    if (notification.targetType === 'profile' && notification.targetId) {
      return `/profile/${notification.targetId}`;
    }

    if (notification.targetType === 'room' && notification.targetId) {
      return `/mood?room=${notification.targetId}`;
    }

    return undefined;
  }

  private resolveMessage(
    type: string,
    actorName: string,
    payload: Record<string, unknown>,
  ) {
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    switch (type) {
      case 'LIKE_POST':
        return `${actorName} liked your post.`;
      case 'COMMENT_POST':
        return `${actorName} commented on your post.`;
      case 'SHARE_POST':
        return `${actorName} shared your post.`;
      case 'FRIEND_REQUEST':
        return `${actorName} sent you a friend request.`;
      case 'FRIEND_ACCEPTED':
        return `${actorName} accepted your friend request.`;
      case 'NEW_MATCH':
        return `${actorName} started a chat with you.`;
      case 'NEW_MESSAGE':
        return `${actorName} sent you a message.`;
      case 'VOICE_REQUEST':
        return `${actorName} invited you to a voice call.`;
      case 'PROFILE_VIEW':
        return `${actorName} viewed your profile.`;
      default:
        return `${actorName} sent you an update.`;
    }
  }
}
