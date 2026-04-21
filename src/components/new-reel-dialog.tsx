'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createReel } from '@/server-actions/reels';
import { toast } from 'sonner';

export function NewReelDialog({ shootId }: { shootId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>+ New reel</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a reel</DialogTitle></DialogHeader>
        <form
          action={async (fd) => {
            const res = await createReel(shootId, fd);
            if (res?.error) toast.error(res.error);
          }}
          className="flex flex-col gap-4"
        >
          <div><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
