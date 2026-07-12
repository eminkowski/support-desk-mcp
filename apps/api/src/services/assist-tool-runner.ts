import type { ToolName } from '@support-desk/shared';
import {
  AUDIT_ACTORS,
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
import {
  getTicketById,
  listAgents,
  listRecentAuditLogs,
  recordAuditLog,
  searchTickets,
} from './ticket.service.js';

export async function executeAssistTool(
  toolName: ToolName,
  input: unknown,
  prompt: string,
): Promise<{ text: string; output?: unknown }> {
  const auditInput =
    typeof input === 'object' && input !== null
      ? { message: prompt, ...input }
      : { message: prompt, input };

  try {
    const result = await runHandler(toolName, input);
    await recordAuditLog({
      toolName,
      actor: AUDIT_ACTORS.WEB_ASSIST,
      input: auditInput,
      output: result.output,
      success: true,
    });
    return result;
  } catch (error) {
    await recordAuditLog({
      toolName,
      actor: AUDIT_ACTORS.WEB_ASSIST,
      input: auditInput,
      success: false,
    });
    throw error;
  }
}

async function runHandler(
  toolName: ToolName,
  input: unknown,
): Promise<{ text: string; output?: unknown }> {
  switch (toolName) {
    case TOOL_NAMES.SEARCH_TICKETS: {
      const args = searchTicketsInputSchema.parse(input);
      return buildSearchTicketsResult(await searchTickets(args), 'compact');
    }
    case TOOL_NAMES.GET_TICKET: {
      const args = getTicketInputSchema.parse(input);
      return buildGetTicketResult(await getTicketById(args.ticketId), args.ticketId, 'compact');
    }
    case TOOL_NAMES.LIST_AGENTS: {
      const args = listAgentsInputSchema.parse(input);
      return buildListAgentsResult(await listAgents(args.activeOnly), {
        activeOnly: args.activeOnly,
        style: 'compact',
      });
    }
    case TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY: {
      const args = recentActivityInputSchema.parse(input);
      return buildRecentActivityResult(await listRecentAuditLogs(args.limit), 'compact');
    }
    default:
      throw new Error(`Tool ${toolName} is not available in the web assist panel.`);
  }
}
