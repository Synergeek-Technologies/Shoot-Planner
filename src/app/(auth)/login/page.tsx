'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { signInAction } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full items-center justify-between border border-[var(--ink)] bg-[var(--ink)] px-5 py-3.5 text-[var(--paper)] transition-all hover:bg-[var(--signal)] hover:border-[var(--signal)] disabled:opacity-60"
    >
      <span className="font-mono text-[11px] tracking-[0.22em] uppercase">
        {pending ? 'One moment…' : 'Enter'}
      </span>
      <span className="font-display italic text-xl leading-none transition-transform group-hover:translate-x-1">→</span>
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useActionState(signInAction, { error: '' });

  return (
    <main className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left — title card */}
      <section className="relative flex flex-col justify-between border-r border-[var(--hair)] bg-[var(--card)] px-12 py-10 lg:px-16">
        <div className="flex items-center justify-between">
          <span className="label-eyebrow">Scene 01 · Int. Studio — Night</span>
          <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-[var(--muted)]">
            Take 01
          </span>
        </div>

        <div className="max-w-lg fade-up">
          <Image
            src="/synergeek-wordmark.png"
            alt="Synergeek"
            width={1600}
            height={900}
            priority
            className="mb-6 h-auto w-[180px]"
          />
          <div className="label-eyebrow mb-5 text-[var(--signal)]">Est. 2026</div>
          <h1 className="font-display text-[clamp(52px,7vw,96px)] leading-[0.95] tracking-tight text-[var(--ink)]">
            A planner for <span className="italic text-[var(--signal)]">every frame</span> you intend to shoot.
          </h1>
          <p className="mt-7 max-w-md text-[15px] leading-relaxed text-[var(--ink-dim)]">
            Scripts, references, products, locations — gathered in one quiet room and
            moved through the pipeline with the whole team watching.
          </p>
        </div>

        <div className="flex items-end justify-between font-mono text-[10.5px] tracking-[0.18em] uppercase text-[var(--muted)]">
          <span>Roll 04 / A-Cam</span>
          <span>— fin —</span>
        </div>
      </section>

      {/* Right — sign in */}
      <section className="flex flex-col justify-center px-8 py-16 lg:px-16 fade-up" style={{ animationDelay: '120ms' }}>
        <div className="mx-auto w-full max-w-sm">
          <div className="label-eyebrow mb-2">Access</div>
          <h2 className="font-display text-[42px] leading-[0.95] tracking-tight text-[var(--ink)]">
            Sign in.
          </h2>
          <p className="mt-3 text-[13.5px] text-[var(--ink-dim)]">
            New here? <Link href="/signup" className="link-slide text-[var(--signal)]">Request an account</Link>.
          </p>

          <form action={action} className="mt-10 flex flex-col gap-7">
            <label className="block">
              <span className="label-eyebrow">Email</span>
              <input
                name="email" type="email" required autoComplete="email"
                className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 text-[16px] text-[var(--ink)] focus:outline-none focus:border-[var(--signal)]"
              />
            </label>
            <label className="block">
              <span className="label-eyebrow">Password</span>
              <input
                name="password" type="password" required autoComplete="current-password"
                className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 text-[16px] text-[var(--ink)] focus:outline-none focus:border-[var(--signal)]"
              />
            </label>
            {state?.error && (
              <p className="border-l-2 border-[var(--signal)] pl-3 font-mono text-[12px] tracking-[0.05em] text-[var(--signal)]">
                {state.error}
              </p>
            )}
            <SubmitButton />
          </form>
        </div>
      </section>
    </main>
  );
}
