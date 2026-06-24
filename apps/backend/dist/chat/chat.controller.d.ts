import { ChatQueryDto } from './dto/chat-query.dto';
import { ChatResponse, ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    ask(payload: ChatQueryDto): ChatResponse;
}
