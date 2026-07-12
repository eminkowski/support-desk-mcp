import type { FastifyReply } from 'fastify';

export function sendNotFound(reply: FastifyReply, message: string) {
  return reply.code(404).send({
    error: 'NOT_FOUND',
    message,
  });
}
