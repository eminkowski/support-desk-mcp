import { createApiClient } from '@support-desk/shared';

const client = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001',
  apiKey: import.meta.env.VITE_API_KEY ?? 'local-dev-api-key',
});

export const apiGet = client.get.bind(client);
export const apiPost = client.post.bind(client);
