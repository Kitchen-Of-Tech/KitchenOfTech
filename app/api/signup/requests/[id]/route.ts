import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/auth/server';

function isCeo(level?: number) {
  return level !== undefined && level === 1;
}

const toUsernameBase = (email: string) =>
  email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');

async function generateUsername(supabaseAdmin: SupabaseClient, email: string) {
  const base = toUsernameBase(email) || 'team_member';
  let candidate = base;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', candidate)
      .single();

    if (!existing) return candidate;

    const suffix = Math.floor(1000 + Math.random() * 9000);
    candidate = `${base}${suffix}`;
  }

  return `${base}${Date.now().toString().slice(-6)}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !isCeo(currentUser.role?.level)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { action, role_id, department, title, rejection_reason } = await request.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: requestRow, error: requestError } = await supabaseAdmin
      .from('signup_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError || !requestRow) {
      return NextResponse.json({ error: 'Signup request not found' }, { status: 404 });
    }

    if (requestRow.status !== 'pending') {
      return NextResponse.json({ error: 'Signup request already processed' }, { status: 400 });
    }

    if (action === 'reject') {
      if (requestRow.auth_user_id) {
        await supabaseAdmin.auth.admin.deleteUser(requestRow.auth_user_id);
      }

      const { error: rejectError } = await supabaseAdmin
        .from('signup_requests')
        .update({
          status: 'rejected',
          rejected_by: currentUser.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: rejection_reason || null,
        })
        .eq('id', id);

      if (rejectError) {
        return NextResponse.json({ error: rejectError.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Signup request rejected' });
    }

    if (!role_id) {
      return NextResponse.json({ error: 'Role is required for approval' }, { status: 400 });
    }

    const username = await generateUsername(supabaseAdmin, requestRow.email);

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: requestRow.auth_user_id,
        username,
        email: requestRow.email,
        full_name: requestRow.full_name,
        role_id,
        is_active: true,
        phone_number: requestRow.phone_number,
        department: department || null,
        title: title || null,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { error: approveError } = await supabaseAdmin
      .from('signup_requests')
      .update({
        status: 'approved',
        approved_by: currentUser.id,
        approved_at: new Date().toISOString(),
        role_id,
        department: department || null,
        title: title || null,
      })
      .eq('id', id);

    if (approveError) {
      return NextResponse.json({ error: approveError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Signup request approved' });
  } catch (error) {
    console.error('Error updating signup request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
