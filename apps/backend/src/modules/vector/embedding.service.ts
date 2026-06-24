import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';

import type { DocumentChunk } from '@rag/shared' with { 'resolution-mode': 'import' };

import { ChunkingService } from '../document/chunking.service';
import { DocumentLoaderService } from '../document/document-loader.service';

interface EmbeddedChunk {
  chunk: DocumentChunk;
  vector: number[];
}

export interface RelevantChunk extends DocumentChunk {
  score: number;
}

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly embeddings: OpenAIEmbeddings | null;
  private embeddedChunks: EmbeddedChunk[] = [];

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(DocumentLoaderService)
    private readonly documentLoaderService: DocumentLoaderService,
    @Inject(ChunkingService)
    private readonly chunkingService: ChunkingService,
  ) {
    const openAiApiKey = this.configService.get<string>('OPENAI_API_KEY');

    this.embeddings = openAiApiKey
      ? new OpenAIEmbeddings({
          apiKey: openAiApiKey,
          model:
            this.configService.get<string>('OPENAI_EMBEDDING_MODEL') ??
            'text-embedding-3-small',
        })
      : null;
  }

  async onModuleInit(): Promise<void> {
    await this.embedChunks();
  }

  async embedChunks(): Promise<number> {
    if (!this.embeddings) {
      this.logger.warn('OPENAI_API_KEY is not configured; skipping embedding on startup.');
      this.embeddedChunks = [];
      return 0;
    }

    const documents = await this.documentLoaderService.loadAllDocuments();
    const chunks = await this.chunkingService.chunkDocuments(documents);

    if (chunks.length === 0) {
      this.logger.warn('No chunks found from documents directory; skipping embedding.');
      this.embeddedChunks = [];
      return 0;
    }

    const vectors = await this.embeddings.embedDocuments(
      chunks.map((chunk) => chunk.content),
    );

    this.embeddedChunks = chunks.map((chunk, index) => ({
      chunk,
      vector: vectors[index] ?? [],
    }));

    this.logger.log(`Embedded and cached ${chunks.length} chunks in memory.`);
    return chunks.length;
  }

  async findRelevantChunks(query: string, topK = 5): Promise<RelevantChunk[]> {
    if (!this.embeddings) {
      this.logger.warn('OPENAI_API_KEY is not configured; returning empty relevant chunks.');
      return [];
    }

    if (this.embeddedChunks.length === 0) {
      return [];
    }

    const queryVector = await this.embeddings.embedQuery(query);

    const rankedChunks = this.embeddedChunks
      .map(({ chunk, vector }) => ({
        content: chunk.content,
        filename: chunk.filename,
        chunkIndex: chunk.chunkIndex,
        score: this.cosineSimilarity(queryVector, vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return rankedChunks;
  }

  private cosineSimilarity(left: number[], right: number[]): number {
    const size = Math.min(left.length, right.length);
    if (size === 0) {
      return 0;
    }

    let dotProduct = 0;
    let leftNorm = 0;
    let rightNorm = 0;

    for (let index = 0; index < size; index += 1) {
      const leftValue = left[index] ?? 0;
      const rightValue = right[index] ?? 0;
      dotProduct += leftValue * rightValue;
      leftNorm += leftValue * leftValue;
      rightNorm += rightValue * rightValue;
    }

    const denominator = Math.sqrt(leftNorm) * Math.sqrt(rightNorm);
    if (denominator === 0) {
      return 0;
    }

    return dotProduct / denominator;
  }
}
