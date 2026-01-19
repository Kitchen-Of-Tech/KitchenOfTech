import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Validate a testimonial link token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { token } = await params;

    // Fetch the link
    const { data: link, error } = await supabase
      .from('testimonial_links')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !link) {
      return NextResponse.json(
        { error: 'Link not found', valid: false },
        { status: 404 }
      );
    }

    // Check if link has expired
    const now = new Date();
    const expiresAt = new Date(link.expires_at);
    
    if (expiresAt < now) {
      return NextResponse.json(
        { error: 'Link has expired', valid: false, expired: true },
        { status: 410 }
      );
    }

    // Check if link has already been used
    if (link.used) {
      return NextResponse.json(
        { error: 'Link has already been used', valid: false, used: true },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      link: {
        id: link.id,
        email: link.email,
        expires_at: link.expires_at,
      },
    });
  } catch (error: unknown) {
    console.error('Error validating testimonial link:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to validate link';
    return NextResponse.json(
      { error: errorMessage, valid: false },
      { status: 500 }
    );
  }
}
