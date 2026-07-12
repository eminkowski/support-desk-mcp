import { prisma } from './prisma.js';

export type HealthStatus = {
  status: 'ok' | 'degraded';
  database: 'ok' | 'unavailable';
};

export async function getHealthStatus(): Promise<HealthStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'ok' };
  } catch {
    return { status: 'degraded', database: 'unavailable' };
  }
}
