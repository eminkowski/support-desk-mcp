# MCP client setup

If MCP clients, servers, and transports are new to you, start with [How MCP fits together](./how-mcp-works.md).

This project is wired for **Claude** as the MCP client. The web app and Ask the queue work without Claude. MCP is optional.

The server exposes the same five tools over two transports:

| Transport | Endpoint | Typical use |
|-----------|----------|-------------|
| stdio | spawned process | Claude Code or Claude Desktop on your machine |
| Streamable HTTP | `http://host:3002/mcp` | Claude via a remote connector, or local testing with MCP Inspector |

Both require the API on port 3001. The MCP process calls that API; it does not talk to Postgres directly.

## Streamable HTTP (Claude remote)

Start:

```bash
pnpm dev:api
pnpm dev:mcp:http
```

URL: `http://localhost:3002/mcp`

Authentication (either works):

```
Authorization: Bearer local-dev-api-key
```

```
x-api-key: local-dev-api-key
```

### Claude connector

In Claude, add a custom connector (Settings > Connectors) pointing at your MCP URL. For local dev you may need a tunnel (ngrok, Cloudflare Tunnel) so Claude can reach `localhost`. Use HTTPS and a real API key in production.

Example connector URL pattern:

```text
https://your-host.example.com/mcp
```

With header:

```text
Authorization: Bearer your-api-key
```

### Local testing without Claude

[MCP Inspector](https://github.com/modelcontextprotocol/inspector) is useful to verify the HTTP endpoint before wiring Claude:

1. Connect to `http://localhost:3002/mcp`.
2. Add header `Authorization: Bearer local-dev-api-key`.
3. Call `search_tickets` with `{ "status": "OPEN", "limit": 10 }`.
4. Check Tool log in the web app.

## stdio (Claude local)

For local work, Claude Code or Claude Desktop starts the MCP server as a child process.

### Claude Code

From the repo root, with the API running (`pnpm dev:api`):

```bash
claude mcp add support-desk \
  --transport stdio \
  --env API_BASE_URL=http://localhost:3001 \
  --env API_KEY=local-dev-api-key \
  -- node scripts/run-mcp.mjs
```

Then ask Claude to search tickets or read a thread. Calls show up in Tool log as `mcp-agent`.

### Claude Desktop

Edit `claude_desktop_config.json` (on macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`). Use an absolute path to `scripts/run-mcp.mjs`:

```json
{
  "mcpServers": {
    "support-desk-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/support-desk-mcp/scripts/run-mcp.mjs"],
      "env": {
        "API_BASE_URL": "http://localhost:3001",
        "API_KEY": "local-dev-api-key"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

Try in chat:

- "Search for open high priority tickets"
- "Show me the ticket about password reset"
- "List active support agents"

## Tools

| Tool | Writes? | Notes |
|------|---------|-------|
| `search_tickets` | no | Filter by text, status, priority, assignee |
| `get_ticket` | no | Full ticket + comments |
| `list_agents` | no | Active agents by default |
| `add_comment` | yes | Needs `confirmed: true` |
| `get_recent_agent_activity` | no | Audit log entries |

All tool calls are stored in the audit log and visible in the web UI under Tool log.

## Optional: Cursor (local only)

If you use Cursor, copy `.cursor/mcp.json.example` to `.cursor/mcp.json` in the project root (or merge into `~/.cursor/mcp.json`). Use only one config source to avoid duplicate server entries.

```json
{
  "mcpServers": {
    "support-desk-mcp": {
      "command": "node",
      "args": ["scripts/run-mcp.mjs"],
      "env": {
        "API_BASE_URL": "http://localhost:3001",
        "API_KEY": "local-dev-api-key"
      }
    }
  }
}
```

1. `pnpm dev:api`
2. Restart Cursor after editing MCP config.
3. Enable `support-desk-mcp` under Settings > Tools > MCP.

Same stdio server and tools as Claude. Tool log looks identical.
