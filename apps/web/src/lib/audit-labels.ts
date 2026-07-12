import { AUDIT_ACTORS } from '@support-desk/shared';

export type AuditChannel = 'mcp' | 'rest';

export function getAuditChannel(actor: string): AuditChannel {
  return actor === AUDIT_ACTORS.MCP ? 'mcp' : 'rest';
}

export const AUDIT_CHANNEL_LABELS: Record<AuditChannel, string> = {
  mcp: 'MCP',
  rest: 'REST',
};

export function auditChannelBadgeClass(channel: AuditChannel): string {
  return channel === 'mcp' ? 'bg-[#ebe4f2] text-[#4f3d66]' : 'bg-[#e4edf3] text-[#2f4f62]';
}

export function getAuditActorDescription(actor: string): string {
  switch (actor) {
    case AUDIT_ACTORS.MCP:
      return 'MCP client or Inspector';
    case AUDIT_ACTORS.WEB_ASSIST:
      return 'Ask the queue';
    case AUDIT_ACTORS.WEB_UI:
      return 'Web form';
    default:
      return actor;
  }
}

export const AUDIT_ACTOR_LEGEND = [
  { actor: AUDIT_ACTORS.WEB_ASSIST, channel: 'rest' as const },
  { actor: AUDIT_ACTORS.WEB_UI, channel: 'rest' as const },
  { actor: AUDIT_ACTORS.MCP, channel: 'mcp' as const },
] as const;
