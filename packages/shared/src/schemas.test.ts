import { describe, expect, it } from 'vitest';
import { searchTicketsInputSchema } from './schemas.js';

describe('shared schemas', () => {
  it('caps search ticket limit', () => {
    const result = searchTicketsInputSchema.safeParse({ limit: 100 });
    expect(result.success).toBe(false);
  });

  it('defaults search ticket limit', () => {
    const result = searchTicketsInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
    }
  });
});
