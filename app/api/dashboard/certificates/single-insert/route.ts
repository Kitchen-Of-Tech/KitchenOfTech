import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

interface CertificateInsertRequest {
  // Required fields
  studentName: string;
  courseName: string;
  credentialCode: string;
  level: string;
  
  // References
  enrollmentId: string;
  userId: string;
  
  // Dates
  issueDate: string;
  validUntil?: string; // Optional expiration date
  
  // Optional fields
  grade?: number; // 0-100
  institution?: string;
  instructorNotes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = await createAdminClient();

    const body = (await request.json()) as CertificateInsertRequest;

    // Validate required fields
    if (!body.studentName || !body.courseName || !body.enrollmentId || !body.userId || !body.credentialCode || !body.level) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: studentName, courseName, enrollmentId, userId, credentialCode, level',
        },
        { status: 400 }
      );
    }

    // Validate dates
    const issueDate = body.issueDate ? new Date(body.issueDate) : new Date();
    if (isNaN(issueDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid issue date format' },
        { status: 400 }
      );
    }

    // Validate optional validUntil date if provided
    let validUntil = null;
    if (body.validUntil) {
      validUntil = new Date(body.validUntil);
      if (isNaN(validUntil.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid valid until date format' },
          { status: 400 }
        );
      }
    }

    // Validate grade if provided (0-100)
    if (body.grade !== undefined && (body.grade < 0 || body.grade > 100)) {
      return NextResponse.json(
        { success: false, error: 'Grade must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Generate secure certificate ID
    const year = issueDate.getFullYear();
    const random = randomBytes(8).toString('hex').toUpperCase();
    const certificateId = `KOT-${year}-${random}`;

    // Check if enrollment exists
    const { data: enrollment, error: enrollmentError } = await adminClient
      .from('course_enrollments')
      .select('id, course_id')
      .eq('id', body.enrollmentId)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Insert certificate
    const { data: certificate, error: insertError } = await adminClient
      .from('certificates')
      .insert({
        certificate_id: certificateId,
        student_name: body.studentName,
        course_name: body.courseName,
        enrollment_id: body.enrollmentId,
        user_id: body.userId,
        issue_date: issueDate.toISOString(),
        valid_until: validUntil ? validUntil.toISOString() : null,
        credential_code: body.credentialCode,
        level: body.level,
        grade: body.grade || null,
        institution: body.institution || null,
        instructor_notes: body.instructorNotes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Certificate insert error:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message || 'Failed to insert certificate' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Certificate inserted successfully',
        certificate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Certificate single insert error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
