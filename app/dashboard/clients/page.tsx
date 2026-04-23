import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import ClientManagementClient from '../../../components/dashboard/ClientManagementClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ClientsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Only CEO and Manager can access this page
  if (!user.role || user.role.level > 2) {
    redirect('/dashboard');
  }

  return <ClientManagementClient currentUser={user} />;
}
