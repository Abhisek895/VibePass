import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CrudModule } from './modules/crud/crud.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { MatchesModule } from './modules/matches/matches.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { SafetyModule } from './modules/safety/safety.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ChatModule } from './modules/chat/chat.module';
import { VoiceModule } from './modules/voice/voice.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { LookupsModule } from './modules/lookups/lookups.module';
import { AdminModule } from './modules/admin/admin.module';
import { AdminLoggerMiddleware } from './common/middleware/admin-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    CrudModule,
    HealthModule,
    MatchesModule,
    RoomsModule,
    SafetyModule,
    UsersModule,
    PostsModule,
    MessagesModule,
    ChatModule,
    VoiceModule,
    NotificationsModule,
    LookupsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminLoggerMiddleware)
      .forRoutes('admin');
  }
}
