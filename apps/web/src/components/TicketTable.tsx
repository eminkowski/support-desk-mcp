import type { TicketSummary } from '@support-desk/shared';
import { UNASSIGNED_LABEL } from '@support-desk/shared';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { cn } from '../lib/cn.js';
import { formatCompactDateTime } from '../lib/labels.js';
import { metaLabelClass, queuePanelClass } from '../lib/styles.js';
import { PriorityBadge, StatusBadge } from './Badge.js';

const columnHelper = createColumnHelper<TicketSummary>();

interface TicketTableProps {
  tickets: TicketSummary[];
  isFetching?: boolean;
  onSortedTicketIdsChange?: (ids: string[]) => void;
}

export function TicketTable({ tickets, isFetching, onSortedTicketIdsChange }: TicketTableProps) {
  const {
    selectedTicketId,
    setSelectedTicketId,
    focusedTicketId,
    setFocusedTicketId,
    rowSelection,
    setRowSelection,
  } = useWorkspace();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updated', desc: true }]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('subject', { id: 'subject' }),
      columnHelper.accessor('updatedAt', { id: 'updated' }),
      columnHelper.accessor('priority', { id: 'priority' }),
      columnHelper.accessor('status', { id: 'status' }),
    ],
    [],
  );

  const table = useReactTable({
    data: tickets,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(next);
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  const sortedTicketIds = useMemo(
    () => table.getRowModel().rows.map((row) => row.original.id),
    [table],
  );

  useEffect(() => {
    onSortedTicketIdsChange?.(sortedTicketIds);
  }, [onSortedTicketIdsChange, sortedTicketIds]);

  if (tickets.length === 0) {
    return (
      <div className="border border-dashed border-[var(--color-line-subtle)] bg-[var(--color-panel)]/60 px-5 py-10 text-center text-sm text-[var(--color-muted)]">
        Nothing matched. Widen the filters or switch saved views.
      </div>
    );
  }

  const allSelected = table.getIsAllPageRowsSelected();
  const someSelected = table.getIsSomePageRowsSelected();

  return (
    <div className={queuePanelClass}>
      <div className="flex items-center justify-between border-b border-[var(--color-line-subtle)] px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-[var(--color-accent)]"
            checked={allSelected}
            ref={(element) => {
              if (element) element.indeterminate = someSelected;
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all tickets"
          />
          <span className={metaLabelClass}>Queue</span>
        </div>
        <button
          type="button"
          className="text-xs text-[var(--color-muted)] transition hover:text-[var(--color-ink)]"
          onClick={() =>
            setSorting((current) => [
              {
                id: 'updated',
                desc: !(current[0]?.id === 'updated' && current[0]?.desc),
              },
            ])
          }
        >
          Updated {sorting[0]?.id === 'updated' && !sorting[0]?.desc ? '↑' : '↓'}
        </button>
      </div>

      <ul className="divide-y divide-[var(--color-line-subtle)]">
        {table.getRowModel().rows.map((row) => {
          const ticket = row.original;
          const isSelected = selectedTicketId === ticket.id;
          const isFocused = focusedTicketId === ticket.id;
          const customer =
            ticket.customer.company && ticket.customer.company !== ticket.customer.name
              ? `${ticket.customer.name} · ${ticket.customer.company}`
              : ticket.customer.name;
          const meta = [
            ticket.assignee?.name ?? UNASSIGNED_LABEL,
            formatCompactDateTime(ticket.updatedAt),
          ].join(' · ');

          return (
            <li key={row.id}>
              <div
                className={cn(
                  'flex cursor-pointer gap-2.5 border-l-[3px] px-3 py-2.5 outline-none transition-colors duration-150 focus-visible:bg-[var(--color-accent-soft)]/35 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]/45',
                  isSelected
                    ? 'border-l-[var(--color-accent)] bg-[var(--color-accent-soft)]/80'
                    : isFocused
                      ? 'border-l-[var(--color-accent)]/50 bg-[var(--color-paper)]'
                      : 'border-l-transparent hover:bg-[var(--color-paper)]/70',
                )}
                onClick={() => {
                  setFocusedTicketId(ticket.id);
                  setSelectedTicketId(ticket.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setFocusedTicketId(ticket.id);
                    setSelectedTicketId(ticket.id);
                  }
                }}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
              >
                <input
                  type="checkbox"
                  className="mt-1 shrink-0 accent-[var(--color-accent)]"
                  checked={row.getIsSelected()}
                  onChange={row.getToggleSelectedHandler()}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`Select ${ticket.subject}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-[var(--color-ink)]">
                    {ticket.subject}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">{customer}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <span className="text-[0.72rem] text-[var(--color-muted)]">{meta}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-[var(--color-line-subtle)] px-3 py-2 text-[0.7rem] text-[var(--color-muted)]">
        <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> move ·{' '}
        <kbd className="kbd">Enter</kbd> open · <kbd className="kbd">Esc</kbd> close
        {isFetching ? ' · updating…' : ''}
      </p>
    </div>
  );
}
