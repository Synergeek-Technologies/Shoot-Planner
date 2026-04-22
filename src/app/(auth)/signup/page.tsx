'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signUpAction } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full items-center justify-between border border-[var(--ink)] bg-[var(--ink)] px-5 py-3.5 text-[var(--paper)] transition-all hover:bg-[var(--signal)] hover:border-[var(--signal)] disabled:opacity-60"
    >
      <span className="font-mono text-[11px] tracking-[0.22em] uppercase">
        {pending ? 'Creating…' : 'Create account'}
      </span>
      <span className="font-display italic text-xl leading-none transition-transform group-hover:translate-x-1">→</span>
    </button>
  );
}

export default function SignupPage() {
  const [state, action] = useActionState(signUpAction, { error: '' });

  return (
    <main className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
      {/* Left — form */}
      <section className="order-2 flex flex-col justify-center px-8 py-16 lg:order-1 lg:px-16 fade-up">
        <div className="mx-auto w-full max-w-sm">
          <div className="label-eyebrow mb-2">Request access</div>
          <h2 className="font-display text-[42px] leading-[0.95] tracking-tight text-[var(--ink)]">
            Join the crew.
          </h2>
          <p className="mt-3 text-[13.5px] text-[var(--ink-dim)]">
            Already on board? <Link href="/login" className="link-slide text-[var(--signal)]">Sign in</Link>.
          </p>

          <form action={action} className="mt-10 flex flex-col gap-7">
            <label className="block">
              <span className="label-eyebrow">Full name</span>
              <input
                name="full_name" required
                className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 text-[16px] text-[var(--ink)] focus:outline-none focus:border-[var(--signal)]"
              />
            </label>
            <label className="block">
              <span className="label-eyebrow">Email</span>
              <input
                name="email" type="email" required
                className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 text-[16px] text-[var(--ink)] focus:outline-none focus:border-[var(--signal)]"
              />
            </label>
            <label className="block">
              <span className="label-eyebrow">Password · 8+ chars</span>
              <input
                name="password" type="password" required minLength={8}
                className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 text-[16px] text-[var(--ink)] focus:outline-none focus:border-[var(--signal)]"
              />
            </label>
            {state?.error && (
              <p className="border-l-2 border-[var(--signal)] pl-3 font-mono text-[12px] tracking-[0.05em] text-[var(--signal)]">
                {state.error}
              </p>
            )}
            <SubmitButton />
            <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[var(--muted)]">
              New accounts land as <span className="text-[var(--ink-dim)]">viewer</span> until an admin grants more access.
            </p>
          </form>
        </div>
      </section>

      {/* Right — poster */}
      <section className="order-1 relative flex flex-col justify-between border-l border-[var(--hair)] bg-[var(--card)] px-12 py-10 lg:order-2 lg:px-16">
        <div className="flex items-center justify-between">
          <span className="label-eyebrow">Scene 02 · New face on set</span>
          <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-[var(--muted)]">
            Take 01
          </span>
        </div>

        <div className="max-w-lg">
          <div className="label-eyebrow mb-5 text-[var(--signal)]">Welcome aboard</div>
          <h1 className="font-display text-[clamp(48px,6vw,88px)] leading-[0.95] tracking-tight text-[var(--ink)]">
            Good light, good <span className="italic text-[var(--signal)]">company</span>,<br />
            and a plan that holds.
          </h1>
          <p className="mt-7 max-w-md text-[15px] leading-relaxed text-[var(--ink-dim)]">
            Your sign-up creates a viewer account. Ask an admin to mark you as an editor
            when you&rsquo;re ready to build shoots of your own.
          </p>
        </div>

        <div className="flex items-end justify-between font-mono text-[10.5px] tracking-[0.18em] uppercase text-[var(--muted)]">
          <span>Ref · Op. 014</span>
          <span>— action —</span>
        </div>
      </section>
    </main>
  );
}
