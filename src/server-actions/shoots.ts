'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { shootCreateSchema, shootUpdateSchema } from '@/lib/schemas/shoot';

export async function createShoot(brandId: string, formData: FormData) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };

  const raw = String(formData.get('scheduled_at') ?? '');
  const normalized = raw.includes('Z') || raw.includes('+') ? raw : new Date(raw).toISOString();

  const parsed = shootCreateSchema.safeParse({
    brand_id: brandId,
    title: formData.get('title'),
    scheduled_at: normalized,
    location_notes: formData.get('location_notes') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('shoots').insert({ ...parsed.data, created_by: profile.id })
    .select('id').single();
  if (error) return { error: error.message };

  await supabase.from('activity_log').insert({
    entity_type: 'shoot', entity_id: data.id, action: 'created',
    actor_id: profile.id, payload: { title: parsed.data.title },
  });

  revalidatePath(`/brands/${brandId}`);
  redirect(`/shoots/${data.id}`);
}

export async function updateShoot(shootId: string, patch: unknown) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };
  const parsed = shootUpdateSchema.safeParse(patch);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await getServerSupabase();
  const { error } = await supabase.from('shoots').update(parsed.data).eq('id', shootId);
  if (error) return { error: error.message };
  revalidatePath(`/shoots/${shootId}`);
  return { ok: true };
}

export async function deleteShoot(shootId: string) {
  const { profile } = await getCurrentUser();
  if (profile.role !== 'admin') return { error: 'Forbidden' };
  const supabase = await getServerSupabase();
  const { data: shoot } = await supabase.from('shoots').select('brand_id').eq('id', shootId).single();
  const { error } = await supabase.from('shoots').delete().eq('id', shootId);
  if (error) return { error: error.message };
  if (shoot) revalidatePath(`/brands/${shoot.brand_id}`);
  redirect('/brands');
}
