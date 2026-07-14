import { useWorkspace } from '../context/WorkspaceContext.js';
import { isActionConfirmForTicket } from '../lib/action-lifecycle.js';

export function WorkspaceStatusAnnouncer() {
  const { proposedAction, actionConfirmResult, selectedTicketId } = useWorkspace();

  let message = '';
  if (proposedAction && proposedAction.ticketId === selectedTicketId) {
    message = 'Proposed internal comment ready for review.';
  } else if (isActionConfirmForTicket(actionConfirmResult, selectedTicketId)) {
    message = 'Internal comment saved to this ticket.';
  }

  if (!message) return null;

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
