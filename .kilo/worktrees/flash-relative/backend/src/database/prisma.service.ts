import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const target = this.getDatabaseTarget();
    this.logger.log(`Connecting to database: ${target}`);

    try {
      await this.$connect();
      this.logger.log(`Database connected successfully: ${target}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown database connection error';
      this.logger.error(`Database connection failed: ${target} | ${message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private getDatabaseTarget() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return 'DATABASE_URL is not set';
    }

    try {
      const parsed = new URL(databaseUrl);
      const protocol = parsed.protocol.replace(':', '');
      const databaseName = parsed.pathname.replace(/^\//, '') || '(no database)';
      const port = parsed.port || '3306';

      return `${protocol}://${parsed.hostname}:${port}/${databaseName}`;
    } catch {
      return 'invalid DATABASE_URL';
    }
  }
}
