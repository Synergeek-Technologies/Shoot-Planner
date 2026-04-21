import { getCurrentUser } from '@/lib/auth/require-role';
import { AccountForms } from './forms';

export default async function AccountPage() {
  const { user, profile } = await getCurrentUser();
  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="text-sm text-muted-foreground">{user.email} ({profile.role})</p>
      <AccountForms initialName={profile.full_name} />
    </div>
  );
}
