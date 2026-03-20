import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

interface CertificateInsertRequest {
  studentName: string;
  courseName: string;
  enrollmentId: string;
  userId: string;
  issueDate: string;
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = await createAdminClient();

    const body = (await request.json()) as CertificateInsertRequest;

    // Validate required fields
    if (!body.studentName || !body.courseName || !body.enrollmentId || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: studentName, courseName, enrollmentId, userId',
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
