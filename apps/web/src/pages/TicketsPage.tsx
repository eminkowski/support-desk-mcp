import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { AskQueuePanel } from '../components/AskQueuePanel.js';
import { StatusMessage } from '../components/StatusMessage.js';
import { TicketCard } from '../components/TicketCard.js';
import { TicketFilters, type TicketFilterValues } from '../components/TicketFilters.js';
import { useAgents, useTickets } from '../features/tickets/queries.js';
import { fetchHealth, formatQueueUnavailableMessage } from '../lib/health.js';

const initialFilters: TicketFilterValues = {
  query: '',
  status: '',
  priority: '',
  assigneeId: '',
};

export function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilterValues>(initialFilters);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const agentsQuery = useAgents();
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: false,
    staleTime: 10_000,
  });

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(filters.query), 300);
    return () => clearTimeout(timeout);
  }, [filters.query]);

  const queryFilters = useMemo(
    () => ({
      query: debouncedQuery || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      assigneeId: filters.assigneeId || undefined,
      limit: 50,
    }),
    [debouncedQuery, filters.assigneeId, filters.priority, filters.status],
  );

  const ticketsQuery = useTickets(queryFilters);

  const isInitialLoad =
    (agentsQuery.isLoading && !agentsQuery.data) || (ticketsQuery.isLoading && !ticketsQuery.data);

  const unavailableHint = useMemo(
    () => formatQueueUnavailableMessage(healthQuery.data ?? null),
    [healthQuery.data],
  );

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

  const tickets = ticketsQuery.data?.tickets ?? [];
  const agents = agentsQuery.data?.agents ?? [];

  return (
    <div className="space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-6 lg:space-y-0">
      <div className="space-y-5">
        <header className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Open queue
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
            Filter the list or use Ask the queue (REST). MCP clients connect on port 3002. Tool log
            records both paths.
          </p>
        </header>

        <TicketFilters values={filters} agents={agents} onChange={setFilters} />

        <p className="font-mono text-[0.72rem] text-[var(--color-muted)]">
          {tickets.length} result{tickets.length === 1 ? '' : 's'}
          {ticketsQuery.isFetching ? ' · updating' : ''}
        </p>

        {tickets.length === 0 ? (
          <StatusMessage title="Nothing matched">
            Widen the filters or clear them to see the full queue.
          </StatusMessage>
        ) : (
          <div className="divide-y divide-[var(--color-line)] border border-[var(--color-line)]">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      <AskQueuePanel />
    </div>
  );
}
