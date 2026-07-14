import { useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext.js';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export function useQueueKeyboard(sortedTicketIds: string[]) {
  const {
    focusedTicketId,
    setFocusedTicketId,
    selectedTicketId,
    setSelectedTicketId,
    commandPaletteOpen,
    setCommandPaletteOpen,
    setProposedAction,
  } = useWorkspace();

  useEffect(() => {
    if (sortedTicketIds.length === 0) return;

    if (!focusedTicketId || !sortedTicketIds.includes(focusedTicketId)) {
      const fallback =
        selectedTicketId && sortedTicketIds.includes(selectedTicketId)
          ? selectedTicketId
          : sortedTicketIds[0];
      if (fallback !== focusedTicketId) {
        setFocusedTicketId(fallback);
      }
    }
  }, [focusedTicketId, selectedTicketId, setFocusedTicketId, sortedTicketIds]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;

      if (event.key === 'Escape') {
        if (commandPaletteOpen) {
          event.preventDefault();
          setCommandPaletteOpen(false);
          return;
        }
        if (selectedTicketId) {
          event.preventDefault();
          setSelectedTicketId(null);
          setProposedAction(null);
        }
        return;
      }

      if (commandPaletteOpen) return;

      const currentIndex = focusedTicketId ? sortedTicketIds.indexOf(focusedTicketId) : -1;

      if (event.key === 'ArrowDown' || event.key === 'j') {
        event.preventDefault();
        const nextIndex =
          currentIndex < 0 ? 0 : Math.min(currentIndex + 1, sortedTicketIds.length - 1);
        setFocusedTicketId(sortedTicketIds[nextIndex] ?? null);
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'k') {
        event.preventDefault();
        const nextIndex = currentIndex < 0 ? 0 : Math.max(currentIndex - 1, 0);
        setFocusedTicketId(sortedTicketIds[nextIndex] ?? null);
        return;
      }

      if (event.key === 'Enter' && focusedTicketId) {
        event.preventDefault();
        setSelectedTicketId(focusedTicketId);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    commandPaletteOpen,
    focusedTicketId,
    selectedTicketId,
    setCommandPaletteOpen,
    setFocusedTicketId,
    setProposedAction,
    setSelectedTicketId,
    sortedTicketIds,
  ]);
}
