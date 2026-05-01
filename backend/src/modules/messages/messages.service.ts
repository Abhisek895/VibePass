import { Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private chatService: ChatService,
    private notificationsService: NotificationsService,
  ) {}

  async getMessagesForChat(chatId: string, userId: string) {
    await this.chatService.validateChatAccess(chatId, userId);

    const messages = await this.chatService.getMessagesForChat(chatId, userId);

    await this.notificationsService.markChatNotificationsAsRead(userId, chatId);

    return messages;
  }

  async createMessage(chatId: string, userId: string, dto: CreateMessageDto) {
    const { message } = await this.chatService.createMessage(chatId, userId, dto.content);
    return message;
  }
}
