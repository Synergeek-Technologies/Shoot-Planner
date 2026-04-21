import { describe, it, expect } from 'vitest';
import { brandCreateSchema, brandUpdateSchema } from '@/lib/schemas/brand';

describe('brandCreateSchema', () => {
  it('requires a name', () => {
    expect(brandCreateSchema.safeParse({ name: '' }).success).toBe(false);
  });
  it('accepts a minimum payload', () => {
    expect(brandCreateSchema.safeParse({ name: 'Acme' }).success).toBe(true);
  });
  it('rejects oversized names', () => {
    expect(brandCreateSchema.safeParse({ name: 'x'.repeat(201) }).success).toBe(false);
  });
});

describe('brandUpdateSchema', () => {
  it('allows partial updates', () => {
    expect(brandUpdateSchema.safeParse({ description: 'new desc' }).success).toBe(true);
  });
});
