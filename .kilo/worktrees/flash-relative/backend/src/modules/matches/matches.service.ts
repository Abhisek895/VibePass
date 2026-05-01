import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Profile, User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { parseStringArray } from '../../common/utils/serialized-fields.util';
import { NotificationsService } from '../notifications/notifications.service';

type MatchCandidate = User & {
  badges: Array<{ badgeType: string; count: number }>;
  _count: {
    posts: number;
    promptAnswers: number;
  };
  profile: Profile | null;
  promptAnswers: Array<{ answer: string; promptId: string }>;
};

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) { }

  private normalizeText(value?: string | null) {
    return value?.trim().toLowerCase() || '';
  }

  private canonicalGender(value?: string | null) {
    const normalized = this.normalizeText(value);

    if (!normalized) {
      return null;
    }

    if (normalized.includes('non') && normalized.includes('binary')) {
      return 'non-binary';
    }

    if (
      normalized === 'other' ||
      normalized.includes('genderqueer') ||
      normalized.includes('gender fluid') ||
      normalized.includes('gender-fluid') ||
      normalized.includes('agender')
    ) {
      return 'other';
    }

    if (
      normalized === 'female' ||
      normalized.startsWith('fem') ||
      normalized.includes('woman') ||
      normalized.includes('women') ||
      normalized.includes('girl')
    ) {
      return 'female';
    }

    if (
      normalized === 'male' ||
      normalized.startsWith('mas') ||
      normalized.includes('man') ||
      normalized.includes('men') ||
      normalized.includes('boy')
    ) {
      return 'male';
    }

    return normalized;
  }

  private hasOpenPreference(value?: string | null) {
    const normalized = this.normalizeText(value);

    return (
      !normalized ||
      normalized.includes('all') ||
      normalized.includes('any') ||
      normalized.includes('everyone') ||
      normalized.includes('pansexual') ||
      normalized.includes('pan sexual') ||
      normalized === 'pan' ||
      normalized.includes('open') ||
      normalized.includes('either') ||
      normalized.includes('no preference')
    );
  }

  private isBisexualPreference(value?: string | null) {
    const normalized = this.normalizeText(value);

    return (
      normalized.includes('bisexual') ||
      normalized === 'bi' ||
      normalized.includes('male & female') ||
      normalized.includes('male and female') ||
      normalized.includes('men & women') ||
      normalized.includes('men and women') ||
      normalized.includes('both')
    );
  }

  private isSameGenderPreference(value?: string | null) {
    const normalized = this.normalizeText(value);

    return (
      normalized.includes('same gender') ||
      normalized.includes('same-gender') ||
      normalized.includes('gay') ||
      normalized.includes('homo')
    );
  }

  private isLesbianPreference(value?: string | null) {
    return this.normalizeText(value).includes('lesbian');
  }

  private parsePreferenceTokens(value?: string | null) {
    const normalized = this.normalizeText(value);

    if (!normalized || this.hasOpenPreference(normalized)) {
      return new Set<string>();
    }

    return new Set(
      normalized
        .split(/,|\/|&|\band\b/)
        .map(token => this.canonicalGender(token))
        .filter((token): token is string => Boolean(token)),
    );
  }

  private evaluatePreferenceMatch(
    preference?: string | null,
    ownerGender?: string | null,
    targetGender?: string | null,
  ) {
    if (this.hasOpenPreference(preference)) {
      return true;
    }

    const target = this.canonicalGender(targetGender);

    if (!target) {
      return null;
    }

    if (this.isBisexualPreference(preference)) {
      return target === 'male' || target === 'female';
    }

    if (this.isLesbianPreference(preference)) {
      return target === 'female';
    }

    if (this.isSameGenderPreference(preference)) {
      const owner = this.canonicalGender(ownerGender);

      if (!owner) {
        return null;
      }

      return owner === target;
    }

    return this.parsePreferenceTokens(preference).has(target);
  }

  private isMutuallyEligible(currentUser: MatchCandidate, candidate: MatchCandidate) {
    const currentToCandidate = this.evaluatePreferenceMatch(
      currentUser.genderPreference,
      currentUser.profile?.gender,
      candidate.profile?.gender,
    );
    const candidateToCurrent = this.evaluatePreferenceMatch(
      candidate.genderPreference,
      candidate.profile?.gender,
      currentUser.profile?.gender,
    );

    return currentToCandidate !== false && candidateToCurrent !== false;
  }

  private getPreferenceScore(
    preference?: string | null,
    ownerGender?: string | null,
    targetGender?: string | null,
  ) {
    if (this.hasOpenPreference(preference)) {
      return 2;
    }

    const match = this.evaluatePreferenceMatch(
      preference,
      ownerGender,
      targetGender,
    );

    if (match === true) {
      return 6;
    }

    return 0;
  }

  private getAgeCompatibilityScore(currentAge?: number | null, candidateAge?: number | null) {
    if (!currentAge || !candidateAge) {
      return 0;
    }

    const ageDifference = Math.abs(currentAge - candidateAge);

    if (ageDifference <= 2) {
      return 5;
    }

    if (ageDifference <= 5) {
      return 3;
    }

    if (ageDifference <= 8) {
      return 1;
    }

    return 0;
  }

  private getConversationIntentScore(
    currentIntent?: string | null,
    candidateIntent?: string | null,
  ) {
    const current = this.normalizeText(currentIntent);
    const candidate = this.normalizeText(candidateIntent);

    if (!current || !candidate) {
      return 0;
    }

    return current === candidate ? 6 : 0;
  }

  private parseInterests(...sources: Array<string | null | undefined>) {
    const normalized = new Map<string, string>();

    sources.forEach(source => {
      parseStringArray(source ?? null)?.forEach(rawInterest => {
        const value = rawInterest.trim();
        if (!value) {
          return;
        }

        const key = value.toLowerCase();
        if (!normalized.has(key)) {
          normalized.set(key, value);
        }
      });
    });

    return normalized;
  }

  private calculateProfileCompleteness(candidate: MatchCandidate) {
    let completedFields = 0;
    const checks = [
      Boolean(candidate.age),
      Boolean(candidate.bio || candidate.profile?.intro),
      Boolean(candidate.pronouns || candidate.profile?.pronouns),
      this.parseInterests(candidate.profile?.interests, candidate.interests).size > 0,
      Boolean(candidate.profile?.profilePhotoUrl),
      Boolean(candidate.profile?.currentCity || candidate.profile?.hometown),
      Boolean(candidate.profile?.education),
      candidate.promptAnswers.length > 0,
    ];

    checks.forEach(check => {
      if (check) {
        completedFields += 1;
      }
    });

    return completedFields / checks.length;
  }

  private calculatePromptSimilarity(
    currentUserPromptAnswers: Array<{ answer: string; promptId: string }>,
    candidatePromptAnswers: Array<{ answer: string; promptId: string }>,
  ) {
    if (!currentUserPromptAnswers.length || !candidatePromptAnswers.length) {
      return 0;
    }

    const currentAnswersByPrompt = new Map(
      currentUserPromptAnswers.map(answer => [
        answer.promptId,
        answer.answer.trim().toLowerCase(),
      ]),
    );

    let sharedPromptCount = 0;
    let exactMatches = 0;

    candidatePromptAnswers.forEach(answer => {
      const currentAnswer = currentAnswersByPrompt.get(answer.promptId);

      if (!currentAnswer) {
        return;
      }

      sharedPromptCount += 1;
      if (currentAnswer === answer.answer.trim().toLowerCase()) {
        exactMatches += 1;
      }
    });

    if (!sharedPromptCount) {
      return 0;
    }

    return exactMatches / sharedPromptCount;
  }

  private buildCompatibilityScore(currentUser: MatchCandidate, candidate: MatchCandidate) {
    const currentInterests = this.parseInterests(
      currentUser.profile?.interests,
      currentUser.interests,
    );
    const candidateInterests = this.parseInterests(
      candidate.profile?.interests,
      candidate.interests,
    );
    const sharedInterestKeys = Array.from(candidateInterests.keys()).filter(key =>
      currentInterests.has(key),
    );
    const totalInterestKeys = new Set([
      ...currentInterests.keys(),
      ...candidateInterests.keys(),
    ]).size;
    const interestScore =
      totalInterestKeys > 0
        ? Math.round((sharedInterestKeys.length / totalInterestKeys) * 30)
        : 0;

    const languageScore =
      currentUser.language &&
        candidate.language &&
        currentUser.language === candidate.language
        ? 10
        : 0;

    const voiceCompatible =
      Boolean(candidate.profile?.voiceOpen) ||
      candidate.voiceComfort === 'comfortable' ||
      candidate.voiceComfort === 'open';
    const currentVoiceFriendly =
      currentUser.voiceComfort === 'comfortable' ||
      currentUser.voiceComfort === 'open';
    const voiceScore = currentVoiceFriendly && voiceCompatible ? 8 : voiceCompatible ? 3 : 0;

    const trustScore = Math.max(
      0,
      Math.min(8, Math.round((candidate.trustScore ?? 0) / 12)),
    );
    const completenessScore = Math.round(
      this.calculateProfileCompleteness(candidate) * 12,
    );
    const promptScore = Math.round(
      this.calculatePromptSimilarity(
        currentUser.promptAnswers,
        candidate.promptAnswers,
      ) * 10,
    );
    const preferenceScore =
      this.getPreferenceScore(
        currentUser.genderPreference,
        currentUser.profile?.gender,
        candidate.profile?.gender,
      ) +
      this.getPreferenceScore(
        candidate.genderPreference,
        candidate.profile?.gender,
        currentUser.profile?.gender,
      );
    const ageScore = this.getAgeCompatibilityScore(currentUser.age, candidate.age);
    const conversationIntentScore = this.getConversationIntentScore(
      currentUser.conversationIntent,
      candidate.conversationIntent,
    );

    const activityScore = Math.min(
      6,
      (candidate._count.posts > 0 ? 4 : 0) +
      (candidate.updatedAt >=
        new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
        ? 2
        : 0),
    );

    const badgeScore = Math.min(
      4,
      candidate.badges.reduce((sum, badge) => sum + badge.count, 0),
    );

    const compatibilityScore = Math.max(
      1,
      Math.min(
        99,
        12 +
        interestScore +
        languageScore +
        voiceScore +
        trustScore +
        completenessScore +
        promptScore +
        preferenceScore +
        ageScore +
        conversationIntentScore +
        activityScore +
        badgeScore,
      ),
    );

    return {
      compatibilityScore,
      interests: Array.from(candidateInterests.values()),
      voiceOpen: voiceCompatible,
    };
  }

  private getCanonicalPair(userAId: string, userBId: string) {
    return userAId < userBId
      ? { user1Id: userAId, user2Id: userBId }
      : { user1Id: userBId, user2Id: userAId };
  }

  private async ensureDirectChat(userAId: string, userBId: string) {
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        roomId: null,
        OR: [
          { user1Id: userAId, user2Id: userBId },
          { user1Id: userBId, user2Id: userAId },
        ],
      },
      orderBy: { startedAt: 'desc' },
    });

    if (existingChat) {
      if (
        existingChat.status !== 'active' ||
        existingChat.archivedAt ||
        existingChat.endedAt
      ) {
        return this.prisma.chat.update({
          where: { id: existingChat.id },
          data: {
            archivedAt: null,
            endedAt: null,
            status: 'active',
          },
        });
      }

      return existingChat;
    }

    const { user1Id, user2Id } = this.getCanonicalPair(userAId, userBId);

    return this.prisma.chat.create({
      data: {
        id: randomUUID(),
        user1Id,
        user2Id,
      },
    });
  }

  async getMatchPool(userId: string) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        badges: {
          select: {
            badgeType: true,
            count: true,
          },
        },
        promptAnswers: {
          select: {
            answer: true,
            promptId: true,
          },
        },
        _count: {
          select: {
            posts: true,
            promptAnswers: true,
          },
        },
      },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found.');
    }

    const blocks = await this.prisma.block.findMany({
      where: {
        OR: [{ blockerId: userId }, { blockedId: userId }],
      },
      select: {
        blockerId: true,
        blockedId: true,
      },
    });

    const excludedIds = new Set<string>([userId]);
    for (const block of blocks) {
      excludedIds.add(block.blockerId);
      excludedIds.add(block.blockedId);
    }

    const [savedConnections, activeChats, matchLikes, matchPasses] = await this.prisma.$transaction([
      this.prisma.savedConnection.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        select: {
          user1Id: true,
          user2Id: true,
        },
      }),
      this.prisma.chat.findMany({
        where: {
          roomId: null,
          status: 'active',
          archivedAt: null,
          endedAt: null,
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        select: {
          user1Id: true,
          user2Id: true,
        },
      }),
      this.prisma.matchLike.findMany({
        where: { senderId: userId },
        select: { targetId: true },
      }),
      this.prisma.matchPass.findMany({
        where: { senderId: userId },
        select: { targetId: true },
      }),
    ]);

    savedConnections.forEach(connection => {
      excludedIds.add(connection.user1Id === userId ? connection.user2Id : connection.user1Id);
    });

    activeChats.forEach(chat => {
      excludedIds.add(chat.user1Id === userId ? chat.user2Id : chat.user1Id);
    });

    matchLikes.forEach(like => excludedIds.add(like.targetId));
    matchPasses.forEach(pass => excludedIds.add(pass.targetId));

    const candidates = await this.prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) },
        isSuspended: false,
        isBanned: false,
      },
      include: {
        badges: {
          select: {
            badgeType: true,
            count: true,
          },
        },
        profile: true,
        promptAnswers: {
          select: { answer: true, promptId: true },
        },
        _count: {
          select: {
            posts: true,
            promptAnswers: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take: 96,
    });

    return candidates
      .filter(candidate => this.isMutuallyEligible(currentUser as MatchCandidate, candidate))
      .map(candidate => this.toMatchCandidate(currentUser as MatchCandidate, candidate))
      .sort(
        (left, right) =>
          right.compatibilityScore - left.compatibilityScore ||
          left.username.localeCompare(right.username),
      )
      .slice(0, 24);
  }

  async submitMatchAction(
    userId: string,
    action: 'like' | 'pass',
    matchId: string,
  ) {
    if (matchId === userId) {
      throw new BadRequestException('You cannot match with your own account.');
    }

    const candidate = await this.prisma.user.findUnique({
      where: { id: matchId },
    });

    if (!candidate || candidate.isSuspended || candidate.isBanned) {
      throw new NotFoundException('Match candidate not found.');
    }

    if (action === 'pass') {
      await this.prisma.matchPass.upsert({
        where: { senderId_targetId: { senderId: userId, targetId: matchId } },
        update: {},
        create: {
          id: randomUUID(),
          senderId: userId,
          targetId: matchId,
        },
      });

      return {
        success: true,
        message: 'Match skipped.',
      };
    }

    const hasBlock = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: matchId },
          { blockerId: matchId, blockedId: userId },
        ],
      },
    });

    if (hasBlock) {
      throw new BadRequestException(
        'You cannot start a chat with a blocked user.',
      );
    }

    // Check if the other user already liked us (Mutual Match)
    const crossLike = await this.prisma.matchLike.findUnique({
      where: { senderId_targetId: { senderId: matchId, targetId: userId } },
    });

    if (crossLike) {
      const chat = await this.ensureDirectChat(userId, matchId);

      const existingConnection = await this.prisma.savedConnection.findFirst({
        where: {
          OR: [
            { user1Id: userId, user2Id: matchId },
            { user1Id: matchId, user2Id: userId },
          ],
        },
        select: { id: true },
      });

      if (existingConnection) {
        await this.prisma.savedConnection.update({
          where: { id: existingConnection.id },
          data: {
            chatId: chat.id,
            savedAt: new Date(),
          },
        });
      } else {
        const { user1Id, user2Id } = this.getCanonicalPair(userId, matchId);

        await this.prisma.savedConnection.create({
          data: {
            id: randomUUID(),
            user1Id,
            user2Id,
            chatId: chat.id,
          },
        });
      }

      // Cleanup cross-like since they matched
      await this.prisma.matchLike.delete({
        where: { id: crossLike.id },
      });

      await this.notificationsService.createNotification({
        userId: matchId,
        actorId: userId,
        type: 'NEW_MATCH',
        targetId: chat.id,
        targetType: 'chat',
        data: {
          actionUrl: `/chat/${chat.id}`,
          chatId: chat.id,
        },
      });

      return {
        success: true,
        message: "It's a Match!",
        chatId: chat.id,
      };
    }

    // No mutual like yet, just record the like
    await this.prisma.matchLike.upsert({
      where: { senderId_targetId: { senderId: userId, targetId: matchId } },
      update: {},
      create: {
        id: randomUUID(),
        senderId: userId,
        targetId: matchId,
      },
    });

    return {
      success: true,
      message: '',
    };
  }

  async unmatch(userId: string, matchId: string) {
    const existingConnection = await this.prisma.savedConnection.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: matchId },
          { user1Id: matchId, user2Id: userId },
        ],
      },
    });

    if (!existingConnection) {
      throw new NotFoundException('Match connection not found.');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Delete the connection
      await tx.savedConnection.delete({
        where: { id: existingConnection.id },
      });

      // 2. Archive the chat if it exists
      if (existingConnection.chatId) {
        await tx.chat.update({
          where: { id: existingConnection.chatId },
          data: {
            status: 'archived',
            endedAt: new Date(),
          },
        });
      }

      // 3. Optional: Add to pass list so they don't show up in discovery immediately
      await tx.matchPass.upsert({
        where: { senderId_targetId: { senderId: userId, targetId: matchId } },
        update: {},
        create: {
          id: randomUUID(),
          senderId: userId,
          targetId: matchId,
        },
      });
    });

    return {
      success: true,
      message: 'Unmatched successfully.',
    };
  }

  async getConnections(userId: string) {
    const connections = await this.prisma.savedConnection.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            isBanned: true,
            isSuspended: true,
            username: true,
            updatedAt: true,
            profile: true,
          },
        },
        user2: {
          select: {
            id: true,
            isBanned: true,
            isSuspended: true,
            username: true,
            updatedAt: true,
            profile: true,
          },
        },
        chat: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    const visibleConnections = [];

    for (const connection of connections) {
      const otherUser =
        connection.user1Id === userId ? connection.user2 : connection.user1;

      if (otherUser.isBanned || otherUser.isSuspended) {
        continue;
      }

      const hasBlock = await this.prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: otherUser.id },
            { blockerId: otherUser.id, blockedId: userId },
          ],
        },
        select: { id: true },
      });

      if (hasBlock) {
        continue;
      }

      const chat =
        connection.chat ??
        (await this.prisma.chat.findUnique({
          where: {
            id: (await this.ensureDirectChat(userId, otherUser.id)).id,
          },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        }));

      if (!chat) {
        continue;
      }

      if (connection.chatId !== chat.id) {
        await this.prisma.savedConnection.update({
          where: { id: connection.id },
          data: { chatId: chat.id },
        });
      }

      const unreadCount = await this.prisma.message.count({
        where: {
          chatId: chat.id,
          senderId: { not: userId },
          readAt: null,
        },
      });

      visibleConnections.push({
        id: chat.id,
        otherUser: {
          id: otherUser.id,
          username:
            otherUser.username ?? `Vibe-${otherUser.id.slice(0, 6)}`,
          profilePhotoUrl: otherUser.profile?.profilePhotoUrl || null,
          updatedAt: otherUser.updatedAt,
        },
        lastMessage: chat.messages[0]?.content || null,
        updatedAt: chat.messages[0]?.createdAt || connection.savedAt,
        unreadCount,
        hasUnread: unreadCount > 0,
      });
    }

    return visibleConnections.sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  }

  private toMatchCandidate(currentUser: MatchCandidate, candidate: MatchCandidate) {
    const { compatibilityScore, interests, voiceOpen } =
      this.buildCompatibilityScore(currentUser, candidate);
    const moodSource =
      candidate.promptAnswers[0]?.answer ||
      candidate.conversationIntent ||
      candidate.voiceComfort ||
      'open-chat';

    return {
      id: candidate.id,
      username: candidate.username ?? `Vibe-${candidate.id.slice(0, 6)}`,
      age: candidate.age,
      bio: candidate.bio || candidate.profile?.intro || null,
      currentCity: candidate.profile?.currentCity || null,
      genderPreference: candidate.genderPreference || null,
      mood: moodSource,
      interests,
      compatibilityScore,
      voiceOpen,
      profilePhotoUrl: candidate.profile?.profilePhotoUrl || null,
    };
  }
}
