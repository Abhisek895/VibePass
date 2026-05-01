import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConnectionsController } from './connections.controller';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [NotificationsModule],
  controllers: [MatchesController, ConnectionsController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule { }
