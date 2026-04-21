'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/require-role';

const roleSchema = z.enum(['admin', 'editor', 'viewer']);

export async function updateUserRole(userId: string, role: string) {
  await requireRole(['admin']);
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { error: 'Invalid role' };
  const supabase = await getServerSupabase();
  const { error } = await supabase.from('profiles').update({ role: parsed.data }).eq('id', userId);
  if (error) return { error: error.message };
  revalidatePath('/team');
  return { ok: true };
}
