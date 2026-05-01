import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User as CurrentUser } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FindManyNotificationsDto } from './dto/find-many.dto';
import { NotificationsService } from './notifications.service';

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  findManyForCurrentUser(
    @CurrentUser('id') userId: string,
    @Query() query: FindManyNotificationsDto,
  ) {
    return this.notificationsService.findManyForUser(userId, query);
  }

  @Get('count-unread')
  countUnreadForCurrentUser(@CurrentUser('id') userId: string) {
    return this.notificationsService.countUnread(userId);
  }

  @Post(':id/read')
  markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Post('mark-all-read')
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationsService.delete(userId, id);
  }
}

