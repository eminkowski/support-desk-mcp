import { TOOL_NAMES } from './constants.js';
import type { AuditEntry } from './schemas.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readStringArray(value: unknown, field: string, limit = 8): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => (typeof item[field] === 'string' ? item[field] : null))
    .filter((item): item is string => item !== null)
    .slice(0, limit);
}

export function auditOutputFromTickets(tickets: Array<{ id: string; subject: string }>) {
  return {
    count: tickets.length,
    tickets: tickets.map(({ id, subject }) => ({ id, subject })),
  };
}

export function auditOutputFromAgents(agents: Array<{ id: string; name: string }>) {
  return {
    count: agents.length,
    agents: agents.map(({ id, name }) => ({ id, name })),
  };
}

export function auditOutputFromTicket(ticket: { id: string; subject: string }) {
  return { ticketId: ticket.id, subject: ticket.subject };
}

function formatStatus(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.toLowerCase().replaceAll('_', ' ');
}

function formatPriority(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return `${value.toLowerCase()} priority`;
}

export function formatAuditInput(toolName: string, input: unknown): string {
  if (!isRecord(input)) return '';

  const parts: string[] = [];

  if (typeof input.message === 'string' && input.message.trim()) {
    parts.push(`"${input.message.trim()}"`);
  }

  switch (toolName) {
    case TOOL_NAMES.SEARCH_TICKETS: {
      if (typeof input.query === 'string' && input.query.trim()) {
        parts.push(`query "${input.query.trim()}"`);
      }
      const status = formatStatus(input.status);
      if (status) parts.push(status);
      const priority = formatPriority(input.priority);
      if (priority) parts.push(priority);
      if (typeof input.assigneeId === 'string') {
        parts.push(`assignee ${input.assigneeId.slice(0, 8)}`);
      }
      if (parts.length === 0) return 'all tickets';
      return parts.join(', ');
    }
    case TOOL_NAMES.GET_TICKET:
      return typeof input.ticketId === 'string' ? `ticket ${input.ticketId}` : '';
    case TOOL_NAMES.LIST_AGENTS:
      return input.activeOnly === false ? 'all agents' : 'active agents';
    case TOOL_NAMES.ADD_COMMENT:
    case TOOL_NAMES.PROPOSE_COMMENT: {
      const ticket = typeof input.ticketId === 'string' ? `ticket ${input.ticketId}` : 'ticket';
      const body = typeof input.body === 'string' ? input.body.trim() : '';
      if (!body) return ticket;
      const preview = body.length > 48 ? `${body.slice(0, 48)}...` : body;
      return `${ticket}, "${preview}"`;
    }
    case TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY:
      return `last ${typeof input.limit === 'number' ? input.limit : 20}`;
    default:
      return '';
  }
}

export function formatAuditOutput(toolName: string, output: unknown): string {
  if (!isRecord(output)) return '';

  if (typeof output.count === 'number') {
    const noun =
      toolName === TOOL_NAMES.LIST_AGENTS
        ? 'agent'
        : toolName === TOOL_NAMES.SEARCH_TICKETS
          ? 'ticket'
          : toolName === TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY
            ? 'entry'
            : 'result';
    return `${output.count} ${noun}${output.count === 1 ? '' : 's'}`;
  }

  if (typeof output.ticketId === 'string') {
    return typeof output.subject === 'string' ? output.subject : 'loaded';
  }

  if (typeof output.commentId === 'string') {
    return 'comment saved';
  }

  if (output.proposed === true) {
    return 'awaiting confirmation';
  }

  return '';
}

export function formatAuditResultItems(
  entry: Pick<AuditEntry, 'toolName' | 'output' | 'success'>,
): string[] {
  if (!entry.success || !isRecord(entry.output)) return [];

  switch (entry.toolName) {
    case TOOL_NAMES.SEARCH_TICKETS:
      return readStringArray(entry.output.tickets, 'subject');
    case TOOL_NAMES.LIST_AGENTS:
      return readStringArray(entry.output.agents, 'name');
    default:
      return [];
  }
}

export function formatAuditEntryDetail(
  entry: Pick<AuditEntry, 'toolName' | 'input' | 'output' | 'success'>,
): string {
  const inputSummary = formatAuditInput(entry.toolName, entry.input);
  const outputSummary = entry.success ? formatAuditOutput(entry.toolName, entry.output) : 'failed';

  if (inputSummary && outputSummary) {
    return `${inputSummary} -> ${outputSummary}`;
  }

  return inputSummary || outputSummary;
}
