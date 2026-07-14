export type TicketTableColumnId =
  | 'select'
  | 'subject'
  | 'customer'
  | 'status'
  | 'priority'
  | 'assignee'
  | 'updated';

export const TICKET_TABLE_COLUMNS: Array<{ id: TicketTableColumnId; label: string }> = [
  { id: 'select', label: 'Select' },
  { id: 'subject', label: 'Subject' },
  { id: 'customer', label: 'Customer' },
  { id: 'status', label: 'Status' },
  { id: 'priority', label: 'Priority' },
  { id: 'assignee', label: 'Assignee' },
  { id: 'updated', label: 'Updated' },
];

const STORAGE_KEY = 'support-desk:table-columns';

export const DEFAULT_VISIBLE_COLUMNS: TicketTableColumnId[] = [
  'select',
  'subject',
  'customer',
  'status',
  'priority',
  'assignee',
  'updated',
];

export function loadVisibleColumns(): TicketTableColumnId[] {
  if (typeof window === 'undefined') return DEFAULT_VISIBLE_COLUMNS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VISIBLE_COLUMNS;
    return JSON.parse(raw) as TicketTableColumnId[];
  } catch {
    return DEFAULT_VISIBLE_COLUMNS;
  }
}

export function persistVisibleColumns(columns: TicketTableColumnId[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
}
