import type { HealthStatus } from '@support-desk/shared';
import { prisma } from './prisma.js';

export type { HealthStatus };

export async function getHealthStatus(): Promise<HealthStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'ok' };
  } catch {
    return { status: 'degraded', database: 'unavailable' };
  }
}
