import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { RoleSelect } from './role-select';
import { PageHeader } from '@/components/page-header';

const ROLE_GLYPH: Record<string, string> = { admin: '◆', editor: '◇', viewer: '○' };

export default async function TeamPage() {
  const { profile } = await getCurrentUser();
  if (profile.role !== 'admin') redirect('/');
  const supabase = await getServerSupabase();
  const { data: members } = await supabase.from('profiles').select('id, full_name, role').order('full_name');

  const total = members?.length ?? 0;

  return (
    <div className="max-w-[900px]">
      <PageHeader
        slug={`CREW · ${String(total).padStart(2, '0')} on the call sheet`}
        title={<>The <span className="italic text-[var(--signal)]">crew</span>.</>}
        subtitle="Grant or revoke access. Only admins can change roles. You can't demote yourself — ask another admin."
      />

      <ul className="border-t border-[var(--hair)]">
        {(members ?? []).map((m, i) => (
          <li key={m.id} className="grid grid-cols-[60px_1fr_auto] items-center gap-6 border-b border-[var(--hair)] px-2 py-5">
            <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[var(--muted)]">
              C-{String(i + 1).padStart(3, '0')}
            </span>
            <span className="flex items-baseline gap-3">
              <span className="text-[var(--signal)]" aria-hidden>{ROLE_GLYPH[m.role as string] ?? '○'}</span>
              <span className="font-display text-[22px] leading-tight text-[var(--ink)]">
                {m.full_name || 'Unnamed'}
              </span>
              {m.id === profile.id && (
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">
                  (you)
                </span>
              )}
            </span>
            <RoleSelect
              userId={m.id}
              current={m.role as 'admin' | 'editor' | 'viewer'}
              disabled={m.id === profile.id}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
