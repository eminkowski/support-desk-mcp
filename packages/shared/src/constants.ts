export const TOOL_NAMES = {
  SEARCH_TICKETS: 'search_tickets',
  GET_TICKET: 'get_ticket',
  LIST_AGENTS: 'list_agents',
  ADD_COMMENT: 'add_comment',
  PROPOSE_COMMENT: 'propose_comment',
  GET_RECENT_AGENT_ACTIVITY: 'get_recent_agent_activity',
} as const;

export const DRAFT_COMMENT_LABEL = 'Draft internal comment';

export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES];

export const AUDIT_ACTORS = {
  MCP: 'mcp-agent',
  WEB_ASSIST: 'web-assist',
  WEB_UI: 'web-ui',
} as const;

export const UNASSIGNED_LABEL = 'Unassigned';

export const TOOL_MESSAGES = {
  noTickets: 'No tickets matched the search.',
  noAgents: 'No agents found.',
  noActiveAgents: 'No active agents found.',
  noActivity: 'No tool activity recorded yet.',
} as const;
