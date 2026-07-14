import type { HealthStatus } from '@support-desk/shared';
import { API_BASE_URL } from './api-config.js';

export type { HealthStatus };

export async function fetchHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json() as Promise<HealthStatus>;
}

export function formatApiUnavailableMessage(health: HealthStatus | null): string {
  if (health?.database === 'unavailable') {
    return 'Postgres is not reachable. Run pnpm db:up or pnpm db:watch, then refresh.';
  }
  return `Check that the API is running at ${API_BASE_URL}.`;
}

/** @deprecated Use formatApiUnavailableMessage */
export const formatQueueUnavailableMessage = formatApiUnavailableMessage;
