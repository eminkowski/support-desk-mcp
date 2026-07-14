import type {
  AgentsListResponse,
  AuditListResponse,
  CreateCommentApiResponse,
  TicketResponse,
  TicketsListResponse,
} from '@support-desk/shared';
import { apiGet, apiPost } from '../../lib/api.js';
import { getDemoSimulations } from '../../lib/demo-simulations.js';
import type { TicketQueryParams } from './types.js';

export function fetchTickets(filters: TicketQueryParams): Promise<TicketsListResponse> {
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
  if (getDemoSimulations().saveFailure) {
    return Promise.reject(
      new Error('Simulated save failure: the API did not accept this comment.'),
    );
  }

  return apiPost<CreateCommentApiResponse>(`/api/tickets/${ticketId}/comments`, {
    body,
    internal: true,
  });
}
