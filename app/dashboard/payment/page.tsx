import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/server';
import PaymentManagementClient from '@/components/dashboard/PaymentManagementClient';

export default async function PaymentPage() {
  const user = await getCurrentUser();

  console.log('Payment Page - User data:', {
    hasUser: !!user,
    email: user?.email,
    hasRole: !!user?.role,
    roleLevel: user?.role?.level,
    roleName: user?.role?.name,
  });

  if (!user) {
    console.log('Payment Page - No user, redirecting to login');
    redirect('/login');
  }

  // Only CEO and Manager can manage payments
  if (!user.role || user.role.level > 2) {
    console.log('Payment Page - Access denied, redirecting to dashboard', {
      hasRole: !!user.role,
      level: user.role?.level,
    });
    redirect('/dashboard');
  }

  return <PaymentManagementClient currentUser={user} />;
}
