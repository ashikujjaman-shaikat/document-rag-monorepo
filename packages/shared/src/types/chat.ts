export interface RetrievalChunk {
  id: string;
  documentId: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface ChatRequest {
  question: string;
  sessionId: string;
  topK?: number;
}

export interface ChatResponse {
  answer: string;
  references: RetrievalChunk[];
  latencyMs: number;
}
