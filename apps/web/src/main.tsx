import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import { AppLayout } from './components/AppLayout.js';
import './index.css';
import { useWorkspace } from './context/WorkspaceContext.js';
import { ActivityPage } from './pages/ActivityPage.js';
import { WorkspacePage } from './pages/WorkspacePage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function TicketSearchRedirect() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticket');
  const { setSelectedTicketId } = useWorkspace();

  useEffect(() => {
    if (ticketId) {
      setSelectedTicketId(ticketId);
    }
  }, [ticketId, setSelectedTicketId]);

  return <WorkspacePage />;
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<TicketSearchRedirect />} />
            <Route path="tickets/:ticketId" element={<WorkspacePage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
