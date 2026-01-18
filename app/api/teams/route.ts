import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/auth/server';

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

    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        captain:users!teams_captain_id_fkey(id, username, full_name, email),
        team_members(
          id,
          user:users(id, username, full_name, email, role:roles(*))
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.role || currentUser.role.level > 2) {
      return NextResponse.json({ error: 'Unauthorized. Only CEO and Managers can create teams.' }, { status: 403 });
    }

    const { name, description, captain_id } = await request.json();

    if (!name || !captain_id) {
      return NextResponse.json({ error: 'Team name and captain are required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create team
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert({
        name,
        description,
        captain_id
      })
      .select(`
        *,
        captain:users!teams_captain_id_fkey(id, username, full_name, email)
      `)
      .single();

    if (teamError) {
      console.error('Error creating team:', teamError);
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }

    // Add captain as team member
    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: captain_id
      });

    if (memberError) {
      console.error('Error adding captain to team:', memberError);
    }

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
