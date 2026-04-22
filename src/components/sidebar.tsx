import Link from 'next/link';
import type { UserRole } from '@/lib/auth/require-role';

type Item = { href: string; label: string; key: string; n: string };

export function Sidebar({ role }: { role: UserRole }) {
  const items: Item[] = [
    { href: '/', label: 'Overview', key: 'overview', n: '01' },
    { href: '/calendar', label: 'Calendar', key: 'calendar', n: '02' },
    { href: '/brands', label: 'Brands', key: 'brands', n: '03' },
  ];
  if (role === 'admin') items.push({ href: '/team', label: 'Team', key: 'team', n: '04' });
  items.push({ href: '/account', label: 'Account', key: 'account', n: role === 'admin' ? '05' : '04' });

  return (
    <aside className="relative flex w-60 flex-col border-r border-[var(--hair)] bg-[var(--card)]">
      <div className="px-6 pt-8 pb-10">
        <div className="label-eyebrow mb-3">Est. 2026 · Film Op.</div>
        <Link href="/" className="block">
          <span className="font-display text-[34px] leading-none tracking-tight text-[var(--ink)]">
            Syner<span className="italic text-[var(--signal)]">geek</span>
          </span>
          <div className="mt-1 text-[11px] font-mono tracking-[0.18em] uppercase text-[var(--muted)]">
            Shoot Planner
          </div>
        </Link>
      </div>

      <nav className="flex flex-col gap-px border-y border-[var(--hair)]">
        {items.map((it) => (
          <Link
            key={it.key}
            href={it.href}
            className="group flex items-baseline gap-4 px-6 py-3.5 transition-colors hover:bg-[var(--card-raised)]"
          >
            <span className="w-6 font-mono text-[10.5px] leading-none tracking-[0.16em] text-[var(--muted)] group-hover:text-[var(--signal)] transition-colors">
              {it.n}
            </span>
            <span className="font-display text-[19px] leading-none text-[var(--ink)] transition-all group-hover:italic">
              {it.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-6 py-6">
        <div className="label-eyebrow mb-2">Currently</div>
        <p className="font-display italic text-[17px] leading-tight text-[var(--ink-dim)]">
          A quiet room,<br />good light,<br />and a plan.
        </p>
      </div>
    </aside>
  );
}
