import type { AssistResponse, AssistStatusResponse } from '@support-desk/shared';
import { apiGet, apiPost } from '../../lib/api.js';

export function fetchAssistStatus(): Promise<AssistStatusResponse> {
  return apiGet<AssistStatusResponse>('/api/assist/status');
}

export function askQueue(message: string): Promise<AssistResponse> {
  return apiPost<AssistResponse>('/api/assist', { message });
}
