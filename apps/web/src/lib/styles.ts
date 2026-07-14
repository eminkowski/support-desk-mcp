/** Mono uppercase — IDs, timestamps, tool names, keyboard hints only */
export const metaLabelClass =
  'font-mono text-[0.7rem] tracking-wide text-[var(--color-muted)] uppercase';

/** @deprecated Prefer metaLabelClass or sectionHeadingClass */
export const sectionLabelClass = metaLabelClass;

/** Sans section headings — Description, Thread, Recent activity */
export const sectionHeadingClass = 'text-sm font-semibold text-[var(--color-ink)]';

/** Filter / toolbar field labels */
export const fieldLabelClass = 'text-xs font-medium text-[var(--color-muted)]';

export const secondaryButtonClass =
  'border border-[var(--color-line)] px-3 py-2 text-sm text-[var(--color-muted)] transition enabled:hover:border-[var(--color-accent)] enabled:hover:text-[var(--color-accent)] disabled:cursor-default disabled:opacity-35';

export const filterFieldClass =
  'border border-[var(--color-line-subtle)] bg-[var(--color-workspace)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]';

export const filterChipClass =
  'inline-flex items-center gap-1.5 border border-[var(--color-accent)]/25 bg-[var(--color-accent-soft)]/50 px-2.5 py-1 text-xs font-medium text-[var(--color-accent)] transition hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-accent-soft)]';

export const queuePanelClass = 'overflow-hidden bg-[var(--color-panel)]/90';

export const workspacePanelClass =
  'flex h-full min-h-0 flex-col bg-[var(--color-workspace)] shadow-[var(--shadow-workspace)] ring-1 ring-[var(--color-line-subtle)]';

export const assistPanelClass =
  'flex h-full min-h-0 flex-col bg-[var(--color-panel)] ring-1 ring-[var(--color-line-subtle)]';

export const elevatedCardClass =
  'border border-[var(--color-line-subtle)] bg-[var(--color-workspace)] shadow-[var(--shadow-elevated)]';

export const commandGroupClass =
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.65rem] [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-[var(--color-muted)] [&_[cmdk-group-heading]]:uppercase';

export const commandItemClass =
  'cursor-pointer px-3 py-2 text-sm aria-selected:bg-[var(--color-accent-soft)]';
