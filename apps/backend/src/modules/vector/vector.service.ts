import { Injectable } from '@nestjs/common';

import { EmbeddingService, RelevantChunk } from './embedding.service';

@Injectable()
export class VectorService {
  constructor(private readonly embeddingService: EmbeddingService) {}

  health(): string {
    return 'configured';
  }

  async searchRelevant(question: string, topK = 5): Promise<RelevantChunk[]> {
    return this.embeddingService.findRelevantChunks(question, topK);
  }
}
