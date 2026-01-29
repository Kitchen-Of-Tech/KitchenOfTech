import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateTestimonial, deleteTestimonial, fetchTestimonialById } from '@/lib/sanity/write';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';

// GET - Fetch single testimonial by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request, 'queries');
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const { id } = await params;
    const testimonial = await fetchTestimonialById(id);

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      testimonial,
    });
  } catch (error: unknown) {
    console.error('Error fetching testimonial:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch testimonial';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH - Approve or Reject a testimonial
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request, 'mutations');
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { id } = await params;
    const body = await request.json();
    const { action, user_id, projectType } = body; // action: 'approve' or 'reject', user_id: who is performing the action, projectType: category when approving

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

    if (!user || !user.role || user.role.level > 2) {
      return NextResponse.json(
        { error: 'Unauthorized. Only CEO and Managers can manage testimonials.' },
        { status: 403 }
      );
    }

    // Prepare updates for Sanity
    const updates: Record<string, unknown> = {
      status: action === 'approve' ? 'approved' : 'rejected',
    };

    if (action === 'approve') {
      updates.approvedAt = new Date().toISOString();
      updates.rejectedAt = null;
      if (projectType) {
        updates.projectType = projectType;
      }
    } else {
      updates.rejectedAt = new Date().toISOString();
      updates.approvedAt = null;
    }

    // Update testimonial in Sanity
    const updatedTestimonial = await updateTestimonial(id, updates);

    return NextResponse.json({
      success: true,
      message: `Testimonial ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      testimonial: updatedTestimonial,
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
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request, 'mutations');
  if (rateLimitResult) {
    return rateLimitResult;
  }

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

    if (!user || !user.role || user.role.level > 2) {
      return NextResponse.json(
        { error: 'Unauthorized. Only CEO and Managers can delete testimonials.' },
        { status: 403 }
      );
    }

    // Delete from Sanity
    await deleteTestimonial(id);

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
