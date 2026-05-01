import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { RoomsService } from './rooms.service';

@Controller('api/v1/rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('active')
  getActiveRooms() {
    return this.roomsService.getActiveRooms();
  }

  @Post(':roomId/join')
  joinRoom(@User() user: { id: string }, @Param('roomId') roomId: string) {
    return this.roomsService.joinRoom(user.id, roomId);
  }

  @Post(':roomId/leave')
  leaveRoom(@User() user: { id: string }, @Param('roomId') roomId: string) {
    return this.roomsService.leaveRoom(user.id, roomId);
  }
}
