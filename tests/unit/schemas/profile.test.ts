import { describe, it, expect } from 'vitest';
import { signInSchema, signUpSchema } from '@/lib/schemas/profile';

describe('signInSchema', () => {
  it('accepts valid email + password', () => {
    expect(signInSchema.safeParse({ email: 'a@b.com', password: 'secret12' }).success).toBe(true);
  });
  it('rejects short passwords', () => {
    expect(signInSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(false);
  });
  it('rejects invalid emails', () => {
    expect(signInSchema.safeParse({ email: 'not-an-email', password: 'secret12' }).success).toBe(false);
  });
});

describe('signUpSchema', () => {
  it('requires full_name', () => {
    expect(signUpSchema.safeParse({ email: 'a@b.com', password: 'secret12', full_name: '' }).success).toBe(false);
  });
  it('accepts full payload', () => {
    expect(signUpSchema.safeParse({ email: 'a@b.com', password: 'secret12', full_name: 'Sid' }).success).toBe(true);
  });
});
