'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';

const refSchema = z.object({
  url: z.string().url(),
  label: z.string().max(200).optional().default(''),
});

export async function addReference(reelId: string, formData: FormData) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' as const };
  const parsed = refSchema.safeParse({
    url: formData.get('url'),
    label: formData.get('label') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('reel_references')
    .insert({ ...parsed.data, reel_id: reelId })
    .select('id, url, label')
    .single();
  if (error) return { error: error.message };
  revalidatePath(`/reels/${reelId}`);
  return { reference: data };
}

export async function removeReference(referenceId: string, reelId: string) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };
  const supabase = await getServerSupabase();
  const { error } = await supabase.from('reel_references').delete().eq('id', referenceId);
  if (error) return { error: error.message };
  revalidatePath(`/reels/${reelId}`);
  return { ok: true };
}
