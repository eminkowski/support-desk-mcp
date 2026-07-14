import type { ProposedAction } from '@support-desk/shared';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ActionConfirmResult } from '../lib/action-lifecycle.js';
import { getSavedViewFilters, loadSavedViews, type SavedView } from '../lib/saved-views.js';
import {
  loadVisibleColumns,
  persistVisibleColumns,
  type TicketTableColumnId,
} from '../lib/table-columns.js';
import { EMPTY_TICKET_FILTERS, type TicketFilterValues } from '../lib/ticket-filters.js';

type WorkspaceContextValue = {
  selectedTicketId: string | null;
  setSelectedTicketId: (ticketId: string | null) => void;
  focusedTicketId: string | null;
  setFocusedTicketId: (ticketId: string | null) => void;
  filters: TicketFilterValues;
  setFilters: (filters: TicketFilterValues) => void;
  clearActiveView: () => void;
  savedViews: SavedView[];
  activeViewId: string | null;
  applySavedView: (viewId: string) => void;
  rowSelection: Record<string, boolean>;
  setRowSelection: (selection: Record<string, boolean>) => void;
  visibleColumns: TicketTableColumnId[];
  setVisibleColumns: (columns: TicketTableColumnId[]) => void;
  proposedAction: ProposedAction | null;
  setProposedAction: (action: ProposedAction | null) => void;
  actionConfirmResult: ActionConfirmResult | null;
  setActionConfirmResult: (result: ActionConfirmResult | null) => void;
  clearActionFlow: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [focusedTicketId, setFocusedTicketId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilterValues>(EMPTY_TICKET_FILTERS);
  const [savedViews] = useState<SavedView[]>(() => loadSavedViews());
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [visibleColumns, setVisibleColumnsState] = useState<TicketTableColumnId[]>(() =>
    loadVisibleColumns(),
  );
  const [proposedAction, setProposedActionState] = useState<ProposedAction | null>(null);
  const [actionConfirmResult, setActionConfirmResult] = useState<ActionConfirmResult | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const clearActionFlow = useCallback(() => {
    setProposedActionState(null);
    setActionConfirmResult(null);
  }, []);

  const setProposedAction = useCallback((action: ProposedAction | null) => {
    if (action) {
      setActionConfirmResult(null);
    }
    setProposedActionState(action);
  }, []);

  const previousTicketIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (previousTicketIdRef.current === selectedTicketId) return;
    previousTicketIdRef.current = selectedTicketId;
    clearActionFlow();
  }, [selectedTicketId, clearActionFlow]);

  const clearActiveView = useCallback(() => {
    setActiveViewId(null);
  }, []);

  const applySavedView = useCallback(
    (viewId: string) => {
      const viewFilters = getSavedViewFilters(viewId, savedViews);
      if (!viewFilters) return;
      setFilters(viewFilters);
      setActiveViewId(viewId);
      setRowSelection({});
    },
    [savedViews],
  );

  const setVisibleColumns = useCallback((columns: TicketTableColumnId[]) => {
    setVisibleColumnsState(columns);
    persistVisibleColumns(columns);
  }, []);

  const value = useMemo(
    () => ({
      selectedTicketId,
      setSelectedTicketId,
      focusedTicketId,
      setFocusedTicketId,
      filters,
      setFilters,
      clearActiveView,
      savedViews,
      activeViewId,
      applySavedView,
      rowSelection,
      setRowSelection,
      visibleColumns,
      setVisibleColumns,
      proposedAction,
      setProposedAction,
      actionConfirmResult,
      setActionConfirmResult,
      clearActionFlow,
      commandPaletteOpen,
      setCommandPaletteOpen,
    }),
    [
      selectedTicketId,
      focusedTicketId,
      filters,
      savedViews,
      activeViewId,
      applySavedView,
      clearActiveView,
      rowSelection,
      visibleColumns,
      setVisibleColumns,
      proposedAction,
      setProposedAction,
      actionConfirmResult,
      clearActionFlow,
      commandPaletteOpen,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}
