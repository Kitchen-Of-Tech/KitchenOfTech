import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/education/certificate/verify-by-credential?credentialCode=...
 *
 * Public endpoint to verify certificates by credential code.
 * Returns full certificate information with all details.
 *
 * Query Parameters:
 *   - credentialCode: Required. The credential code (e.g., WEB-DEV-2024-001)
 *
 * Response:
 *   - success: boolean
 *   - certificate: Full certificate object with all fields
 *   - error: Error message if verification fails
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const credentialCode = searchParams.get('credentialCode')?.trim();

    if (!credentialCode) {
      return NextResponse.json(
        { error: 'Credential code is required' },
        { status: 400 }
      );
    }

    // Use admin client for public read (RLS policy allows public viewing)
    const supabase = createAdminClient();

    // Fetch certificate by credential code with all details
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(
        `id, 
         certificate_id, 
         student_name, 
         course_name, 
         credential_code, 
         level, 
         issue_date, 
         valid_until,
         grade,
         institution,
         instructor_notes,
         user_id, 
         enrollment_id, 
         course_id`
      )
      .eq('credential_code', credentialCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          { error: 'Certificate not found with this credential code' },
          { status: 404 }
        );
      }
      console.error('Certificate fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch certificate' },
        { status: 500 }
      );
    }

    // Check if certificate is expired
    const isExpired = certificate.valid_until && new Date(certificate.valid_until) < new Date();

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        certificate_id: certificate.certificate_id,
        credential_code: certificate.credential_code,
        student_name: certificate.student_name,
        course_name: certificate.course_name || 'Course',
        level: certificate.level,
        grade: certificate.grade,
        institution: certificate.institution,
        instructor_notes: certificate.instructor_notes,
        issue_date: certificate.issue_date,
        valid_until: certificate.valid_until,
        isExpired: isExpired,
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
