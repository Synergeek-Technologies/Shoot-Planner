'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ActionButton } from '@/components/action-button';
import { createShoot } from '@/server-actions/shoots';
import { toast } from 'sonner';

export function NewShootDialog({ brandId }: { brandId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<ActionButton />}>Schedule shoot</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="label-eyebrow mb-1">New call sheet</div>
          <DialogTitle className="font-display text-[32px] leading-tight tracking-tight">
            A <span className="italic text-[var(--signal)]">shoot day</span>.
          </DialogTitle>
        </DialogHeader>
        <form
          action={async (fd) => {
            const res = await createShoot(brandId, fd);
            if (res?.error) toast.error(res.error);
          }}
          className="mt-4 flex flex-col gap-6"
        >
          <label className="block">
            <span className="label-eyebrow">Title</span>
            <input
              name="title" required
              className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 font-display text-[24px] leading-tight text-[var(--ink)] placeholder:italic placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--signal)]"
              placeholder="Spring campaign · day one"
            />
          </label>
          <label className="block">
            <span className="label-eyebrow">Date & call time</span>
            <input
              name="scheduled_at" type="datetime-local" required
              className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 font-mono text-[16px] text-[var(--ink)] focus:outline-none focus:border-[var(--signal)] [color-scheme:dark]"
            />
          </label>
          <label className="block">
            <span className="label-eyebrow">Location notes (optional)</span>
            <textarea
              name="location_notes" rows={2}
              className="mt-2 w-full resize-none border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 text-[14px] leading-[1.5] text-[var(--ink)] placeholder:italic placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--signal)]"
              placeholder="Studio B · parking out back"
            />
          </label>
          <ActionButton type="submit">Schedule</ActionButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
