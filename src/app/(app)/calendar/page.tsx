import { getServerSupabase } from '@/lib/supabase/server';
import { CalendarGrid } from '@/components/calendar-grid';
import { PageHeader } from '@/components/page-header';

export default async function CalendarPage() {
  const supabase = await getServerSupabase();
  const { data: shoots } = await supabase
    .from('shoots').select('id, title, scheduled_at, brand:brands(id, name)')
    .order('scheduled_at', { ascending: true });

  const events = (shoots ?? []).map((s) => {
    const brand = s.brand as { id: string; name: string } | { id: string; name: string }[];
    const b = Array.isArray(brand) ? brand[0] : brand;
    return {
      id: s.id, title: s.title, scheduled_at: s.scheduled_at,
      brand_id: b?.id ?? '',
      brand_name: b?.name ?? '',
    };
  });

  return (
    <div className="max-w-[1400px]">
      <PageHeader
        slug={`CALENDAR · ${events.length} scheduled`}
        title={<>The <span className="italic text-[var(--signal)]">month</span>.</>}
        subtitle="Every shoot across every brand — on one grid, color-coded."
      />
      <CalendarGrid events={events} />
    </div>
  );
}
