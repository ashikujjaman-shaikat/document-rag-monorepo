import type { ChatRequest, ChatResponse } from '@rag/shared';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:4001/api';

export async function askChat(payload: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}`);
  }

  return (await response.json()) as ChatResponse;
}
