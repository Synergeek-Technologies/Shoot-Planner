'use client';
import { toast } from 'sonner';
import { updateFullName, updatePassword } from '@/server-actions/account';

export function AccountForms({ initialName }: { initialName: string }) {
  return (
    <div className="space-y-14">
      <FormBlock
        label="Identity"
        number="01"
        hint="The name your teammates see on every shoot you touch."
        action={async (fd) => {
          const res = await updateFullName(fd);
          if ('error' in res && res.error) toast.error(res.error);
          else toast.success('Name updated');
        }}
        submit="Save name"
      >
        <label className="block">
          <span className="label-eyebrow">Full name</span>
          <input
            name="full_name"
            defaultValue={initialName}
            className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 font-display text-[26px] leading-tight text-[var(--ink)] focus:outline-none focus:border-[var(--signal)]"
          />
        </label>
      </FormBlock>

      <FormBlock
        label="Passphrase"
        number="02"
        hint="Minimum eight characters. Used the next time you sign in."
        action={async (fd) => {
          const res = await updatePassword(fd);
          if ('error' in res && res.error) toast.error(res.error);
          else toast.success('Password updated');
        }}
        submit="Change password"
      >
        <label className="block">
          <span className="label-eyebrow">New password</span>
          <input
            name="password" type="password" minLength={8}
            placeholder="••••••••"
            className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 font-mono text-[18px] tracking-[0.1em] text-[var(--ink)] focus:outline-none focus:border-[var(--signal)]"
          />
        </label>
      </FormBlock>
    </div>
  );
}

function FormBlock({
  label, number, hint, action, submit, children,
}: {
  label: string; number: string; hint: string;
  action: (fd: FormData) => Promise<void>; submit: string; children: React.ReactNode;
}) {
  return (
    <form action={action} className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
      <aside>
        <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[var(--signal)]">
          Section {number}
        </div>
        <h3 className="mt-2 font-display text-[28px] leading-[0.95] tracking-tight text-[var(--ink)]">
          {label}
        </h3>
        <p className="mt-3 max-w-[180px] text-[12.5px] leading-relaxed text-[var(--ink-dim)]">{hint}</p>
      </aside>
      <div className="space-y-5">
        {children}
        <button
          type="submit"
          className="group flex items-center gap-3 border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--paper)] transition-all hover:bg-[var(--signal)] hover:border-[var(--signal)]"
        >
          {submit}
          <span className="font-display italic text-base transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>
    </form>
  );
}
