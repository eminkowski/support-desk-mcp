import type { Prisma } from '@prisma/client';
import type { RecordAuditBody, SearchTicketsInput } from '@support-desk/shared';
import { AUDIT_ACTORS } from '@support-desk/shared';
import { prisma } from '../lib/prisma.js';
import {
  toAgentSummary,
  toAuditEntry,
  toTicketDetail,
  toTicketSummary,
} from '../lib/serializers.js';

export type SearchTicketsParams = Required<Pick<SearchTicketsInput, 'limit'>> &
  Pick<SearchTicketsInput, 'query' | 'status' | 'priority' | 'assigneeId'>;

export async function listAgents(activeOnly: boolean) {
  const agents = await prisma.agent.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: 'asc' },
  });

  return agents.map(toAgentSummary);
}

export async function searchTickets(params: SearchTicketsParams) {
  const where: Prisma.TicketWhereInput = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.priority) {
    where.priority = params.priority;
  }

  if (params.assigneeId) {
    where.assigneeId = params.assigneeId;
  }

  if (params.query) {
    const q = params.query.trim();
    where.OR = [
      { subject: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { customer: { name: { contains: q, mode: 'insensitive' } } },
      { customer: { company: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      customer: true,
      assignee: true,
    },
    orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
    take: params.limit,
  });

  return tickets.map(toTicketSummary);
}

export async function getTicketById(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      customer: true,
      assignee: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return ticket ? toTicketDetail(ticket) : null;
}

export async function addTicketComment(input: {
  ticketId: string;
  body: string;
  internal?: boolean;
  authorId?: string;
}) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: input.ticketId },
    select: { id: true },
  });

  if (!ticket) {
    return null;
  }

  const comment = await prisma.ticketComment.create({
    data: {
      ticketId: input.ticketId,
      body: input.body,
      internal: input.internal ?? true,
      authorId: input.authorId,
    },
    include: { author: true },
  });

  await prisma.ticket.update({
    where: { id: input.ticketId },
    data: { updatedAt: new Date() },
  });

  return comment;
}

export async function listRecentAuditLogs(limit: number) {
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return entries.map(toAuditEntry);
}

export async function recordAuditLog(body: RecordAuditBody) {
  return prisma.auditLog.create({
    data: {
      toolName: body.toolName,
      actor: body.actor ?? AUDIT_ACTORS.MCP,
      input: body.input as Prisma.InputJsonValue,
      output: body.output === undefined ? undefined : (body.output as Prisma.InputJsonValue),
      success: body.success,
    },
  });
}
