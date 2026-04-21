import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { RoleSelect } from './role-select';
import { Card } from '@/components/ui/card';

export default async function TeamPage() {
  const { profile } = await getCurrentUser();
  if (profile.role !== 'admin') redirect('/');
  const supabase = await getServerSupabase();
  const { data: members } = await supabase.from('profiles').select('id, full_name, role').order('full_name');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Team</h1>
      <div className="grid gap-3">
        {(members ?? []).map((m) => (
          <Card key={m.id} className="flex items-center justify-between p-4">
            <span>{m.full_name || 'Unnamed'}</span>
            <RoleSelect userId={m.id} current={m.role as 'admin' | 'editor' | 'viewer'} disabled={m.id === profile.id} />
          </Card>
        ))}
      </div>
    </div>
  );
}
