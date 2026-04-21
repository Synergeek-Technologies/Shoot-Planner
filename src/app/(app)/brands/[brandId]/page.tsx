import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { NewShootDialog } from '@/components/new-shoot-dialog';
import { Card } from '@/components/ui/card';

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{brand.name}</h1>
        {brand.description && <p className="text-muted-foreground">{brand.description}</p>}
      </header>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Shoots</h2>
        {profile.role !== 'viewer' && <NewShootDialog brandId={brand.id} />}
      </div>
      <div className="grid gap-3">
        {(shoots ?? []).map((s) => (
          <Link key={s.id} href={`/shoots/${s.id}`}>
            <Card className="p-4 hover:bg-muted/50 transition">
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium">{s.title}</h3>
                <span className="text-sm text-muted-foreground">{format(new Date(s.scheduled_at), 'PP p')}</span>
              </div>
              {s.location_notes && <p className="mt-1 text-sm text-muted-foreground">{s.location_notes}</p>}
            </Card>
          </Link>
        ))}
        {(shoots ?? []).length === 0 && <p className="text-muted-foreground">No shoots yet.</p>}
      </div>
    </div>
  );
}
