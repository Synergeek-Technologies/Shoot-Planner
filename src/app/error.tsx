'use client';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 p-10">
      <div className="label-eyebrow text-[var(--signal)]">Cut — something broke</div>
      <h1 className="font-display text-[56px] leading-[0.95] tracking-tight text-[var(--ink)]">
        A scratch on <span className="italic text-[var(--signal)]">the negative</span>.
      </h1>
      <p className="border-l-2 border-[var(--signal)] pl-3 font-mono text-[12px] leading-relaxed text-[var(--ink-dim)]">
        {error.message || 'The app hit an unexpected error.'}
      </p>
      <button
        onClick={reset}
        className="group inline-flex w-fit items-center gap-3 border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--paper)] transition-all hover:bg-[var(--signal)] hover:border-[var(--signal)]"
      >
        Reload
        <span className="font-display italic text-base transition-transform group-hover:translate-x-0.5">→</span>
      </button>
      <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[var(--muted)]">
        If this persists, note the time and ping an admin.
      </p>
    </main>
  );
}
