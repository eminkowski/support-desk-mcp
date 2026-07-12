export type HealthStatus = {
  status: 'ok' | 'degraded';
  database: 'ok' | 'unavailable';
};
