import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format, isPast } from 'date-fns';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { NewShootDialog } from '@/components/new-shoot-dialog';
import { PageHeader } from '@/components/page-header';

export default async function BrandDetailPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const { profile } = await getCurrentUser();
  const supabase = await getServerSupabase();
  const { data: brand } = await supabase
    .from('brands').select('*').eq('id', brandId).single();
  if (!brand) notFound();
  const { data: shoots } = await supabase
    .from('shoots').select('id, title, scheduled_at, location_notes')
    .eq('brand_id', brand.id).order('scheduled_at', { ascending: true });

  const count = shoots?.length ?? 0;

  return (
    <div className="max-w-[1200px]">
      <PageHeader
        crumbs={[{ label: 'Brands', href: '/brands' }, { label: brand.name }]}
        slug={`BRAND · ${count} ${count === 1 ? 'shoot' : 'shoots'}`}
        title={<span>{brand.name}</span>}
        subtitle={brand.description || undefined}
        side={profile.role !== 'viewer' ? <NewShootDialog brandId={brand.id} /> : undefined}
      />

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <div>
            <div className="label-eyebrow">Production slate</div>
            <h2 className="mt-1 font-display text-[28px] leading-tight text-[var(--ink)]">
              All shoots, <span className="italic text-[var(--ink-dim)]">by date</span>
            </h2>
          </div>
        </div>

        {count === 0 ? (
          <div className="flex flex-col items-start gap-3 border border-dashed border-[var(--hair-strong)] p-10">
            <span className="label-eyebrow">Empty reel</span>
            <p className="font-display text-[26px] leading-tight text-[var(--ink)]">
              No shoots scheduled for {brand.name}.
            </p>
            <p className="text-[13px] text-[var(--ink-dim)]">
              Create a shoot to start gathering reels, references, and call-sheet details.
            </p>
          </div>
        ) : (
          <ul className="border-t border-[var(--hair)]">
            {(shoots ?? []).map((s, i) => {
              const when = new Date(s.scheduled_at);
              const past = isPast(when);
              return (
                <li key={s.id} className="border-b border-[var(--hair)] transition-colors hover:bg-[var(--card)]">
                  <Link href={`/shoots/${s.id}`} className="grid grid-cols-[60px_140px_1fr_auto] items-baseline gap-6 px-2 py-6">
                    <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[var(--muted)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="font-mono text-[11px] tracking-[0.18em] uppercase"
                      style={{ color: past ? 'var(--muted)' : 'var(--signal)' }}
                    >
                      {format(when, 'dd MMM yy')}
                      <span className="ml-2 text-[var(--muted)]">{format(when, 'HH:mm')}</span>
                    </span>
                    <div className="min-w-0">
                      <div className="font-display text-[26px] leading-tight text-[var(--ink)]">{s.title}</div>
                      {s.location_notes && (
                        <div className="mt-1 truncate text-[12.5px] text-[var(--ink-dim)]">
                          {s.location_notes}
                        </div>
                      )}
                    </div>
                    <span className="link-slide font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-dim)]">
                      Open →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
