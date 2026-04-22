'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ActionButton } from '@/components/action-button';
import { createBrand } from '@/server-actions/brands';
import { toast } from 'sonner';

export function NewBrandDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<ActionButton />}>Add brand</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="label-eyebrow mb-1">New file</div>
          <DialogTitle className="font-display text-[32px] leading-tight tracking-tight">
            Open a <span className="italic text-[var(--signal)]">brand</span>.
          </DialogTitle>
        </DialogHeader>
        <form action={async (fd) => {
          const res = await createBrand(fd);
          if (res?.error) toast.error(res.error);
        }} className="mt-4 flex flex-col gap-6">
          <label className="block">
            <span className="label-eyebrow">Name</span>
            <input
              name="name" required
              className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 font-display text-[24px] leading-tight text-[var(--ink)] placeholder:italic placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--signal)]"
              placeholder="Acme Studios"
            />
          </label>
          <label className="block">
            <span className="label-eyebrow">Description (optional)</span>
            <textarea
              name="description" rows={3}
              className="mt-2 w-full border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 text-[14px] leading-[1.5] text-[var(--ink)] placeholder:italic placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--signal)] resize-none"
              placeholder="A note about the client or the work."
            />
          </label>
          <ActionButton type="submit">Create</ActionButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
