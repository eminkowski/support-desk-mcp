import type { AgentSummary, TicketPriority, TicketStatus } from '@support-desk/shared';
import { PRIORITY_LABELS, STATUS_LABELS } from '../lib/labels.js';

export interface TicketFilterValues {
  query: string;
  status: TicketStatus | '';
  priority: TicketPriority | '';
  assigneeId: string;
}

interface TicketFiltersProps {
  values: TicketFilterValues;
  agents: AgentSummary[];
  onChange: (values: TicketFilterValues) => void;
}

const fieldClass =
  'w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]';

export function TicketFilters({ values, agents, onChange }: TicketFiltersProps) {
  function update<K extends keyof TicketFilterValues>(key: K, value: TicketFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }

  const hasFilters = Boolean(values.query || values.status || values.priority || values.assigneeId);

  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="flex flex-wrap items-end gap-3 border-b border-[var(--color-line)] px-3 py-3">
        <label className="min-w-[12rem] flex-1 grid gap-1 text-sm">
          <span className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
            Search
          </span>
          <input
            className={fieldClass}
            placeholder="subject, customer, description"
            value={values.query}
            onChange={(event) => update('query', event.target.value)}
          />
        </label>
        <label className="grid min-w-[8rem] gap-1 text-sm">
          <span className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
            Status
          </span>
          <select
            className={fieldClass}
            value={values.status}
            onChange={(event) => update('status', event.target.value as TicketStatus | '')}
          >
            <option value="">Any</option>
            {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-[8rem] gap-1 text-sm">
          <span className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
            Priority
          </span>
          <select
            className={fieldClass}
            value={values.priority}
            onChange={(event) => update('priority', event.target.value as TicketPriority | '')}
          >
            <option value="">Any</option>
            {(Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-[10rem] flex-1 gap-1 text-sm">
          <span className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
            Assignee
          </span>
          <select
            className={fieldClass}
            value={values.assigneeId}
            onChange={(event) => update('assigneeId', event.target.value)}
          >
            <option value="">Anyone</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!hasFilters}
          className="shrink-0 border border-[var(--color-line)] px-3 py-2 text-sm text-[var(--color-muted)] transition enabled:hover:border-[var(--color-accent)] enabled:hover:text-[var(--color-accent)] disabled:cursor-default disabled:opacity-35"
          onClick={() => onChange({ query: '', status: '', priority: '', assigneeId: '' })}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
