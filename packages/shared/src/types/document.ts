export interface LoadedDocument {
  filename: string;
  content: string;
}

export interface DocumentChunk {
  content: string;
  filename: string;
  chunkIndex: number;
}
