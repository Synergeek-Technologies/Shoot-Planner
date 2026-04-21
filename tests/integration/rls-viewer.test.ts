import { describe, it, expect, beforeAll } from 'vitest';
import { createUserWithRole, seedBrand } from './_helpers';

let viewer: Awaited<ReturnType<typeof createUserWithRole>>;
let brandId: string;

beforeAll(async () => {
  viewer = await createUserWithRole('viewer');
  brandId = await seedBrand();
});

describe('RLS: viewer', () => {
  it('can read brands', async () => {
    const { data, error } = await viewer.client.from('brands').select('id').eq('id', brandId).single();
    expect(error).toBeNull();
    expect(data?.id).toBe(brandId);
  });
  it('cannot insert a brand', async () => {
    const { error } = await viewer.client.from('brands').insert({ name: 'Nope', created_by: viewer.userId });
    expect(error).not.toBeNull();
  });
  it('cannot update a brand', async () => {
    const { count } = await viewer.client.from('brands').update({ name: 'Hacked' }).eq('id', brandId).select('*', { count: 'exact' });
    expect(count ?? 0).toBe(0);
  });
  it('cannot delete a brand', async () => {
    const { count } = await viewer.client.from('brands').delete().eq('id', brandId).select('*', { count: 'exact' });
    expect(count ?? 0).toBe(0);
  });
});
