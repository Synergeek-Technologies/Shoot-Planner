import { forwardRef, type ButtonHTMLAttributes } from 'react';

/**
 * A film-slate styled button used as a consistent primary-action chrome
 * across the app. Matches the sign-in / signup form button.
 */
export const ActionButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function ActionButton({ className = '', children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        className={`group inline-flex items-center gap-3 border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--paper)] transition-all hover:bg-[var(--signal)] hover:border-[var(--signal)] disabled:opacity-40 ${className}`}
        {...rest}
      >
        {children}
        <span className="font-display italic text-base leading-none transition-transform group-hover:translate-x-0.5">→</span>
      </button>
    );
  }
);
