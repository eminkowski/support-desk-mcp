import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { AskQueuePanel } from '../components/AskQueuePanel.js';
import { StatusMessage } from '../components/StatusMessage.js';
import { TicketDetailPanel } from '../components/TicketDetailPanel.js';
import { TicketFilters } from '../components/TicketFilters.js';
import { TicketTable } from '../components/TicketTable.js';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { useAgents } from '../features/tickets/queries.js';
import { useFilteredTickets } from '../hooks/useFilteredTickets.js';
import { useQueueKeyboard } from '../hooks/useQueueKeyboard.js';
import { useTicketUrlSync } from '../hooks/useTicketUrlSync.js';
import { fetchHealth, formatApiUnavailableMessage } from '../lib/health.js';
import { getSelectedRowIds, selectedRowCount } from '../lib/selection.js';
import { secondaryButtonClass } from '../lib/styles.js';

export function WorkspacePage() {
  const {
    selectedTicketId,
    setSelectedTicketId,
    setFocusedTicketId,
    filters,
    setFilters,
    clearActiveView,
    rowSelection,
    setRowSelection,
  } = useWorkspace();

  const [sortedTicketIds, setSortedTicketIds] = useState<string[]>([]);
  useQueueKeyboard(sortedTicketIds);
  useTicketUrlSync(selectedTicketId, setSelectedTicketId);

  const agentsQuery = useAgents();
  const { ticketsQuery, tickets } = useFilteredTickets(filters);
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: false,
    staleTime: 10_000,
  });
  const unavailableHint = useMemo(
    () => formatApiUnavailableMessage(healthQuery.data ?? null),
    [healthQuery.data],
  );

  useEffect(() => {
    if (!selectedTicketId || ticketsQuery.isFetching || ticketsQuery.isPending) return;
    if (tickets.some((ticket) => ticket.id === selectedTicketId)) return;
    setSelectedTicketId(null);
    setFocusedTicketId(null);
  }, [
    selectedTicketId,
    tickets,
    ticketsQuery.isFetching,
    ticketsQuery.isPending,
    setSelectedTicketId,
    setFocusedTicketId,
  ]);

  const selectedCount = selectedRowCount(rowSelection);
  const isInitialLoad =
    (agentsQuery.isLoading && !agentsQuery.data) || (ticketsQuery.isLoading && !ticketsQuery.data);

  if (isInitialLoad) {
    return <StatusMessage title="Loading queue" />;
  }

  if (ticketsQuery.isError || agentsQuery.isError) {
    const message =
      ticketsQuery.error?.message ?? agentsQuery.error?.message ?? 'Could not load tickets.';
    return (
      <StatusMessage title="Queue unavailable">
        {message} {unavailableHint}
      </StatusMessage>
    );
  }

  const agents = agentsQuery.data?.agents ?? [];

  return (
    <div className="flex h-[calc(100dvh-3rem)] min-h-[40rem] flex-col gap-3 lg:h-[calc(100dvh-2rem)]">
      <header className="shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              Support queue
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
              Review ticket context, approve assistant actions, and trace every change.
            </p>
          </div>
          <p className="font-mono text-[0.72rem] text-[var(--color-muted)]">
            {tickets.length} ticket{tickets.length === 1 ? '' : 's'}
            {selectedCount > 0 ? ` · ${selectedCount} selected` : ''}
          </p>
        </div>
      </header>

      <div className="shrink-0 space-y-2">
        <TicketFilters
          values={filters}
          agents={agents}
          onChange={(next) => {
            clearActiveView();
            setFilters(next);
          }}
        />
        {selectedCount > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => {
                void navigator.clipboard.writeText(getSelectedRowIds(rowSelection).join('\n'));
              }}
            >
              Copy selected IDs
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => setRowSelection({})}
            >
              Clear selection
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.28fr)_minmax(18rem,0.72fr)]">
        <div className="min-h-0 overflow-y-auto">
          <TicketTable
            tickets={tickets}
            isFetching={ticketsQuery.isFetching}
            onSortedTicketIdsChange={setSortedTicketIds}
          />
        </div>
        <div className="min-h-0">
          <TicketDetailPanel />
        </div>
        <div className="min-h-0 xl:overflow-y-auto">
          <AskQueuePanel key={selectedTicketId ?? 'queue-wide'} />
        </div>
      </div>
    </div>
  );
}
