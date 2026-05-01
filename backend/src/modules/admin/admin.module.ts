import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseModule } from '../../database/database.module';
import { RolesGuard } from '../../common/guards/roles.guard';

import { IntelligenceModule } from './intelligence/intelligence.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [DatabaseModule, IntelligenceModule, ChatModule],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
  exports: [AdminService],
})
export class AdminModule {}
