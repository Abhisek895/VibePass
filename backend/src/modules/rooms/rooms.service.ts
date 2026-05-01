import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveRooms() {
    return this.prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
  }

  async joinRoom(userId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    await this.prisma.roomUser.upsert({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      update: {
        joinedAt: new Date(),
        leftAt: null,
      },
      create: {
        id: randomUUID(),
        roomId,
        userId,
      },
    });

    return {
      success: true,
      message: `Joined ${room.name}.`,
    };
  }

  async leaveRoom(userId: string, roomId: string) {
    const membership = await this.prisma.roomUser.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      include: {
        room: {
          select: { name: true },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Room membership not found.');
    }

    if (!membership.leftAt) {
      await this.prisma.roomUser.update({
        where: { id: membership.id },
        data: { leftAt: new Date() },
      });
    }

    return {
      success: true,
      message: `Left ${membership.room.name}.`,
    };
  }
}
