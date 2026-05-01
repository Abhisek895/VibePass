import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { parseStringArray } from '../../common/utils/serialized-fields.util';

@Controller('api/users')
export class ProfilesController {
  constructor(private prisma: PrismaService) {}

  private mergeInterests(...sources: Array<string | null | undefined>) {
    const merged = new Set<string>();

    sources.forEach(source => {
      parseStringArray(source ?? null)?.forEach(interest => {
        const normalized = interest.trim();
        if (normalized) {
          merged.add(normalized);
        }
      });
    });

    return Array.from(merged);
  }

  private async findUserIdByUsername(username: string) {
    const result = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM users
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `;

    return result[0]?.id ?? null;
  }

  /**
   * GET /api/users/search
   * Search VibePass users by username or email
   */
  @Get('search')
  async searchUsers(
    @Query('q') q?: string,
    @Query('query') query?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const searchTerm = (query ?? q ?? '').trim();
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const skip = (safePage - 1) * safeLimit;

    if (!searchTerm) {
      return { users: [], total: 0, page: safePage, pageSize: safeLimit };
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: {
          isBanned: false,
          isSuspended: false,
          OR: [
            { username: { contains: searchTerm } },
            { email: { contains: searchTerm } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
        select: {
          email: true,
          id: true,
          bio: true,
          username: true,
          profile: true,
        },
      }),
      this.prisma.user.count({
        where: {
          isBanned: false,
          isSuspended: false,
          OR: [
            { username: { contains: searchTerm } },
            { email: { contains: searchTerm } },
          ],
        },
      }),
    ]);

    return {
      users: users.map(user => {
        const displayName = user.username?.trim() || user.email.split('@')[0];

        return {
          id: user.id,
          username: user.username ?? displayName,
          firstName: displayName,
          lastName: '',
          profileImage: (user as any).profile?.profilePhotoUrl ?? null,
          bio: user.bio,
        };
      }),
      total,
      page: safePage,
      pageSize: safeLimit,
    };
  }

  private mapConnectionUser(
    currentUserId: string,
    connection: Prisma.SavedConnectionGetPayload<{
      include: {
        user1: {
          select: {
            email: true;
            id: true;
            username: true;
            profile: true;
          };
        };
        user2: {
          select: {
            email: true;
            id: true;
            username: true;
            profile: true;
          };
        };
      };
    }>,
  ) {
    const counterpart =
      connection.user1Id === currentUserId ? connection.user2 : connection.user1;
    const displayName = counterpart.username?.trim() || counterpart.email.split('@')[0];

    return {
      id: counterpart.id,
      username: counterpart.username ?? displayName,
      firstName: displayName,
      lastName: '',
      profileImage: counterpart.profile?.profilePhotoUrl ?? null,
      coverImage: counterpart.profile?.coverPhotoUrl ?? null,
      bio: counterpart.profile?.intro ?? null,
      mutualFriendsCount: 0,
    };
  }

  private mapPublicProfile(
    user: Prisma.UserGetPayload<{
      include: {
        profile: true;
        badges: true;
        _count: {
          select: {
            posts: true;
            savedConnections: true;
            savedConnections2: true;
          };
        };
      };
    }>,
    stats: {
      commentsCount: number;
      connectionsCount: number;
      likesCount: number;
      sharesCount: number;
    },
  ) {
    const displayName = user.username?.trim() || user.email.split('@')[0];
    const mergedInterests = this.mergeInterests(
      user.profile?.interests,
      user.interests,
    );
    const voiceOpen = user.profile?.voiceOpen ?? false;

    return {
      id: user.id,
      username: user.username ?? displayName,
      displayName,
      firstName: displayName,
      lastName: '',
      email: undefined,
      bio: user.bio,
      intro: user.profile?.intro ?? null,
      education: user.profile?.education ?? null,
      friendsCount: stats.connectionsCount,
      postsCount: user._count.posts,
      likesCount: stats.likesCount,
      commentsCount: stats.commentsCount,
      sharesCount: stats.sharesCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isOwnProfile: false,
      friendshipStatus: 'NONE',
      mutualFriendsCount: 0,
      age: user.age ?? null,
      pronouns: user.profile?.pronouns ?? user.pronouns ?? null,
      genderPreference: user.genderPreference,
      interests: mergedInterests,
      language: user.language,
      timezone: user.timezone,
      voiceComfort: user.voiceComfort,
      voiceOpen,
      trustScore: user.trustScore,
      isBanned: user.isBanned,
      isSuspended: user.isSuspended,
      gender: user.profile?.gender ?? null,
      profileImage: user.profile?.profilePhotoUrl ?? null,
      coverImage: user.profile?.coverPhotoUrl ?? null,
      avatar: user.profile?.profilePhotoUrl ?? null,
      coverPhoto: user.profile?.coverPhotoUrl ?? null,
      fullName: displayName,
      relationshipStatus: user.profile?.relationshipStatus ?? null,
      dateOfBirth: user.profile?.dateOfBirth ?? null,
      workTitle: user.profile?.workTitle ?? null,
      workPlace: user.profile?.workPlace ?? null,
      currentCity: user.profile?.currentCity ?? null,
      hometown: user.profile?.hometown ?? null,
      work: user.profile
        ? {
            title: user.profile.workTitle ?? null,
            company: user.profile.workPlace ?? null,
          }
        : null,
      location: user.profile
        ? {
            city: user.profile.currentCity ?? null,
            hometown: user.profile.hometown ?? null,
          }
        : null,
      badges: user.badges.map(badge => ({
        awardedAt: badge.awardedAt,
        badgeType: badge.badgeType,
        count: badge.count,
        id: badge.id,
      })),
      recentActivity: {
        commentsCount: stats.commentsCount,
        likesCount: stats.likesCount,
        postsCount: user._count.posts,
        sharesCount: stats.sharesCount,
      },
      profile: user.profile
        ? {
            profilePhotoUrl: user.profile.profilePhotoUrl,
            coverPhotoUrl: user.profile.coverPhotoUrl,
            intro: user.profile.intro,
            voiceOpen: user.profile.voiceOpen,
            workTitle: user.profile.workTitle,
            workPlace: user.profile.workPlace,
            education: user.profile.education,
            currentCity: user.profile.currentCity,
            hometown: user.profile.hometown,
            relationshipStatus: user.profile.relationshipStatus,
            pronouns: user.profile.pronouns,
            gender: user.profile.gender,
            updatedAt: user.profile.updatedAt,
          }
        : null,
      profileDetails: user.profile
        ? {
            interests: this.mergeInterests(user.profile.interests),
            updatedAt: user.profile.updatedAt,
            voiceOpen: user.profile.voiceOpen,
          }
        : null,
    };
  }

  /**
   * GET /api/users/:username
   * Get a public profile backed by vibepass.users
   */
  @Get(':username')
  async getProfileByUsername(
    @Param('username') username: string,
    @Query('viewerId') viewerId?: string,
  ) {
    const userId = await this.findUserIdByUsername(username);

    if (!userId) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }

    const [user, connections, postStats] = await this.prisma.$transaction([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          badges: true,
          _count: {
            select: {
              posts: true,
              savedConnections: true,
              savedConnections2: true,
            },
          },
        },
      }),
      this.prisma.savedConnection.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        select: {
          user1Id: true,
          user2Id: true,
        },
      }),
      this.prisma.post.aggregate({
        where: { userId },
        _sum: {
          commentsCount: true,
          likesCount: true,
          sharesCount: true,
        },
      }),
    ]);

    let friendship = null;
    if (viewerId && viewerId !== userId) {
      friendship = await this.prisma.savedConnection.findFirst({
        where: {
          OR: [
            { user1Id: viewerId, user2Id: userId },
            { user1Id: userId, user2Id: viewerId },
          ],
        },
        select: { id: true },
      });
    }

    if (!user || user.isBanned || user.isSuspended) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }

    const connectionsCount = new Set(
      connections.map(connection =>
        connection.user1Id === userId ? connection.user2Id : connection.user1Id,
      ),
    ).size;

    const mappedProfile = this.mapPublicProfile(user, {
      commentsCount: postStats._sum.commentsCount ?? 0,
      connectionsCount,
      likesCount: postStats._sum.likesCount ?? 0,
      sharesCount: postStats._sum.sharesCount ?? 0,
    });

    if (friendship) {
      mappedProfile.friendshipStatus = 'FRIEND';
    }

    return mappedProfile;
  }

  /**
   * GET /api/users/:username/friends
   * Get a user's saved connections as profile friends
   */
  @Get(':username/friends')
  async getUserFriends(
    @Param('username') username: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const skip = (safePage - 1) * safeLimit;

    const userId = await this.findUserIdByUsername(username);

    if (!userId) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }

    const [connections, total] = await this.prisma.$transaction([
      this.prisma.savedConnection.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        orderBy: { savedAt: 'desc' },
        skip,
        take: safeLimit,
        include: {
          user1: {
            select: {
              email: true,
              id: true,
              isBanned: true,
              isSuspended: true,
              username: true,
              profile: true,
            },
          },
          user2: {
            select: {
              email: true,
              id: true,
              isBanned: true,
              isSuspended: true,
              username: true,
              profile: true,
            },
          },
        },
      }),
      this.prisma.savedConnection.count({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
      }),
    ]);

    const visibleConnections = connections.filter(connection => {
      const counterpart =
        connection.user1Id === userId ? connection.user2 : connection.user1;

      return !counterpart.isBanned && !counterpart.isSuspended;
    });

    return {
      friends: visibleConnections.map(connection =>
        this.mapConnectionUser(userId, connection),
      ),
      total,
      page: safePage,
      pageSize: safeLimit,
    };
  }
}
