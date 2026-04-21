'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createShoot } from '@/server-actions/shoots';
import { toast } from 'sonner';

export function NewShootDialog({ brandId }: { brandId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>+ New shoot</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Schedule a shoot</DialogTitle></DialogHeader>
        <form
          action={async (fd) => {
            const res = await createShoot(brandId, fd);
            if (res?.error) toast.error(res.error);
          }}
          className="flex flex-col gap-4"
        >
          <div><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
          <div><Label htmlFor="scheduled_at">Date &amp; time</Label><Input id="scheduled_at" name="scheduled_at" type="datetime-local" required /></div>
          <div><Label htmlFor="location_notes">Location notes (optional)</Label><Textarea id="location_notes" name="location_notes" /></div>
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
