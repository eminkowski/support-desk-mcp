import { useNavigate } from 'react-router-dom';
import { AuditTimeline } from '../components/AuditTimeline.js';
import { EntryPathsPanel } from '../components/EntryPathsPanel.js';
import { StatusMessage } from '../components/StatusMessage.js';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { useAuditLog } from '../features/tickets/queries.js';
import { formatApiUnavailableMessage } from '../lib/health.js';

export function ActivityPage() {
  const navigate = useNavigate();
  const { setSelectedTicketId } = useWorkspace();
  const auditQuery = useAuditLog(50);

  if (auditQuery.isLoading) {
    return <StatusMessage title="Loading tool log" />;
  }

  if (auditQuery.isError) {
    return (
      <StatusMessage title="Log unavailable">
        {auditQuery.error.message} {formatApiUnavailableMessage(null)}
      </StatusMessage>
    );
  }

  const entries = auditQuery.data?.entries ?? [];

  return (
    <div className="space-y-5">
      <header className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">Tool log</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          Unified audit trail for REST and MCP activity. Proposed writes, confirmations, reads, and
          blocked MCP calls are all visible here. Refreshes every 10 seconds.
        </p>
      </header>

      <EntryPathsPanel />

      <AuditTimeline
        entries={entries}
        onOpenTicket={(ticketId) => {
          setSelectedTicketId(ticketId);
          navigate('/');
        }}
      />
    </div>
  );
}
