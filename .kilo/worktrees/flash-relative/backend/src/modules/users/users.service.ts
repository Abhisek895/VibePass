import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { hashPassword } from '../../common/utils/crypto.util';
import { PrismaService } from '../../database/prisma.service';
import {
  parseStringArray,
  serializeStringArray,
} from '../../common/utils/serialized-fields.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { OnboardUserDto } from './dto/onboard-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async assertUsernameAvailable(username: string, currentUserId?: string) {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      return;
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        username: normalizedUsername,
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('That username is already taken.');
    }
  }

  private normalizeProfile(profile: any) {
    if (!profile) {
      return null;
    }

    return {
      ...profile,
      interests: parseStringArray(profile.interests),
    };
  }

  private normalizeUser(user: any) {
    const { passwordHash: _passwordHash, ...safeUser } = user;

    return {
      ...safeUser,
      interests: parseStringArray(user.interests),
      profile: user.profile ? this.normalizeProfile(user.profile) : null,
    };
  }

  private toUserUpdateData(dto: any) {
    const data: any = {};
    if (dto.username !== undefined) {
      data.username = dto.username;
    }
    if (dto.password !== undefined) {
      data.passwordHash = hashPassword(dto.password);
    }
    if (dto.age !== undefined) {
      data.age = dto.age;
    }
    if (dto.bio !== undefined) {
      data.bio = dto.bio;
    }
    if (dto.conversationIntent !== undefined) {
      data.conversationIntent = dto.conversationIntent;
    }
    if (dto.pronouns !== undefined) {
      data.pronouns = dto.pronouns;
    }
    if (dto.interests !== undefined) {
      data.interests = serializeStringArray(dto.interests);
    }
    if (dto.voiceComfort !== undefined) {
      data.voiceComfort = dto.voiceComfort;
    }
    if (dto.language !== undefined) {
      data.language = dto.language;
    }
    if (dto.timezone !== undefined) {
      data.timezone = dto.timezone;
    }
    if (dto.genderPreference !== undefined) {
      data.genderPreference = dto.genderPreference;
    }
    if (dto.readReceipts !== undefined) {
      data.readReceipts = dto.readReceipts;
    }
    return data;
  }

  private buildProfileUpsertData(
    id: string,
    dto: Pick<OnboardUserDto, 'pronouns' | 'interests' | 'voiceComfort'>,
  ) {
    const serializedInterests = serializeStringArray(dto.interests);
    const voiceOpen =
      dto.voiceComfort === 'comfortable' || dto.voiceComfort === 'open';

    return {
      where: { userId: id },
      update: {
        pronouns: dto.pronouns,
        interests: serializedInterests,
        voiceOpen,
      },
      create: {
        id: randomUUID(),
        userId: id,
        pronouns: dto.pronouns,
        interests: serializedInterests,
        voiceOpen,
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        badges: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.normalizeUser(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.username) {
      dto.username = dto.username.trim();
      await this.assertUsernameAvailable(dto.username, id);
    }

    let updateData = this.toUserUpdateData(dto);

    if (dto.username) {
      updateData = {
        ...updateData,
        lastUsernameChangeAt: new Date(),
      };
    }

    const shouldUpdateProfile =
      dto.bio !== undefined ||
      dto.gender !== undefined ||
      dto.intro !== undefined ||
      dto.pronouns !== undefined ||
      dto.interests !== undefined ||
      dto.voiceComfort !== undefined ||
      dto.workTitle !== undefined ||
      dto.workPlace !== undefined ||
      dto.education !== undefined ||
      dto.currentCity !== undefined ||
      dto.hometown !== undefined ||
      dto.relationshipStatus !== undefined;

    if (shouldUpdateProfile) {
      const profileData: any = {};
      const serializedInterests = serializeStringArray(dto.interests);
      const profileIntro = dto.intro ?? dto.bio;

      if (profileIntro !== undefined) profileData.intro = profileIntro;
      if (dto.gender !== undefined) profileData.gender = dto.gender;
      if (dto.pronouns !== undefined) profileData.pronouns = dto.pronouns;
      if (dto.interests !== undefined) profileData.interests = serializedInterests;
      if (dto.voiceComfort !== undefined) {
        profileData.voiceOpen =
          dto.voiceComfort === 'comfortable' || dto.voiceComfort === 'open';
      }
      if (dto.workTitle !== undefined) profileData.workTitle = dto.workTitle;
      if (dto.workPlace !== undefined) profileData.workPlace = dto.workPlace;
      if (dto.education !== undefined) profileData.education = dto.education;
      if (dto.currentCity !== undefined) profileData.currentCity = dto.currentCity;
      if (dto.hometown !== undefined) profileData.hometown = dto.hometown;
      if (dto.relationshipStatus !== undefined) {
        profileData.relationshipStatus = dto.relationshipStatus;
      }

      await this.prisma.profile.upsert({
        where: { userId: id },
        create: {
          id: randomUUID(),
          userId: id,
          intro: profileIntro,
          gender: dto.gender,
          pronouns: dto.pronouns,
          interests: serializedInterests ?? '',
          voiceOpen:
            dto.voiceComfort === 'comfortable' || dto.voiceComfort === 'open',
          workTitle: dto.workTitle,
          workPlace: dto.workPlace,
          education: dto.education,
          currentCity: dto.currentCity,
          hometown: dto.hometown,
          relationshipStatus: dto.relationshipStatus,
        },
        update: profileData,
      });
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        profile: true,
        badges: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.normalizeUser(user);
  }

  async onboard(id: string, dto: OnboardUserDto) {
    const { promptAnswers, ...userData } = dto;

    if (userData.username) {
      await this.assertUsernameAvailable(userData.username, id);
    }

    const user = await this.prisma.$transaction(async tx => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: this.toUserUpdateData(userData),
      });

      await tx.profile.upsert(this.buildProfileUpsertData(id, userData));

      if (promptAnswers?.length) {
        const dedupedPromptAnswers = Array.from(
          new Map(promptAnswers.map(answer => [answer.promptId, answer])).values(),
        );

        await tx.promptAnswer.deleteMany({
          where: {
            userId: id,
            promptId: {
              in: dedupedPromptAnswers.map(answer => answer.promptId),
            },
          },
        });

        await tx.promptAnswer.createMany({
          data: dedupedPromptAnswers.map(answer => ({
            id: randomUUID(),
            userId: id,
            promptId: answer.promptId,
            answer: answer.answer,
          })),
        });
      }

      return tx.user.findUnique({
        where: { id: updatedUser.id },
        include: {
          profile: true,
          badges: true,
        },
      });
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.normalizeUser(user);
  }

  async getBadges(userId: string) {
    return this.prisma.badge.findMany({
      where: { userId },
    });
  }

async updateProfilePhoto(userId: string, url: string | null) {
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: { 
        id: randomUUID(),
        userId,
        profilePhotoUrl: url,
        pronouns: '',
        interests: '',
        voiceOpen: false
      } as any,
      update: { profilePhotoUrl: url } as any,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, badges: true }
    });
    if (!user) throw new NotFoundException('User not found');
    return this.normalizeUser(user);
  }

  async updateCoverPhoto(userId: string, url: string | null) {
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: { 
        id: randomUUID(),
        userId,
        coverPhotoUrl: url,
        pronouns: '',
        interests: '',
        voiceOpen: false
      } as any,
      update: { coverPhotoUrl: url } as any,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, badges: true }
    });
    if (!user) throw new NotFoundException('User not found');
    return this.normalizeUser(user);
  }

async findByUsername(username: string) {
    const result = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM users
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `;
    const userId = result[0]?.id;

    if (!userId) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        badges: true,
      },
    });

    if (!user) throw new NotFoundException(`User with username '${username}' not found`);
    return this.normalizeUser(user);
  }

  async deleteAccount(id: string) {
    await this.prisma.$transaction(async tx => {
      const chats = await tx.chat.findMany({
        where: {
          OR: [{ user1Id: id }, { user2Id: id }],
        },
        select: { id: true },
      });
      const chatIds = chats.map(chat => chat.id);

      await tx.savedConnection.deleteMany({
        where: {
          OR: [
            { user1Id: id },
            { user2Id: id },
            ...(chatIds.length ? [{ chatId: { in: chatIds } }] : []),
          ],
        },
      });

      await tx.userFeedback.deleteMany({
        where: {
          OR: [
            { fromUserId: id },
            { toUserId: id },
            ...(chatIds.length ? [{ chatId: { in: chatIds } }] : []),
          ],
        },
      });

      await tx.report.deleteMany({
        where: {
          OR: [
            { reporterId: id },
            { reportedId: id },
            ...(chatIds.length ? [{ chatId: { in: chatIds } }] : []),
          ],
        },
      });

      await tx.voiceSession.deleteMany({
        where: {
          OR: [
            { user1Id: id },
            { user2Id: id },
            ...(chatIds.length ? [{ chatId: { in: chatIds } }] : []),
          ],
        },
      });

      await tx.message.deleteMany({
        where: {
          OR: [
            { senderId: id },
            ...(chatIds.length ? [{ chatId: { in: chatIds } }] : []),
          ],
        },
      });

      if (chatIds.length) {
        await tx.chat.deleteMany({
          where: { id: { in: chatIds } },
        });
      }

      await tx.block.deleteMany({
        where: {
          OR: [{ blockerId: id }, { blockedId: id }],
        },
      });

      await tx.roomUser.deleteMany({
        where: { userId: id },
      });

      await tx.promptAnswer.deleteMany({
        where: { userId: id },
      });

      await tx.badge.deleteMany({
        where: { userId: id },
      });

      await tx.profile.deleteMany({
        where: { userId: id },
      });

      await tx.user.delete({
        where: { id },
      });
    });

    return {
      success: true,
      message: 'Account deleted successfully.',
    };
  }
}
