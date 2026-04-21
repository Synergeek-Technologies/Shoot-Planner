'use client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateFullName, updatePassword } from '@/server-actions/account';

export function AccountForms({ initialName }: { initialName: string }) {
  return (
    <div className="space-y-8">
      <form
        action={async (fd) => {
          const res = await updateFullName(fd);
          if ('error' in res && res.error) toast.error(res.error);
          else toast.success('Name updated');
        }}
        className="flex flex-col gap-3"
      >
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" defaultValue={initialName} />
        <Button type="submit" className="self-start">Save name</Button>
      </form>

      <form
        action={async (fd) => {
          const res = await updatePassword(fd);
          if ('error' in res && res.error) toast.error(res.error);
          else toast.success('Password updated');
        }}
        className="flex flex-col gap-3"
      >
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" minLength={8} />
        <Button type="submit" className="self-start">Change password</Button>
      </form>
    </div>
  );
}
