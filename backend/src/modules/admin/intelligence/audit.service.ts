import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async startSession(adminId: string, userId: string, reason: string) {
    return this.prisma.auditSession.create({
      data: {
        adminId,
        userId,
        reason,
        startedAt: new Date()
      }
    });
  }

  async endSession(sessionId: string) {
    const session = await this.prisma.auditSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) throw new NotFoundException('Session not found');

    return this.prisma.auditSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() }
    });
  }

  async getSession(sessionId: string) {
    return this.prisma.auditSession.findUnique({
      where: { id: sessionId },
      include: {
        admin: { select: { username: true, email: true } },
        user: { select: { username: true, email: true } }
      }
    });
  }

  async isSessionActive(sessionId: string): Promise<boolean> {
    if (!sessionId) return false;
    const session = await this.prisma.auditSession.findUnique({
      where: { id: sessionId }
    });
    return !!session && !session.endedAt;
  }
}
