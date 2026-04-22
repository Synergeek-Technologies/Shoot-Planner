import { getCurrentUser } from '@/lib/auth/require-role';
import { AccountForms } from './forms';
import { PageHeader } from '@/components/page-header';

export default async function AccountPage() {
  const { user, profile } = await getCurrentUser();
  return (
    <div className="max-w-[720px]">
      <PageHeader
        slug={`ACCOUNT · ${profile.role.toUpperCase()}`}
        title={<>Your <span className="italic text-[var(--signal)]">chair</span>.</>}
        subtitle={user.email ?? undefined}
      />
      <AccountForms initialName={profile.full_name} />
    </div>
  );
}
