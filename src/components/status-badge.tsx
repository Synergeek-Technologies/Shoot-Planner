import type { ReelStatus } from '@/lib/schemas/reel';

const LABELS: Record<ReelStatus, string> = {
  planning: 'Planning',
  ready_to_shoot: 'Ready',
  shot: 'Shot',
  edited: 'Edited',
  posted: 'Posted',
};

// Color sequence walks from cool-muted through signal-red to amber-gold as a
// reel moves toward "posted" — a little warmth the further along you get.
const COLORS: Record<ReelStatus, string> = {
  planning: 'var(--muted)',
  ready_to_shoot: '#C8BFA8',
  shot: 'var(--signal)',
  edited: '#E8A13A',
  posted: '#9FB97B',
};

const TRACK_INDEX: Record<ReelStatus, number> = {
  planning: 0,
  ready_to_shoot: 1,
  shot: 2,
  edited: 3,
  posted: 4,
};

export function StatusBadge({ status }: { status: ReelStatus }) {
  return (
    <span
      className="inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[10.5px] tracking-[0.16em] uppercase"
      style={{ color: COLORS[status], borderColor: 'color-mix(in srgb, currentColor 35%, transparent)' }}
    >
      <span className="status-dot" style={{ color: COLORS[status] }} aria-hidden />
      {LABELS[status]}
    </span>
  );
}

/** A five-tick progress track — the full pipeline visualized as a reel strip. */
export function StatusTrack({ status }: { status: ReelStatus }) {
  const active = TRACK_INDEX[status];
  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`Status: ${LABELS[status]}`}>
      {([0, 1, 2, 3, 4] as const).map((i) => {
        const reached = i <= active;
        const isCurrent = i === active;
        return (
          <span
            key={i}
            className="block h-[3px] w-6 transition-colors"
            style={{
              background: reached ? COLORS[status] : 'var(--hair-strong)',
              boxShadow: isCurrent ? `0 0 10px ${COLORS[status]}` : undefined,
            }}
          />
        );
      })}
      <span className="ml-2 font-mono text-[10.5px] tracking-[0.16em] uppercase" style={{ color: COLORS[status] }}>
        {LABELS[status]}
      </span>
    </div>
  );
}
