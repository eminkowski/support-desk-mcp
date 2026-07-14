import type { SearchTicketsInput } from '@support-desk/shared';

export type TicketQueryParams = Pick<
  SearchTicketsInput,
  'query' | 'status' | 'priority' | 'assigneeId' | 'limit'
>;
