import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// PATCH - Approve or Reject a testimonial
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { id } = await params;
    const body = await request.json();
    const { action, user_id } = body; // action: 'approve' or 'reject', user_id: who is performing the action

    if (!action || !user_id) {
      return NextResponse.json(
        { error: 'Action and user_id are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Verify user has permission (CEO or Manager)
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*, role:roles(*)')
      .eq('id', user_id)
      .single();

    if (!user || user.role.level > 2) {
      return NextResponse.json(
        { error: 'Unauthorized. Only CEO and Managers can manage testimonials.' },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {
      status: action === 'approve' ? 'approved' : 'rejected',
    };

    if (action === 'approve') {
      updateData.approved_by = user_id;
      updateData.approved_at = new Date().toISOString();
      updateData.rejected_by = null;
      updateData.rejected_at = null;
    } else {
      updateData.rejected_by = user_id;
      updateData.rejected_at = new Date().toISOString();
      updateData.approved_by = null;
      updateData.approved_at = null;
    }

    const { data: testimonial, error } = await supabaseAdmin
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        link:testimonial_links(id, email, token),
        approved_by_user:users!testimonials_approved_by_fkey(id, full_name, username),
        rejected_by_user:users!testimonials_rejected_by_fkey(id, full_name, username)
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Testimonial ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      testimonial,
    });
  } catch (error: unknown) {
    console.error('Error updating testimonial:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update testimonial';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete a testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { id } = await params;
    
    // Get user_id from query params or body
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Verify user has permission (CEO or Manager)
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*, role:roles(*)')
      .eq('id', userId)
      .single();

    if (!user || user.role.level > 2) {
      return NextResponse.json(
        { error: 'Unauthorized. Only CEO and Managers can delete testimonials.' },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting testimonial:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete testimonial';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
