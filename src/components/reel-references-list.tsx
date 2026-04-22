'use client';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Link2, X } from 'lucide-react';
import { addReference, removeReference } from '@/server-actions/reel-references';

type Ref = { id: string; url: string; label: string };

export function ReelReferencesList({ reelId, initial, canEdit }: { reelId: string; initial: Ref[]; canEdit: boolean }) {
  const [refs, setRefs] = useState(initial);
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [, start] = useTransition();

  const add = () => {
    if (!url) return;
    const fd = new FormData();
    fd.set('url', url);
    fd.set('label', label);
    start(async () => {
      const res = await addReference(reelId, fd);
      if ('error' in res) { toast.error(res.error); return; }
      setRefs([...refs, res.reference]);
      setUrl(''); setLabel('');
    });
  };

  const remove = (id: string) => {
    const snapshot = refs;
    setRefs(refs.filter((r) => r.id !== id));
    start(async () => {
      const res = await removeReference(id, reelId);
      if ('error' in res && res.error) {
        toast.error(res.error);
        setRefs(snapshot);
      }
    });
  };

  return (
    <section className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
      <aside className="md:sticky md:top-8 md:self-start">
        <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[var(--signal)]">
          Section 04
        </div>
        <h3 className="mt-2 font-display text-[34px] leading-[0.95] tracking-tight text-[var(--ink)]">
          References
        </h3>
        <p className="mt-3 max-w-[180px] text-[12.5px] leading-relaxed text-[var(--ink-dim)]">
          Links the team should watch before the shoot. Moodboards, inspiration, the real thing.
        </p>
      </aside>

      <div className="space-y-5">
        <ul className="border-t border-[var(--hair)]">
          {refs.length === 0 && (
            <li className="border-b border-dashed border-[var(--hair-strong)] py-6 text-[13px] italic text-[var(--muted)]">
              No references yet — the moodboard is empty.
            </li>
          )}
          {refs.map((r, i) => (
            <li key={r.id} className="group flex items-baseline justify-between gap-4 border-b border-[var(--hair)] py-3.5">
              <span className="flex min-w-0 items-baseline gap-4">
                <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[var(--muted)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <a href={r.url} target="_blank" rel="noreferrer"
                  className="flex min-w-0 items-baseline gap-2 text-[var(--ink)]">
                  <Link2 size={13} className="translate-y-[1px] text-[var(--signal)]" />
                  <span className="link-slide truncate">{r.label || r.url}</span>
                </a>
              </span>
              {canEdit && (
                <button
                  onClick={() => remove(r.id)}
                  className="opacity-0 transition-opacity hover:text-[var(--signal)] group-hover:opacity-100"
                  aria-label="Remove reference"
                >
                  <X size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>

        {canEdit && (
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[160px] flex-1 flex-col">
              <span className="label-eyebrow">Label (optional)</span>
              <input
                value={label} onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Hero montage ref"
                className="mt-2 border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 text-[14px] text-[var(--ink)] focus:outline-none focus:border-[var(--signal)]"
              />
            </label>
            <label className="flex min-w-[260px] flex-[2] flex-col">
              <span className="label-eyebrow">URL</span>
              <input
                value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="mt-2 border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 text-[14px] text-[var(--ink)] focus:outline-none focus:border-[var(--signal)]"
              />
            </label>
            <button
              type="button" onClick={add} disabled={!url}
              className="border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--paper)] transition-all hover:bg-[var(--signal)] hover:border-[var(--signal)] disabled:opacity-40"
            >
              Add link
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
