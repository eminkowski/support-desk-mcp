import type { Agent, AuditLog, Customer, Ticket, TicketComment } from '@prisma/client';
import type {
  AgentSummary,
  AuditEntry,
  CommentSummary,
  CustomerSummary,
  TicketDetail,
  TicketSummary,
} from '@support-desk/shared';

type TicketWithRelations = Ticket & {
  customer: Customer;
  assignee: Agent | null;
  comments?: (TicketComment & { author: Agent | null })[];
};

export function toAuditEntry(entry: AuditLog): AuditEntry {
  return {
    id: entry.id,
    toolName: entry.toolName,
    actor: entry.actor,
    input: entry.input,
    output: entry.output,
    success: entry.success,
    createdAt: entry.createdAt.toISOString(),
  };
}

export function toAgentSummary(agent: Agent): AgentSummary {
  return {
    id: agent.id,
    name: agent.name,
    email: agent.email,
    active: agent.active,
  };
}

export function toCustomerSummary(customer: Customer): CustomerSummary {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    company: customer.company,
  };
}

export function toCommentSummary(
  comment: TicketComment & { author: Agent | null },
): CommentSummary {
  return {
    id: comment.id,
    body: comment.body,
    internal: comment.internal,
    authorName: comment.author?.name ?? null,
    createdAt: comment.createdAt.toISOString(),
  };
}

export function toTicketSummary(ticket: TicketWithRelations): TicketSummary {
  return {
    id: ticket.id,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    customer: toCustomerSummary(ticket.customer),
    assignee: ticket.assignee ? toAgentSummary(ticket.assignee) : null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

export function toTicketDetail(ticket: TicketWithRelations): TicketDetail {
  return {
    ...toTicketSummary(ticket),
    description: ticket.description,
    comments: (ticket.comments ?? []).map(toCommentSummary),
  };
}
