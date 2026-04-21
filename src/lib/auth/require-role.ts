import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type UserRole = Database['public']['Enums']['user_role'];

export async function getCurrentUser() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();
  if (!profile) redirect('/login');
  return { user, profile };
}

export async function requireRole(allowed: UserRole[]) {
  const { profile } = await getCurrentUser();
  if (!allowed.includes(profile.role)) {
    throw new Error('Forbidden: insufficient role');
  }
  return profile;
}
