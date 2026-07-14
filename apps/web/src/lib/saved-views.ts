import type { TicketFilterValues } from './ticket-filters.js';
import { EMPTY_TICKET_FILTERS, UNASSIGNED_FILTER_VALUE } from './ticket-filters.js';

export type SavedView = {
  id: string;
  name: string;
  filters: TicketFilterValues;
};

const STORAGE_KEY = 'support-desk:saved-views:v2';

export const DEFAULT_SAVED_VIEWS: SavedView[] = [
  {
    id: 'open-high',
    name: 'Open, high priority',
    filters: { ...EMPTY_TICKET_FILTERS, status: 'OPEN', priority: 'HIGH' },
  },
  {
    id: 'unassigned',
    name: 'Open, unassigned',
    filters: { ...EMPTY_TICKET_FILTERS, status: 'OPEN', assigneeId: UNASSIGNED_FILTER_VALUE },
  },
];

export function getSavedViewFilters(
  viewId: string,
  views: SavedView[] = DEFAULT_SAVED_VIEWS,
): TicketFilterValues | null {
  const view = views.find((item) => item.id === viewId);
  return view?.filters ?? null;
}

export function loadSavedViews(): SavedView[] {
  if (typeof window === 'undefined') return DEFAULT_SAVED_VIEWS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVED_VIEWS;
    const parsed = JSON.parse(raw) as SavedView[];
    return parsed.length > 0 ? parsed : DEFAULT_SAVED_VIEWS;
  } catch {
    return DEFAULT_SAVED_VIEWS;
  }
}
