import type { AssistResponse, QuickSearch } from '@support-desk/shared';
import { ASSIST_SUGGESTIONS, findQuickSearch } from '@support-desk/shared';
import { executeAssistTool } from './assist-tool-runner.js';
import { isClaudeAssistEnabled, runClaudeAssist } from './claude-assist.service.js';

const NO_CLAUDE_REPLY =
  'Pick a quick search below. For open-ended questions, connect an MCP client or configure free-text on the API.';

export function getAssistSuggestions(): readonly string[] {
  return ASSIST_SUGGESTIONS;
}

export function getAssistStatus(): { claudeEnabled: boolean } {
  return { claudeEnabled: isClaudeAssistEnabled() };
}

async function runQuickSearch(search: QuickSearch, prompt: string): Promise<AssistResponse> {
  const result = await executeAssistTool(search.tool, search.input, prompt);
  return { reply: result.text, toolsUsed: [search.tool] };
}

export async function runAssist(message: string): Promise<AssistResponse> {
  const text = message.trim();
  if (!text) {
    return { reply: NO_CLAUDE_REPLY, toolsUsed: [] };
  }

  const quickSearch = findQuickSearch(text);
  if (quickSearch) {
    return runQuickSearch(quickSearch, text);
  }

  if (isClaudeAssistEnabled()) {
    return runClaudeAssist(text);
  }

  return { reply: NO_CLAUDE_REPLY, toolsUsed: [] };
}
