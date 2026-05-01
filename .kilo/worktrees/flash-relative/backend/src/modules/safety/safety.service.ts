import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { serializeStringArray } from '../../common/utils/serialized-fields.util';
import {
  BlockUserDto,
  ReportUserDto,
  SubmitFeedbackDto,
} from './dto/safety.dto';

@Injectable()
export class SafetyService {
  constructor(private readonly prisma: PrismaService) {}

  async reportUser(reporterId: string, dto: ReportUserDto) {
    if (dto.reportedId === reporterId) {
      throw new BadRequestException('You cannot report your own account.');
    }

    const reportedUser = await this.prisma.user.findUnique({
      where: { id: dto.reportedId },
      select: { id: true },
    });

    if (!reportedUser) {
      throw new NotFoundException('Reported user not found.');
    }

    await this.prisma.report.create({
      data: {
        id: randomUUID(),
        reporterId,
        reportedId: dto.reportedId,
        chatId: dto.chatId,
        reason: dto.reason,
        description: dto.description,
      },
    });

    return {
      success: true,
      message: 'Report submitted successfully.',
    };
  }

  async blockUser(blockerId: string, dto: BlockUserDto) {
    if (dto.blockedId === blockerId) {
      throw new BadRequestException('You cannot block your own account.');
    }

    const blockedUser = await this.prisma.user.findUnique({
      where: { id: dto.blockedId },
      select: { id: true },
    });

    if (!blockedUser) {
      throw new NotFoundException('User not found.');
    }

    await this.prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId: dto.blockedId,
        },
      },
      update: {},
      create: {
        id: randomUUID(),
        blockerId,
        blockedId: dto.blockedId,
      },
    });

    return {
      success: true,
      message: 'User blocked successfully.',
    };
  }

  async getBlockedUsers(blockerId: string) {
    return this.prisma.block.findMany({
      where: { blockerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitFeedback(fromUserId: string, dto: SubmitFeedbackDto) {
    if (dto.toUserId === fromUserId) {
      throw new BadRequestException('You cannot leave feedback for yourself.');
    }

    const chat = await this.prisma.chat.findUnique({
      where: { id: dto.chatId },
      select: { id: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found.');
    }

    const toUser = await this.prisma.user.findUnique({
      where: { id: dto.toUserId },
      select: { id: true },
    });

    if (!toUser) {
      throw new NotFoundException('Recipient not found.');
    }

    await this.prisma.userFeedback.create({
      data: {
        id: randomUUID(),
        fromUserId,
        toUserId: dto.toUserId,
        chatId: dto.chatId,
        attributes: serializeStringArray(dto.attributes),
      },
    });

    return {
      success: true,
      message: 'Feedback submitted successfully.',
    };
  }
}
