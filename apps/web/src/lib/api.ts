import { createApiClient } from '@support-desk/shared';
import { API_BASE_URL } from './api-config.js';

const client = createApiClient({
  baseUrl: API_BASE_URL,
  apiKey: import.meta.env.VITE_API_KEY ?? 'local-dev-api-key',
});

export const apiGet = client.get.bind(client);
export const apiPost = client.post.bind(client);
