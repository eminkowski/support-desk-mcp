import type {
  AgentsListResponse,
  AuditListResponse,
  CreateCommentApiResponse,
  TicketResponse,
  TicketsListResponse,
} from '@support-desk/shared';
import { apiGet, apiPost } from '../../lib/api.js';
import type { TicketFilters } from './types.js';

export function fetchTickets(filters: TicketFilters): Promise<TicketsListResponse> {
  return apiGet<TicketsListResponse>('/api/tickets', {
    query: filters.query,
    status: filters.status,
    priority: filters.priority,
    assigneeId: filters.assigneeId,
    limit: filters.limit ?? 50,
  });
}

export function fetchTicket(ticketId: string): Promise<TicketResponse> {
  return apiGet<TicketResponse>(`/api/tickets/${ticketId}`);
}

export function fetchAgents(): Promise<AgentsListResponse> {
  return apiGet<AgentsListResponse>('/api/agents', { activeOnly: 'true' });
}

export function fetchAuditLog(limit = 50): Promise<AuditListResponse> {
  return apiGet<AuditListResponse>('/api/audit', { limit });
}

export function createComment(ticketId: string, body: string): Promise<CreateCommentApiResponse> {
  return apiPost<CreateCommentApiResponse>(`/api/tickets/${ticketId}/comments`, {
    body,
    internal: true,
  });
}
