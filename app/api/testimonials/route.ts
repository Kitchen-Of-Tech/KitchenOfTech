import { NextRequest, NextResponse } from 'next/server';
import { fetchTestimonials } from '@/lib/sanity/write';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';

// GET - List testimonials (filter by status)
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request, 'queries');
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;

    // Fetch testimonials from Sanity
    const testimonials = await fetchTestimonials(status || undefined, limit);

    return NextResponse.json({
      success: true,
      testimonials: testimonials || [],
      count: testimonials?.length || 0,
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
