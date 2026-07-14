import { Link } from 'react-router-dom';
import { cn } from '../lib/cn.js';
import { elevatedCardClass, metaLabelClass } from '../lib/styles.js';

export function AssistContextBlock({
  ticketId,
  customerName,
  company,
  commentCount,
}: {
  ticketId: string;
  customerName: string;
  company?: string | null;
  commentCount: number;
}) {
  const customer =
    company && company !== customerName ? `${customerName} · ${company}` : customerName;

  return (
    <div className="space-y-2.5 border-b border-[var(--color-line-subtle)] px-4 py-3">
      <div>
        <p className={metaLabelClass}>Context</p>
        <p className="mt-1.5 font-mono text-xs text-[var(--color-ink)]">{ticketId.slice(0, 8)}</p>
        <p className="mt-0.5 text-sm text-[var(--color-ink)]">{customer}</p>
        <p className="mt-0.5 text-xs text-[var(--color-muted)]">
          {commentCount} thread message{commentCount === 1 ? '' : 's'}
        </p>
      </div>
      <p className="border border-[#c9923f]/30 bg-[#fdf8ef] px-2.5 py-1.5 text-xs font-medium text-[#8a5a18]">
        Internal writes require review
      </p>
    </div>
  );
}

export function AssistProposedActionNotice() {
  return (
    <div className={cn(elevatedCardClass, 'border-[#c9923f]/30 bg-[#fdf8ef]/80 px-3 py-2.5')}>
      <p className={cn(metaLabelClass, 'text-[#8a5a18]')}>Awaiting your review</p>
      <p className="mt-1 text-sm text-[var(--color-ink)]/90">
        Internal comment proposed — confirm in the ticket workspace.
      </p>
    </div>
  );
}

export function AssistSuccessNotice() {
  return (
    <p className="text-xs text-[var(--color-muted)]">
      <span className="font-medium text-[var(--color-accent)]">Done.</span> Request completed — see
      the thread and{' '}
      <Link
        to="/activity"
        className="text-[var(--color-accent)] underline-offset-2 hover:underline"
      >
        activity record
      </Link>
      .
    </p>
  );
}
