import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof ZodError) {
    reply.code(400).send({
      error: 'VALIDATION_ERROR',
      message: error.issues.map((issue) => issue.message).join('; '),
    });
    return;
  }

  if (error.statusCode) {
    reply.code(error.statusCode).send({
      error: 'REQUEST_ERROR',
      message: error.message,
    });
    return;
  }

  reply.code(500).send({
    error: 'INTERNAL_ERROR',
    message: 'Unexpected server error',
  });
}
