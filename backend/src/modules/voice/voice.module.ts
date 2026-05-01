import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { VoiceGateway } from './voice.gateway';
import { VoiceService } from './voice.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
    DatabaseModule,
    NotificationsModule,
  ],
  providers: [VoiceGateway, VoiceService],
  exports: [VoiceService],
})
export class VoiceModule {}
