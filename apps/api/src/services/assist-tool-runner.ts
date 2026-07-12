import type { ToolName } from '@support-desk/shared';
import {
  AUDIT_ACTORS,
  executeSupportTool,
  isWebAssistTool,
  type ToolHandlerDeps,
} from '@support-desk/shared';
import {
  getTicketById,
  listAgents,
  listRecentAuditLogs,
  recordAuditLog,
  searchTickets,
} from './ticket.service.js';

const localToolDeps: ToolHandlerDeps = {
  searchTickets: (args) => searchTickets(args),
  getTicket: (ticketId) => getTicketById(ticketId),
  listAgents: (activeOnly) => listAgents(activeOnly),
  listRecentAudit: (limit) => listRecentAuditLogs(limit),
};

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
  if (!isWebAssistTool(toolName)) {
    throw new Error(`Tool ${toolName} is not available in the web assist panel.`);
  }

  return executeSupportTool(toolName, input, localToolDeps, 'compact');
}
