import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

interface BatchCertificateRequest {
  certificates: Array<{
    studentName: string;
    courseName: string;
    enrollmentId: string;
    userId: string;
    issueDate?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = await createAdminClient();

    const body = (await request.json()) as BatchCertificateRequest;

    if (!body.certificates || !Array.isArray(body.certificates)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format. Expected "certificates" array.' },
        { status: 400 }
      );
    }

    if (body.certificates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No certificates provided' },
        { status: 400 }
      );
    }

    if (body.certificates.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Maximum 100 certificates per batch' },
        { status: 400 }
      );
    }

    // Validate all records before inserting
    const validationErrors: string[] = [];
    body.certificates.forEach((cert, index) => {
      if (!cert.studentName) validationErrors.push(`Row ${index + 1}: Missing studentName`);
      if (!cert.courseName) validationErrors.push(`Row ${index + 1}: Missing courseName`);
      if (!cert.enrollmentId) validationErrors.push(`Row ${index + 1}: Missing enrollmentId`);
      if (!cert.userId) validationErrors.push(`Row ${index + 1}: Missing userId`);
      if (cert.issueDate && isNaN(new Date(cert.issueDate).getTime())) {
        validationErrors.push(`Row ${index + 1}: Invalid issueDate format`);
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationErrors.slice(0, 10), // Show first 10 errors
        },
        { status: 400 }
      );
    }

    // Prepare certificates for insertion
    const certificatesToInsert = body.certificates.map((cert) => {
      const issueDate = cert.issueDate ? new Date(cert.issueDate) : new Date();
      const year = issueDate.getFullYear();
      const random = randomBytes(8).toString('hex').toUpperCase();
      const certificateId = `KOT-${year}-${random}`;

      return {
        certificate_id: certificateId,
        student_name: cert.studentName,
        course_name: cert.courseName,
        enrollment_id: cert.enrollmentId,
        user_id: cert.userId,
        issue_date: issueDate.toISOString(),
      };
    });

    // Insert all certificates
    const { data: inserted, error: insertError } = await adminClient
      .from('certificates')
      .insert(certificatesToInsert)
      .select();

    if (insertError) {
      console.error('Batch insert error:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message || 'Batch insert failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `${inserted?.length || 0} certificates inserted successfully`,
        count: inserted?.length || 0,
        certificates: inserted,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Batch insert error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
