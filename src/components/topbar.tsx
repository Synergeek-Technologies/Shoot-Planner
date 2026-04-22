import { signOutAction } from '@/server-actions/account';

function roleGlyph(role: string) {
  if (role === 'admin') return '◆';
  if (role === 'editor') return '◇';
  return '○';
}

export function Topbar({ fullName, role }: { fullName: string; role: string }) {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).toUpperCase();

  return (
    <header className="flex items-baseline justify-between border-b border-[var(--hair)] px-10 pt-7 pb-5">
      <div className="flex items-baseline gap-6">
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--muted)]">
          {today}
        </span>
        <span className="h-px w-8 bg-[var(--hair-strong)]" aria-hidden />
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--muted)]">
          Production Desk
        </span>
      </div>

      <div className="flex items-baseline gap-5 text-[13px]">
        <span className="flex items-baseline gap-2">
          <span className="text-[var(--signal)]" aria-hidden>{roleGlyph(role)}</span>
          <span className="font-medium text-[var(--ink)]">{fullName || 'Unnamed'}</span>
          <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[var(--muted)]">
            {role}
          </span>
        </span>
        <span className="h-3 w-px bg-[var(--hair-strong)]" aria-hidden />
        <form action={signOutAction}>
          <button
            type="submit"
            className="link-slide font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
