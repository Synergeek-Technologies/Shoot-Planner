import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const admin = () => createClient<Database>(URL, SERVICE, { auth: { persistSession: false } });

export async function createUserWithRole(role: 'admin'|'editor'|'viewer') {
  const a = admin();
  const email = `${role}-${Date.now()}-${Math.random().toString(36).slice(2,8)}@test.local`;
  const password = 'test-password-123';
  const { data, error } = await a.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw error ?? new Error('no user');
  await a.from('profiles').update({ role, full_name: role }).eq('id', data.user.id);
  const anon = createClient<Database>(URL, ANON, { auth: { persistSession: false } });
  await anon.auth.signInWithPassword({ email, password });
  return { client: anon, userId: data.user.id, email };
}

export async function seedBrand() {
  const a = admin();
  const { data: u } = await a.auth.admin.listUsers();
  const firstUser = u.users[0];
  if (!firstUser) throw new Error('No users exist to be created_by');
  const { data, error } = await a.from('brands').insert({ name: 'Seed brand', created_by: firstUser.id }).select('id').single();
  if (error) throw error;
  return data.id;
}
