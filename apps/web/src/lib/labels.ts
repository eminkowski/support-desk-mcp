import type { TicketPriority, TicketStatus } from '@support-desk/shared';

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  WAITING: 'Waiting',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export function statusBadgeClass(status: TicketStatus): string {
  switch (status) {
    case 'OPEN':
      return 'bg-[#e4edf3] text-[#2f4f62]';
    case 'IN_PROGRESS':
      return 'bg-[#ebe4f2] text-[#4f3d66]';
    case 'WAITING':
      return 'bg-[#f4ead8] text-[#6b4f1f]';
    case 'RESOLVED':
      return 'bg-[#e2efe8] text-[#2f5d50]';
    case 'CLOSED':
      return 'bg-[#ece8e2] text-[#5c564f]';
  }
}

export function priorityBadgeClass(priority: TicketPriority): string {
  switch (priority) {
    case 'LOW':
      return 'bg-[#ece8e2] text-[#5c564f]';
    case 'MEDIUM':
      return 'bg-[#e4edf3] text-[#2f4f62]';
    case 'HIGH':
      return 'bg-[#f4ead8] text-[#8a5a18]';
    case 'URGENT':
      return 'bg-[#f3e0dc] text-[#8f3f2f]';
  }
}

export function priorityStripeClass(priority: TicketPriority): string {
  switch (priority) {
    case 'LOW':
      return 'bg-[#c8c2b8]';
    case 'MEDIUM':
      return 'bg-[#7a9eb0]';
    case 'HIGH':
      return 'bg-[#c9923f]';
    case 'URGENT':
      return 'bg-[#b4533c]';
  }
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value));
}
