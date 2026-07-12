import { ActorBadge } from '../components/ActorBadge.js';
import { AuditLogTable } from '../components/AuditLogTable.js';
import { EntryPathsPanel } from '../components/EntryPathsPanel.js';
import { StatusMessage } from '../components/StatusMessage.js';
import { useAuditLog } from '../features/tickets/queries.js';
import { AUDIT_ACTOR_LEGEND } from '../lib/audit-labels.js';

export function ActivityPage() {
  const auditQuery = useAuditLog(50);

  if (auditQuery.isLoading) {
    return <StatusMessage title="Loading tool log" />;
  }

  if (auditQuery.isError) {
    return (
      <StatusMessage title="Log unavailable">
        {auditQuery.error.message} Check that the API is running on port 3001.
      </StatusMessage>
    );
  }

  const entries = auditQuery.data?.entries ?? [];

  return (
    <div className="space-y-5">
      <header className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">Tool log</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          Shared audit trail for REST (this app) and MCP clients. Each row shows the transport, tool
          name, inputs, and results. Refreshes every 10 seconds.
        </p>
      </header>

      <EntryPathsPanel />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] text-[var(--color-muted)]">
        <span className="tracking-wide uppercase">Legend</span>
        {AUDIT_ACTOR_LEGEND.map(({ actor }) => (
          <ActorBadge key={actor} actor={actor} />
        ))}
      </div>

      <AuditLogTable entries={entries} />
    </div>
  );
}
