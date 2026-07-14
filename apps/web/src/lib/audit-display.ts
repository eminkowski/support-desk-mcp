import type { AuditEntry } from '@support-desk/shared';
import { TOOL_NAMES } from '@support-desk/shared';

export const WRITE_TOOLS = new Set<string>([TOOL_NAMES.ADD_COMMENT, TOOL_NAMES.PROPOSE_COMMENT]);

export function isWriteTool(toolName: string): boolean {
  return WRITE_TOOLS.has(toolName);
}

export function isBlockedWrite(entry: AuditEntry): boolean {
  if (entry.toolName !== TOOL_NAMES.ADD_COMMENT || entry.success) return false;
  const input = entry.input;
  return (
    typeof input === 'object' && input !== null && 'confirmed' in input && input.confirmed === false
  );
}

export function getAuditTicketId(entry: AuditEntry): string | null {
  if (typeof entry.input !== 'object' || entry.input === null) return null;
  const ticketId = (entry.input as Record<string, unknown>).ticketId;
  return typeof ticketId === 'string' ? ticketId : null;
}

export function auditEntryMatchesTicket(entry: AuditEntry, ticketId: string): boolean {
  return getAuditTicketId(entry) === ticketId;
}

export function ticketActivityEntries(
  entries: AuditEntry[],
  ticketId: string,
  limit = 5,
): AuditEntry[] {
  return entries.filter((entry) => auditEntryMatchesTicket(entry, ticketId)).slice(0, limit);
}
