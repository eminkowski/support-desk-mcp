import 'dotenv/config';

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { loadMcpEnv } from './config/env.js';
import { createMcpServer } from './server.js';

function readApiKey(req: IncomingMessage): string | undefined {
  const authorization = req.headers.authorization;
  if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length);
  }

  const headerKey = req.headers['x-api-key'];
  return typeof headerKey === 'string' ? headerKey : undefined;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function handleOptions(res: ServerResponse): void {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, x-api-key, Mcp-Session-Id, MCP-Protocol-Version',
  });
  res.end();
}

async function main(): Promise<void> {
  const env = loadMcpEnv();

  const httpServer = createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      handleOptions(res);
      return;
    }

    const path = req.url?.split('?')[0];
    if (path === '/health') {
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    if (path !== '/mcp') {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    const apiKey = readApiKey(req);
    if (!apiKey || apiKey !== env.API_KEY) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    // Stateless Streamable HTTP requires a fresh transport (and server) per request.
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const server = createMcpServer();

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
      res.on('close', () => {
        void transport.close();
        void server.close();
      });
    } catch (error) {
      console.error('MCP HTTP request failed:', error);
      if (!res.headersSent) {
        sendJson(res, 500, {
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  httpServer.listen(env.MCP_HTTP_PORT, env.MCP_HTTP_HOST, () => {
    console.error(`MCP HTTP listening on http://${env.MCP_HTTP_HOST}:${env.MCP_HTTP_PORT}/mcp`);
  });
}

main().catch((error) => {
  console.error('MCP HTTP server failed to start:', error);
  process.exit(1);
});
