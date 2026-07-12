import type { ReactNode } from 'react';

export function StatusMessage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-8">
      <h2 className="text-base font-medium text-[var(--color-ink)]">{title}</h2>
      {children ? (
        <div className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{children}</div>
      ) : null}
    </div>
  );
}
