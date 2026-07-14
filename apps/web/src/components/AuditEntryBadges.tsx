import type { AuditEntry } from '@support-desk/shared';
import { isBlockedWrite, isWriteTool } from '../lib/audit-display.js';
import { ActorBadge } from './ActorBadge.js';
import { Badge } from './Badge.js';

export function AuditEntryBadges({ entry }: { entry: AuditEntry }) {
  const isWrite = isWriteTool(entry.toolName);
  const blocked = isBlockedWrite(entry);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ActorBadge actor={entry.actor} />
      <Badge className={isWrite ? 'bg-[#f4ead8] text-[#6b4f1f]' : 'bg-[#e2efe8] text-[#2f5d50]'}>
        {isWrite ? 'write' : 'read'}
      </Badge>
      {blocked ? (
        <Badge className="bg-[#f3e0dc] text-[#8f3f2f]">blocked</Badge>
      ) : entry.success ? (
        <Badge className="bg-[#e2efe8] text-[#2f5d50]">ok</Badge>
      ) : (
        <Badge className="bg-[#f3e0dc] text-[#8f3f2f]">err</Badge>
      )}
    </div>
  );
}
