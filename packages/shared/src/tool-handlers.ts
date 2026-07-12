import type { ApiClient } from './api-client.js';
import type {
  AgentsListResponse,
  AuditListResponse,
  CreateCommentApiResponse,
  TicketResponse,
  TicketsListResponse,
} from './api-responses.js';
import { TOOL_NAMES, type ToolName } from './constants.js';
import type {
  AgentSummary,
  AuditEntry,
  SearchTicketsInput,
  TicketDetail,
  TicketSummary,
} from './schemas.js';
import {
  addCommentInputSchema,
  getTicketInputSchema,
  listAgentsInputSchema,
  recentActivityInputSchema,
  searchTicketsInputSchema,
} from './schemas.js';
import {
  buildAddCommentResult,
  buildGetTicketResult,
  buildListAgentsResult,
  buildRecentActivityResult,
  buildSearchTicketsResult,
  type ToolResultStyle,
  type ToolTextResult,
} from './tool-results.js';

export interface ToolHandlerDeps {
  searchTickets(args: SearchTicketsInput): Promise<TicketSummary[]>;
  getTicket(ticketId: string): Promise<TicketDetail | null>;
  listAgents(activeOnly: boolean): Promise<AgentSummary[]>;
  listRecentAudit(limit: number): Promise<AuditEntry[]>;
  addComment?: (
    ticketId: string,
    body: string,
  ) => Promise<{ id: string; createdAt: string } | null>;
}

export const WEB_ASSIST_TOOL_NAMES = [
  TOOL_NAMES.SEARCH_TICKETS,
  TOOL_NAMES.GET_TICKET,
  TOOL_NAMES.LIST_AGENTS,
  TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY,
] as const satisfies readonly ToolName[];

export type WebAssistToolName = (typeof WEB_ASSIST_TOOL_NAMES)[number];

export function isWebAssistTool(toolName: ToolName): toolName is WebAssistToolName {
  return (WEB_ASSIST_TOOL_NAMES as readonly ToolName[]).includes(toolName);
}

export function createApiClientToolDeps(client: ApiClient): ToolHandlerDeps {
  return {
    searchTickets: async (args) => {
      const result = await client.get<TicketsListResponse>('/api/tickets', {
        query: args.query,
        status: args.status,
        priority: args.priority,
        assigneeId: args.assigneeId,
        limit: args.limit,
      });

      return result.tickets;
    },
    getTicket: async (ticketId) => {
      const result = await client.get<TicketResponse>(`/api/tickets/${ticketId}`);
      return result.ticket;
    },
    listAgents: async (activeOnly) => {
      const result = await client.get<AgentsListResponse>('/api/agents', { activeOnly });
      return result.agents;
    },
    addComment: async (ticketId, body) => {
      const result = await client.post<CreateCommentApiResponse>(
        `/api/tickets/${ticketId}/comments`,
        { body, internal: true },
      );

      return { id: result.comment.id, createdAt: result.comment.createdAt };
    },
    listRecentAudit: async (limit) => {
      const result = await client.get<AuditListResponse>('/api/audit', { limit });
      return result.entries;
    },
  };
}

export async function executeSupportTool(
  toolName: ToolName,
  input: unknown,
  deps: ToolHandlerDeps,
  style: ToolResultStyle,
): Promise<ToolTextResult> {
  switch (toolName) {
    case TOOL_NAMES.SEARCH_TICKETS: {
      const args = searchTicketsInputSchema.parse(input);
      return buildSearchTicketsResult(await deps.searchTickets(args), style);
    }
    case TOOL_NAMES.GET_TICKET: {
      const args = getTicketInputSchema.parse(input);
      return buildGetTicketResult(await deps.getTicket(args.ticketId), args.ticketId, style);
    }
    case TOOL_NAMES.LIST_AGENTS: {
      const args = listAgentsInputSchema.parse(input);
      return buildListAgentsResult(await deps.listAgents(args.activeOnly), {
        activeOnly: args.activeOnly,
        style,
      });
    }
    case TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY: {
      const args = recentActivityInputSchema.parse(input);
      return buildRecentActivityResult(await deps.listRecentAudit(args.limit), style);
    }
    case TOOL_NAMES.ADD_COMMENT: {
      if (!deps.addComment) {
        throw new Error(`Tool ${toolName} is not available.`);
      }

      const args = addCommentInputSchema.parse(input);
      const comment = await deps.addComment(args.ticketId, args.body);

      if (!comment) {
        return { text: `No ticket found with ID ${args.ticketId}.` };
      }

      return buildAddCommentResult(args.ticketId, comment);
    }
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
