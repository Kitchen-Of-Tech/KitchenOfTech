import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import TestimonialManagementClient from '@/components/dashboard/TestimonialManagementClient';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;

  if (!token) {
    return null;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  
  if (!user) {
    return null;
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('id', user.id)
    .single();

  return userData;
}

export default async function TestimonialsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Only CEO and Manager can access this page
  if (user.role?.level > 2) {
    redirect('/dashboard');
  }

  return <TestimonialManagementClient currentUser={user} />;
}
