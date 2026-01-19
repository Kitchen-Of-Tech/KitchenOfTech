import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// POST - Generate a new testimonial link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Use service role client for operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user is authenticated (optional)
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex');
    
    // Set expiry to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Insert link into database
    const { data: link, error } = await supabase
      .from('testimonial_links')
      .insert({
        token,
        email: email || null,
        expires_at: expiresAt.toISOString(),
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Generate the full URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const testimonialUrl = `${baseUrl}/testimonial/${token}`;

    return NextResponse.json({
      success: true,
      link,
      url: testimonialUrl,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error generating testimonial link:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate link';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET - List all links (for authenticated users)
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all links (you can add filtering/pagination later)
    const { data: links, error } = await supabase
      .from('testimonial_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      links: links || [],
    });
  } catch (error: unknown) {
    console.error('Error fetching testimonial links:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch links';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
