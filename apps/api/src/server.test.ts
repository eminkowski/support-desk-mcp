import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer } from '../src/server.js';

const API_KEY = process.env.API_KEY ?? 'local-dev-api-key';

describe('API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.API_KEY = API_KEY;
    process.env.DATABASE_URL ??= 'postgresql://supportdesk:supportdesk@localhost:5433/supportdesk';
    app = await createServer();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns health without auth', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', database: 'ok' });
  });

  it('rejects missing API key', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/agents' });
    expect(response.statusCode).toBe(401);
  });

  it('lists agents with API key', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/agents',
      headers: { 'x-api-key': API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { agents: unknown[] };
    expect(body.agents.length).toBeGreaterThan(0);
  });

  it('lists tickets when limit is a query string', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/tickets?limit=50',
      headers: { 'x-api-key': API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { tickets: unknown[]; count: number };
    expect(body.tickets.length).toBeGreaterThan(0);
    expect(body.count).toBe(body.tickets.length);
  });
});
