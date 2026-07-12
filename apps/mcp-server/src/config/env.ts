import { z } from 'zod';

const envSchema = z.object({
  API_BASE_URL: z.string().url().default('http://localhost:3001'),
  API_KEY: z.string().min(8),
  MCP_HTTP_HOST: z.string().default('0.0.0.0'),
  MCP_HTTP_PORT: z.coerce.number().int().min(1).max(65535).default(3002),
});

export type McpEnv = z.infer<typeof envSchema>;

export function loadMcpEnv(): McpEnv {
  return envSchema.parse(process.env);
}
