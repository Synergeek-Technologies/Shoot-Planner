import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { getCurrentUser } from '@/lib/auth/require-role';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentUser();
  return (
    <div className="flex min-h-screen">
      <Sidebar role={profile.role} />
      <div className="flex flex-1 flex-col">
        <Topbar fullName={profile.full_name} role={profile.role} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
