import { describe, it, expect, beforeAll } from 'vitest';
import { createUserWithRole } from './_helpers';

let editor: Awaited<ReturnType<typeof createUserWithRole>>;
let brandId: string;

beforeAll(async () => {
  editor = await createUserWithRole('editor');
  const { data, error } = await editor.client.from('brands').insert({ name: 'Editor brand', created_by: editor.userId }).select('id').single();
  if (error) throw error;
  brandId = data!.id;
});

describe('RLS: editor', () => {
  it('can create and update', async () => {
    const { error } = await editor.client.from('brands').update({ name: 'Updated' }).eq('id', brandId);
    expect(error).toBeNull();
  });
  it('cannot delete', async () => {
    const { count } = await editor.client.from('brands').delete().eq('id', brandId).select('*', { count: 'exact' });
    expect(count ?? 0).toBe(0);
  });
});
