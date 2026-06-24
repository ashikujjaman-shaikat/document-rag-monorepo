import { Injectable } from '@nestjs/common';

import type {
  DocumentChunk,
  LoadedDocument,
} from '@rag/shared' with { 'resolution-mode': 'import' };

type TextSplitter = {
  splitText(text: string): Promise<string[]>;
};

@Injectable()
export class ChunkingService {
  private splitter: TextSplitter | null = null;

  async chunkDocuments(documents: LoadedDocument[]): Promise<DocumentChunk[]> {
    const chunkGroups = await Promise.all(
      documents.map((document) => this.chunkSingleDocument(document)),
    );

    return chunkGroups.flat();
  }

  private async chunkSingleDocument(
    document: LoadedDocument,
  ): Promise<DocumentChunk[]> {
    const splitter = await this.getSplitter();
    const chunks = await splitter.splitText(document.content);

    return chunks.map((content: string, chunkIndex: number) => ({
      content,
      filename: document.filename,
      chunkIndex,
    }));
  }

  private async getSplitter(): Promise<TextSplitter> {
    if (this.splitter !== null) {
      return this.splitter;
    }

    const { RecursiveCharacterTextSplitter } = await import(
      '@langchain/textsplitters'
    );

    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    return this.splitter;
  }
}
