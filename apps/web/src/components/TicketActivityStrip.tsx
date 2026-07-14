import { useAuditLog } from '../features/tickets/queries.js';
import { ticketActivityEntries } from '../lib/audit-display.js';
import { getAuditActorDescription } from '../lib/audit-labels.js';
import { sectionHeadingClass } from '../lib/styles.js';
import { AuditEntrySummary } from './AuditEntrySummary.js';

export function TicketActivityStrip({ ticketId }: { ticketId: string }) {
  const auditQuery = useAuditLog(50);
  const entries = ticketActivityEntries(auditQuery.data?.entries ?? [], ticketId);
  const isEmpty = !auditQuery.isLoading && entries.length === 0;

  return (
    <section
      id="ticket-activity"
      className={
        isEmpty
          ? 'border-b border-[var(--color-line-subtle)] px-5 py-2.5'
          : 'border-b border-[var(--color-line-subtle)] px-5 py-4'
      }
    >
      {isEmpty ? (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className={sectionHeadingClass}>Recent activity</h3>
          <p className="text-sm text-[var(--color-muted)]">No assistant or tool actions yet.</p>
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className={sectionHeadingClass}>Recent activity</h3>
            <span className="font-mono text-[0.65rem] text-[var(--color-muted)]">
              last {entries.length}
            </span>
          </div>
          {auditQuery.isLoading ? (
            <p className="mt-3 text-sm text-[var(--color-muted)]">Loading activity…</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {entries.map((entry) => (
                <li key={entry.id} className="border-l-2 border-[var(--color-line)] pl-3">
                  <AuditEntrySummary entry={entry} />
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {getAuditActorDescription(entry.actor)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
