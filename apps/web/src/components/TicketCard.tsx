import type { TicketSummary } from '@support-desk/shared';
import { UNASSIGNED_LABEL } from '@support-desk/shared';
import { Link } from 'react-router-dom';
import { formatDateTime, priorityStripeClass } from '../lib/labels.js';
import { PriorityBadge, StatusBadge } from './Badge.js';

export function TicketCard({ ticket }: { ticket: TicketSummary }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="group grid grid-cols-[4px_1fr] overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)] transition hover:border-[var(--color-accent)]/35"
    >
      <span
        aria-hidden
        className={`${priorityStripeClass(ticket.priority)} transition group-hover:opacity-90`}
      />
      <div className="min-w-0 px-4 py-3.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[0.98rem] font-medium leading-snug text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
              {ticket.subject}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {ticket.customer.name}
              {ticket.customer.company ? ` · ${ticket.customer.company}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.72rem] text-[var(--color-muted)]">
          <span>{ticket.assignee?.name ?? UNASSIGNED_LABEL}</span>
          <span>{formatDateTime(ticket.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
