import { z } from 'zod';
import {
  auditLimitField,
  ticketIdField,
  ticketPrioritySchema,
  ticketSearchLimitField,
  ticketSearchTextField,
  ticketStatusSchema,
} from './schemas.js';

export const emptyQueryValue = (value: unknown): unknown =>
  value === '' || value === undefined ? undefined : value;

function optionalQueryField<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(emptyQueryValue, schema.optional());
}

export const ticketIdParamSchema = z.object({
  ticketId: ticketIdField,
});

export const searchTicketsQuerySchema = z.object({
  query: optionalQueryField(ticketSearchTextField),
  status: optionalQueryField(ticketStatusSchema),
  priority: optionalQueryField(ticketPrioritySchema),
  assigneeId: optionalQueryField(ticketIdField),
  limit: ticketSearchLimitField,
});

export const auditQuerySchema = z.object({
  limit: auditLimitField,
});

export const agentsQuerySchema = z.object({
  activeOnly: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((value) => value !== 'false'),
});

export const recordAuditBodySchema = z.object({
  toolName: z.string().min(1).max(100),
  actor: z.string().min(1).max(100).optional(),
  input: z.unknown().default(null),
  output: z.unknown().optional(),
  success: z.boolean(),
});

export type RecordAuditBody = z.infer<typeof recordAuditBodySchema>;

export const assistRequestSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

export type AssistRequest = z.infer<typeof assistRequestSchema>;
