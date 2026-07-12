import type { SearchTicketsInput } from '@support-desk/shared';

export type TicketFilters = Pick<
  SearchTicketsInput,
  'query' | 'status' | 'priority' | 'assigneeId' | 'limit'
>;
