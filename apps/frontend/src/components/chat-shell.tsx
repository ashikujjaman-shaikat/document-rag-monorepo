'use client';

import { FormEvent, useMemo, useState } from 'react';

import type { ChatResponse } from '@rag/shared';

import { askChat } from '../lib/api';

type Turn = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export function ChatShell(): JSX.Element {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);

  const sessionId = useMemo(() => 'session-local-dev', []);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!question.trim() || isLoading) {
      return;
    }

    const userText = question.trim();
    setIsLoading(true);
    setQuestion('');
    setTurns((current) => [...current, { id: crypto.randomUUID(), role: 'user', text: userText }]);

    try {
      const nextResponse = await askChat({
        question: userText,
        sessionId,
        topK: 5,
      });
      setResponse(nextResponse);
      setTurns((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', text: nextResponse.answer },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="chat-panel">
      <header className="chat-header">
        <h1>Document RAG Assistant</h1>
        <p>Ask grounded questions across indexed documents via MySQL + Qdrant + BullMQ pipeline.</p>
      </header>

      <div className="chat-stream">
        {turns.length === 0 ? <p className="muted">Start by asking a question about your documents.</p> : null}
        {turns.map((turn) => (
          <article key={turn.id} className={`message ${turn.role}`}>
            <span className="badge">{turn.role === 'user' ? 'You' : 'Assistant'}</span>
            <p>{turn.text}</p>
          </article>
        ))}
      </div>

      <form className="chat-form" onSubmit={onSubmit}>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="How do our refund terms vary by region?"
          rows={4}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      {response ? (
        <aside className="meta-panel">
          <h2>Retrieval Metadata</h2>
          <p>Latency: {response.latencyMs} ms</p>
          <p>References: {response.references.length}</p>
        </aside>
      ) : null}
    </section>
  );
}
