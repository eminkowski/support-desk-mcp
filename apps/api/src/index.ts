import 'dotenv/config';

import { loadEnv } from './config/env.js';
import { createServer } from './server.js';

async function main(): Promise<void> {
  const env = loadEnv();
  const app = await createServer();

  try {
    await app.listen({ port: env.API_PORT, host: env.API_HOST });
    app.log.info(`API listening on http://${env.API_HOST}:${env.API_PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
