'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { reelCreateSchema, reelUpdateSchema } from '@/lib/schemas/reel';

export async function createReel(shootId: string, formData: FormData) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };

  const parsed = reelCreateSchema.safeParse({
    shoot_id: shootId,
    title: formData.get('title'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await getServerSupabase();
  const { count } = await supabase.from('reels').select('id', { count: 'exact', head: true }).eq('shoot_id', shootId);
  const { data, error } = await supabase
    .from('reels').insert({ ...parsed.data, position: count ?? 0 })
    .select('id').single();
  if (error) return { error: error.message };

  await supabase.from('activity_log').insert({
    entity_type: 'reel', entity_id: data.id, action: 'created',
    actor_id: profile.id, payload: { title: parsed.data.title },
  });

  revalidatePath(`/shoots/${shootId}`);
  redirect(`/reels/${data.id}`);
}

export async function updateReel(reelId: string, patch: unknown) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };

  const parsed = reelUpdateSchema.safeParse(patch);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await getServerSupabase();

  if (parsed.data.status) {
    const { data: before } = await supabase.from('reels').select('status, shoot_id').eq('id', reelId).single();
    const { error } = await supabase.from('reels').update(parsed.data).eq('id', reelId);
    if (error) return { error: error.message };
    if (before && before.status !== parsed.data.status) {
      await supabase.from('activity_log').insert({
        entity_type: 'reel', entity_id: reelId, action: 'status_changed',
        actor_id: profile.id, payload: { from: before.status, to: parsed.data.status },
      });
    }
    revalidatePath(`/reels/${reelId}`);
    if (before) revalidatePath(`/shoots/${before.shoot_id}`);
    return { ok: true };
  }

  const { error } = await supabase.from('reels').update(parsed.data).eq('id', reelId);
  if (error) return { error: error.message };
  revalidatePath(`/reels/${reelId}`);
  return { ok: true };
}

export async function deleteReel(reelId: string) {
  const { profile } = await getCurrentUser();
  if (profile.role !== 'admin') return { error: 'Forbidden' };
  const supabase = await getServerSupabase();
  const { data: reel } = await supabase.from('reels').select('shoot_id').eq('id', reelId).single();
  const { error } = await supabase.from('reels').delete().eq('id', reelId);
  if (error) return { error: error.message };
  if (reel) {
    await supabase.storage.from('reel-assets').remove([
      `${reelId}/script`, `${reelId}/product`, `${reelId}/location`,
    ]);
    revalidatePath(`/shoots/${reel.shoot_id}`);
    redirect(`/shoots/${reel.shoot_id}`);
  }
  redirect('/brands');
}
