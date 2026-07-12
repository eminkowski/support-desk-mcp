import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiClient } from './api-client.js';

describe('createApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds GET URLs without duplicating the base URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tickets: [], count: 0 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({
      baseUrl: 'http://localhost:3001',
      apiKey: 'test-key',
    });

    await client.get('/api/tickets', { limit: 50 });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/tickets?limit=50',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ 'x-api-key': 'test-key' }),
      }),
    );
  });
});
