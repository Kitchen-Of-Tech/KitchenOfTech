import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/auth/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { assigned_users, ...taskData } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update task
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .select(`
        *,
        project:projects(id, name, team:teams(id, name))
      `)
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    // Update assignments if provided
    if (assigned_users !== undefined) {
      // Delete existing assignments
      await supabaseAdmin.from('task_assignments').delete().eq('task_id', id);
      
      // Add new assignments
      if (assigned_users.length > 0) {
        const assignments = assigned_users.map((user_id: string) => ({
          task_id: id,
          user_id
        }));
        await supabaseAdmin.from('task_assignments').insert(assignments);
      }
    }

    return NextResponse.json({ task: data });
  } catch (error) {
    console.error('Error in PATCH /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.role || currentUser.role.level > 3) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
