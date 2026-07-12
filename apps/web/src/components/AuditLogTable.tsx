import type { AuditEntry } from '@support-desk/shared';
import { formatAuditEntryDetail, formatAuditResultItems } from '@support-desk/shared';
import { formatTime } from '../lib/labels.js';
import { ActorBadge } from './ActorBadge.js';

export function AuditLogTable({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-8 font-mono text-sm text-[var(--color-muted)]">
        <p>$ awaiting tool calls</p>
        <p className="mt-2 text-[var(--color-ink)]/70">
          REST: pick a quick search in Ask the queue or add a comment on a ticket. MCP: call a tool
          from an MCP client or Inspector, then refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-line)] px-4 py-2 font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
        Recent invocations
      </div>
      <ul className="divide-y divide-[var(--color-line)]">
        {entries.map((entry) => {
          const detail = formatAuditEntryDetail(entry);
          const items = formatAuditResultItems(entry);

          return (
            <li key={entry.id} className="px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="shrink-0 font-mono text-[0.72rem] text-[var(--color-muted)]">
                    {formatTime(entry.createdAt)}
                  </span>
                  <span className="font-mono text-[0.78rem] text-[var(--color-ink)]">
                    {entry.toolName}
                  </span>
                  <ActorBadge actor={entry.actor} />
                </div>
                <span
                  className={
                    entry.success
                      ? 'shrink-0 font-mono text-[0.72rem] text-[var(--color-accent)]'
                      : 'shrink-0 font-mono text-[0.72rem] text-[#b4533c]'
                  }
                >
                  {entry.success ? 'ok' : 'err'}
                </span>
              </div>
              {detail ? (
                <p className="mt-1.5 font-mono text-[0.72rem] leading-relaxed text-[var(--color-ink)]/75">
                  {detail}
                </p>
              ) : null}
              {items.length > 0 ? (
                <ul className="mt-1.5 space-y-0.5 border-l border-[var(--color-line)] pl-3">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="font-mono text-[0.72rem] leading-relaxed text-[var(--color-ink)]/70"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
