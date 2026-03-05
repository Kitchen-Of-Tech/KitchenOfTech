import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service-role client — server-side only, never exposed to the browser.
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured.');
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * GET /api/bootcamp/attendance?phone=01XXXXXXXXX
 *
 * Looks up a registered participant by phone number.
 * Returns participant info + whether they have already marked attendance today.
 */
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone')?.trim();

  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Find the registration by phone number (exact match, normalise whitespace)
  const { data: registration, error: regError } = await supabase
    .from('bootcamp_registrations')
    .select('id, name, bootcamp_id, bootcamp_name, phone_number, status')
    .eq('phone_number', phone)
    .maybeSingle();

  if (regError) {
    console.error('[attendance GET] registration lookup error:', regError);
    return NextResponse.json({ error: 'Database error during lookup.' }, { status: 500 });
  }

  if (!registration) {
    return NextResponse.json({ found: false }, { status: 200 });
  }

  // Check if already attended today (using today's date in UTC)
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const { data: existing, error: attError } = await supabase
    .from('bootcamp_attendance')
    .select('id, created_at')
    .eq('phone_number', phone)
    .eq('attendance_date', today)
    .maybeSingle();

  if (attError) {
    console.error('[attendance GET] attendance lookup error:', attError);
    return NextResponse.json({ error: 'Database error during attendance check.' }, { status: 500 });
  }

  return NextResponse.json({
    found: true,
    participant: {
      id: registration.id,
      name: registration.name,
      bootcampId: registration.bootcamp_id,
      bootcampName: registration.bootcamp_name,
      phoneNumber: registration.phone_number,
      status: registration.status,
    },
    attendedToday: !!existing,
    attendedAt: existing?.created_at ?? null,
  });
}

/**
 * POST /api/bootcamp/attendance
 *
 * Records attendance for a registered participant.
 * Body: { phone: string }
 * One record per phone per calendar day — duplicate attempts return 409.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { phone?: string };
    const phone = body.phone?.trim();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Re-verify registration exists and is not rejected
    const { data: registration, error: regError } = await supabase
      .from('bootcamp_registrations')
      .select('id, name, bootcamp_id, bootcamp_name, status')
      .eq('phone_number', phone)
      .maybeSingle();

    if (regError) {
      console.error('[attendance POST] registration lookup error:', regError);
      return NextResponse.json({ error: 'Database error.' }, { status: 500 });
    }

    if (!registration) {
      return NextResponse.json({ error: 'No registration found for this phone number.' }, { status: 404 });
    }

    if (registration.status === 'rejected') {
      return NextResponse.json({ error: 'Your registration has been rejected.' }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Insert — the unique index will reject duplicates
    const { error: insertError } = await supabase
      .from('bootcamp_attendance')
      .insert({
        registration_id:  registration.id,
        bootcamp_id:      registration.bootcamp_id,
        bootcamp_name:    registration.bootcamp_name,
        participant_name: registration.name,
        phone_number:     phone,
        attendance_date:  today,
      });

    if (insertError) {
      // Unique violation (23505) → already marked today
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Attendance already marked for today.' }, { status: 409 });
      }
      console.error('[attendance POST] insert error:', insertError);
      return NextResponse.json({ error: 'Failed to record attendance.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      participant: {
        name: registration.name,
        bootcampName: registration.bootcamp_name,
      },
      date: today,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
