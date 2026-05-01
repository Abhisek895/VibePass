import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersController } from './users.controller';
import { ProfilesController } from './profiles.controller';
import { FacebookFriendshipsController } from './facebook-friendships.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './public/uploads',
    }),
  ],
  controllers: [UsersController, ProfilesController, FacebookFriendshipsController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}