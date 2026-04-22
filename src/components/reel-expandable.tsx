'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, FileText } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import type { ReelStatus } from '@/lib/schemas/reel';

type ReelReference = { id: string; url: string; label: string };

export type ExpandableReel = {
  id: string;
  title: string;
  status: ReelStatus;
  script_text: string;
  script_file_url: string | null;
  product_name: string;
  product_image_url: string | null;
  location_text: string;
  location_image_url: string | null;
  reel_references: ReelReference[] | null;
};

export function ReelExpandable({ reel, index }: { reel: ExpandableReel; index: number }) {
  const [open, setOpen] = useState(false);
  const refs = reel.reel_references ?? [];
  const hasBody =
    reel.script_text.trim().length > 0 ||
    !!reel.script_file_url ||
    reel.product_name.trim().length > 0 ||
    !!reel.product_image_url ||
    reel.location_text.trim().length > 0 ||
    !!reel.location_image_url ||
    refs.length > 0;

  return (
    <li className="border-b border-[var(--hair)]">
      <div className="group grid grid-cols-[60px_1fr_auto_auto_auto] items-center gap-6 px-2 py-5 transition-colors hover:bg-[var(--card)]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`reel-body-${reel.id}`}
          className="flex items-center gap-3 col-span-2 text-left"
        >
          <ChevronDown
            size={14}
            className={`text-[var(--muted)] transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}
          />
          <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[var(--muted)]">
            R-{String(index + 1).padStart(3, '0')}
          </span>
          <span className="font-display text-[24px] leading-tight text-[var(--ink)]">
            {reel.title}
          </span>
        </button>

        <StatusBadge status={reel.status} />

        <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--muted)]">
          {refs.length} {refs.length === 1 ? 'ref' : 'refs'}
        </span>

        <Link
          href={`/reels/${reel.id}`}
          className="link-slide font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-dim)]"
        >
          Open →
        </Link>
      </div>

      {open && (
        <div
          id={`reel-body-${reel.id}`}
          className="fade-up border-t border-dashed border-[var(--hair)] bg-[var(--paper-raised)] px-8 py-7"
        >
          {!hasBody ? (
            <p className="font-mono text-[12px] tracking-[0.12em] uppercase text-[var(--muted)]">
              No contents yet · open the reel to add script, product, location, and references.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                {reel.script_text.trim().length > 0 && (
                  <Section label="Script">
                    <p className="whitespace-pre-wrap font-display text-[17px] leading-relaxed text-[var(--ink)]">
                      {reel.script_text}
                    </p>
                  </Section>
                )}
                {reel.script_file_url && (
                  <Section label="Script file">
                    <a
                      href={reel.script_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-[var(--hair-strong)] bg-[var(--card)] px-3 py-2 text-[13px] text-[var(--ink)] hover:border-[var(--signal)] hover:text-[var(--signal)]"
                    >
                      <FileText size={14} />
                      <span className="truncate max-w-[280px]">
                        {reel.script_file_url.split('/').pop() ?? 'Open file'}
                      </span>
                    </a>
                  </Section>
                )}
                {refs.length > 0 && (
                  <Section label={`References · ${refs.length}`}>
                    <ul className="space-y-2">
                      {refs.map((r) => (
                        <li key={r.id} className="flex items-baseline gap-3">
                          <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[var(--muted)] whitespace-nowrap">
                            ↗
                          </span>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-slide break-all text-[14px] text-[var(--ink)]"
                          >
                            {r.label || r.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
              </div>

              <div className="space-y-6">
                {(reel.product_name.trim().length > 0 || reel.product_image_url) && (
                  <Section label="Product">
                    {reel.product_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={reel.product_image_url}
                        alt={reel.product_name || 'Product'}
                        className="mb-3 aspect-[4/3] w-full border border-[var(--hair)] bg-[var(--card)] object-cover"
                      />
                    )}
                    {reel.product_name.trim().length > 0 && (
                      <p className="font-display text-[18px] leading-tight text-[var(--ink)]">
                        {reel.product_name}
                      </p>
                    )}
                  </Section>
                )}
                {(reel.location_text.trim().length > 0 || reel.location_image_url) && (
                  <Section label="Location">
                    {reel.location_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={reel.location_image_url}
                        alt={reel.location_text ? reel.location_text.slice(0, 60) : 'Location'}
                        className="mb-3 aspect-[4/3] w-full border border-[var(--hair)] bg-[var(--card)] object-cover"
                      />
                    )}
                    {reel.location_text.trim().length > 0 && (
                      <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--ink-dim)]">
                        {reel.location_text}
                      </p>
                    )}
                  </Section>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label-eyebrow mb-3">{label}</div>
      {children}
    </div>
  );
}
