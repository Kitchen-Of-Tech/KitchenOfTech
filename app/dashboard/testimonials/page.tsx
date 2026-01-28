import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/server';
import TestimonialManagementClient from '@/components/dashboard/TestimonialManagementClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function TestimonialsPage() {
  const user = await getCurrentUser();

  console.log('Testimonials Page - User data:', {
    hasUser: !!user,
    email: user?.email,
    hasRole: !!user?.role,
    roleLevel: user?.role?.level,
    roleName: user?.role?.name,
  });

  if (!user) {
    console.log('Testimonials Page - No user, redirecting to login');
    redirect('/login');
  }

  // Only CEO and Manager can access this page
  if (!user.role || user.role.level > 2) {
    console.log('Testimonials Page - Access denied, redirecting to dashboard', {
      hasRole: !!user.role,
      level: user.role?.level,
    });
    redirect('/dashboard');
  }

  return <TestimonialManagementClient currentUser={user} />;
}

