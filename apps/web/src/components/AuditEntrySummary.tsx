import type { AuditEntry } from '@support-desk/shared';
import { formatActivityDetail, formatToolLabel } from '../lib/activity-display.js';
import { formatTime } from '../lib/labels.js';

interface AuditEntrySummaryProps {
  entry: AuditEntry;
}

export function AuditEntrySummary({ entry }: AuditEntrySummaryProps) {
  const detail = formatActivityDetail(entry);

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-[0.72rem] text-[var(--color-muted)]">
          {formatTime(entry.createdAt)}
        </span>
        <span className="text-sm font-medium text-[var(--color-ink)]">
          {formatToolLabel(entry.toolName)}
        </span>
      </div>
      {detail ? (
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink)]/80">{detail}</p>
      ) : null}
    </>
  );
}
