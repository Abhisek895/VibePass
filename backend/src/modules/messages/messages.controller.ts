import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('api/v1/chats/:chatId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getMessages(@Param('chatId') chatId: string, @User() user: { id: string }) {
    return this.messagesService.getMessagesForChat(chatId, user.id);
  }

  @Post()
  createMessage(
    @Param('chatId') chatId: string,
    @User() user: { id: string },
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.createMessage(chatId, user.id, dto);
  }
}