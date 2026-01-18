import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import UserManagementClient from '@/components/dashboard/UserManagementClient';

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Only CEO and Manager can access this page
  if (user.role.level > 2) {
    redirect('/dashboard');
  }

  return <UserManagementClient currentUser={user} />;
}
