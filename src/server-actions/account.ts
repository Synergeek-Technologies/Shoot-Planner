'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';

export async function signOutAction() {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function updateFullName(formData: FormData) {
  const { profile } = await getCurrentUser();
  const name = z.string().min(1).max(100).safeParse(formData.get('full_name'));
  if (!name.success) return { error: 'Name must be 1–100 characters' };
  const supabase = await getServerSupabase();
  const { error } = await supabase.from('profiles').update({ full_name: name.data }).eq('id', profile.id);
  if (error) return { error: error.message };
  revalidatePath('/account');
  return { ok: true };
}

export async function updatePassword(formData: FormData) {
  const pw = z.string().min(8).safeParse(formData.get('password'));
  if (!pw.success) return { error: 'Password must be 8+ characters' };
  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.updateUser({ password: pw.data });
  if (error) return { error: error.message };
  return { ok: true };
}
