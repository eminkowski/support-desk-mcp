import type { TicketPriority, TicketStatus } from '@support-desk/shared';
import type { ReactNode } from 'react';
import {
  PRIORITY_LABELS,
  priorityBadgeClass,
  STATUS_LABELS,
  statusBadgeClass,
} from '../lib/labels.js';

export function Badge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[0.68rem] font-medium tracking-wide uppercase ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge className={statusBadgeClass(status)}>{STATUS_LABELS[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge className={priorityBadgeClass(priority)}>{PRIORITY_LABELS[priority]}</Badge>;
}
