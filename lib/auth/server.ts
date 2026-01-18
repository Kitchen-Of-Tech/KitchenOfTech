import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@/types/auth';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) {
    return null;
  }

  // Get user profile with role using service role key
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select(`
      *,
      role:roles(*)
    `)
    .eq('id', authUser.id)
    .single();

  if (error || !userData) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }

  return userData as unknown as User;
}
