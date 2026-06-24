import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

import type { DocumentChunk } from '@rag/shared' with { 'resolution-mode': 'import' };

import { ChunkingService } from '../document/chunking.service';
import { DocumentLoaderService } from '../document/document-loader.service';

interface EmbeddedChunk {
  chunk: DocumentChunk;
}

export interface RelevantChunk extends DocumentChunk {
  score: number;
}

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private embeddedChunks: EmbeddedChunk[] = [];

  constructor(
    @Inject(DocumentLoaderService)
    private readonly documentLoaderService: DocumentLoaderService,
    @Inject(ChunkingService)
    private readonly chunkingService: ChunkingService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.embedChunks();
  }

  async embedChunks(): Promise<number> {
    const documents = await this.documentLoaderService.loadAllDocuments();
    const chunks = await this.chunkingService.chunkDocuments(documents);

    if (chunks.length === 0) {
      this.logger.warn('No chunks found from documents directory; skipping embedding.');
      this.embeddedChunks = [];
      return 0;
    }

    this.embeddedChunks = chunks.map((chunk) => ({ chunk }));

    this.logger.log(`Indexed and cached ${chunks.length} chunks in memory.`);
    return chunks.length;
  }

  async findRelevantChunks(query: string, topK = 5): Promise<RelevantChunk[]> {
    if (this.embeddedChunks.length === 0) {
      return [];
    }

    const rankedChunks = this.embeddedChunks
      .map(({ chunk }) => ({
        content: chunk.content,
        filename: chunk.filename,
        chunkIndex: chunk.chunkIndex,
        score: this.relevanceScore(query, chunk.content),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return rankedChunks;
  }

  private relevanceScore(query: string, content: string): number {
    const queryTerms = this.toTerms(query);
    const contentTerms = this.toTerms(content);

    if (queryTerms.size === 0 || contentTerms.size === 0) {
      return 0;
    }

    let overlapCount = 0;
    for (const term of queryTerms) {
      if (contentTerms.has(term)) {
        overlapCount += 1;
      }
    }

    const overlapScore = overlapCount / queryTerms.size;
    const normalizedContent = content.toLowerCase();
    const normalizedQuery = query.toLowerCase().trim();
    const containsFullQuery = normalizedQuery.length > 0 && normalizedContent.includes(normalizedQuery);

    if (containsFullQuery) {
      return Math.min(1, overlapScore + 0.2);
    }

    return overlapScore;
  }

  private toTerms(input: string): Set<string> {
    return new Set(
      input
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length > 1),
    );
  }
}
