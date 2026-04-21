import { signOutAction } from '@/server-actions/account';
import { Button } from '@/components/ui/button';

export function Topbar({ fullName, role }: { fullName: string; role: string }) {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="text-lg font-semibold">Synergeek Shoot Planner</div>
      <div className="flex items-center gap-3 text-sm">
        <span>{fullName || 'Unnamed'} <span className="text-muted-foreground">({role})</span></span>
        <form action={signOutAction}><Button type="submit" variant="ghost" size="sm">Log out</Button></form>
      </div>
    </header>
  );
}
