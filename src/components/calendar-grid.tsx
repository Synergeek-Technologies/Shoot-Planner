'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  addMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay,
  startOfWeek, endOfWeek, isSameMonth, isToday,
} from 'date-fns';

type Event = { id: string; title: string; scheduled_at: string; brand_name: string; brand_id: string };

function hashHue(id: string) {
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 360;
}

export function CalendarGrid({ events }: { events: Event[] }) {
  const [cursor, setCursor] = useState(new Date());
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between border-b border-[var(--hair)] pb-5">
        <div>
          <div className="label-eyebrow mb-1">Month</div>
          <h2 className="font-display text-[48px] leading-[0.95] tracking-tight text-[var(--ink)]">
            {format(cursor, 'MMMM')} <span className="italic text-[var(--signal)]">{format(cursor, 'yyyy')}</span>
          </h2>
        </div>
        <div className="flex items-center gap-px overflow-hidden border border-[var(--hair-strong)]">
          <NavButton onClick={() => setCursor(addMonths(cursor, -1))}>←</NavButton>
          <NavButton onClick={() => setCursor(new Date())}>Today</NavButton>
          <NavButton onClick={() => setCursor(addMonths(cursor, 1))}>→</NavButton>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[var(--hair)]">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
          <div key={d} className="px-3 py-2 font-mono text-[10.5px] tracking-[0.18em] uppercase text-[var(--muted)]">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-[var(--hair)]">
        {days.map((d) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.scheduled_at), d));
          const outsideMonth = !isSameMonth(d, cursor);
          const today = isToday(d);
          return (
            <div
              key={d.toISOString()}
              className="group relative min-h-32 bg-[var(--card)] px-2.5 pb-2 pt-2 transition-colors"
              style={{ opacity: outsideMonth ? 0.35 : 1 }}
            >
              <div className="flex items-baseline justify-between">
                <span className={`font-display text-[22px] leading-none ${today ? 'text-[var(--signal)]' : 'text-[var(--ink)]'}`}>
                  {format(d, 'd')}
                </span>
                {today && (
                  <span className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-[var(--signal)]">
                    Today
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-1">
                {dayEvents.map((e) => {
                  const hue = hashHue(e.brand_id);
                  return (
                    <Link
                      key={e.id}
                      href={`/shoots/${e.id}`}
                      className="block truncate border-l-[3px] pl-2 pr-1 py-1 text-[11px] leading-tight transition-transform hover:translate-x-0.5"
                      style={{
                        borderLeftColor: `hsl(${hue} 65% 55%)`,
                        background: `hsl(${hue} 65% 55% / 0.08)`,
                        color: 'var(--ink)',
                      }}
                    >
                      <span className="font-mono text-[9.5px] tracking-[0.16em] uppercase" style={{ color: `hsl(${hue} 65% 60%)` }}>
                        {format(new Date(e.scheduled_at), 'HH:mm')}
                      </span>
                      <span className="ml-1.5">{e.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-r border-[var(--hair-strong)] bg-[var(--card)] px-4 py-2 font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-dim)] transition-colors last:border-r-0 hover:bg-[var(--card-raised)] hover:text-[var(--signal)]"
    >
      {children}
    </button>
  );
}
