# Walkthrough

Two paths through the project. An MCP client is optional for the web-only path.

## Path 1: Web only

```bash
pnpm setup
pnpm dev
```

Postgres in a dedicated terminal (optional, with logs):

```bash
pnpm db:watch
```

Open http://localhost:5173

1. **Tickets** - filter by status or priority, search by subject.
2. **Ask the queue** - try "Show open tickets" or "Any high priority tickets?". Replies show in the panel; the same call is logged under Tool log.
3. Open a ticket - read the thread, add an internal comment. That write also shows up in Tool log as `add_comment` from `web-ui`.
4. **Tool log** - confirm each row shows filters or the question, result count, and ticket subjects where applicable.

Health check (includes database):

```bash
curl http://localhost:3001/health
```

Returns `{ "status": "ok", "database": "ok" }`. If Postgres is down, status is `503` with `"database": "unavailable"`.

## Path 2: MCP over HTTP

Start the full stack:

```bash
pnpm setup
pnpm run --parallel dev:api dev:web dev:mcp:http
```

MCP endpoint: http://localhost:3002/mcp

Health: `curl http://localhost:3002/health`

Auth: send the same API key as Bearer token or `x-api-key` header.

```bash
curl -H "Authorization: Bearer local-dev-api-key" http://localhost:3002/health
```

Wire an MCP client to this URL via a custom connector (see [mcp-clients.md](./mcp-clients.md)). For local dev you may need a tunnel so a remote client can reach your machine.

### MCP Inspector

Useful to verify the HTTP endpoint before connecting a client:

1. Install and run [MCP Inspector](https://github.com/modelcontextprotocol/inspector).
2. Connect to `http://localhost:3002/mcp`.
3. Add header `Authorization: Bearer local-dev-api-key`.
4. Call `search_tickets` with `{ "status": "OPEN", "limit": 10 }`.
5. Refresh Tool log in the web app. You should see the call from `mcp-agent` with ticket subjects listed.

### stdio transport

See [mcp-clients.md](./mcp-clients.md) for Claude Code or Claude Desktop setup. Tool log looks the same no matter which transport you use.

## Highlights

- Support queue with filters and ticket detail.
- MCP tools backed by the same REST API and Zod schemas.
- Tool log as an audit trail (query, filters, counts, ticket subjects).
- Writes gated (`confirmed` on MCP, internal comments from the web UI).
- Two transports: stdio for local clients, Streamable HTTP for remote connectors.

## Screenshots

1. Ticket list with filters applied.
2. Ask the queue with a question and reply visible.
3. Tool log row showing `"Show open tickets", open -> 3 tickets` plus subject lines.
4. MCP client connected to the queue (stdio or HTTP), with Tool log showing the matching call.

Save images under `docs/screenshots/`.
