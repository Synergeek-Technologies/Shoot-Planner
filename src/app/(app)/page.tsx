import Link from 'next/link';
import { addDays, format } from 'date-fns';
import { getServerSupabase } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { REEL_STATUSES } from '@/lib/schemas/reel';

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
    supabase.from('activity_log').select('*, actor:profiles(full_name)').order('created_at', { ascending: false }).limit(10),
  ]);

  const counts: Record<string, number> = Object.fromEntries(REEL_STATUSES.map((s) => [s, 0]));
  for (const r of statusRows ?? []) counts[r.status]++;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section>
        <h2 className="mb-3 text-lg font-medium">Upcoming shoots (next 7 days)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(upcoming ?? []).map((s) => {
            const brand = s.brand as { name: string } | { name: string }[];
            const brandName = Array.isArray(brand) ? brand[0]?.name : brand.name;
            return (
              <Link key={s.id} href={`/shoots/${s.id}`}>
                <Card className="p-4 hover:bg-muted/50 transition">
                  <div className="text-sm text-muted-foreground">{brandName}</div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{format(new Date(s.scheduled_at), 'PP p')}</div>
                </Card>
              </Link>
            );
          })}
          {(upcoming ?? []).length === 0 && <p className="text-muted-foreground">Nothing scheduled this week.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Reels by status</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {REEL_STATUSES.map((s) => (
            <Card key={s} className="p-4">
              <div className="text-sm text-muted-foreground">{s.replace('_',' ')}</div>
              <div className="text-2xl font-semibold">{counts[s]}</div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Recent activity</h2>
        <ul className="space-y-2 text-sm">
          {(recent ?? []).map((a) => {
            const actor = a.actor as { full_name: string } | { full_name: string }[] | null;
            const actorName = Array.isArray(actor) ? actor[0]?.full_name : actor?.full_name;
            return (
              <li key={a.id} className="flex items-center justify-between rounded border px-3 py-2">
                <span><span className="font-medium">{actorName || 'someone'}</span> {a.action.replace('_',' ')} a {a.entity_type}</span>
                <span className="text-muted-foreground">{format(new Date(a.created_at), 'PP p')}</span>
              </li>
            );
          })}
          {(recent ?? []).length === 0 && <p className="text-muted-foreground">No activity yet.</p>}
        </ul>
      </section>
    </div>
  );
}
