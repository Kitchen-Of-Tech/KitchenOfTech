import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.auth);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { full_name, username, email, phone_number, password } = await request.json();

    if (!full_name || !username || !email || !password) {
      return NextResponse.json({ error: 'Full name, username, email, and password are required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const { data: existingUsername } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return NextResponse.json({ error: 'This username is already taken' }, { status: 400 });
    }

    const { data: existingRequest } = await supabaseAdmin
      .from('signup_requests')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return NextResponse.json({ error: 'A signup request is already pending for this email' }, { status: 400 });
    }

    const { data: existingRequestUsername } = await supabaseAdmin
      .from('signup_requests')
      .select('id')
      .eq('username', username)
      .eq('status', 'pending')
      .single();

    if (existingRequestUsername) {
      return NextResponse.json({ error: 'A signup request is already pending for this username' }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: authError?.message || 'Failed to create signup request' }, { status: 500 });
    }

    const { error: requestError } = await supabaseAdmin
      .from('signup_requests')
      .insert({
        auth_user_id: authData.user.id,
        username,
        full_name,
        email,
        phone_number,
        user_type: 'team_member',
        status: 'pending',
      });

    if (requestError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: requestError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Signup request submitted for approval.' }, { status: 201 });
  } catch (error) {
    console.error('Error creating signup request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
