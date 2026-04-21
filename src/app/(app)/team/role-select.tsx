'use client';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserRole } from '@/server-actions/team';

export function RoleSelect({ userId, current, disabled }: { userId: string; current: 'admin'|'editor'|'viewer'; disabled?: boolean }) {
  const [, start] = useTransition();
  return (
    <Select
      value={current}
      disabled={disabled}
      onValueChange={(v) => start(async () => {
        const res = await updateUserRole(userId, v ?? '');
        if ('error' in res && res.error) toast.error(res.error);
        else toast.success('Role updated');
      })}
    >
      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="viewer">Viewer</SelectItem>
      </SelectContent>
    </Select>
  );
}
