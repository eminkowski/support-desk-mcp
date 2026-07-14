export function ticketSearchPath(ticketId: string): string {
  return `/?ticket=${encodeURIComponent(ticketId)}`;
}

export function ticketShareUrl(ticketId: string): string {
  if (typeof window === 'undefined') return ticketSearchPath(ticketId);
  return `${window.location.origin}${ticketSearchPath(ticketId)}`;
}
