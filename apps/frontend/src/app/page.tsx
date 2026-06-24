import { ChatShell } from '../components/chat-shell';

export default function HomePage(): JSX.Element {
  return (
    <main className="page-wrap">
      <div className="ambient" />
      <ChatShell />
    </main>
  );
}
