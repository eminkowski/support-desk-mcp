import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type {
  AgentsListResponse,
  ApiClient,
  AuditListResponse,
  CreateCommentApiResponse,
  TicketResponse,
  TicketsListResponse,
} from '@support-desk/shared';
import {
  addCommentInputSchema,
  buildGetTicketResult,
  buildListAgentsResult,
  buildRecentActivityResult,
  buildSearchTicketsResult,
  getTicketInputSchema,
  listAgentsInputSchema,
  recentActivityInputSchema,
  searchTicketsInputSchema,
  TOOL_NAMES,
} from '@support-desk/shared';
import { rejectTool, runTool } from '../lib/run-tool.js';

export function registerTools(server: McpServer, client: ApiClient): void {
  server.registerTool(
    TOOL_NAMES.SEARCH_TICKETS,
    {
      description: 'Search support tickets by text, status, priority, or assignee.',
      inputSchema: searchTicketsInputSchema,
    },
    (args) =>
      runTool(client, TOOL_NAMES.SEARCH_TICKETS, args, async () => {
        const result = await client.get<TicketsListResponse>('/api/tickets', {
          query: args.query,
          status: args.status,
          priority: args.priority,
          assigneeId: args.assigneeId,
          limit: args.limit,
        });

        return buildSearchTicketsResult(result.tickets, 'verbose');
      }),
  );

  server.registerTool(
    TOOL_NAMES.GET_TICKET,
    {
      description: 'Fetch a single ticket with customer context and comment thread.',
      inputSchema: getTicketInputSchema,
    },
    (args) =>
      runTool(client, TOOL_NAMES.GET_TICKET, args, async () => {
        const result = await client.get<TicketResponse>(`/api/tickets/${args.ticketId}`);
        return buildGetTicketResult(result.ticket, args.ticketId, 'verbose');
      }),
  );

  server.registerTool(
    TOOL_NAMES.LIST_AGENTS,
    {
      description: 'List support agents available for assignment.',
      inputSchema: listAgentsInputSchema,
    },
    (args) =>
      runTool(client, TOOL_NAMES.LIST_AGENTS, args, async () => {
        const result = await client.get<AgentsListResponse>('/api/agents', {
          activeOnly: args.activeOnly,
        });

        return buildListAgentsResult(result.agents, {
          activeOnly: args.activeOnly,
          style: 'verbose',
        });
      }),
  );

  server.registerTool(
    TOOL_NAMES.ADD_COMMENT,
    {
      description: 'Append an internal comment to a ticket. Requires confirmed=true.',
      inputSchema: addCommentInputSchema,
    },
    async (args) => {
      if (!args.confirmed) {
        return rejectTool(
          client,
          TOOL_NAMES.ADD_COMMENT,
          args,
          'Comment not saved. Set confirmed=true after verifying the ticket and comment text.',
        );
      }

      return runTool(client, TOOL_NAMES.ADD_COMMENT, args, async () => {
        const result = await client.post<CreateCommentApiResponse>(
          `/api/tickets/${args.ticketId}/comments`,
          { body: args.body, internal: true },
        );

        return {
          text: `Comment added to ticket ${args.ticketId} at ${result.comment.createdAt}.`,
          output: { commentId: result.comment.id },
        };
      });
    },
  );

  server.registerTool(
    TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY,
    {
      description: 'List recent MCP tool calls recorded in the audit log.',
      inputSchema: recentActivityInputSchema,
    },
    (args) =>
      runTool(client, TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY, args, async () => {
        const result = await client.get<AuditListResponse>('/api/audit', {
          limit: args.limit,
        });

        return buildRecentActivityResult(result.entries, 'verbose');
      }),
  );
}
