import Link from 'next/link';
import { addDays, format, formatDistanceToNow } from 'date-fns';
import { getServerSupabase } from '@/lib/supabase/server';
import { REEL_STATUSES } from '@/lib/schemas/reel';
import { PageHeader } from '@/components/page-header';

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planning',
  ready_to_shoot: 'Ready',
  shot: 'Shot',
  edited: 'Edited',
  posted: 'Posted',
};

const STATUS_COLORS: Record<string, string> = {
  planning: 'var(--muted)',
  ready_to_shoot: '#C8BFA8',
  shot: 'var(--signal)',
  edited: '#E8A13A',
  posted: '#9FB97B',
};

export default async function DashboardPage() {
  const supabase = await getServerSupabase();
  const now = new Date();
  const weekOut = addDays(now, 7);

  const [{ data: upcoming }, { data: statusRows }, { data: recent }] = await Promise.all([
    supabase.from('shoots')
      .select('id, title, scheduled_at, brand:brands(name)')
      .gte('scheduled_at', now.toISOString()).lte('scheduled_at', weekOut.toISOString())
      .order('scheduled_at', { ascending: true }),
    supabase.from('reels').select('status'),
    supabase.from('activity_log').select('*, actor:profiles(full_name)').order('created_at', { ascending: false }).limit(8),
  ]);

  const counts: Record<string, number> = Object.fromEntries(REEL_STATUSES.map((s) => [s, 0]));
  for (const r of statusRows ?? []) counts[r.status]++;
  const totalReels = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-14 max-w-[1200px]">
      <PageHeader
        slug={`DESK / ${format(now, 'PPPP').toUpperCase()}`}
        title={<>Today, quietly<br /><span className="italic text-[var(--signal)]">on schedule.</span></>}
        subtitle="Seven-day forecast of shoots, where each reel is in the pipeline, and what the team just did."
      />

      {/* Status overview — reels-by-status, big numerals */}
      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <div className="label-eyebrow">Pipeline · Status</div>
            <h2 className="mt-1 font-display text-[32px] leading-tight text-[var(--ink)]">
              {totalReels} <span className="italic text-[var(--ink-dim)]">reel{totalReels === 1 ? '' : 's'} in flight</span>
            </h2>
          </div>
          <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-[var(--muted)]">
            live count
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-[var(--hair)] bg-[var(--hair)] md:grid-cols-5">
          {REEL_STATUSES.map((s, i) => (
            <div key={s} className="flex flex-col justify-between bg-[var(--card)] p-6 transition-colors hover:bg-[var(--card-raised)]">
              <div className="flex items-baseline justify-between">
                <span className="label-eyebrow">{String(i + 1).padStart(2, '0')}</span>
                <span className="status-dot" style={{ color: STATUS_COLORS[s] }} aria-hidden />
              </div>
              <div className="mt-8">
                <div className="font-display text-[52px] leading-none text-[var(--ink)]">{counts[s]}</div>
                <div className="mt-2 font-mono text-[10.5px] tracking-[0.16em] uppercase" style={{ color: STATUS_COLORS[s] }}>
                  {STATUS_LABELS[s]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming 7 days */}
      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <div className="label-eyebrow">Call sheet · Next 7 days</div>
            <h2 className="mt-1 font-display text-[32px] leading-tight text-[var(--ink)]">
              On the books <span className="italic text-[var(--ink-dim)]">this week</span>
            </h2>
          </div>
          <Link href="/calendar" className="link-slide font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--muted)] hover:text-[var(--ink)]">
            Full calendar →
          </Link>
        </div>
        {(upcoming ?? []).length === 0 ? (
          <EmptyLine text="Nothing on the slate this week." />
        ) : (
          <ul className="border-t border-[var(--hair)]">
            {(upcoming ?? []).map((s) => {
              const brand = s.brand as { name: string } | { name: string }[];
              const brandName = Array.isArray(brand) ? brand[0]?.name : brand?.name;
              const when = new Date(s.scheduled_at);
              return (
                <li key={s.id} className="border-b border-[var(--hair)] transition-colors hover:bg-[var(--card)]">
                  <Link href={`/shoots/${s.id}`} className="grid grid-cols-[120px_1fr_auto] items-baseline gap-6 px-2 py-5">
                    <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--signal)]">
                      {format(when, 'EEE dd MMM').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="label-eyebrow mb-0.5">{brandName ?? '—'}</div>
                      <div className="font-display text-[26px] leading-tight text-[var(--ink)]">{s.title}</div>
                    </div>
                    <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-dim)]">
                      {format(when, 'HH:mm')}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recent activity */}
      <section>
        <div className="mb-6">
          <div className="label-eyebrow">Log · Latest takes</div>
          <h2 className="mt-1 font-display text-[32px] leading-tight text-[var(--ink)]">
            What just <span className="italic text-[var(--ink-dim)]">happened</span>
          </h2>
        </div>
        {(recent ?? []).length === 0 ? (
          <EmptyLine text="No entries in the log yet." />
        ) : (
          <ul className="space-y-px">
            {(recent ?? []).map((a) => {
              const actor = a.actor as { full_name: string } | { full_name: string }[] | null;
              const actorName = Array.isArray(actor) ? actor[0]?.full_name : actor?.full_name;
              return (
                <li key={a.id} className="flex items-baseline justify-between border-b border-[var(--hair)] py-3.5 text-[13.5px]">
                  <span className="text-[var(--ink-dim)]">
                    <span className="text-[var(--ink)]">{actorName || 'Someone'}</span>
                    <span className="mx-2 text-[var(--muted)]">·</span>
                    <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--signal)]">
                      {a.action.replace(/_/g, ' ')}
                    </span>
                    <span className="mx-2 text-[var(--muted)]">·</span>
                    <span className="italic">a {a.entity_type}</span>
                  </span>
                  <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[var(--muted)]">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 border-y border-dashed border-[var(--hair-strong)] py-7 text-[var(--muted)]">
      <span className="font-display italic text-xl">—</span>
      <span className="text-[13px]">{text}</span>
    </div>
  );
}
