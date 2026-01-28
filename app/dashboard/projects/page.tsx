import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import ProjectManagementClient from '@/components/dashboard/ProjectManagementClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <ProjectManagementClient currentUser={user} />;
}

