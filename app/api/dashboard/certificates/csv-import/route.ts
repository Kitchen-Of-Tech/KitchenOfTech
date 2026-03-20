import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

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

    // Validate required columns
    const requiredColumns = ['studentName', 'courseName', 'enrollmentId', 'userId'];
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

    // Validate rows
    const validationErrors: string[] = [];
    rows.forEach((row, index) => {
      if (!row.studentName?.trim()) validationErrors.push(`Row ${index + 2}: Missing or empty studentName`);
      if (!row.courseName?.trim()) validationErrors.push(`Row ${index + 2}: Missing or empty courseName`);
      if (!row.enrollmentId?.trim()) validationErrors.push(`Row ${index + 2}: Missing or empty enrollmentId`);
      if (!row.userId?.trim()) validationErrors.push(`Row ${index + 2}: Missing or empty userId`);
      if (row.issueDate && isNaN(new Date(row.issueDate).getTime())) {
        validationErrors.push(`Row ${index + 2}: Invalid issueDate format`);
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
      const year = issueDate.getFullYear();
      const random = randomBytes(8).toString('hex').toUpperCase();
      const certificateId = `KOT-${year}-${random}`;

      return {
        certificate_id: certificateId,
        student_name: row.studentName.trim(),
        course_name: row.courseName.trim(),
        enrollment_id: row.enrollmentId.trim(),
        user_id: row.userId.trim(),
        issue_date: issueDate.toISOString(),
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
