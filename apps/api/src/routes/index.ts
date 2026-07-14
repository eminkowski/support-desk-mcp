import {
  AUDIT_ACTORS,
  agentsQuerySchema,
  assistRequestSchema,
  auditOutputFromTicket,
  auditQuerySchema,
  createCommentBodySchema,
  recordAuditBodySchema,
  searchTicketsQuerySchema,
  TOOL_NAMES,
  ticketIdParamSchema,
} from '@support-desk/shared';
import type { FastifyInstance } from 'fastify';
import { getHealthStatus } from '../lib/health.js';
import { sendNotFound } from '../lib/http-errors.js';
import { toAuditEntry, toCommentSummary } from '../lib/serializers.js';
import { requireApiKey } from '../middleware/api-key.js';
import { getAssistStatus, runAssist } from '../services/assist.service.js';
import {
  addTicketComment,
  getTicketById,
  listAgents,
  listRecentAuditLogs,
  recordAuditLog,
  searchTickets,
} from '../services/ticket.service.js';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    const health = await getHealthStatus();
    if (health.status === 'degraded') {
      return reply.code(503).send(health);
    }
    return health;
  });

  app.register(
    async (api) => {
      api.addHook('preHandler', requireApiKey);

      api.get('/agents', async (request) => {
        const query = agentsQuerySchema.parse(request.query);
        return { agents: await listAgents(query.activeOnly) };
      });

      api.get('/tickets', async (request) => {
        const query = searchTicketsQuerySchema.parse(request.query);
        const tickets = await searchTickets(query);
        return { tickets, count: tickets.length };
      });

      api.get('/tickets/:ticketId', async (request, reply) => {
        const params = ticketIdParamSchema.parse(request.params);
        const ticket = await getTicketById(params.ticketId);

        if (!ticket) {
          return sendNotFound(reply, `Ticket ${params.ticketId} not found`);
        }

        return { ticket };
      });

      api.post('/tickets/:ticketId/comments', async (request, reply) => {
        const params = ticketIdParamSchema.parse(request.params);
        const body = createCommentBodySchema.parse(request.body);

        const ticket = await getTicketById(params.ticketId);
        if (!ticket) {
          return sendNotFound(reply, `Ticket ${params.ticketId} not found`);
        }

        const comment = await addTicketComment({
          ticketId: params.ticketId,
          body: body.body,
          internal: body.internal,
          authorId: body.authorId,
        });

        if (!comment) {
          return sendNotFound(reply, `Ticket ${params.ticketId} not found`);
        }

        await recordAuditLog({
          toolName: TOOL_NAMES.ADD_COMMENT,
          actor: AUDIT_ACTORS.WEB_UI,
          input: { ticketId: params.ticketId, body: body.body },
          output: { ...auditOutputFromTicket(ticket), commentId: comment.id },
          success: true,
        });

        return reply.code(201).send({
          comment: toCommentSummary(comment),
        });
      });

      api.get('/audit', async (request) => {
        const query = auditQuerySchema.parse(request.query);
        const entries = await listRecentAuditLogs(query.limit);
        return { entries, count: entries.length };
      });

      api.post('/audit', async (request, reply) => {
        const body = recordAuditBodySchema.parse(request.body);
        const entry = await recordAuditLog(body);

        return reply.code(201).send({
          entry: toAuditEntry(entry),
        });
      });

      api.get('/assist/status', async () => getAssistStatus());

      api.post('/assist', async (request) => {
        const body = assistRequestSchema.parse(request.body);
        return runAssist(body.message, body.ticketId);
      });
    },
    { prefix: '/api' },
  );
}
