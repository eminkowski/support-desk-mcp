import type { FastifyReply, FastifyRequest } from 'fastify';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export async function requireApiKey(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const headerKey = request.headers['x-api-key'];
  const apiKey = typeof headerKey === 'string' ? headerKey : undefined;

  if (!apiKey || apiKey !== env.API_KEY) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Valid x-api-key header is required',
    });
  }
}
