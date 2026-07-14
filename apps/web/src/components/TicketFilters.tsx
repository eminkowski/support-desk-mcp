import type { AgentSummary, TicketPriority, TicketStatus } from '@support-desk/shared';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { cn } from '../lib/cn.js';
import { PRIORITY_LABELS, STATUS_LABELS } from '../lib/labels.js';
import {
  fieldLabelClass,
  filterChipClass,
  filterFieldClass,
  metaLabelClass,
} from '../lib/styles.js';
import {
  buildFilterChips,
  EMPTY_TICKET_FILTERS,
  type TicketFilterValues,
  UNASSIGNED_FILTER_VALUE,
} from '../lib/ticket-filters.js';

export type { TicketFilterValues };

interface TicketFiltersProps {
  values: TicketFilterValues;
  agents: AgentSummary[];
  onChange: (values: TicketFilterValues) => void;
}

export function TicketFilters({ values, agents, onChange }: TicketFiltersProps) {
  const { savedViews, activeViewId, applySavedView, clearActiveView, setFilters } = useWorkspace();
  const chips = buildFilterChips(values, agents);

  function update<K extends keyof TicketFilterValues>(key: K, value: TicketFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function removeChip(chip: (typeof chips)[number]) {
    onChange({ ...values, [chip.key]: chip.clearValue });
  }

  function resetFilters() {
    clearActiveView();
    onChange(EMPTY_TICKET_FILTERS);
  }

  function onViewChange(viewId: string) {
    if (!viewId) {
      clearActiveView();
      setFilters(EMPTY_TICKET_FILTERS);
      return;
    }
    applySavedView(viewId);
  }

  const controlClass = cn(filterFieldClass, 'h-9');

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-[11rem] flex-1 grid gap-1">
          <span className={fieldLabelClass}>Search</span>
          <input
            className={cn(controlClass, 'w-full')}
            placeholder="Search tickets…"
            value={values.query}
            onChange={(event) => update('query', event.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className={fieldLabelClass}>Status</span>
          <select
            aria-label="Filter by status"
            className={cn(controlClass, 'min-w-[7.5rem]')}
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

        <label className="grid gap-1">
          <span className={fieldLabelClass}>Priority</span>
          <select
            aria-label="Filter by priority"
            className={cn(controlClass, 'min-w-[7.5rem]')}
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

        <label className="grid gap-1">
          <span className={fieldLabelClass}>Assignee</span>
          <select
            aria-label="Filter by assignee"
            className={cn(controlClass, 'min-w-[9rem]')}
            value={values.assigneeId}
            onChange={(event) => update('assigneeId', event.target.value)}
          >
            <option value="">Anyone</option>
            <option value={UNASSIGNED_FILTER_VALUE}>Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className={fieldLabelClass}>View</span>
          <select
            aria-label="Saved view"
            className={cn(controlClass, 'min-w-[9.5rem]')}
            value={activeViewId ?? ''}
            onChange={(event) => onViewChange(event.target.value)}
          >
            <option value="">All tickets</option>
            {savedViews.map((view) => (
              <option key={view.id} value={view.id}>
                {view.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={metaLabelClass}>Active</span>
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                aria-label={`Remove ${chip.label} filter`}
                className={filterChipClass}
                onClick={() => removeChip(chip)}
              >
                <span>{chip.label}</span>
                <span aria-hidden className="font-mono text-[0.72rem] leading-none opacity-60">
                  ×
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="shrink-0 text-xs text-[var(--color-muted)] underline-offset-2 transition hover:text-[var(--color-accent)] hover:underline"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
