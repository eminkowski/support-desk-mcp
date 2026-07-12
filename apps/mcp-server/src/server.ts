import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpApiClient } from './lib/api-client.js';
import { registerTools } from './tools/register-tools.js';

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'support-desk-mcp',
    version: '0.1.0',
  });

  registerTools(server, createMcpApiClient());

  return server;
}
