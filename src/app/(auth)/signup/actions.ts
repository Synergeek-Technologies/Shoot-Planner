'use server';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { signUpSchema } from '@/lib/schemas/profile';

export async function signUpAction(_prev: unknown, formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    full_name: formData.get('full_name'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.full_name } },
  });
  if (error) return { error: error.message };
  redirect('/');
}
