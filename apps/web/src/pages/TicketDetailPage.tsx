import { UNASSIGNED_LABEL } from '@support-desk/shared';
import { Link, useParams } from 'react-router-dom';
import { AddCommentForm } from '../components/AddCommentForm.js';
import { PriorityBadge, StatusBadge } from '../components/Badge.js';
import { StatusMessage } from '../components/StatusMessage.js';
import { useTicket } from '../features/tickets/queries.js';
import { formatDateTime } from '../lib/labels.js';

export function TicketDetailPage() {
  const { ticketId } = useParams();
  const ticketQuery = useTicket(ticketId);

  if (ticketQuery.isLoading) {
    return <StatusMessage title="Loading ticket" />;
  }

  if (ticketQuery.isError || !ticketQuery.data) {
    return (
      <StatusMessage title="Ticket not found">
        <Link to="/" className="text-[var(--color-accent)] underline-offset-2 hover:underline">
          Back to queue
        </Link>
      </StatusMessage>
    );
  }

  const { ticket } = ticketQuery.data;

  return (
    <div className="space-y-5">
      <Link
        to="/"
        className="inline-flex font-mono text-[0.72rem] text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
      >
        ← queue
      </Link>

      <header className="border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
              Ticket {ticket.id.slice(0, 8)}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {ticket.subject}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {ticket.customer.name}
              {ticket.customer.company ? ` · ${ticket.customer.company}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-[var(--color-line)] pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
              Assignee
            </dt>
            <dd className="mt-1 text-[var(--color-ink)]">
              {ticket.assignee?.name ?? UNASSIGNED_LABEL}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
              Customer email
            </dt>
            <dd className="mt-1 text-[var(--color-ink)]">{ticket.customer.email ?? 'n/a'}</dd>
          </div>
          <div>
            <dt className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
              Opened
            </dt>
            <dd className="mt-1 text-[var(--color-ink)]">{formatDateTime(ticket.createdAt)}</dd>
          </div>
          <div>
            <dt className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
              Updated
            </dt>
            <dd className="mt-1 text-[var(--color-ink)]">{formatDateTime(ticket.updatedAt)}</dd>
          </div>
        </dl>
      </header>

      <section className="border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-5">
        <h3 className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
          Description
        </h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-ink)]/90">
          {ticket.description}
        </p>
      </section>

      <section className="border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-line)] px-5 py-3">
          <h3 className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
            Thread ({ticket.comments.length})
          </h3>
        </div>
        {ticket.comments.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[var(--color-muted)]">
            No comments on this ticket yet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-line)]">
            {ticket.comments.map((comment) => (
              <li key={comment.id} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-[var(--color-ink)]">
                    {comment.authorName ?? 'System'}
                  </span>
                  <span className="font-mono text-[0.72rem] text-[var(--color-muted)]">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]/85">
                  {comment.body}
                </p>
                {comment.internal ? (
                  <p className="mt-2 font-mono text-[0.68rem] text-[var(--color-muted)]">
                    internal
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <AddCommentForm ticketId={ticket.id} />
      </section>
    </div>
  );
}
