import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import TaskManagementClient from '@/components/dashboard/TaskManagementClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function TasksPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <TaskManagementClient currentUser={user} />;
}

