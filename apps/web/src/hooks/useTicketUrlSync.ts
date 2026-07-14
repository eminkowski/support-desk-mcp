import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ticketSearchPath } from '../lib/ticket-links.js';

export function useTicketUrlSync(
  selectedTicketId: string | null,
  setSelectedTicketId: (ticketId: string | null) => void,
) {
  const { ticketId: routeTicketId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (routeTicketId) {
      setSelectedTicketId(routeTicketId);
      navigate('/', { replace: true });
    }
  }, [routeTicketId, setSelectedTicketId, navigate]);

  useEffect(() => {
    if (routeTicketId) return;
    const nextUrl = selectedTicketId ? ticketSearchPath(selectedTicketId) : '/';
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [selectedTicketId, routeTicketId]);
}
