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

## Demo flow (one story)

Record or screenshot this sequence:

1. Open http://localhost:5173
2. Choose **View → Open, high priority** — confirm filter chips appear
3. Select a ticket — split-pane detail and activity strip load
4. Press **⌘K** — search or jump (optional, good for video)
5. Click **Draft internal comment** in Ask the queue
6. Review the proposed action — preview, safety copy, edit if needed
7. **Confirm and save** — comment appears in thread
8. Check **Recent activity** in the detail pane
9. Open **Tool log** — `propose_comment` and `add_comment` in timeline

Screenshot capture: [screenshot-guide.md](./screenshot-guide.md)

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

- Dense queue workspace: TanStack Table, saved views, split-pane detail, command palette.
- AI action review: draft internal comments require human confirmation before write.
- MCP tools backed by the same REST API and Zod schemas.
- Tool log as a timeline audit trail (actor, transport, read/write, expandable details).
- Writes gated (`confirmed` on MCP, review card on web assist, direct form on web UI).
- Two transports: stdio for local clients, Streamable HTTP for remote connectors.

## Screenshots

1. Ticket list with filters applied.
2. Ask the queue with a question and reply visible.
3. Tool log row showing `"Show open tickets", open -> 3 tickets` plus subject lines.
4. MCP client connected to the queue (stdio or HTTP), with Tool log showing the matching call.

Save images under `docs/screenshots/`.
