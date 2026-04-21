import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { NewReelDialog } from '@/components/new-reel-dialog';
import { StatusBadge } from '@/components/status-badge';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

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

  return (
    <div className="space-y-6">
      <header>
        <Link href={`/brands/${shoot.brand.id}`} className="text-sm text-muted-foreground underline">{shoot.brand.name}</Link>
        <h1 className="text-2xl font-semibold">{shoot.title}</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(shoot.scheduled_at), 'PPPP p')}</p>
        {shoot.location_notes && <p className="mt-2">{shoot.location_notes}</p>}
      </header>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Reels</h2>
        {profile.role !== 'viewer' && <NewReelDialog shootId={shoot.id} />}
      </div>
      <div className="grid gap-3">
        {(reels ?? []).map((r) => (
          <Link key={r.id} href={`/reels/${r.id}`}>
            <Card className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
              <span className="font-medium">{r.title}</span>
              <StatusBadge status={r.status} />
            </Card>
          </Link>
        ))}
        {(reels ?? []).length === 0 && <p className="text-muted-foreground">No reels yet.</p>}
      </div>
    </div>
  );
}
