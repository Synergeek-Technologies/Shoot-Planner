import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { ReelEditor } from '@/components/reel-editor';
import { ReelReferencesList } from '@/components/reel-references-list';

export default async function ReelDetailPage({ params }: { params: Promise<{ reelId: string }> }) {
  const { reelId } = await params;
  const { profile } = await getCurrentUser();
  const supabase = await getServerSupabase();
  const { data: reel } = await supabase
    .from('reels')
    .select('*, shoot:shoots(id, title, brand_id, brand:brands(name))')
    .eq('id', reelId).single();
  if (!reel) notFound();
  const { data: refs } = await supabase
    .from('reel_references').select('id, url, label').eq('reel_id', reel.id);

  const shoot = reel.shoot as { id: string; title: string; brand_id: string; brand: { name: string } | { name: string }[] };
  const brandName = Array.isArray(shoot.brand) ? shoot.brand[0]?.name : shoot.brand?.name;
  const canEdit = profile.role !== 'viewer';

  return (
    <div className="max-w-[1200px] space-y-14">
      <nav className="flex items-center gap-3 font-mono text-[10.5px] tracking-[0.18em] uppercase">
        <Link href={`/brands/${shoot.brand_id}`} className="link-slide text-[var(--muted)] hover:text-[var(--ink)]">
          {brandName ?? 'Brand'}
        </Link>
        <span className="text-[var(--hair-strong)]">/</span>
        <Link href={`/shoots/${shoot.id}`} className="link-slide text-[var(--muted)] hover:text-[var(--ink)]">
          {shoot.title}
        </Link>
        <span className="text-[var(--hair-strong)]">/</span>
        <span className="text-[var(--signal)]">Reel</span>
      </nav>

      <ReelEditor reel={reel} canEdit={canEdit} />
      <ReelReferencesList reelId={reel.id} initial={refs ?? []} canEdit={canEdit} />
    </div>
  );
}
