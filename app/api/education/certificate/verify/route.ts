import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/education/certificate/verify?certificateId=...
 *
 * Public endpoint to verify certificates and fetch their details.
 * Returns full certificate information with course name.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get('certificateId')?.trim();

    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    // Use admin client for public read (RLS policy allows public viewing)
    const supabase = createAdminClient();

    // Fetch certificate with course name
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(
        'id, certificate_id, student_name, course_name, issue_date, user_id, enrollment_id, course_id'
      )
      .eq('certificate_id', certificateId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          { error: 'Certificate not found' },
          { status: 404 }
        );
      }
      console.error('Certificate fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch certificate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        certificate_id: certificate.certificate_id,
        student_name: certificate.student_name,
        course_name: certificate.course_name || 'Course', // Fallback if not set
        issue_date: certificate.issue_date,
      },
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
