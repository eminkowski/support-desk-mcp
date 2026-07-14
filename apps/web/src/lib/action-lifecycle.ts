export type ActionConfirmResult = {
  ticketId: string;
  kind: 'add_comment';
  body: string;
  confirmedAt: number;
};

export function isActionConfirmForTicket(
  result: ActionConfirmResult | null,
  ticketId: string | null,
): result is ActionConfirmResult {
  return Boolean(result && ticketId && result.ticketId === ticketId);
}
