import { useEffect, useMemo, useState } from 'react';
import { useTickets } from '../features/tickets/queries.js';
import {
  applyClientTicketFilters,
  buildTicketQueryParams,
  type TicketFilterValues,
} from '../lib/ticket-filters.js';

const DEFAULT_DEBOUNCE_MS = 300;

export function useFilteredTickets(filters: TicketFilterValues, options?: { debounceMs?: number }) {
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(filters.query), debounceMs);
    return () => clearTimeout(timeout);
  }, [debounceMs, filters.query]);

  const queryParams = useMemo(
    () => buildTicketQueryParams(filters, debouncedQuery),
    [debouncedQuery, filters],
  );

  const ticketsQuery = useTickets(queryParams);
  const tickets = useMemo(
    () => applyClientTicketFilters(ticketsQuery.data?.tickets ?? [], filters),
    [filters, ticketsQuery.data?.tickets],
  );

  return { ticketsQuery, tickets };
}
