import Anthropic from '@anthropic-ai/sdk';
import type { Tool } from '@anthropic-ai/sdk/resources/messages/messages.mjs';
import type { AssistResponse } from '@support-desk/shared';
import {
  getTicketInputSchema,
  listAgentsInputSchema,
  recentActivityInputSchema,
  searchTicketsInputSchema,
  TOOL_NAMES,
  type ToolName,
} from '@support-desk/shared';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { loadEnv } from '../config/env.js';
import { executeAssistTool } from './assist-tool-runner.js';

const READ_TOOLS: Tool[] = [
  {
    name: TOOL_NAMES.SEARCH_TICKETS,
    description: 'Search support tickets by text, status, priority, or assignee.',
    input_schema: zodToJsonSchema(searchTicketsInputSchema, {
      $refStrategy: 'none',
    }) as Tool['input_schema'],
  },
  {
    name: TOOL_NAMES.GET_TICKET,
    description: 'Fetch a single ticket with customer context and comment thread.',
    input_schema: zodToJsonSchema(getTicketInputSchema, {
      $refStrategy: 'none',
    }) as Tool['input_schema'],
  },
  {
    name: TOOL_NAMES.LIST_AGENTS,
    description: 'List support agents available for assignment.',
    input_schema: zodToJsonSchema(listAgentsInputSchema, {
      $refStrategy: 'none',
    }) as Tool['input_schema'],
  },
  {
    name: TOOL_NAMES.GET_RECENT_AGENT_ACTIVITY,
    description: 'List recent tool calls recorded in the audit log.',
    input_schema: zodToJsonSchema(recentActivityInputSchema, {
      $refStrategy: 'none',
    }) as Tool['input_schema'],
  },
];

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

function isToolName(name: string): name is ToolName {
  return (Object.values(TOOL_NAMES) as string[]).includes(name);
}

export function isClaudeAssistEnabled(): boolean {
  return Boolean(loadEnv().ANTHROPIC_API_KEY);
}

export async function runClaudeAssist(message: string, ticketId?: string): Promise<AssistResponse> {
  const env = loadEnv();
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const toolsUsed: string[] = [];

  type MessageParam = Anthropic.MessageParam;
  const messages: MessageParam[] = [{ role: 'user', content: message }];

  for (let step = 0; step < 5; step += 1) {
    const response = await client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 1024,
      system:
        'You help support agents query a ticket queue. Use the provided tools for ticket data. Keep replies concise.' +
        (ticketId
          ? ` The agent has ticket ${ticketId} selected. If they ask to draft or add an internal comment, tell them to use "Draft internal comment" so the UI can review the write first.`
          : ''),
      tools: READ_TOOLS,
      messages,
    });

    if (response.stop_reason === 'end_turn') {
      return {
        reply: extractText(response) || 'Done.',
        toolsUsed: [...new Set(toolsUsed)],
      };
    }

    if (response.stop_reason !== 'tool_use') {
      return {
        reply: extractText(response) || 'Could not complete the request.',
        toolsUsed: [...new Set(toolsUsed)],
      };
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;
      if (!isToolName(block.name)) {
        throw new Error(`Unknown tool requested: ${block.name}`);
      }

      toolsUsed.push(block.name);
      const result = await executeAssistTool(block.name, block.input, message);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: result.text,
      });
    }

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });
  }

  return {
    reply: 'Hit the tool call limit for this question. Try a shorter request.',
    toolsUsed: [...new Set(toolsUsed)],
  };
}
