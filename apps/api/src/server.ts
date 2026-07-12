import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import { loadEnv } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { errorHandler } from './middleware/error-handler.js';
import { registerRoutes } from './routes/index.js';

export async function createServer(): Promise<FastifyInstance> {
  const env = loadEnv();

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                ignore: 'pid,hostname',
                singleLine: true,
              },
            }
          : undefined,
    },
  });

  app.setErrorHandler(errorHandler);

  await app.register(helmet);
  await app.register(cors, { origin: true });
  await registerRoutes(app);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
