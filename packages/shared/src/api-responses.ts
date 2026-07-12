import type {
  AgentSummary,
  AuditEntry,
  CommentSummary,
  TicketDetail,
  TicketSummary,
} from './schemas.js';

export interface TicketsListResponse {
  tickets: TicketSummary[];
  count: number;
}

export interface TicketResponse {
  ticket: TicketDetail;
}

export interface AgentsListResponse {
  agents: AgentSummary[];
}

export interface AuditListResponse {
  entries: AuditEntry[];
  count: number;
}

export interface CommentResponse {
  comment: CommentSummary;
}

export interface AuditEntryResponse {
  entry: AuditEntry;
}

export type CreateCommentApiResponse = CommentResponse;

export interface AssistStatusResponse {
  claudeEnabled: boolean;
}

export interface AssistResponse {
  reply: string;
  toolsUsed: string[];
}
