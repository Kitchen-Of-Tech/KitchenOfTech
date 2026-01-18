import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import TaskManagementClient from '@/components/dashboard/TaskManagementClient';

export default async function TasksPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <TaskManagementClient currentUser={user} />;
}
