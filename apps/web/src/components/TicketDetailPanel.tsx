import { UNASSIGNED_LABEL } from '@support-desk/shared';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { useTicket } from '../features/tickets/queries.js';
import { isActionConfirmForTicket } from '../lib/action-lifecycle.js';
import { formatDateTime } from '../lib/labels.js';
import { metaLabelClass, sectionHeadingClass, workspacePanelClass } from '../lib/styles.js';
import { ActionReviewCard, ActionReviewCompletedCard } from './ActionReviewCard.js';
import { AddCommentForm } from './AddCommentForm.js';
import { PriorityBadge, StatusBadge } from './Badge.js';
import { StatusMessage } from './StatusMessage.js';
import { TicketActivityStrip } from './TicketActivityStrip.js';

export { focusCommentBox } from '../lib/comment-focus.js';

export function TicketDetailPanel() {
  const { selectedTicketId, proposedAction, actionConfirmResult } = useWorkspace();
  const ticketQuery = useTicket(selectedTicketId ?? undefined);

  if (!selectedTicketId) {
    return (
      <div className="flex h-full min-h-[24rem] items-center justify-center bg-[var(--color-panel)]/40 px-8 text-center ring-1 ring-[var(--color-line-subtle)] ring-inset">
        <div className="max-w-xs">
          <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            Select a ticket
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
            Review customer context, work the thread, and approve assistant actions.
          </p>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Choose a ticket from the queue, or use ↑ and ↓ to navigate.
          </p>
          <ul className="mt-5 space-y-1.5 text-left text-xs text-[var(--color-muted)]">
            <li className="flex items-center gap-3">
              <span className="w-14 shrink-0 font-mono text-[0.7rem]">
                <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd>
              </span>
              <span>Move through the queue</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-14 shrink-0 font-mono text-[0.7rem]">
                <kbd className="kbd">Enter</kbd>
              </span>
              <span>Open selected ticket</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-14 shrink-0 font-mono text-[0.7rem]">
                <kbd className="kbd">⌘K</kbd>
              </span>
              <span>Search tickets</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (ticketQuery.isLoading) {
    return <StatusMessage title="Loading ticket" />;
  }

  if (ticketQuery.isError || !ticketQuery.data) {
    return (
      <StatusMessage title="Ticket not found">This ticket may have been removed.</StatusMessage>
    );
  }

  const { ticket } = ticketQuery.data;

  return (
    <article
      className={`${workspacePanelClass} border-l-[3px] border-l-[var(--color-accent)]`}
      aria-label={`Ticket ${ticket.subject}`}
    >
      <header className="shrink-0 border-b border-[var(--color-line-subtle)] px-5 py-4">
        <p className={metaLabelClass}>Ticket {ticket.id.slice(0, 8)}</p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[var(--color-ink)]">
          {ticket.subject}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {ticket.customer.name}
          {ticket.customer.company && ticket.customer.company !== ticket.customer.name
            ? ` · ${ticket.customer.company}`
            : ''}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          <span className="font-medium text-[var(--color-ink)]">
            {ticket.assignee?.name ?? UNASSIGNED_LABEL}
          </span>
          {' · Updated '}
          {formatDateTime(ticket.updatedAt)}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {proposedAction && proposedAction.ticketId === ticket.id ? (
          <div className="border-b border-[var(--color-line-subtle)] p-4">
            <ActionReviewCard action={proposedAction} />
          </div>
        ) : isActionConfirmForTicket(actionConfirmResult, ticket.id) ? (
          <div className="border-b border-[var(--color-line-subtle)] p-4">
            <ActionReviewCompletedCard result={actionConfirmResult} />
          </div>
        ) : null}

        <TicketActivityStrip ticketId={ticket.id} />

        <section className="border-b border-[var(--color-line-subtle)] px-5 py-4">
          <h3 className={sectionHeadingClass}>Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--color-ink)]/90">
            {ticket.description}
          </p>
        </section>

        <section id="ticket-thread">
          <div className="border-b border-[var(--color-line-subtle)] px-5 py-3">
            <h3 className={sectionHeadingClass}>Thread ({ticket.comments.length})</h3>
          </div>
          {ticket.comments.length === 0 ? (
            <p className="px-5 py-5 text-sm text-[var(--color-muted)]">No comments yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-line-subtle)]">
              {ticket.comments.map((comment) => (
                <li key={comment.id} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{comment.authorName ?? 'System'}</span>
                      {comment.internal ? (
                        <span className="border border-[var(--color-line-subtle)] bg-[var(--color-paper)] px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide text-[var(--color-muted)] uppercase">
                          Internal
                        </span>
                      ) : null}
                    </div>
                    <span className="font-mono text-[0.72rem] text-[var(--color-muted)]">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-ink)]/85">
                    {comment.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="shrink-0 border-t border-[var(--color-line-subtle)] bg-[var(--color-workspace)] shadow-[var(--shadow-composer)]">
        <AddCommentForm ticketId={ticket.id} />
      </div>
    </article>
  );
}
