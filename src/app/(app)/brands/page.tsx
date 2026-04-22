import Link from 'next/link';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { NewBrandDialog } from '@/components/new-brand-dialog';
import { PageHeader } from '@/components/page-header';

export default async function BrandsPage() {
  const { profile } = await getCurrentUser();
  const supabase = await getServerSupabase();
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, description, logo_url, shoots(count)')
    .order('created_at', { ascending: false });

  const total = brands?.length ?? 0;

  return (
    <div className="max-w-[1200px]">
      <PageHeader
        slug={`ROSTER · ${String(total).padStart(2, '0')} ${total === 1 ? 'brand' : 'brands'}`}
        title={<>The <span className="italic text-[var(--signal)]">roster</span>.</>}
        subtitle="Every client we shoot for, and the number of days on the books for each."
        side={profile.role !== 'viewer' ? <NewBrandDialog /> : undefined}
      />

      {total === 0 ? (
        <EmptyRoster />
      ) : (
        <ul className="grid grid-cols-1 gap-px border border-[var(--hair)] bg-[var(--hair)] md:grid-cols-2 lg:grid-cols-3">
          {(brands ?? []).map((b, i) => {
            const count = (b.shoots as { count: number }[])[0]?.count ?? 0;
            return (
              <li key={b.id} className="bg-[var(--card)] transition-colors hover:bg-[var(--card-raised)]">
                <Link href={`/brands/${b.id}`} className="flex h-full flex-col p-7">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-[var(--muted)]">
                      № {String(i + 1).padStart(3, '0')}
                    </span>
                    <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[var(--signal)]">
                      {count} {count === 1 ? 'shoot' : 'shoots'}
                    </span>
                  </div>

                  <h3 className="mt-8 font-display text-[32px] leading-[1] tracking-tight text-[var(--ink)]">
                    {b.name}
                  </h3>
                  {b.description && (
                    <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-[var(--ink-dim)]">
                      {b.description}
                    </p>
                  )}

                  <div className="mt-auto pt-10">
                    <span className="link-slide font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-dim)]">
                      Open file →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EmptyRoster() {
  return (
    <div className="flex flex-col items-start gap-4 border border-dashed border-[var(--hair-strong)] p-12">
      <span className="label-eyebrow">Empty stage</span>
      <h2 className="font-display text-[40px] leading-tight text-[var(--ink)]">
        No brands on the roster yet.
      </h2>
      <p className="max-w-sm text-[14px] text-[var(--ink-dim)]">
        Add your first client brand — every shoot and reel lives under one of these.
      </p>
    </div>
  );
}
