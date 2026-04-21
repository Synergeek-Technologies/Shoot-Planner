import { describe, it, expect, beforeAll } from 'vitest';
import { createUserWithRole } from './_helpers';

let adminUser: Awaited<ReturnType<typeof createUserWithRole>>;

beforeAll(async () => {
  adminUser = await createUserWithRole('admin');
});

describe('RLS: admin', () => {
  it('can create + delete', async () => {
    const { data: insert, error: e1 } = await adminUser.client.from('brands').insert({ name: 'AdminBrand', created_by: adminUser.userId }).select('id').single();
    expect(e1).toBeNull();
    const { error: e2 } = await adminUser.client.from('brands').delete().eq('id', insert!.id);
    expect(e2).toBeNull();
  });
});
