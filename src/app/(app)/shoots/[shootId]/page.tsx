import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { NewReelDialog } from '@/components/new-reel-dialog';
import { StatusBadge } from '@/components/status-badge';
import { PageHeader } from '@/components/page-header';
import type { ReelStatus } from '@/lib/schemas/reel';

export default async function ShootDetailPage({ params }: { params: Promise<{ shootId: string }> }) {
  const { shootId } = await params;
  const { profile } = await getCurrentUser();
  const supabase = await getServerSupabase();
  const { data: shoot } = await supabase
    .from('shoots').select('*, brand:brands(id, name)').eq('id', shootId).single();
  if (!shoot) notFound();
  const { data: reels } = await supabase
    .from('reels').select('id, title, status, position')
    .eq('shoot_id', shoot.id).order('position', { ascending: true });

  const brand = shoot.brand as { id: string; name: string } | { id: string; name: string }[];
  const brandObj = Array.isArray(brand) ? brand[0] : brand;
  const when = new Date(shoot.scheduled_at);
  const count = reels?.length ?? 0;

  return (
    <div className="max-w-[1200px]">
      <PageHeader
        crumbs={[
          { label: 'Brands', href: '/brands' },
          { label: brandObj?.name ?? 'Brand', href: `/brands/${brandObj?.id}` },
          { label: shoot.title },
        ]}
        slug={`SHOOT · ${format(when, 'dd MMM yy · HH:mm').toUpperCase()}`}
        title={shoot.title}
        subtitle={shoot.location_notes || undefined}
        side={profile.role !== 'viewer' ? <NewReelDialog shootId={shoot.id} /> : undefined}
      />

      <section className="mb-12 grid grid-cols-3 gap-px border border-[var(--hair)] bg-[var(--hair)]">
        <Cell label="Date" value={format(when, 'EEE, dd MMM yyyy')} />
        <Cell label="Call time" value={format(when, 'HH:mm')} mono />
        <Cell
          label="Brand"
          value={
            <Link href={`/brands/${brandObj?.id}`} className="link-slide text-[var(--ink)]">
              {brandObj?.name}
            </Link>
          }
        />
      </section>

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <div>
            <div className="label-eyebrow">Shot list · {count} {count === 1 ? 'reel' : 'reels'}</div>
            <h2 className="mt-1 font-display text-[28px] leading-tight text-[var(--ink)]">
              Reels <span className="italic text-[var(--ink-dim)]">in this shoot</span>
            </h2>
          </div>
        </div>

        {count === 0 ? (
          <div className="flex flex-col items-start gap-3 border border-dashed border-[var(--hair-strong)] p-10">
            <span className="label-eyebrow">Blank reel</span>
            <p className="font-display text-[26px] leading-tight text-[var(--ink)]">
              No reels planned yet.
            </p>
            <p className="text-[13px] text-[var(--ink-dim)]">
              Add reels — the script, product, location, and references all live on the reel page.
            </p>
          </div>
        ) : (
          <ul className="border-t border-[var(--hair)]">
            {(reels ?? []).map((r, i) => (
              <li key={r.id} className="border-b border-[var(--hair)] transition-colors hover:bg-[var(--card)]">
                <Link href={`/reels/${r.id}`} className="grid grid-cols-[60px_1fr_auto_auto] items-baseline gap-6 px-2 py-5">
                  <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[var(--muted)]">
                    R-{String(i + 1).padStart(3, '0')}
                  </span>
                  <span className="font-display text-[24px] leading-tight text-[var(--ink)]">{r.title}</span>
                  <StatusBadge status={r.status as ReelStatus} />
                  <span className="link-slide font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-dim)]">
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Cell({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="bg-[var(--card)] p-6">
      <div className="label-eyebrow mb-3">{label}</div>
      <div className={`text-[20px] leading-tight text-[var(--ink)] ${mono ? 'font-mono tracking-tight' : 'font-display'}`}>
        {value}
      </div>
    </div>
  );
}
