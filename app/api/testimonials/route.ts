import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - List testimonials (filter by status)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', or null for all

    let query = supabase
      .from('testimonials')
      .select(`
        *,
        link:testimonial_links(id, email, token),
        approved_by_user:users!testimonials_approved_by_fkey(id, full_name, username),
        rejected_by_user:users!testimonials_rejected_by_fkey(id, full_name, username)
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
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
    });
  } catch (error: unknown) {
    console.error('Error fetching testimonials:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch testimonials';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Submit a new testimonial
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { link_token, name, email, company, position, message, rating, image_url } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // If a link token is provided, validate it
    let linkId = null;
    if (link_token) {
      const { data: link, error: linkError } = await supabase
        .from('testimonial_links')
        .select('*')
        .eq('token', link_token)
        .single();

      if (linkError || !link) {
        return NextResponse.json(
          { error: 'Invalid testimonial link' },
          { status: 400 }
        );
      }

      // Check if link is expired
      const now = new Date();
      const expiresAt = new Date(link.expires_at);
      if (expiresAt < now) {
        return NextResponse.json(
          { error: 'Testimonial link has expired' },
          { status: 410 }
        );
      }

      // Check if link has already been used
      if (link.used) {
        return NextResponse.json(
          { error: 'Testimonial link has already been used' },
          { status: 410 }
        );
      }

      linkId = link.id;
    }

    // Insert testimonial
    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .insert({
        link_id: linkId,
        name,
        email,
        company: company || null,
        position: position || null,
        message,
        rating: rating || 5,
        status: 'pending',
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Mark link as used (trigger will handle this, but we can also do it manually)
    if (linkId) {
      await supabase
        .from('testimonial_links')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('id', linkId);
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial submitted successfully! It will be reviewed by our team.',
      testimonial,
    });
  } catch (error: unknown) {
    console.error('Error submitting testimonial:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit testimonial';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
