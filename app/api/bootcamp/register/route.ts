import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { client } from '@/lib/sanity/client';
import { groq } from 'next-sanity';
import type { BootcampRegistration } from '@/types';

/**
 * POST /api/bootcamp/register
 *
 * Validates and saves a bootcamp registration to the Supabase
 * `bootcamp_registrations` table using the service-role key (server-side only).
 *
 * Note: The previous Google Sheets integration was replaced because:
 *   - API keys with HTTP-referrer restrictions block server-side calls (no Referer header)
 *   - The Sheets `values:append` endpoint requires OAuth2; API keys are rejected with HTTP 401
 */

// Service-role client — bypasses RLS, never exposed to the browser.
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured.');
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BootcampRegistration;

    // ── Required field validation ───────────────────────────────────────────
    if (
      !body.bootcampId || !body.bootcampName || !body.name || !body.dateOfBirth ||
      !body.occupation || !body.phoneNumber || !body.whatsappNumber ||
      !body.email || !body.registrationReason
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Email format ────────────────────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // ── Phone format (digits/+/-/spaces/parens, min 6 digits) ───────────────
    const phoneRegex = /^[\d+\-\s()]+$/;
    const digitsOnly = body.phoneNumber.replace(/\D/g, '');
    if (!phoneRegex.test(body.phoneNumber) || digitsOnly.length < 6) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // ── Save to Supabase ────────────────────────────────────────────────────
    const supabase = getSupabaseAdmin();

    const { error: dbError } = await supabase
      .from('bootcamp_registrations')
      .insert({
        bootcamp_id:         body.bootcampId,
        bootcamp_name:       body.bootcampName,
        name:                body.name,
        date_of_birth:       body.dateOfBirth,   // ISO date string "YYYY-MM-DD"
        occupation:          body.occupation,
        institute:           body.institute ?? null,
        phone_number:        body.phoneNumber,
        whatsapp_number:     body.whatsappNumber,
        email:               body.email,
        interests:           body.interests ?? null,
        registration_reason: body.registrationReason,
        status:              'pending',
      });

    if (dbError) {
      // Unique constraint violation → already registered
      if (dbError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already registered for this bootcamp with this email address.' },
          { status: 409 }
        );
      }
      console.error('Supabase insert error:', dbError.message, dbError.code);
      throw new Error(dbError.message);
    }

    const timestamp = new Date().toISOString();

    // ── Fetch facebookGroupUrl fresh from Sanity (bypasses page cache) ──────
    let facebookGroupUrl: string | null = null;
    try {
      const doc = await client.fetch<{ facebookGroupUrl?: string } | null>(
        groq`*[_type == "bootcamp" && _id == $id][0]{ facebookGroupUrl }`,
        { id: body.bootcampId },
        { cache: 'no-store' }
      );
      facebookGroupUrl = doc?.facebookGroupUrl ?? null;
    } catch {
      // Non-fatal — modal will show without the Facebook button
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! We will contact you soon.',
        data: { bootcampId: body.bootcampId, email: body.email, timestamp, facebookGroupUrl },
      },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Registration error:', msg);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'development'
            ? `Registration failed: ${msg}`
            : 'Failed to process registration. Please try again later.',
      },
      { status: 500 }
    );
  }
}
