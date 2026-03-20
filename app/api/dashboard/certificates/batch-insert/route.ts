import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

// Helper function to convert course name to slug format for course_id
function generateCourseId(courseName: string): string {
  return courseName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

interface BatchCertificateRequest {
  certificates: Array<{
    // Required
    studentName: string;
    courseName: string;
    credentialCode: string;
    level: string;
    
    // Optional references
    enrollmentId?: string;
    userId?: string;
    
    // Dates
    issueDate?: string;
    validUntil?: string;
    
    // Optional
    grade?: number;
    institution?: string;
    instructorName?: string;
    instructorNotes?: string;
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

    // Validate all records before inserting (enrollmentId and userId are now optional)
    const validationErrors: string[] = [];
    body.certificates.forEach((cert, index) => {
      if (!cert.studentName) validationErrors.push(`Row ${index + 1}: Missing studentName`);
      if (!cert.courseName) validationErrors.push(`Row ${index + 1}: Missing courseName`);
      if (!cert.credentialCode) validationErrors.push(`Row ${index + 1}: Missing credentialCode`);
      if (!cert.level) validationErrors.push(`Row ${index + 1}: Missing level`);
      if (cert.issueDate && isNaN(new Date(cert.issueDate).getTime())) {
        validationErrors.push(`Row ${index + 1}: Invalid issueDate format`);
      }
      if (cert.validUntil && isNaN(new Date(cert.validUntil).getTime())) {
        validationErrors.push(`Row ${index + 1}: Invalid validUntil format`);
      }
      if (cert.grade !== undefined && (cert.grade < 0 || cert.grade > 100)) {
        validationErrors.push(`Row ${index + 1}: Grade must be 0-100`);
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
      const validUntil = cert.validUntil ? new Date(cert.validUntil) : null;
      const year = issueDate.getFullYear();
      const random = randomBytes(8).toString('hex').toUpperCase();
      const certificateId = `KOT-${year}-${random}`;
      const courseId = generateCourseId(cert.courseName);

      return {
        certificate_id: certificateId,
        student_name: cert.studentName,
        course_name: cert.courseName,
        course_id: courseId,
        enrollment_id: cert.enrollmentId || null,
        user_id: cert.userId || null,
        instructor_name: cert.instructorName || 'Not specified',
        issue_date: issueDate.toISOString(),
        valid_until: validUntil ? validUntil.toISOString() : null,
        credential_code: cert.credentialCode,
        level: cert.level,
        grade: cert.grade || null,
        institution: cert.institution || null,
        instructor_notes: cert.instructorNotes || null,
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
