import type { ProposedCommentAction, TicketDetail } from '@support-desk/shared';

export function isProposalStale(action: ProposedCommentAction, ticket: TicketDetail): boolean {
  return (
    ticket.updatedAt !== action.ticketUpdatedAt ||
    ticket.comments.length !== action.ticketCommentCount
  );
}
