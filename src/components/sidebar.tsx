import Link from 'next/link';
import { LayoutDashboard, Calendar, Building2, Users, UserCircle } from 'lucide-react';
import type { UserRole } from '@/lib/auth/require-role';

export function Sidebar({ role }: { role: UserRole }) {
  return (
    <aside className="flex w-56 flex-col gap-1 border-r bg-muted/30 p-4">
      <Link href="/" className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"><LayoutDashboard size={16} />Dashboard</Link>
      <Link href="/calendar" className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"><Calendar size={16} />Calendar</Link>
      <Link href="/brands" className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"><Building2 size={16} />Brands</Link>
      {role === 'admin' && (
        <Link href="/team" className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"><Users size={16} />Team</Link>
      )}
      <Link href="/account" className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"><UserCircle size={16} />Account</Link>
    </aside>
  );
}
