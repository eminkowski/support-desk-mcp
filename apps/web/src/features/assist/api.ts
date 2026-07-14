import type { AssistResponse, AssistStatusResponse } from '@support-desk/shared';
import { apiGet, apiPost } from '../../lib/api.js';
import { getDemoSimulations } from '../../lib/demo-simulations.js';

export function fetchAssistStatus(): Promise<AssistStatusResponse> {
  return apiGet<AssistStatusResponse>('/api/assist/status');
}

export function askQueue(message: string, ticketId?: string): Promise<AssistResponse> {
  if (getDemoSimulations().assistFailure) {
    return Promise.reject(
      new Error('Simulated assist unavailable: the assist service is offline.'),
    );
  }

  return apiPost<AssistResponse>('/api/assist', {
    message,
    ...(ticketId ? { ticketId } : {}),
  });
}
