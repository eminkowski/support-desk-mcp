import { formatAuditEntryDetail } from './audit-format.js';
import { TOOL_MESSAGES, UNASSIGNED_LABEL } from './constants.js';
import type { AgentSummary, AuditEntry, TicketDetail, TicketSummary } from './schemas.js';

function assigneeName(ticket: TicketSummary | TicketDetail): string {
  return ticket.assignee?.name ?? UNASSIGNED_LABEL;
}

export function formatTicketLineCompact(ticket: TicketSummary): string {
  return `• ${ticket.subject} (${ticket.priority}, ${ticket.status}) · ${ticket.customer.name}, ${assigneeName(ticket)}`;
}

export function formatTicketSummaryVerbose(ticket: TicketSummary): string {
  return [
    `ID: ${ticket.id}`,
    `Subject: ${ticket.subject}`,
    `Status: ${ticket.status}`,
    `Priority: ${ticket.priority}`,
    `Customer: ${ticket.customer.name}`,
    `Assignee: ${assigneeName(ticket)}`,
    `Updated: ${ticket.updatedAt}`,
  ].join('\n');
}

export function formatTicketDetailCompact(ticket: TicketDetail): string {
  const lines = [
    ticket.subject,
    `Status: ${ticket.status} · Priority: ${ticket.priority}`,
    `Customer: ${ticket.customer.name}`,
    `Assignee: ${assigneeName(ticket)}`,
    '',
    ticket.description,
  ];

  if (ticket.comments.length > 0) {
    lines.push('', 'Comments:');
    for (const comment of ticket.comments) {
      lines.push(
        `- ${comment.authorName ?? 'System'}: ${comment.body.slice(0, 120)}${comment.body.length > 120 ? '...' : ''}`,
      );
    }
  }

  return lines.join('\n');
}

export function formatTicketDetailVerbose(ticket: TicketDetail): string {
  const header = formatTicketSummaryVerbose(ticket);
  const comments =
    ticket.comments.length === 0
      ? 'Comments: none'
      : [
          'Comments:',
          ...ticket.comments.map(
            (comment) =>
              `- [${comment.createdAt}] ${comment.authorName ?? 'System'}: ${comment.body}`,
          ),
        ].join('\n');

  return `${header}\nDescription: ${ticket.description}\n${comments}`;
}

export function formatAgentLineCompact(agent: AgentSummary): string {
  return `• ${agent.name} <${agent.email}>`;
}

export function formatAgentVerbose(agent: AgentSummary): string {
  return `${agent.name} <${agent.email}> (${agent.active ? 'active' : 'inactive'}) [${agent.id}]`;
}

export function formatAuditEntriesVerbose(entries: AuditEntry[]): string {
  if (entries.length === 0) {
    return TOOL_MESSAGES.noActivity;
  }

  return entries
    .map(
      (entry) =>
        `[${entry.createdAt}] ${entry.toolName} by ${entry.actor} - ${formatAuditEntryDetail(entry)}`,
    )
    .join('\n');
}

export function formatAuditEntriesCompact(entries: AuditEntry[]): string {
  if (entries.length === 0) {
    return TOOL_MESSAGES.noActivity;
  }

  const lines = entries.map(
    (entry) => `• ${entry.toolName} (${entry.actor}): ${formatAuditEntryDetail(entry)}`,
  );
  return ['Recent tool calls:', ...lines].join('\n');
}
