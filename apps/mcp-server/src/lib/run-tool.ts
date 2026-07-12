import type { ApiClient } from '@support-desk/shared';
import { recordToolAudit } from './format.js';

export type ToolTextResult = {
  text: string;
  output?: unknown;
};

export type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

export async function runTool<TArgs>(
  client: ApiClient,
  toolName: string,
  args: TArgs,
  handler: () => Promise<ToolTextResult>,
): Promise<ToolResult> {
  try {
    const result = await handler();
    await recordToolAudit(client, {
      toolName,
      input: args,
      output: result.output,
      success: true,
    });
    return { content: [{ type: 'text', text: result.text }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : `${toolName} failed`;
    await recordToolAudit(client, {
      toolName,
      input: args,
      success: false,
    });
    return toolError(message);
  }
}

export async function rejectTool<TArgs>(
  client: ApiClient,
  toolName: string,
  args: TArgs,
  message: string,
): Promise<ToolResult> {
  await recordToolAudit(client, {
    toolName,
    input: args,
    success: false,
  });
  return toolError(message);
}

function toolError(message: string): ToolResult {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}
