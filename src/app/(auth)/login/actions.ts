'use server';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { signInSchema } from '@/lib/schemas/profile';

export async function signInAction(_prev: unknown, formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };
  redirect('/');
}
