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

export const PROPOSED_ACTION_TYPES = {
  ADD_COMMENT: 'add_comment',
} as const;

export type ProposedActionType = (typeof PROPOSED_ACTION_TYPES)[keyof typeof PROPOSED_ACTION_TYPES];

export interface ProposedCommentAction {
  type: typeof PROPOSED_ACTION_TYPES.ADD_COMMENT;
  ticketId: string;
  ticketSubject: string;
  body: string;
  /** Snapshot for stale-ticket checks before confirm */
  ticketUpdatedAt: string;
  ticketCommentCount: number;
}

export type ProposedAction = ProposedCommentAction;

export interface AssistResponse {
  reply: string;
  toolsUsed: string[];
  proposedAction?: ProposedAction;
}
