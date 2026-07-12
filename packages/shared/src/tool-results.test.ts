import { describe, expect, it } from 'vitest';
import { TOOL_MESSAGES } from './constants.js';
import {
  buildGetTicketResult,
  buildListAgentsResult,
  buildSearchTicketsResult,
} from './tool-results.js';

const sampleTicket = {
  id: 'clticket123',
  subject: 'Password reset email not arriving',
  status: 'OPEN' as const,
  priority: 'HIGH' as const,
  customer: { id: 'c1', name: 'Acme', email: 'a@acme.com', company: null },
  assignee: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  description: 'User cannot log in.',
  comments: [],
};

describe('buildSearchTicketsResult', () => {
  it('returns compact list text', () => {
    const result = buildSearchTicketsResult([sampleTicket], 'compact');
    expect(result.text).toContain('Found 1 ticket:');
    expect(result.text).toContain('Password reset email not arriving');
    expect(result.output).toEqual({
      count: 1,
      tickets: [{ id: 'clticket123', subject: 'Password reset email not arriving' }],
    });
  });

  it('returns shared empty message', () => {
    const result = buildSearchTicketsResult([], 'verbose');
    expect(result.text).toBe(TOOL_MESSAGES.noTickets);
  });
});

describe('buildGetTicketResult', () => {
  it('returns not found text when ticket is missing', () => {
    const result = buildGetTicketResult(null, 'missing');
    expect(result.text).toContain('No ticket found with ID missing');
  });
});

describe('buildListAgentsResult', () => {
  it('returns active-only empty message', () => {
    const result = buildListAgentsResult([], { activeOnly: true, style: 'compact' });
    expect(result.text).toBe(TOOL_MESSAGES.noActiveAgents);
  });
});
