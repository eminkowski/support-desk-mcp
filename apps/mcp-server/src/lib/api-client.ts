import { type ApiClient, createApiClient } from '@support-desk/shared';
import { loadMcpEnv } from '../config/env.js';

export function createMcpApiClient(): ApiClient {
  const env = loadMcpEnv();
  return createApiClient({
    baseUrl: env.API_BASE_URL,
    apiKey: env.API_KEY,
  });
}
