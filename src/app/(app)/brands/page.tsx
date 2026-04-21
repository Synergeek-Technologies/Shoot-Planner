import Link from 'next/link';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { NewBrandDialog } from '@/components/new-brand-dialog';
import { Card } from '@/components/ui/card';

export default async function BrandsPage() {
  const { profile } = await getCurrentUser();
  const supabase = await getServerSupabase();
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, description, logo_url, shoots(count)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Brands</h1>
        {profile.role !== 'viewer' && <NewBrandDialog />}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(brands ?? []).map((b) => (
          <Link key={b.id} href={`/brands/${b.id}`}>
            <Card className="p-4 hover:bg-muted/50 transition">
              <h2 className="font-medium">{b.name}</h2>
              <p className="line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">{(b.shoots as {count:number}[])[0]?.count ?? 0} shoots</p>
            </Card>
          </Link>
        ))}
        {(brands ?? []).length === 0 && <p className="text-muted-foreground">No brands yet.</p>}
      </div>
    </div>
  );
}
