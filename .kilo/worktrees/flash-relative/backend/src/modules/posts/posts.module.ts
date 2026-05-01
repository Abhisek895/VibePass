import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { FacebookPostsController } from './facebook-posts.controller';

@Module({
  imports: [NotificationsModule],
  providers: [PostsService],
  controllers: [PostsController, FacebookPostsController],
  exports: [PostsService],
})
export class PostsModule {}
