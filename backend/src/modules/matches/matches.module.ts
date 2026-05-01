import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConnectionsController } from './connections.controller';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [NotificationsModule, ChatModule],
  controllers: [MatchesController, ConnectionsController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule { }
