import {
  auditOutputFromAgents,
  auditOutputFromTicket,
  auditOutputFromTickets,
} from './audit-format.js';
import { TOOL_MESSAGES } from './constants.js';
import type { AgentSummary, AuditEntry, TicketDetail, TicketSummary } from './schemas.js';
import {
  formatAgentLineCompact,
  formatAgentVerbose,
  formatAuditEntriesCompact,
  formatAuditEntriesVerbose,
  formatTicketDetailCompact,
  formatTicketDetailVerbose,
  formatTicketLineCompact,
  formatTicketSummaryVerbose,
} from './text-format.js';

export type ToolTextResult = {
  text: string;
  output?: unknown;
};

export type ToolResultStyle = 'compact' | 'verbose';

export function buildSearchTicketsResult(
  tickets: TicketSummary[],
  style: ToolResultStyle = 'verbose',
): ToolTextResult {
  if (tickets.length === 0) {
    return { text: TOOL_MESSAGES.noTickets, output: auditOutputFromTickets([]) };
  }

  const text =
    style === 'compact'
      ? [
          `Found ${tickets.length} ticket${tickets.length === 1 ? '' : 's'}:`,
          ...tickets.map(formatTicketLineCompact),
        ].join('\n')
      : tickets.map(formatTicketSummaryVerbose).join('\n\n');

  return { text, output: auditOutputFromTickets(tickets) };
}

export function buildGetTicketResult(
  ticket: TicketDetail | null,
  ticketId: string,
  style: ToolResultStyle = 'verbose',
): ToolTextResult {
  if (!ticket) {
    return { text: `No ticket found with ID ${ticketId}.` };
  }

  return {
    text:
      style === 'compact' ? formatTicketDetailCompact(ticket) : formatTicketDetailVerbose(ticket),
    output: auditOutputFromTicket(ticket),
  };
}

export function buildListAgentsResult(
  agents: AgentSummary[],
  options: { activeOnly?: boolean; style?: ToolResultStyle } = {},
): ToolTextResult {
  const { activeOnly = true, style = 'verbose' } = options;

  if (agents.length === 0) {
    return {
      text: activeOnly ? TOOL_MESSAGES.noActiveAgents : TOOL_MESSAGES.noAgents,
      output: auditOutputFromAgents([]),
    };
  }

  const text =
    style === 'compact'
      ? ['Active agents:', ...agents.map(formatAgentLineCompact)].join('\n')
      : agents.map(formatAgentVerbose).join('\n');

  return { text, output: auditOutputFromAgents(agents) };
}

export function buildRecentActivityResult(
  entries: AuditEntry[],
  style: ToolResultStyle = 'verbose',
): ToolTextResult {
  if (entries.length === 0) {
    return { text: TOOL_MESSAGES.noActivity, output: { count: 0 } };
  }

  const text =
    style === 'compact' ? formatAuditEntriesCompact(entries) : formatAuditEntriesVerbose(entries);

  return { text, output: { count: entries.length } };
}
