import { Link } from 'react-router-dom';
import { AUDIT_CHANNEL_LABELS, auditChannelBadgeClass } from '../lib/audit-labels.js';
import { Badge } from './Badge.js';

type EntryPathsPanelProps = {
  variant?: 'full' | 'compact';
};

export function EntryPathsPanel({ variant = 'full' }: EntryPathsPanelProps) {
  if (variant === 'compact') {
    return (
      <p className="text-xs leading-relaxed text-[var(--color-muted)]">
        This panel uses{' '}
        <span className="font-mono text-[0.68rem] text-[var(--color-ink)]/80">REST</span> (
        <span className="font-mono text-[0.68rem]">/api/assist</span>). MCP clients use{' '}
        <span className="font-mono text-[0.68rem] text-[var(--color-ink)]/80">MCP</span> on port
        3002. Both show up in{' '}
        <Link
          to="/activity"
          className="text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          Tool log
        </Link>
        .
      </p>
    );
  }

  return (
    <section className="border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4 sm:px-5">
      <h3 className="text-sm font-semibold text-[var(--color-ink)]">Two entry points, one log</h3>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[var(--color-muted)]">
        The browser never speaks MCP. It calls the REST API directly. MCP clients connect to the MCP
        server, which calls the same API. Every tool invocation lands here.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-3">
          <Badge className={auditChannelBadgeClass('rest')}>{AUDIT_CHANNEL_LABELS.rest}</Badge>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]/85">
            Web UI and Ask the queue call <span className="font-mono text-[0.72rem]">/api/*</span>{' '}
            on port 3001.
          </p>
          <p className="mt-2 font-mono text-[0.68rem] leading-relaxed text-[var(--color-muted)]">
            actors: web-ui, web-assist
          </p>
        </div>

        <div className="border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-3">
          <Badge className={auditChannelBadgeClass('mcp')}>{AUDIT_CHANNEL_LABELS.mcp}</Badge>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]/85">
            MCP clients connect to{' '}
            <span className="font-mono text-[0.72rem]">localhost:3002/mcp</span>, then the MCP
            server calls the API.
          </p>
          <p className="mt-2 font-mono text-[0.68rem] leading-relaxed text-[var(--color-muted)]">
            actor: mcp-agent
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--color-muted)]">
        To exercise MCP: run{' '}
        <span className="font-mono text-[0.68rem] text-[var(--color-ink)]/75">
          pnpm dev:mcp:http
        </span>
        , call <span className="font-mono text-[0.68rem]">search_tickets</span> from MCP Inspector,
        then refresh this page. Setup details are in{' '}
        <span className="font-mono text-[0.68rem]">docs/mcp-clients.md</span> in the repo.
      </p>
    </section>
  );
}
