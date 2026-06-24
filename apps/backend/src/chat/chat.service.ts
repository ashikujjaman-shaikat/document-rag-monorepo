import { Injectable } from '@nestjs/common';
import { ChatQueryDto } from './dto/chat-query.dto';

export type ChatResponse = {
  answer: string;
  references: unknown[];
  latencyMs: number;
};

@Injectable()
export class ChatService {
  ask(_payload: ChatQueryDto): ChatResponse {
    return {
      answer: 'Backend scaffold is ready. Business logic is intentionally not implemented.',
      references: [],
      latencyMs: 0,
    };
  }
}
