import { NextRequest, NextResponse } from 'next/server';
import type { BootcampRegistration } from '@/types';
import { client } from '@/lib/sanity/client';
import { groq } from 'next-sanity';

/**
 * POST /api/bootcamp/register
 *
 * Registers a participant for a bootcamp and appends the row to Google Sheets.
 * The Google Sheets credentials (spreadsheetId + apiKey) come from the Sanity
 * bootcamp document, so each bootcamp can use a different sheet.
 *
 * Columns written (AM):
 *  A  Timestamp
 *  B  Bootcamp ID
 *  C  Bootcamp Name
 *  D  Full Name
 *  E  Date of Birth
 *  F  Occupation
 *  G  Institute
 *  H  Phone Number
 *  I  WhatsApp Number
 *  J  Email
 *  K  Interests
 *  L  Why Register
 *  M  Status (pending)
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BootcampRegistration;

    // ── Required field validation ───────────────────────────────────────────
    if (!body.bootcampId || !body.bootcampName || !body.name || !body.dateOfBirth ||
        !body.occupation || !body.phoneNumber || !body.whatsappNumber ||
        !body.email || !body.registrationReason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Email format ────────────────────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    //  Phone format (basic: digits/+/-/spaces/parens, min 6 digits) 
    const phoneRegex = /^[\d+\-\s()]+$/;
    const digitsOnly = body.phoneNumber.replace(/\D/g, '');
    if (!phoneRegex.test(body.phoneNumber) || digitsOnly.length < 6) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    //  Fetch Google Sheets config from Sanity 
    const bootcampDoc = await client.fetch(
      groq`*[_type == "bootcamp" && _id == $bootcampId][0] {
        googleSheets { spreadsheetId, apiKey }
      }`,
      { bootcampId: body.bootcampId }
    );

    if (!bootcampDoc?.googleSheets?.spreadsheetId || !bootcampDoc?.googleSheets?.apiKey) {
      // Log and return a clear error
      console.error('Google Sheets config missing for bootcamp:', body.bootcampId);
      return NextResponse.json(
        { error: 'Registration storage is not configured for this bootcamp. Please contact support.' },
        { status: 503 }
      );
    }

    const { spreadsheetId, apiKey } = bootcampDoc.googleSheets;

    //  Build the row 
    const timestamp = new Date().toISOString();
    // Sheet tab name: sanitised bootcamp name (Google Sheets tab names  100 chars, no [:/?*[\]])
    const sheetTab = body.bootcampName
      .substring(0, 80)
      .replace(/[/:?*[\]]/g, '')
      .trim();
    const range = `'${sheetTab}'!A:M`;

    const row = [
      timestamp,
      body.bootcampId,
      body.bootcampName,
      body.name,
      body.dateOfBirth,
      body.occupation,
      body.institute ?? '',
      body.phoneNumber,
      body.whatsappNumber,
      body.email,
      body.interests ?? '',
      body.registrationReason,
      'pending',
    ];

    //  Append to Google Sheets via REST API 
    const sheetsUrl =
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}` +
      `/values/${encodeURIComponent(range)}:append` +
      `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${apiKey}`;

    const sheetsRes = await fetch(sheetsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row], majorDimension: 'ROWS' }),
    });

    if (!sheetsRes.ok) {
      const detail = await sheetsRes.text();
      console.error('Google Sheets API error:', sheetsRes.status, detail);
      // 403 usually means the API key lacks write access.
      // Google Sheets API keys are READ-ONLY by default.
      // To enable writes, share the sheet with a Service Account and use
      // OAuth2 Bearer token instead of an API key in the Authorization header.
      if (sheetsRes.status === 403) {
        throw new Error(
          'Registration storage is temporarily unavailable. Please contact support.'
        );
      }
      throw new Error('Failed to save registration data');
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! We will contact you soon.',
        data: { bootcampId: body.bootcampId, email: body.email, timestamp },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to process registration. Please try again later.' },
      { status: 500 }
    );
  }
}
