import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    let database: 'up' | 'down' = 'up';

    try {
      await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
    } catch {
      database = 'down';
    }

    return {
      service: 'vibepass-backend',
      status: database === 'up' ? 'ok' : 'degraded',
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
