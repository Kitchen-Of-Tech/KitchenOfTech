import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import TeamManagementClient from '@/components/dashboard/TeamManagementClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function TeamsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <TeamManagementClient currentUser={user} />;
}

