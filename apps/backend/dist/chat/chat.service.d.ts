import { ChatQueryDto } from './dto/chat-query.dto';
export type ChatResponse = {
    answer: string;
    references: unknown[];
    latencyMs: number;
};
export declare class ChatService {
    ask(_payload: ChatQueryDto): ChatResponse;
}
