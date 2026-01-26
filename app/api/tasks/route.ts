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

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, name, team:teams(id, name)),
        task_assignments(
          id,
          user:users(id, username, full_name, email, role:roles(*))
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting (20 requests per minute for sensitive operations)
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.apiStrict);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, description, project_id, priority, status, due_date, assigned_users } = await request.json();

    if (!title || !project_id) {
      return NextResponse.json({ error: 'Task title and project are required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .insert({
        title,
        description,
        project_id,
        priority: priority || 'medium',
        status: status || 'todo',
        due_date,
        created_by: currentUser.id
      })
      .select(`
        *,
        project:projects(id, name, team:teams(id, name))
      `)
      .single();

    if (taskError) {
      console.error('Error creating task:', taskError);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    // Assign users to task
    if (assigned_users && assigned_users.length > 0) {
      const assignments = assigned_users.map((user_id: string) => ({
        task_id: task.id,
        user_id
      }));

      await supabaseAdmin.from('task_assignments').insert(assignments);
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
