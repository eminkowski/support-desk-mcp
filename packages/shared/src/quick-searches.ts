import { TOOL_NAMES } from './constants.js';
import type { ListAgentsInput, RecentActivityInput, SearchTicketsInput } from './schemas.js';

export type QuickSearch =
  | {
      label: string;
      tool: typeof TOOL_NAMES.SEARCH_TICKETS;
      input: SearchTicketsInput;
    }
  | {
      label: string;
      tool: typeof TOOL_NAMES.LIST_AGENTS;
      input: ListAgentsInput;
    }
  | {
      label: string;
      tool: typeof TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY;
      input: RecentActivityInput;
    };

export const QUICK_SEARCHES: QuickSearch[] = [
  {
    label: 'Show open tickets',
    tool: TOOL_NAMES.SEARCH_TICKETS,
    input: { status: 'OPEN', limit: 10 },
  },
  {
    label: 'Any high priority tickets?',
    tool: TOOL_NAMES.SEARCH_TICKETS,
    input: { priority: 'HIGH', limit: 10 },
  },
  {
    label: 'Who are the active agents?',
    tool: TOOL_NAMES.LIST_AGENTS,
    input: { activeOnly: true },
  },
  {
    label: 'Tell me about the password reset ticket',
    tool: TOOL_NAMES.SEARCH_TICKETS,
    input: { query: 'password', limit: 10 },
  },
];

export const ASSIST_SUGGESTIONS = QUICK_SEARCHES.map((search) => search.label);

export function findQuickSearch(message: string): QuickSearch | undefined {
  return QUICK_SEARCHES.find((search) => search.label === message.trim());
}
