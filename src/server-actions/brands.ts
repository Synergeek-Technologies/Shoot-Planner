'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { brandCreateSchema, brandUpdateSchema } from '@/lib/schemas/brand';
import { getCurrentUser } from '@/lib/auth/require-role';

export async function createBrand(formData: FormData) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Viewers cannot create brands' };

  const parsed = brandCreateSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('brands')
    .insert({ ...parsed.data, created_by: profile.id })
    .select('id')
    .single();
  if (error) return { error: error.message };

  await supabase.from('activity_log').insert({
    entity_type: 'brand', entity_id: data.id, action: 'created',
    actor_id: profile.id, payload: { name: parsed.data.name },
  });

  revalidatePath('/brands');
  redirect(`/brands/${data.id}`);
}

export async function updateBrand(brandId: string, patch: unknown) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };

  const parsed = brandUpdateSchema.safeParse(patch);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await getServerSupabase();
  const { error } = await supabase.from('brands').update(parsed.data).eq('id', brandId);
  if (error) return { error: error.message };

  revalidatePath(`/brands/${brandId}`);
  revalidatePath('/brands');
  return { ok: true };
}

export async function deleteBrand(brandId: string) {
  const { profile } = await getCurrentUser();
  if (profile.role !== 'admin') return { error: 'Only admins can delete brands' };

  const supabase = await getServerSupabase();
  const { error } = await supabase.from('brands').delete().eq('id', brandId);
  if (error) return { error: error.message };
  revalidatePath('/brands');
  redirect('/brands');
}
