import { useCallback, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { useDismissiblePopover } from '../hooks/useDismissiblePopover.js';
import { secondaryButtonClass } from '../lib/styles.js';
import { TICKET_TABLE_COLUMNS } from '../lib/table-columns.js';

export function ColumnVisibilityMenu() {
  const { visibleColumns, setVisibleColumns } = useWorkspace();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const popoverRef = useDismissiblePopover(open, close);

  return (
    <div ref={popoverRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        className={secondaryButtonClass}
        onClick={() => setOpen((current) => !current)}
      >
        Columns
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Visible columns"
          className="absolute right-0 z-20 mt-1 min-w-[10rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-2 shadow-sm"
        >
          {TICKET_TABLE_COLUMNS.filter((column) => column.id !== 'select').map((column) => {
            const checked = visibleColumns.includes(column.id);
            return (
              <label
                key={column.id}
                className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-[var(--color-paper)]"
              >
                <input
                  type="checkbox"
                  className="accent-[var(--color-accent)]"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? visibleColumns.filter((id) => id !== column.id)
                      : [...visibleColumns, column.id];
                    setVisibleColumns(next.length > 0 ? next : ['subject']);
                  }}
                />
                {column.label}
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
