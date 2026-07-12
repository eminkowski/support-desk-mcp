import { ASSIST_SUGGESTIONS } from '@support-desk/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { askQueue, fetchAssistStatus } from '../features/assist/api.js';
import { EntryPathsPanel } from './EntryPathsPanel.js';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  toolsUsed?: string[];
};

const SUGGESTIONS = [...ASSIST_SUGGESTIONS];

export function AskQueuePanel() {
  const statusQuery = useQuery({
    queryKey: ['assist-status'],
    queryFn: fetchAssistStatus,
  });

  const claudeEnabled = statusQuery.data?.claudeEnabled ?? false;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(text: string) {
    const question = text.trim();
    if (!question || isPending) return;

    setError(null);
    setInput('');
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', text: question },
    ]);
    setIsPending(true);

    try {
      const result = await askQueue(question);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: result.reply,
          toolsUsed: result.toolsUsed,
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Assist request failed';
      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'Could not reach the assist endpoint. Is the API running on port 3001?',
        },
      ]);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <aside className="flex h-full min-h-[24rem] flex-col border border-[var(--color-line)] bg-[var(--color-surface)] lg:min-h-[32rem]">
      <div className="border-b border-[var(--color-line)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">Ask the queue</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
          Quick searches call tools directly.{' '}
          {claudeEnabled ? 'Typed questions enabled.' : 'Same tools as MCP.'}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <p className="mr-2 text-sm leading-relaxed text-[var(--color-ink)]/90">
          {claudeEnabled
            ? 'Ask a question or pick a quick search. Typed questions use the same tools as MCP.'
            : 'Pick a quick search below. For open-ended questions, connect an MCP client.'}
        </p>
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === 'user'
                ? 'ml-6 border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)]'
                : 'mr-2 text-sm text-[var(--color-ink)]/90'
            }
          >
            <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
            {message.toolsUsed && message.toolsUsed.length > 0 ? (
              <p className="mt-2 font-mono text-[0.65rem] text-[var(--color-muted)]">
                tools: {message.toolsUsed.join(', ')}
              </p>
            ) : null}
          </div>
        ))}
        {isPending ? (
          <p className="font-mono text-[0.72rem] text-[var(--color-muted)]">working...</p>
        ) : null}
      </div>

      <div className="border-t border-[var(--color-line)] px-4 py-3">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isPending}
              className="border border-[var(--color-line)] px-2 py-1 text-xs text-[var(--color-muted)] transition enabled:hover:border-[var(--color-accent)] enabled:hover:text-[var(--color-accent)] disabled:opacity-50"
              onClick={() => submit(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit(input);
          }}
          className="flex gap-2"
        >
          <input
            className="min-w-0 flex-1 border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-paper)]"
            placeholder={
              claudeEnabled ? 'e.g. Show open high priority tickets' : 'Quick searches only'
            }
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isPending || !claudeEnabled}
          />
          <button
            type="submit"
            disabled={isPending || !claudeEnabled || !input.trim()}
            className="shrink-0 border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white transition enabled:hover:opacity-90 disabled:opacity-40"
          >
            Ask
          </button>
        </form>
        {error ? <p className="mt-2 text-xs text-[#b4533c]">{error}</p> : null}
        <div className="mt-3 border-t border-[var(--color-line)] pt-3">
          <EntryPathsPanel variant="compact" />
        </div>
      </div>
    </aside>
  );
}
