import { DRAFT_COMMENT_LABEL } from '@support-desk/shared';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { askQueue, fetchAssistStatus } from '../features/assist/api.js';
import { useTicket } from '../features/tickets/queries.js';
import { isActionConfirmForTicket } from '../lib/action-lifecycle.js';
import { formatApiUnavailableMessage } from '../lib/health.js';
import { assistPanelClass, metaLabelClass, secondaryButtonClass } from '../lib/styles.js';
import {
  AssistContextBlock,
  AssistProposedActionNotice,
  AssistSuccessNotice,
} from './AssistBlocks.js';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  toolsUsed?: string[];
};

export function AskQueuePanel() {
  const {
    selectedTicketId,
    proposedAction,
    setProposedAction,
    actionConfirmResult,
    setActionConfirmResult,
  } = useWorkspace();
  const ticketQuery = useTicket(selectedTicketId ?? undefined);
  const statusQuery = useQuery({
    queryKey: ['assist-status'],
    queryFn: fetchAssistStatus,
  });

  const claudeEnabled = statusQuery.data?.claudeEnabled ?? false;
  const ticket = ticketQuery.data?.ticket;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (actionConfirmResult) {
      setMessages([]);
      setError(null);
    }
  }, [actionConfirmResult]);

  const suggestions = selectedTicketId
    ? [DRAFT_COMMENT_LABEL, 'Summarize this thread', 'Any similar open tickets?']
    : ['Show open tickets', 'Any high priority tickets?', 'Who are the active agents?'];

  async function submit(text: string) {
    const question = text.trim();
    if (!question || isPending) return;

    setError(null);
    setActionConfirmResult(null);
    setInput('');
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', text: question },
    ]);
    setIsPending(true);

    try {
      const result = await askQueue(question, selectedTicketId ?? undefined);
      if (result.proposedAction) {
        setProposedAction(result.proposedAction);
      }
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
          text: `Could not reach the assist endpoint. ${formatApiUnavailableMessage(null)}`,
        },
      ]);
    } finally {
      setIsPending(false);
    }
  }

  const showIdleCopy = messages.length === 0 && !proposedAction && !actionConfirmResult;

  return (
    <aside className={assistPanelClass}>
      <div className="shrink-0 border-b border-[var(--color-line-subtle)] px-4 py-3">
        <h2 className="text-base font-semibold tracking-tight text-[var(--color-ink)]">Assist</h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
          {selectedTicketId
            ? 'Uses the selected ticket and customer context. Actions require review.'
            : 'Queue-wide reads and searches. Select a ticket to draft internal comments.'}
        </p>
      </div>

      {ticket ? (
        <AssistContextBlock
          ticketId={ticket.id}
          customerName={ticket.customer.name}
          company={ticket.customer.company}
          commentCount={ticket.comments.length}
        />
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {proposedAction && proposedAction.ticketId === selectedTicketId ? (
          <div className="mb-3">
            <AssistProposedActionNotice />
          </div>
        ) : null}

        {isActionConfirmForTicket(actionConfirmResult, selectedTicketId) ? (
          <div className="mb-3">
            <AssistSuccessNotice />
          </div>
        ) : null}

        {showIdleCopy ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-[var(--color-ink)]/85">
              {selectedTicketId
                ? 'Ask for a summary or draft an internal comment. Writes open a review card in the ticket workspace.'
                : claudeEnabled
                  ? 'Ask about the queue or pick a quick search below.'
                  : 'Quick searches are available below.'}
            </p>
            <div className="flex flex-col items-start gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isPending || Boolean(proposedAction)}
                  className={secondaryButtonClass}
                  onClick={() => submit(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === 'user'
                  ? 'ml-4 border border-[var(--color-line-subtle)] bg-[var(--color-workspace)] px-3 py-2.5 text-sm text-[var(--color-ink)] shadow-sm'
                  : 'space-y-2 pr-1 text-sm text-[var(--color-ink)]/90'
              }
            >
              {message.role === 'assistant' ? <p className={metaLabelClass}>Assistant</p> : null}
              <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
              {/* Tool names stay in Tool log / activity — omit raw IDs from Assist chat. */}
            </div>
          ))}

          {isPending ? (
            <p className="font-mono text-[0.72rem] text-[var(--color-muted)]">Working…</p>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--color-line-subtle)] bg-[var(--color-panel)] px-4 py-3">
        {!showIdleCopy && messages.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={isPending || Boolean(proposedAction)}
                className={secondaryButtonClass}
                onClick={() => submit(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit(input);
          }}
          className="flex gap-2"
        >
          <input
            className="min-w-0 flex-1 border border-[var(--color-line-subtle)] bg-[var(--color-workspace)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-paper)]"
            placeholder={
              selectedTicketId
                ? 'Draft internal comment…'
                : claudeEnabled
                  ? 'Search or ask about the queue…'
                  : 'Quick searches only'
            }
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isPending || (!claudeEnabled && !selectedTicketId) || Boolean(proposedAction)}
          />
          <button
            type="submit"
            disabled={isPending || !input.trim() || Boolean(proposedAction)}
            className="shrink-0 border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white transition enabled:hover:opacity-90 disabled:opacity-40"
          >
            Send
          </button>
        </form>
        {error ? <p className="mt-2 text-xs text-[#b4533c]">{error}</p> : null}
      </div>
    </aside>
  );
}
