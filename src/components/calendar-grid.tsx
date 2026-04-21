'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { addMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';

type Event = { id: string; title: string; scheduled_at: string; brand_name: string; brand_id: string };

function hashColor(id: string) {
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 70% 45%)`;
}

export function CalendarGrid({ events }: { events: Event[] }) {
  const [cursor, setCursor] = useState(new Date());
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{format(cursor, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCursor(addMonths(cursor, -1))}>←</Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(addMonths(cursor, 1))}>→</Button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-xs text-muted-foreground">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d} className="p-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px rounded border bg-border">
        {days.map((d) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.scheduled_at), d));
          return (
            <div key={d.toISOString()} className="min-h-28 bg-background p-1 text-xs">
              <div className="text-muted-foreground">{format(d, 'd')}</div>
              <div className="mt-1 space-y-1">
                {dayEvents.map((e) => (
                  <Link key={e.id} href={`/shoots/${e.id}`}
                    className="block truncate rounded px-1.5 py-1 text-white"
                    style={{ background: hashColor(e.brand_id) }}>
                    <span className="font-medium">{format(new Date(e.scheduled_at), 'HH:mm')}</span>{' '}{e.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
