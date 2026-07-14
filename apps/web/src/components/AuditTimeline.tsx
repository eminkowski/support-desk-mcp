import type { AuditEntry } from '@support-desk/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuditTicketId } from '../lib/audit-display.js';
import {
  AUDIT_ACTOR_LEGEND,
  AUDIT_CHANNEL_LABELS,
  auditChannelBadgeClass,
  getAuditActorDescription,
} from '../lib/audit-labels.js';
import { cn } from '../lib/cn.js';
import { ticketSearchPath } from '../lib/ticket-links.js';
import { AuditEntryBadges } from './AuditEntryBadges.js';
import { AuditEntrySummary } from './AuditEntrySummary.js';
import { Badge } from './Badge.js';

function AuditTimelineItem({
  entry,
  onOpenTicket,
}: {
  entry: AuditEntry;
  onOpenTicket?: (ticketId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ticketId = getAuditTicketId(entry);

  return (
    <li className="relative pl-8">
      <span
        aria-hidden
        className={cn(
          'absolute top-2 left-[0.44rem] h-2.5 w-2.5 rounded-full border-2 border-[var(--color-surface)]',
          entry.success ? 'bg-[var(--color-accent)]' : 'bg-[#b4533c]',
        )}
      />
      <div className="border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <AuditEntrySummary entry={entry} />
            <AuditEntryBadges entry={entry} />
            {ticketId && onOpenTicket ? (
              <button
                type="button"
                className="font-mono text-[0.72rem] text-[var(--color-accent)] underline-offset-2 hover:underline"
                onClick={() => onOpenTicket(ticketId)}
              >
                Open ticket {ticketId.slice(0, 8)}
              </button>
            ) : ticketId ? (
              <Link
                to={ticketSearchPath(ticketId)}
                className="font-mono text-[0.72rem] text-[var(--color-accent)] underline-offset-2 hover:underline"
              >
                Open ticket {ticketId.slice(0, 8)}
              </Link>
            ) : null}
          </div>
          <button
            type="button"
            className="shrink-0 font-mono text-[0.68rem] text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Hide' : 'Details'}
          </button>
        </div>
        {expanded ? (
          <div className="mt-3 space-y-2 border-t border-[var(--color-line)] pt-3 font-mono text-[0.72rem] leading-relaxed text-[var(--color-ink)]/75">
            <div>
              <p className="text-[var(--color-muted)]">input</p>
              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(entry.input, null, 2)}
              </pre>
            </div>
            {entry.output !== null && entry.output !== undefined ? (
              <div>
                <p className="text-[var(--color-muted)]">output</p>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(entry.output, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function AuditTimeline({
  entries,
  onOpenTicket,
  emptyMessage,
}: {
  entries: AuditEntry[];
  onOpenTicket?: (ticketId: string) => void;
  emptyMessage?: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-8 font-mono text-sm text-[var(--color-muted)]">
        <p>$ awaiting tool calls</p>
        <p className="mt-2 text-[var(--color-ink)]/70">
          {emptyMessage ??
            'REST: filter the queue, draft a comment, or add a comment on a ticket. MCP: call a tool from a client.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] text-[var(--color-muted)]">
        <span className="tracking-wide uppercase">Legend</span>
        {AUDIT_ACTOR_LEGEND.map(({ actor, channel }) => (
          <span key={actor} className="inline-flex items-center gap-1.5">
            <Badge className={auditChannelBadgeClass(channel)}>
              {AUDIT_CHANNEL_LABELS[channel]}
            </Badge>
            {getAuditActorDescription(actor)}
          </span>
        ))}
      </div>
      <ol className="relative space-y-4 border-l border-[var(--color-line)] pl-0">
        {entries.map((entry) => (
          <AuditTimelineItem key={entry.id} entry={entry} onOpenTicket={onOpenTicket} />
        ))}
      </ol>
    </div>
  );
}
