import Anthropic from '@anthropic-ai/sdk';
import type { AssistResponse, ProposedCommentAction, TicketDetail } from '@support-desk/shared';
import {
  AUDIT_ACTORS,
  DRAFT_COMMENT_LABEL,
  PROPOSED_ACTION_TYPES,
  TOOL_NAMES,
} from '@support-desk/shared';
import { loadEnv } from '../config/env.js';
import { isClaudeAssistEnabled } from './claude-assist.service.js';
import { recordAuditLog } from './ticket.service.js';

const DRAFT_COMMENT_PATTERNS = [
  /^draft\s+(an?\s+)?internal\s+comment/i,
  /^propose\s+(an?\s+)?comment/i,
  /^add\s+(an?\s+)?internal\s+(note|comment)/i,
];

function isDraftCommentIntent(message: string): boolean {
  const text = message.trim();
  return (
    text === DRAFT_COMMENT_LABEL || DRAFT_COMMENT_PATTERNS.some((pattern) => pattern.test(text))
  );
}

function fallbackCommentBody(ticket: TicketDetail): string {
  const subject = ticket.subject.toLowerCase();
  const description = ticket.description.toLowerCase();
  const haystack = `${subject} ${description}`;

  if (
    haystack.includes('chart') ||
    haystack.includes('dashboard') ||
    haystack.includes('analytics')
  ) {
    return 'Initial investigation points to delayed analytics processing rather than missing customer data. Reviewing the affected jobs and will update once the backlog has cleared.';
  }
  if (
    haystack.includes('duplicate') ||
    haystack.includes('notification') ||
    haystack.includes('email')
  ) {
    return 'Reviewing the invoice notification workflow for duplicate sends. Checking recent event deliveries and retry activity, and will update the ticket with findings.';
  }
  if (
    haystack.includes('export') ||
    haystack.includes('missing transaction') ||
    (haystack.includes('billing') && haystack.includes('ledger'))
  ) {
    return 'Checking billing export jobs and customer ledger for the missing transactions. Will note findings here once the report run completes.';
  }
  if (haystack.includes('rate') || haystack.includes('api')) {
    return 'Seeing elevated request volume against the shared API limit. Cap is still in place; coordinating a temporary raise and will confirm once traffic stabilizes.';
  }
  if (haystack.includes('password') || haystack.includes('login') || haystack.includes('auth')) {
    return 'Reproduced the failed login path against the auth service. No customer-facing reply yet — documenting recovery steps for the on-call agent.';
  }
  if (haystack.includes('sso') || haystack.includes('saml') || haystack.includes('okta')) {
    return 'Collecting the SAML metadata and attribute requirements for SSO setup. Will attach the checklist for the customer once internal review is complete.';
  }
  return 'Reviewed the latest details and queued follow-up with the assigned agent. Will note the next customer-facing step once investigation completes.';
}

async function draftCommentWithClaude(ticket: TicketDetail, prompt: string): Promise<string> {
  const env = loadEnv();
  if (!env.ANTHROPIC_API_KEY) {
    return fallbackCommentBody(ticket);
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 400,
    system:
      'Draft a concise internal support comment for the team. One or two sentences. No greeting or sign-off. Plain text only.',
    messages: [
      {
        role: 'user',
        content: [
          `Ticket: ${ticket.subject}`,
          `Customer: ${ticket.customer.name}`,
          `Status: ${ticket.status}, Priority: ${ticket.priority}`,
          `Description: ${ticket.description}`,
          ticket.comments.length > 0
            ? `Recent thread:\n${ticket.comments
                .slice(-3)
                .map((comment) => `- ${comment.authorName ?? 'System'}: ${comment.body}`)
                .join('\n')}`
            : 'No comments yet.',
          prompt.trim() === DRAFT_COMMENT_LABEL ? '' : `Agent request: ${prompt}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    ],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  return text || fallbackCommentBody(ticket);
}

export function isProposeCommentRequest(message: string, ticketId?: string): boolean {
  return Boolean(ticketId) && isDraftCommentIntent(message);
}

export async function runProposeComment(
  ticket: TicketDetail,
  prompt: string,
): Promise<AssistResponse> {
  const body = isClaudeAssistEnabled()
    ? await draftCommentWithClaude(ticket, prompt)
    : fallbackCommentBody(ticket);

  const proposedAction: ProposedCommentAction = {
    type: PROPOSED_ACTION_TYPES.ADD_COMMENT,
    ticketId: ticket.id,
    ticketSubject: ticket.subject,
    body,
    ticketUpdatedAt: ticket.updatedAt,
    ticketCommentCount: ticket.comments.length,
  };

  await recordAuditLog({
    toolName: TOOL_NAMES.PROPOSE_COMMENT,
    actor: AUDIT_ACTORS.WEB_ASSIST,
    input: { ticketId: ticket.id, body, message: prompt },
    output: {
      proposed: true,
      ticketId: ticket.id,
      subject: ticket.subject,
      bodyPreview: body.slice(0, 120),
    },
    success: true,
  });

  return {
    reply: 'Review the proposed internal comment below. Edit or confirm before it is saved.',
    toolsUsed: [TOOL_NAMES.PROPOSE_COMMENT],
    proposedAction,
  };
}
