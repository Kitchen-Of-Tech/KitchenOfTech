/**
 * SECURED TESTIMONIALS API ROUTE
 * 
 * This is a reference implementation showing best practices:
 * - Authentication middleware (requireAuth/requireAdmin)
 * - Input validation with Zod schemas
 * - Proper error handling
 * - Standardized responses
 * 
 * Apply this pattern to all protected API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, requireAdmin, createAuthErrorResponse } from '@/lib/middleware/auth';
import { validateRequest } from '@/lib/validations/utils';
import { createTestimonialSchema, updateTestimonialSchema } from '@/lib/validations/testimonial';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/testimonials
 * List testimonials with optional status filter
 * AUTH: Required (any authenticated user)
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const { user, error: authError } = await requireAuth(request);
  if (authError || !user) {
    return createAuthErrorResponse(authError || 'Authentication required');
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('testimonials')
      .select(`
        *,
        link:testimonial_links(id, email, token),
        approved_by_user:users!testimonials_approved_by_fkey(id, full_name, username),
        rejected_by_user:users!testimonials_rejected_by_fkey(id, full_name, username)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: testimonials, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      testimonials: testimonials || [],
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch testimonials',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/testimonials
 * Create a new testimonial
 * AUTH: Not required (public submission)
 * VALIDATION: Required
 */
export async function POST(request: NextRequest) {
  // Validate input
  const validation = await validateRequest(request, createTestimonialSchema);
  if (!validation.success) {
    return validation.response;
  }

  const { client_name, company, position, content, rating, project_name, email, image_url } = validation.data;

  try {
    // Insert testimonial
    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .insert({
        client_name,
        company,
        position,
        content,
        rating,
        project_name,
        email,
        image_url,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Testimonial submitted successfully',
        testimonial
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create testimonial',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/testimonials
 * Update testimonial status (approve/reject)
 * AUTH: Admin only
 * VALIDATION: Required
 */
export async function PATCH(request: NextRequest) {
  // Check admin authentication
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return createAuthErrorResponse(authError || 'Admin access required', 403);
  }

  // Validate input
  const validation = await validateRequest(request, updateTestimonialSchema);
  if (!validation.success) {
    return validation.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Testimonial ID is required'
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...validation.data };

    // Add approval/rejection tracking
    if (updateData.status === 'approved') {
      updateData.approved_by = user.id;
      updateData.approved_at = new Date().toISOString();
    } else if (updateData.status === 'rejected') {
      updateData.rejected_by = user.id;
      updateData.rejected_at = new Date().toISOString();
    }

    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial updated successfully',
      testimonial,
      updated_by: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update testimonial',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/testimonials
 * Delete a testimonial
 * AUTH: Admin only
 */
export async function DELETE(request: NextRequest) {
  // Check admin authentication
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return createAuthErrorResponse(authError || 'Admin access required', 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Testimonial ID is required'
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully',
      deleted_by: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete testimonial',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
