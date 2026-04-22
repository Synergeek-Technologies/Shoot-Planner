import Link from 'next/link';

type Crumb = { label: string; href?: string };

type Props = {
  crumbs?: Crumb[];
  slug?: string;      // e.g. "BRAND / SHOOT / 12 MAY 26"
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  side?: React.ReactNode;
};

/**
 * Film-slate header used across the app. Each page opens with an eyebrow slug,
 * an oversized display title, and optional action on the right.
 */
export function PageHeader({ crumbs, slug, title, subtitle, side }: Props) {
  return (
    <header className="mb-10 border-b border-[var(--hair)] pb-7">
      {(crumbs?.length || slug) && (
        <div className="mb-5 flex items-center gap-3 font-mono text-[10.5px] tracking-[0.18em] uppercase text-[var(--muted)]">
          {slug && <span>{slug}</span>}
          {crumbs?.map((c, i) => (
            <span key={i} className="flex items-center gap-3">
              {(i > 0 || slug) && <span aria-hidden className="text-[var(--hair-strong)]">/</span>}
              {c.href ? (
                <Link href={c.href} className="link-slide hover:text-[var(--ink)]">{c.label}</Link>
              ) : (
                <span className="text-[var(--ink-dim)]">{c.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end justify-between gap-8">
        <div className="min-w-0 max-w-[62ch]">
          <h1 className="font-display text-[clamp(40px,5vw,68px)] leading-[0.95] tracking-tight text-[var(--ink)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-dim)]">{subtitle}</p>
          )}
        </div>
        {side && <div className="shrink-0">{side}</div>}
      </div>
    </header>
  );
}
