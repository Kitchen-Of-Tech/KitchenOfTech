import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import ProjectManagementClient from '@/components/dashboard/ProjectManagementClient';

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <ProjectManagementClient currentUser={user} />;
}
