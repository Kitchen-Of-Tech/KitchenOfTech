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

interface CSVRow {
  [key: string]: string;
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = await createAdminClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'File must be CSV format' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Read CSV file
    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'CSV must contain header and at least one data row' },
        { status: 400 }
      );
    }

    // Parse CSV header
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);

    // Validate required columns (enrollmentId and userId are now optional)
    const requiredColumns = ['studentName', 'courseName', 'credentialCode', 'level'];
    const missingColumns = requiredColumns.filter((col) => !headers.includes(col));

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required columns: ${missingColumns.join(', ')}`,
          availableColumns: headers,
        },
        { status: 400 }
      );
    }

    // Parse CSV data rows
    const rows: CSVRow[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = parseCSVLine(line);
        const row: CSVRow = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        rows.push(row);
      } catch (error) {
        parseErrors.push(`Row ${i + 1}: ${(error as Error).message}`);
      }
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid data rows found in CSV' },
        { status: 400 }
      );
    }

    if (rows.length > 100) {
      return NextResponse.json(
        { success: false, error: 'CSV contains more than 100 rows. Maximum is 100 per upload.' },
        { status: 400 }
      );
    }

    // Validate rows (enrollmentId and userId are optional)
    const validationErrors: string[] = [];
    rows.forEach((row, index) => {
      // Required fields
      if (!row.studentName?.trim()) validationErrors.push(`Row ${index + 2}: Missing or empty studentName`);
      if (!row.courseName?.trim()) validationErrors.push(`Row ${index + 2}: Missing or empty courseName`);
      if (!row.credentialCode?.trim()) validationErrors.push(`Row ${index + 2}: Missing or empty credentialCode`);
      if (!row.level?.trim()) validationErrors.push(`Row ${index + 2}: Missing or empty level`);

      // Optional date validations
      if (row.issueDate && isNaN(new Date(row.issueDate).getTime())) {
        validationErrors.push(`Row ${index + 2}: Invalid issueDate format (use YYYY-MM-DD)`);
      }
      if (row.validUntil && isNaN(new Date(row.validUntil).getTime())) {
        validationErrors.push(`Row ${index + 2}: Invalid validUntil format (use YYYY-MM-DD)`);
      }

      // Optional grade validation (0-100)
      if (row.grade) {
        const gradeNum = parseFloat(row.grade);
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
          validationErrors.push(`Row ${index + 2}: Grade must be a number between 0 and 100`);
        }
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSV validation failed',
          details: validationErrors.slice(0, 20), // Show first 20 errors
          totalErrors: validationErrors.length,
        },
        { status: 400 }
      );
    }

    // Prepare certificates for insertion
    const certificatesToInsert = rows.map((row) => {
      const issueDate = row.issueDate ? new Date(row.issueDate) : new Date();
      const validUntilDate = row.validUntil ? new Date(row.validUntil) : null;
      const year = issueDate.getFullYear();
      const random = randomBytes(8).toString('hex').toUpperCase();
      const certificateId = `KOT-${year}-${random}`;
      const courseId = generateCourseId(row.courseName);
      const grade = row.grade ? parseFloat(row.grade) : null;

      return {
        certificate_id: certificateId,
        student_name: row.studentName.trim(),
        course_name: row.courseName.trim(),
        course_id: courseId,
        instructor_name: row.instructorName?.trim() || 'Not specified',
        credential_code: row.credentialCode.trim(),
        level: row.level.trim(),
        enrollment_id: row.enrollmentId?.trim() || null,
        user_id: row.userId?.trim() || null,
        issue_date: issueDate.toISOString(),
        valid_until: validUntilDate ? validUntilDate.toISOString() : null,
        grade: grade,
        institution: row.institution?.trim() || null,
        instructor_notes: row.instructorNotes?.trim() || null,
      };
    });

    // Insert certificates
    const { data: inserted, error: insertError } = await adminClient
      .from('certificates')
      .insert(certificatesToInsert)
      .select();

    if (insertError) {
      console.error('CSV insert error:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message || 'Failed to insert certificates from CSV' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully imported ${inserted?.length || 0} certificates from CSV`,
        count: inserted?.length || 0,
        parseErrors: parseErrors.length > 0 ? parseErrors.slice(0, 10) : undefined,
        skippedRows: lines.length - rows.length - 1,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}
