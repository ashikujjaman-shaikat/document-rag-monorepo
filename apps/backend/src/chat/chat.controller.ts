import { Body, Controller, Post } from '@nestjs/common';

import { ChatQueryDto } from './dto/chat-query.dto';
import { ChatResponse, ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  ask(@Body() payload: ChatQueryDto): ChatResponse {
    return this.chatService.ask(payload);
  }
}
