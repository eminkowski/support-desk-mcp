import { describe, expect, it } from 'vitest';
import {
  formatAuditEntryDetail,
  formatAuditInput,
  formatAuditOutput,
  formatAuditResultItems,
} from './audit-format.js';

describe('formatAuditInput', () => {
  it('formats search_tickets with filters', () => {
    expect(
      formatAuditInput('search_tickets', {
        message: 'Show open tickets',
        status: 'OPEN',
        limit: 10,
      }),
    ).toBe('"Show open tickets", open');
  });

  it('formats get_ticket', () => {
    expect(formatAuditInput('get_ticket', { ticketId: 'clticket123' })).toBe('ticket clticket123');
  });

  it('formats list_agents', () => {
    expect(formatAuditInput('list_agents', { activeOnly: true })).toBe('active agents');
  });
});

describe('formatAuditOutput', () => {
  it('formats ticket counts', () => {
    expect(formatAuditOutput('search_tickets', { count: 3 })).toBe('3 tickets');
    expect(formatAuditOutput('search_tickets', { count: 1 })).toBe('1 ticket');
  });

  it('formats ticket subject for get_ticket', () => {
    expect(
      formatAuditOutput('get_ticket', {
        ticketId: 'clticket123',
        subject: 'Password reset email not arriving',
      }),
    ).toBe('Password reset email not arriving');
  });

  it('formats agent counts', () => {
    expect(formatAuditOutput('list_agents', { count: 2 })).toBe('2 agents');
  });
});

describe('formatAuditResultItems', () => {
  it('lists ticket subjects', () => {
    expect(
      formatAuditResultItems({
        toolName: 'search_tickets',
        output: {
          count: 2,
          tickets: [
            { id: 'a', subject: 'Password reset email not arriving' },
            { id: 'b', subject: 'SSO setup guide' },
          ],
        },
        success: true,
      }),
    ).toEqual(['Password reset email not arriving', 'SSO setup guide']);
  });
});

describe('formatAuditEntryDetail', () => {
  it('joins input and output', () => {
    expect(
      formatAuditEntryDetail({
        toolName: 'search_tickets',
        input: { message: 'Any high priority tickets?', priority: 'HIGH', limit: 10 },
        output: { count: 2 },
        success: true,
      }),
    ).toBe('"Any high priority tickets?", high priority -> 2 tickets');
  });

  it('shows failed without output', () => {
    expect(
      formatAuditEntryDetail({
        toolName: 'get_ticket',
        input: { ticketId: 'missing' },
        output: null,
        success: false,
      }),
    ).toBe('ticket missing -> failed');
  });
});
