import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { ChatService } from './chat.service';

@Controller('api/v1/chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':id')
  getChat(@Param('id') chatId: string, @User() user: { id: string }) {
    return this.chatService.getChat(chatId, user.id);
  }
}