import { Module } from '@nestjs/common';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { DatabaseModule } from '../../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [IntelligenceController, AuditController],
  providers: [IntelligenceService, AuditService],
  exports: [IntelligenceService, AuditService],
})
export class IntelligenceModule {}
