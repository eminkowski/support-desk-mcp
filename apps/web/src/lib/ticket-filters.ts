import type {
  AgentSummary,
  TicketPriority,
  TicketStatus,
  TicketSummary,
} from '@support-desk/shared';
import type { TicketQueryParams } from '../features/tickets/types.js';
import { PRIORITY_LABELS, STATUS_LABELS } from './labels.js';

export const UNASSIGNED_FILTER_VALUE = '__unassigned__';

export type TicketFilterValues = {
  query: string;
  status: TicketStatus | '';
  priority: TicketPriority | '';
  assigneeId: string;
};

export const EMPTY_TICKET_FILTERS: TicketFilterValues = {
  query: '',
  status: '',
  priority: '',
  assigneeId: '',
};

export function hasActiveFilters(values: TicketFilterValues): boolean {
  return Boolean(values.query || values.status || values.priority || values.assigneeId);
}

export function isUnassignedFilter(assigneeId: string): boolean {
  return assigneeId === UNASSIGNED_FILTER_VALUE;
}

export function buildTicketQueryParams(
  values: TicketFilterValues,
  query = values.query,
): TicketQueryParams {
  return {
    query: query.trim() || undefined,
    status: values.status || undefined,
    priority: values.priority || undefined,
    assigneeId:
      values.assigneeId && !isUnassignedFilter(values.assigneeId) ? values.assigneeId : undefined,
    limit: 50,
  };
}

export function applyClientTicketFilters(
  tickets: TicketSummary[],
  values: TicketFilterValues,
): TicketSummary[] {
  if (!isUnassignedFilter(values.assigneeId)) return tickets;
  return tickets.filter((ticket) => !ticket.assignee);
}

export function assigneeFilterLabel(assigneeId: string, agents: AgentSummary[]): string {
  if (isUnassignedFilter(assigneeId)) return 'Unassigned';
  const agent = agents.find((item) => item.id === assigneeId);
  return agent?.name ?? assigneeId.slice(0, 8);
}

export type FilterChip = {
  key: keyof TicketFilterValues;
  label: string;
  clearValue: TicketFilterValues[keyof TicketFilterValues];
};

export function buildFilterChips(values: TicketFilterValues, agents: AgentSummary[]): FilterChip[] {
  const chips: FilterChip[] = [];

  if (values.query.trim()) {
    chips.push({
      key: 'query',
      label: `Search: ${values.query.trim()}`,
      clearValue: '',
    });
  }
  if (values.status) {
    chips.push({
      key: 'status',
      label: `Status: ${STATUS_LABELS[values.status]}`,
      clearValue: '',
    });
  }
  if (values.priority) {
    chips.push({
      key: 'priority',
      label: `Priority: ${PRIORITY_LABELS[values.priority]}`,
      clearValue: '',
    });
  }
  if (values.assigneeId) {
    chips.push({
      key: 'assigneeId',
      label: `Assignee: ${assigneeFilterLabel(values.assigneeId, agents)}`,
      clearValue: '',
    });
  }

  return chips;
}
