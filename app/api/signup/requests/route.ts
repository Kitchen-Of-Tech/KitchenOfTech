import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/auth/server';

function isCeo(level?: number) {
  return level !== undefined && level === 1;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !isCeo(currentUser.role?.level)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: requests, error } = await supabaseAdmin
      .from('signup_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching signup requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
