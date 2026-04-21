'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createBrand } from '@/server-actions/brands';
import { toast } from 'sonner';

export function NewBrandDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>+ New brand</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create brand</DialogTitle></DialogHeader>
        <form action={async (fd) => {
          const res = await createBrand(fd);
          if (res?.error) toast.error(res.error);
        }} className="flex flex-col gap-4">
          <div><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
          <div><Label htmlFor="description">Description (optional)</Label><Textarea id="description" name="description" /></div>
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
