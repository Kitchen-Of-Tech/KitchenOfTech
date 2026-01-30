import { NextRequest, NextResponse } from 'next/server';
import { createTestimonial, uploadImageToSanity } from '@/lib/sanity/write';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';

/**
 * POST /api/testimonials/submit
 * Public endpoint for testimonial submission with image upload
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request, 'mutations');
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    // Parse form data (supports multipart/form-data for image upload)
    const formData = await request.formData();
    
    // Extract fields
    const clientName = formData.get('name') as string;
    const email = formData.get('email') as string;
    const clientCompany = formData.get('company') as string | null;
    const position = formData.get('position') as string | null;
    const testimonial = formData.get('message') as string;
    const rating = parseInt(formData.get('rating') as string);
    const projectType = formData.get('projectType') as string | null;
    const linkToken = formData.get('link_token') as string | null;
    const clientImageFile = formData.get('image') as File | null;

    // Validate required fields
    if (!clientName || !email || !testimonial) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate testimonial length
    if (testimonial.length < 50) {
      return NextResponse.json(
        { error: 'Testimonial must be at least 50 characters long' },
        { status: 400 }
      );
    }

    if (testimonial.length > 1000) {
      return NextResponse.json(
        { error: 'Testimonial must not exceed 1000 characters' },
        { status: 400 }
      );
    }

    // Validate rating
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate image if provided
    if (clientImageFile && clientImageFile.size > 0) {
      // Check file size (max 5MB)
      if (clientImageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image size must not exceed 5MB' },
          { status: 400 }
        );
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(clientImageFile.type)) {
        return NextResponse.json(
          { error: 'Only JPG, PNG, and WEBP images are allowed' },
          { status: 400 }
        );
      }
    }

    // Create testimonial in Sanity (with image if provided)
    const newTestimonial = await createTestimonial(
      {
        clientName,
        email,
        clientCompany: clientCompany || undefined,
        position: position || undefined,
        testimonial,
        rating,
        projectType: projectType || undefined,
        linkToken: linkToken || undefined,
        status: 'pending',
      },
      clientImageFile && clientImageFile.size > 0 ? clientImageFile : undefined
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Testimonial submitted successfully! It will be reviewed by our team.',
        testimonial: {
          _id: newTestimonial._id,
          clientName: newTestimonial.clientName,
          email: newTestimonial.email,
          rating: newTestimonial.rating,
          status: newTestimonial.status,
          submittedAt: newTestimonial.submittedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    
    // Extract detailed error message
    let errorMessage = 'Failed to submit testimonial';
    let errorDetails = undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
