'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ActionButton } from '@/components/action-button';
import { createReel } from '@/server-actions/reels';
import { toast } from 'sonner';

export function NewReelDialog({ shootId }: { shootId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<ActionButton />}>Add reel</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="label-eyebrow mb-1">New reel</div>
          <DialogTitle className="font-display text-[32px] leading-tight tracking-tight">
            One more <span className="italic text-[var(--signal)]">take</span>.
          </DialogTitle>
        </DialogHeader>
        <form
          action={async (fd) => {
            const res = await createReel(shootId, fd);
            if (res?.error) toast.error(res.error);
          }}
          className="mt-4 flex flex-col gap-6"
        >
          <label className="block">
            <span className="label-eyebrow">Title</span>
            <input
              name="title" required
              className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 font-display text-[24px] leading-tight text-[var(--ink)] placeholder:italic placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--signal)]"
              placeholder="Hero montage · wide open"
            />
          </label>
          <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[var(--muted)]">
            Script, product, location and references live on the reel page.
          </p>
          <ActionButton type="submit">Create</ActionButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
