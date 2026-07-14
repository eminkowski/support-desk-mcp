import { Command } from 'cmdk';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { useFilteredTickets } from '../hooks/useFilteredTickets.js';
import { focusCommentBox } from '../lib/comment-focus.js';
import {
  clearDemoSimulations,
  isDemoModeEnabled,
  setDemoSimulation,
} from '../lib/demo-simulations.js';
import { getSavedViewFilters } from '../lib/saved-views.js';
import { getSelectedRowIds } from '../lib/selection.js';
import { commandGroupClass, commandItemClass } from '../lib/styles.js';
import { ticketShareUrl } from '../lib/ticket-links.js';

export function CommandPalette() {
  const navigate = useNavigate();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    filters,
    setFilters,
    clearActiveView,
    selectedTicketId,
    setSelectedTicketId,
    rowSelection,
    savedViews,
    applySavedView,
  } = useWorkspace();

  const { tickets } = useFilteredTickets(filters);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setCommandPaletteOpen]);

  const selectedIds = getSelectedRowIds(rowSelection);
  const openHighFilters = getSavedViewFilters('open-high', savedViews);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 px-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close command palette"
        onClick={() => setCommandPaletteOpen(false)}
      />
      <Command
        className="relative z-10 w-full max-w-xl overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)] shadow-xl"
        label="Command palette"
      >
        <Command.Input
          placeholder="Search tickets, jump to pages, run actions…"
          className="w-full border-b border-[var(--color-line)] bg-transparent px-4 py-3 text-sm outline-none"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-sm text-[var(--color-muted)]">
            No matches.
          </Command.Empty>

          <Command.Group heading="Navigation" className={commandGroupClass}>
            <Command.Item
              className={commandItemClass}
              onSelect={() => {
                navigate('/');
                setCommandPaletteOpen(false);
              }}
            >
              Go to queue
            </Command.Item>
            <Command.Item
              className={commandItemClass}
              onSelect={() => {
                navigate('/activity');
                setCommandPaletteOpen(false);
              }}
            >
              Go to tool log
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Saved views" className={commandGroupClass}>
            {savedViews.map((view) => (
              <Command.Item
                key={view.id}
                className={commandItemClass}
                onSelect={() => {
                  applySavedView(view.id);
                  navigate('/');
                  setCommandPaletteOpen(false);
                }}
              >
                Apply view: {view.name}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Tickets" className={commandGroupClass}>
            {tickets.map((ticket) => (
              <Command.Item
                key={ticket.id}
                value={`${ticket.subject} ${ticket.customer.name} ${ticket.id}`}
                className={commandItemClass}
                onSelect={() => {
                  setSelectedTicketId(ticket.id);
                  navigate('/');
                  setCommandPaletteOpen(false);
                }}
              >
                <span className="font-medium">{ticket.subject}</span>
                <span className="ml-2 text-xs text-[var(--color-muted)]">
                  {ticket.customer.name}
                </span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Actions" className={commandGroupClass}>
            {selectedTicketId ? (
              <Command.Item
                className={commandItemClass}
                onSelect={() => {
                  void navigator.clipboard.writeText(ticketShareUrl(selectedTicketId));
                  setCommandPaletteOpen(false);
                }}
              >
                Copy link to selected ticket
              </Command.Item>
            ) : null}
            {selectedIds.length > 0 ? (
              <Command.Item
                className={commandItemClass}
                onSelect={() => {
                  void navigator.clipboard.writeText(selectedIds.join('\n'));
                  setCommandPaletteOpen(false);
                }}
              >
                Copy {selectedIds.length} selected ticket ID
                {selectedIds.length === 1 ? '' : 's'}
              </Command.Item>
            ) : null}
            {selectedTicketId ? (
              <Command.Item
                className={commandItemClass}
                onSelect={() => {
                  navigate('/');
                  setCommandPaletteOpen(false);
                  requestAnimationFrame(() => focusCommentBox());
                }}
              >
                Focus comment box
              </Command.Item>
            ) : null}
            {openHighFilters ? (
              <Command.Item
                className={commandItemClass}
                onSelect={() => {
                  clearActiveView();
                  setFilters(openHighFilters);
                  navigate('/');
                  setCommandPaletteOpen(false);
                }}
              >
                Filter: open high priority
              </Command.Item>
            ) : null}
          </Command.Group>

          {isDemoModeEnabled() ? (
            <Command.Group heading="Demo simulations" className={commandGroupClass}>
              <Command.Item
                className={commandItemClass}
                onSelect={() => {
                  setDemoSimulation('assistFailure', true);
                  setCommandPaletteOpen(false);
                }}
              >
                Simulate assistant unavailable
              </Command.Item>
              <Command.Item
                className={commandItemClass}
                onSelect={() => {
                  setDemoSimulation('saveFailure', true);
                  setCommandPaletteOpen(false);
                }}
              >
                Simulate save failure
              </Command.Item>
              <Command.Item
                className={commandItemClass}
                onSelect={() => {
                  setDemoSimulation('staleTicket', true);
                  setCommandPaletteOpen(false);
                }}
              >
                Simulate stale proposal
              </Command.Item>
              <Command.Item
                className={commandItemClass}
                onSelect={() => {
                  clearDemoSimulations();
                  setCommandPaletteOpen(false);
                }}
              >
                Clear demo simulations
              </Command.Item>
            </Command.Group>
          ) : null}
        </Command.List>
      </Command>
    </div>
  );
}
