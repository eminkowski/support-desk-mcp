import {
  AUDIT_CHANNEL_LABELS,
  auditChannelBadgeClass,
  getAuditActorDescription,
  getAuditChannel,
} from '../lib/audit-labels.js';
import { Badge } from './Badge.js';

export function ActorBadge({ actor }: { actor: string }) {
  const channel = getAuditChannel(actor);

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Badge className={auditChannelBadgeClass(channel)}>{AUDIT_CHANNEL_LABELS[channel]}</Badge>
      <span className="font-mono text-[0.72rem] text-[var(--color-muted)]">
        {getAuditActorDescription(actor)}
      </span>
    </span>
  );
}
