import type { ApiClient, RecordAuditBody } from '@support-desk/shared';
import { AUDIT_ACTORS } from '@support-desk/shared';

export async function recordToolAudit(
  client: ApiClient,
  entry: Pick<RecordAuditBody, 'toolName' | 'input' | 'output' | 'success'> & {
    actor?: string;
  },
): Promise<void> {
  try {
    await client.post('/api/audit', {
      toolName: entry.toolName,
      actor: entry.actor ?? AUDIT_ACTORS.MCP,
      input: entry.input,
      output: entry.output,
      success: entry.success,
    });
  } catch (error) {
    console.error('Failed to record audit log:', error);
  }
}
