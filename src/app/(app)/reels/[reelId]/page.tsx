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

  const canEdit = profile.role !== 'viewer';

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted-foreground">
        <Link href={`/brands/${reel.shoot.brand_id}`} className="underline">{reel.shoot.brand.name}</Link>
        {' / '}
        <Link href={`/shoots/${reel.shoot.id}`} className="underline">{reel.shoot.title}</Link>
      </nav>
      <ReelEditor reel={reel} canEdit={canEdit} />
      <ReelReferencesList reelId={reel.id} initial={refs ?? []} canEdit={canEdit} />
    </div>
  );
}
