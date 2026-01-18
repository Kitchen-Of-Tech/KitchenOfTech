import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import TeamManagementClient from '@/components/dashboard/TeamManagementClient';

export default async function TeamsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <TeamManagementClient currentUser={user} />;
}
