import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/auth/server';
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        team:teams(id, name, captain:users!teams_captain_id_fkey(id, username, full_name))
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting (20 requests per minute for sensitive operations)
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.apiStrict);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.role || currentUser.role.level > 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, description, team_id, priority, status, start_date, end_date } = await request.json();

    if (!name || !team_id) {
      return NextResponse.json({ error: 'Project name and team are required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert({
        name,
        description,
        team_id,
        priority: priority || 'medium',
        status: status || 'planning',
        start_date,
        end_date
      })
      .select(`
        *,
        team:teams(id, name, captain:users!teams_captain_id_fkey(id, username, full_name))
      `)
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
