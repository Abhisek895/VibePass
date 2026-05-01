import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

type Role = 'user' | 'moderator' | 'admin' | 'super_admin';

import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
  ) { }

  // ── USER MANAGEMENT ──

  async getAllUsers(search?: string, role?: string, limit = 50, offset = 0) {
    // Ensure numeric
    limit = Number(limit) || 50;
    offset = Number(offset) || 0;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { username: { contains: search } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isBanned: true,
          isSuspended: true,
          trustScore: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, limit, offset };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isBanned: true,
        isSuspended: true,
        trustScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // REAL-TIME: Update Admin Panel
    this.chatGateway.broadcastUpdate(['users', 'audit-logs', 'analytics']);

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    return user;
  }

  async banUser(adminId: string, userId: string, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');
    if (user.role === 'super_admin') {
      throw new ConflictException('Cannot modify super_admin');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
    });

    await this.createAuditLog({
      action: 'USER_BAN',
      entityType: 'USER',
      entityId: userId,
      adminId,
      targetUserId: userId,
      details: reason || 'User banned',
    });

    return { success: true, message: 'User banned' };
  }

  async unbanUser(adminId: string, userId: string, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');
    if (user.role === 'super_admin') {
      throw new ConflictException('Cannot modify super_admin');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: false },
    });

    await this.createAuditLog({
      action: 'USER_UNBAN',
      entityType: 'USER',
      entityId: userId,
      adminId,
      targetUserId: userId,
      details: reason || 'User unbanned',
    });

    return { success: true, message: 'User unbanned' };
  }

  async suspendUser(adminId: string, userId: string, dto: { reason?: string; durationHours?: number }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');
    if (user.role === 'super_admin') {
      throw new ConflictException('Cannot modify super_admin');
    }

    const suspendedUntil = dto.durationHours
      ? new Date(Date.now() + dto.durationHours * 60 * 60 * 1000)
      : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true },
    });

    await this.createAuditLog({
      action: 'USER_SUSPEND',
      entityType: 'USER',
      entityId: userId,
      adminId,
      targetUserId: userId,
      details: dto.reason || `Suspended${suspendedUntil ? ` until ${suspendedUntil.toISOString()}` : ''}`,
    });

    return { success: true, message: 'User suspended' };
  }

  async unsuspendUser(adminId: string, userId: string, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');
    if (user.role === 'super_admin') {
      throw new ConflictException('Cannot modify super_admin');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: false },
    });

    await this.createAuditLog({
      action: 'USER_UNSUSPEND',
      entityType: 'USER',
      entityId: userId,
      adminId,
      targetUserId: userId,
      details: reason || 'User unsuspended',
    });

    return { success: true, message: 'User unsuspended' };
  }

  async changeUserRole(adminId: string, userId: string, newRole: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');
    if (user.role === 'super_admin') {
      throw new ConflictException('Cannot modify super_admin');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await this.createAuditLog({
      action: 'ROLE_CHANGE',
      entityType: 'USER',
      entityId: userId,
      adminId,
      targetUserId: userId,
      details: `Role changed to ${newRole}`,
    });

    return { success: true, message: `User role changed to ${newRole}` };
  }

  async deleteUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'super_admin') {
      throw new ConflictException('Cannot delete super_admin');
    }

    await this.prisma.user.delete({ where: { id: userId } });

    await this.createAuditLog({
      action: 'USER_DELETE',
      entityType: 'USER',
      entityId: userId,
      adminId,
      targetUserId: userId,
      details: `User permanently deleted`,
    });

    return { success: true, message: 'User permanently deleted' };
  }

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            content: true,
            imageUrl: true,
            isDarkMeme: true,
            likesCount: true,
            commentsCount: true,
            sharesCount: true,
            createdAt: true,
          },
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            reported: { select: { id: true, username: true, email: true } },
          },
        },
        reports2: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            reporter: { select: { id: true, username: true, email: true } },
          },
        },
      },
    });


    if (!user) throw new NotFoundException('User not found');

    const [postsCount, reportsMadeCount, reportsReceivedCount] = await Promise.all([
      this.prisma.post.count({ where: { userId } }),
      this.prisma.report.count({ where: { reporterId: userId } }),
      this.prisma.report.count({ where: { reportedId: userId } }),
    ]);

    return {
      ...user,
      reportsMade: user.reports,
      reportsReceived: user.reports2,
      stats: { postsCount, reportsMadeCount, reportsReceivedCount },
    };
  }

  // ── REPORTS ──

  async getAllReports(status?: string, limit = 50, offset = 0) {
    limit = Number(limit) || 50;
    offset = Number(offset) || 0;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, username: true, email: true },
          },
          reported: {
            select: { id: true, username: true, email: true },
          },
          chat: {
            include: {
              user1: { select: { username: true } },
              user2: { select: { username: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.report.count({ where }),
    ]);

    return { reports, total, limit, offset };
  }

  async resolveReport(adminId: string, reportId: string, action: 'resolved' | 'dismissed' | 'escalated', notes?: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new ForbiddenException('Report not found');
    }

    await this.prisma.report.update({
      where: { id: reportId },
      data: { status: action },
    });

    await this.createAuditLog({
      action: 'REPORT_RESOLVE',
      entityType: 'REPORT',
      entityId: reportId,
      adminId,
      targetUserId: report.reportedId,
      details: notes || `Report ${action}`,
    });

    return { success: true, message: `Report ${action}` };
  }

  // ── ANALYTICS ──

  async getAnalytics() {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      totalMatches,
      totalChats,
      totalReports,
      pendingReports,
      totalVoiceCalls,
      totalAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isBanned: false, isSuspended: false } }),
      this.prisma.user.count({ where: { isBanned: true } }),
      this.prisma.chat.count(),
      this.prisma.message.count(),
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'pending' } }),
      this.prisma.voiceSession.count(),
      this.prisma.auditLog.count(),
    ]);

    // Get daily user registration for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });
      last7Days.push({ date: date.toISOString().split('T')[0], count });
    }

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        growth: last7Days,
      },
      engagement: {
        totalMatches,
        totalChats,
        totalVoiceCalls,
      },
      safety: {
        totalReports,
        pendingReports,
      },
      system: {
        totalAuditLogs,
      },
    };
  }

  // ── AUDIT LOGS ──

  async getAuditLogs(limit = 50, offset = 0, action?: string, adminId?: string) {
    limit = Number(limit) || 50;
    offset = Number(offset) || 0;

    const where: any = {};
    if (action) where.action = action;
    if (adminId) where.adminId = adminId;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          admin: {
            select: { id: true, username: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, limit, offset };
  }

  // ── CONTENT MODERATION ──

  async getAllPosts(search?: string, isDarkMeme?: boolean, limit = 50, offset = 0) {
    limit = Number(limit) || 50;
    offset = Number(offset) || 0;

    const where: any = {};
    if (search) {
      where.OR = [
        { content: { contains: search } },
        { user: { username: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }
    if (isDarkMeme !== undefined) {
      where.isDarkMeme = isDarkMeme;
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, email: true, role: true },
          },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { posts, total, limit, offset };
  }

  async adminDeletePost(adminId: string, postId: string, reason?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, content: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.post.delete({ where: { id: postId } });

    await this.createAuditLog({
      action: 'POST_DELETE',
      entityType: 'POST',
      entityId: postId,
      adminId,
      targetUserId: post.userId,
      details: reason || 'Post removed by admin',
    });

    return { success: true, message: 'Post deleted' };
  }

  async getAllMessages(
    search?: string,
    senderId?: string,
    limit = 50,
    offset = 0,
  ) {
    limit = Number(limit) || 50;
    offset = Number(offset) || 0;

    const where: any = {};
    if (search) {
      where.content = { contains: search };
    }
    if (senderId) {
      where.senderId = senderId;
    }

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: { select: { profilePhotoUrl: true } },
            },
          },
          chat: {
            select: {
              id: true,
              user1Id: true,
              user2Id: true,
              user1: { select: { username: true, email: true } },
              user2: { select: { username: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      messages: messages.map((m) => ({
        ...m,
        isDeleted: m.isDeletedForEveryone || m.deletedBySender || m.deletedByRecipient,
      })),
      total,
      limit,
      offset,
    };
  }

  // ── SUPER ADMIN: BLOCKS ──

  async getUserBlocks(userId: string) {
    const [blocked, blockedBy] = await Promise.all([
      this.prisma.block.findMany({
        where: { blockerId: userId },
        include: {
          blocked: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: { select: { profilePhotoUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.block.findMany({
        where: { blockedId: userId },
        include: {
          blocker: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: { select: { profilePhotoUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { blocked, blockedBy };
  }

  // ── SUPER ADMIN: VOICE SESSIONS ──

  async getUserVoiceSessions(userId: string) {
    const sessions = await this.prisma.voiceSession.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { profilePhotoUrl: true } },
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { profilePhotoUrl: true } },
          },
        },
        chat: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        status: s.status,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        durationSeconds: s.durationSeconds,
        otherUser: s.user1Id === userId ? s.user2 : s.user1,
        chat: s.chat,
      })),
    };
  }

  async getAllVoiceSessions(limit = 50, offset = 0) {
    limit = Number(limit) || 50;
    offset = Number(offset) || 0;

    const [sessions, total] = await Promise.all([
      this.prisma.voiceSession.findMany({
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: { select: { profilePhotoUrl: true } },
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: { select: { profilePhotoUrl: true } },
            },
          },
          chat: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.voiceSession.count(),
    ]);

    return { sessions, total, limit, offset };
  }

  // ── SUPER ADMIN: NOTIFICATIONS ──

  async getUserNotifications(userId: string, limit = 100, offset = 0) {
    limit = Number(limit) || 100;
    offset = Number(offset) || 0;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: { select: { profilePhotoUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return { notifications, total, limit, offset };
  }

  // ── SUPER ADMIN: BADGES ──

  async getUserBadges(userId: string) {
    const badges = await this.prisma.badge.findMany({
      where: { userId },
      orderBy: { awardedAt: 'desc' },
    });

    return { badges };
  }

  // ── SUPER ADMIN: USER FEEDBACK ──

  async getUserFeedback(userId: string) {
    const [given, received] = await Promise.all([
      this.prisma.userFeedback.findMany({
        where: { fromUserId: userId },
        include: {
          toUser: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: { select: { profilePhotoUrl: true } },
            },
          },
          chat: {
            select: { id: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userFeedback.findMany({
        where: { toUserId: userId },
        include: {
          fromUser: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: { select: { profilePhotoUrl: true } },
            },
          },
          chat: {
            select: { id: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { given, received };
  }

  // ── SUPER ADMIN: EVERYTHING (consolidated user dump) ──

  async getUserEverything(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            _count: { select: { likes: true, comments: true, shares: true } },
          },
        },
        badges: { orderBy: { awardedAt: 'desc' } },
        matchLikesSent: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            target: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
          },
        },
        matchLikesReceived: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            sender: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
          },
        },
        matchPassesSent: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        blocks: {
          orderBy: { createdAt: 'desc' },
          include: {
            blocked: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
          },
        },
        blocks2: {
          orderBy: { createdAt: 'desc' },
          include: {
            blocker: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
          },
        },
        chats: {
          orderBy: { startedAt: 'desc' },
          take: 20,
          include: {
            user2: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
            _count: { select: { messages: true } },
          },
        },
        chats2: {
          orderBy: { startedAt: 'desc' },
          take: 20,
          include: {
            user1: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
            _count: { select: { messages: true } },
          },
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            reported: { select: { id: true, username: true, email: true } },
          },
        },
        reports2: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            reporter: { select: { id: true, username: true, email: true } },
          },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            actor: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
          },
        },
        voiceSessions: {
          orderBy: { startedAt: 'desc' },
          take: 20,
          include: {
            user2: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
          },
        },
        voiceSessions2: {
          orderBy: { startedAt: 'desc' },
          take: 20,
          include: {
            user1: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
          },
        },
        savedConnections: {
          orderBy: { savedAt: 'desc' },
          take: 20,
          include: {
            user2: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
          },
        },
        savedConnections2: {
          orderBy: { savedAt: 'desc' },
          take: 20,
          include: {
            user1: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // Flatten chats from both sides
    const allChats = [
      ...user.chats.map((c) => ({ ...c, otherUser: c.user2 })),
      ...user.chats2.map((c) => ({ ...c, otherUser: c.user1 })),
    ].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 20);

    // Flatten voice sessions
    const allVoiceSessions = [
      ...user.voiceSessions.map((v) => ({ ...v, otherUser: v.user2 })),
      ...user.voiceSessions2.map((v) => ({ ...v, otherUser: v.user1 })),
    ].sort((a, b) => new Date(b.startedAt ?? 0).getTime() - new Date(a.startedAt ?? 0).getTime()).slice(0, 20);

    // Flatten saved connections (matches)
    const allMatches = [
      ...user.savedConnections.map((s) => ({ ...s, otherUser: s.user2 })),
      ...user.savedConnections2.map((s) => ({ ...s, otherUser: s.user1 })),
    ].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()).slice(0, 20);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isBanned: user.isBanned,
        isSuspended: user.isSuspended,
        trustScore: user.trustScore,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile,
      },
      posts: user.posts,
      badges: user.badges,
      likesSent: user.matchLikesSent,
      likesReceived: user.matchLikesReceived,
      passesSent: user.matchPassesSent,
      blocked: user.blocks,
      blockedBy: user.blocks2,
      chats: allChats,
      matches: allMatches,
      reportsMade: user.reports,
      reportsReceived: user.reports2,
      notifications: user.notifications,
      voiceSessions: allVoiceSessions,
    };
  }

  // ── SUPER ADMIN: USER CHATS (list of chat partners) ──

  async getUserChats(userId: string, limit: number = 20, offset: number = 0) {
    limit = Number(limit) || 20;
    offset = Number(offset) || 0;

    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
        user1Id: true,
        user2Id: true,
        user1: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { profilePhotoUrl: true } },
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { profilePhotoUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            isDeletedForEveryone: true,
            deletedBySender: true,
            deletedByRecipient: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      skip: offset,
      take: limit,
    });

    const total = await this.prisma.chat.count({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    });

    // Shape so the UI always knows who the "other" person is
    const shaped = chats.map((chat) => {
      const otherUser = chat.user1Id === userId ? chat.user2 : chat.user1;
      const lastMsg = chat.messages[0] ?? null;
      return {
        id: chat.id,
        status: chat.status,
        startedAt: chat.startedAt,
        user1Id: chat.user1Id,
        user2Id: chat.user2Id,
        otherUser,
        lastMessage: lastMsg
          ? {
              ...lastMsg,
              isDeleted: !!(
                lastMsg.isDeletedForEveryone ||
                lastMsg.deletedBySender ||
                lastMsg.deletedByRecipient
              ),
            }
          : null,
      };
    });

    return { chats: shaped, total, limit, offset };
  }

  // ── SUPER ADMIN: MESSAGES INSIDE A CHAT ──

  async getChatMessages(adminId: string, chatId: string, limit: number = 50, offset: number = 0) {
    limit = Number(limit) || 50;
    offset = Number(offset) || 0;

    const chat = await this.prisma.chat.findUnique({ 
      where: { id: chatId },
      include: {
        user1: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
        user2: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
      }
    });
    if (!chat) throw new NotFoundException('Chat not found');

    const messages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        isDeletedForEveryone: true,
        deletedBySender: true,
        deletedByRecipient: true,
        sender: { 
          select: { 
            id: true, 
            username: true, 
            email: true,
            profile: { select: { profilePhotoUrl: true } }
          } 
        },
      },
    });

    const total = await this.prisma.message.count({ where: { chatId } });

    // Log sensitive access
    await this.createAuditLog({
      action: 'VIEW_CHAT',
      entityType: 'CHAT',
      entityId: chatId,
      adminId,
      targetUserId: chat.user1Id,
      isSensitive: true,
      details: `Admin viewed chat ${chatId}`,
    });

    return {
      chat: {
        id: chat.id,
        user1: {
          id: chat.user1.id,
          username: chat.user1.username,
          email: chat.user1.email,
          profile: chat.user1.profile,
        },
        user2: {
          id: chat.user2.id,
          username: chat.user2.username,
          email: chat.user2.email,
          profile: chat.user2.profile,
        },
      },
      messages: messages.map((m) => ({
        ...m,
        isDeleted: !!(m.isDeletedForEveryone || m.deletedBySender || m.deletedByRecipient),
      })),
      total,
      limit,
      offset,
    };
  }

  // ── SUPER ADMIN: USER RELATIONSHIPS (sent / received / mutual) ──

  async getUserRelationships(userId: string) {
    // Likes this user SENT
    const sent = await this.prisma.matchLike.findMany({
      where: { senderId: userId },
      select: {
        id: true,
        createdAt: true,
        target: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { profilePhotoUrl: true, currentCity: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Likes this user RECEIVED
    const received = await this.prisma.matchLike.findMany({
      where: { targetId: userId },
      select: {
        id: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { profilePhotoUrl: true, currentCity: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Mutual Matches = Active connections in the SavedConnection table
    const matches = await this.prisma.savedConnection.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { profilePhotoUrl: true, currentCity: true } },
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { profilePhotoUrl: true, currentCity: true } },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    const mutual = matches.map((m) => ({
      user: m.user1Id === userId ? m.user2 : m.user1,
      matchedAt: m.savedAt,
    }));

    // Sent Likes = Pending likes + Mutual Matches
    const sentLikes = sent.map((s) => ({ ...s.target, likedAt: s.createdAt }));
    const mutualMatchedUsers = mutual.map(m => ({ ...m.user, likedAt: m.matchedAt }));
    
    // Received Likes = Pending received + Mutual Matches
    const receivedLikes = received.map((r) => ({ ...r.sender, likedAt: r.createdAt }));

    return {
      sent: [...sentLikes, ...mutualMatchedUsers].sort((a, b) => new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime()),
      received: [...receivedLikes, ...mutualMatchedUsers].sort((a, b) => new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime()),
      mutual,
    };
  }

  // ── SUPER ADMIN: USER MATCH REQUESTS (sent / received / passes) ──

  async getUserMatchRequests(userId: string) {
    const [likesSent, likesReceived, passesSent] = await Promise.all([
      this.prisma.matchLike.findMany({
        where: { senderId: userId },
        select: {
          id: true,
          createdAt: true,
          target: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.matchLike.findMany({
        where: { targetId: userId },
        select: {
          id: true,
          createdAt: true,
          sender: { select: { id: true, username: true, email: true, profile: { select: { profilePhotoUrl: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.matchPass.findMany({
        where: { senderId: userId },
        select: { id: true, createdAt: true, targetId: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { likesSent, likesReceived, passesSent };
  }

  // ── INTERNAL: AUDIT LOG CREATION ──


  private async createAuditLog(dto: CreateAuditLogDto) {
    await this.prisma.auditLog.create({
      data: {
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId,
        adminId: dto.adminId,
        targetUserId: dto.targetUserId,
        details: dto.details,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        sessionId: dto.sessionId,
        metadata: dto.metadata,
        isSensitive: dto.isSensitive ?? false,
      },
    });

    // REAL-TIME: Update Admin Panel
    this.chatGateway.broadcastUpdate(['users', 'audit-logs', 'analytics']);
  }
}
