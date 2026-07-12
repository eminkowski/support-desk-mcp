import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mcpDir = path.join(root, 'apps', 'mcp-server');
const tsx = path.join(mcpDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');

const child = spawn(process.execPath, [tsx, 'src/index.ts'], {
  cwd: mcpDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3001',
    API_KEY: process.env.API_KEY ?? 'local-dev-api-key',
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
