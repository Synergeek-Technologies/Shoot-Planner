import { describe, it, expect } from 'vitest';
import { shootCreateSchema } from '@/lib/schemas/shoot';

describe('shootCreateSchema', () => {
  it('requires brand_id, title, scheduled_at', () => {
    expect(shootCreateSchema.safeParse({}).success).toBe(false);
  });
  it('accepts valid payload', () => {
    expect(shootCreateSchema.safeParse({
      brand_id: 'b6f6c0b2-9f9a-4a1e-9b1a-8f8f8f8f8f8f',
      title: 'Spring launch',
      scheduled_at: '2026-05-01T10:00:00Z',
    }).success).toBe(true);
  });
  it('rejects invalid brand_id (not uuid)', () => {
    expect(shootCreateSchema.safeParse({
      brand_id: 'not-uuid', title: 't', scheduled_at: '2026-05-01T10:00:00Z',
    }).success).toBe(false);
  });
});
