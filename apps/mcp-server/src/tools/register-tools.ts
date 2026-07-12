import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ApiClient } from '@support-desk/shared';
import {
  addCommentInputSchema,
  createApiClientToolDeps,
  executeSupportTool,
  getTicketInputSchema,
  listAgentsInputSchema,
  recentActivityInputSchema,
  searchTicketsInputSchema,
  TOOL_NAMES,
} from '@support-desk/shared';
import { rejectTool, runTool } from '../lib/run-tool.js';

export function registerTools(server: McpServer, client: ApiClient): void {
  const deps = createApiClientToolDeps(client);

  server.registerTool(
    TOOL_NAMES.SEARCH_TICKETS,
    {
      description: 'Search support tickets by text, status, priority, or assignee.',
      inputSchema: searchTicketsInputSchema,
    },
    (args) =>
      runTool(client, TOOL_NAMES.SEARCH_TICKETS, args, () =>
        executeSupportTool(TOOL_NAMES.SEARCH_TICKETS, args, deps, 'verbose'),
      ),
  );

  server.registerTool(
    TOOL_NAMES.GET_TICKET,
    {
      description: 'Fetch a single ticket with customer context and comment thread.',
      inputSchema: getTicketInputSchema,
    },
    (args) =>
      runTool(client, TOOL_NAMES.GET_TICKET, args, () =>
        executeSupportTool(TOOL_NAMES.GET_TICKET, args, deps, 'verbose'),
      ),
  );

  server.registerTool(
    TOOL_NAMES.LIST_AGENTS,
    {
      description: 'List support agents available for assignment.',
      inputSchema: listAgentsInputSchema,
    },
    (args) =>
      runTool(client, TOOL_NAMES.LIST_AGENTS, args, () =>
        executeSupportTool(TOOL_NAMES.LIST_AGENTS, args, deps, 'verbose'),
      ),
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

      return runTool(client, TOOL_NAMES.ADD_COMMENT, args, () =>
        executeSupportTool(TOOL_NAMES.ADD_COMMENT, args, deps, 'verbose'),
      );
    },
  );

  server.registerTool(
    TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY,
    {
      description: 'List recent MCP tool calls recorded in the audit log.',
      inputSchema: recentActivityInputSchema,
    },
    (args) =>
      runTool(client, TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY, args, () =>
        executeSupportTool(TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY, args, deps, 'verbose'),
      ),
  );
}
