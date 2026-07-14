import type { AuditEntry } from '@support-desk/shared';
import { TOOL_NAMES } from '@support-desk/shared';

const TOOL_LABELS: Record<string, string> = {
  [TOOL_NAMES.SEARCH_TICKETS]: 'Searched tickets',
  [TOOL_NAMES.GET_TICKET]: 'Opened ticket',
  [TOOL_NAMES.LIST_AGENTS]: 'Listed agents',
  [TOOL_NAMES.ADD_COMMENT]: 'Saved internal comment',
  [TOOL_NAMES.PROPOSE_COMMENT]: 'Proposed internal comment',
  [TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY]: 'Checked activity',
};

export function formatToolLabel(toolName: string): string {
  return TOOL_LABELS[toolName] ?? toolName.replaceAll('_', ' ');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Product-facing summary for the ticket activity strip and portfolio UI. */
export function formatActivityDetail(entry: AuditEntry): string {
  const input = isRecord(entry.input) ? entry.input : null;
  const output = isRecord(entry.output) ? entry.output : null;

  if (!entry.success) {
    return 'Action failed';
  }

  switch (entry.toolName) {
    case TOOL_NAMES.PROPOSE_COMMENT: {
      const preview =
        typeof output?.bodyPreview === 'string'
          ? output.bodyPreview
          : typeof input?.body === 'string'
            ? input.body
            : '';
      return preview ? truncate(preview, 72) : 'Awaiting confirmation';
    }
    case TOOL_NAMES.ADD_COMMENT: {
      const body = typeof input?.body === 'string' ? input.body.trim() : '';
      return body ? truncate(body, 72) : 'Comment saved';
    }
    case TOOL_NAMES.SEARCH_TICKETS: {
      const count = typeof output?.count === 'number' ? output.count : null;
      return count === null
        ? 'Search completed'
        : `${count} ticket${count === 1 ? '' : 's'} matched`;
    }
    case TOOL_NAMES.GET_TICKET:
      return typeof output?.subject === 'string' ? output.subject : 'Ticket loaded';
    case TOOL_NAMES.LIST_AGENTS: {
      const count = typeof output?.count === 'number' ? output.count : null;
      return count === null ? 'Agents loaded' : `${count} agent${count === 1 ? '' : 's'}`;
    }
    default:
      return '';
  }
}

function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}
