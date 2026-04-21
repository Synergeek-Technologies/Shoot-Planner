import { describe, it, expect } from 'vitest';
import { reelCreateSchema, reelUpdateSchema, REEL_STATUSES } from '@/lib/schemas/reel';

describe('reelCreateSchema', () => {
  it('requires shoot_id and title', () => {
    expect(reelCreateSchema.safeParse({}).success).toBe(false);
  });
  it('accepts minimum payload', () => {
    expect(reelCreateSchema.safeParse({
      shoot_id: 'b6f6c0b2-9f9a-4a1e-9b1a-8f8f8f8f8f8f', title: 'Reel A',
    }).success).toBe(true);
  });
});

describe('reelUpdateSchema', () => {
  it('accepts valid status', () => {
    expect(reelUpdateSchema.safeParse({ status: 'shot' }).success).toBe(true);
  });
  it('rejects unknown status', () => {
    expect(reelUpdateSchema.safeParse({ status: 'bogus' }).success).toBe(false);
  });
});

describe('REEL_STATUSES', () => {
  it('has 5 statuses', () => {
    expect(REEL_STATUSES).toHaveLength(5);
  });
});
