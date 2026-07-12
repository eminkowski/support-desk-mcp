import { z } from 'zod';

export const ticketStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']);

export const ticketPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export type TicketStatus = z.infer<typeof ticketStatusSchema>;
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

export const ticketSearchTextField = z.string().trim().min(1).max(200);
export const ticketIdField = z.string().cuid();
export const ticketSearchLimitField = z.coerce.number().int().min(1).max(50).default(20);
export const auditLimitField = z.coerce.number().int().min(1).max(100).default(20);

export const searchTicketsInputSchema = z.object({
  query: ticketSearchTextField.optional().describe('Search subject, description, or customer name'),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  assigneeId: ticketIdField.optional(),
  limit: ticketSearchLimitField,
});

export const getTicketInputSchema = z.object({
  ticketId: ticketIdField.describe('Ticket ID'),
});

export const listAgentsInputSchema = z.object({
  activeOnly: z.boolean().default(true),
});

export const addCommentInputSchema = z.object({
  ticketId: ticketIdField.describe('Ticket ID'),
  body: z.string().trim().min(1).max(5000).describe('Comment text to append to the ticket'),
  confirmed: z.boolean().describe('Must be true to persist a comment. Prevents accidental writes.'),
});

export const recentActivityInputSchema = z.object({
  limit: auditLimitField,
});

export const createCommentBodySchema = z.object({
  body: z.string().trim().min(1).max(5000),
  internal: z.boolean().default(true),
  authorId: z.string().cuid().optional(),
});

export const agentSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  active: z.boolean(),
});

export const customerSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  company: z.string().nullable(),
});

export const commentSummarySchema = z.object({
  id: z.string(),
  body: z.string(),
  internal: z.boolean(),
  authorName: z.string().nullable(),
  createdAt: z.string(),
});

export const ticketSummarySchema = z.object({
  id: z.string(),
  subject: z.string(),
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  customer: customerSummarySchema,
  assignee: agentSummarySchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ticketDetailSchema = ticketSummarySchema.extend({
  description: z.string(),
  comments: z.array(commentSummarySchema),
});

export const auditEntrySchema = z.object({
  id: z.string(),
  toolName: z.string(),
  actor: z.string(),
  input: z.unknown().nullable(),
  output: z.unknown().nullable(),
  success: z.boolean(),
  createdAt: z.string(),
});

export type SearchTicketsInput = z.infer<typeof searchTicketsInputSchema>;
export type GetTicketInput = z.infer<typeof getTicketInputSchema>;
export type ListAgentsInput = z.infer<typeof listAgentsInputSchema>;
export type AddCommentInput = z.infer<typeof addCommentInputSchema>;
export type RecentActivityInput = z.infer<typeof recentActivityInputSchema>;
export type AgentSummary = z.infer<typeof agentSummarySchema>;
export type CommentSummary = z.infer<typeof commentSummarySchema>;
export type CustomerSummary = z.infer<typeof customerSummarySchema>;
export type TicketSummary = z.infer<typeof ticketSummarySchema>;
export type TicketDetail = z.infer<typeof ticketDetailSchema>;
export type AuditEntry = z.infer<typeof auditEntrySchema>;
