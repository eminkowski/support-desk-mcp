import type { HealthStatus } from '@support-desk/shared';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export type { HealthStatus };

export async function fetchHealth(): Promise<HealthStatus> {
  const response = await fetch(`${baseUrl}/health`);
  return response.json() as Promise<HealthStatus>;
}

export function formatQueueUnavailableMessage(health: HealthStatus | null): string {
  if (health?.database === 'unavailable') {
    return 'Postgres is not reachable. Run pnpm db:up or pnpm db:watch, then refresh.';
  }
  return 'Check that the API is running on port 3001.';
}
