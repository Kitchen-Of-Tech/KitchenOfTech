import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, formatMeetingNotificationEmail } from '@/lib/mail';
import { checkRateLimit } from '@/lib/middleware/rate-limit';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/meetings
 * Create a new meeting request
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 'mutations');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      email,
      phone,
      message,
      preferred_datetime,
      service_slug,
      service_title,
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Validate at least one contact method
    const hasEmail = email && typeof email === 'string' && email.trim().length > 0;
    const hasPhone = phone && typeof phone === 'string' && phone.trim().length > 0;

    if (!hasEmail && !hasPhone) {
      return NextResponse.json(
        { error: 'At least one contact method (email or phone) is required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (hasEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Create meeting record
    const { data: meeting, error: insertError } = await supabase
      .from('meetings')
      .insert({
        name: name.trim(),
        email: hasEmail ? email.trim() : null,
        phone: hasPhone ? phone.trim() : null,
        message: message?.trim() || null,
        preferred_datetime: preferred_datetime || null,
        service_slug: service_slug || null,
        service_title: service_title || null,
        status: 'requested',
        notified: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create meeting:', insertError);
      return NextResponse.json(
        { error: 'Failed to create meeting request. Please try again.' },
        { status: 500 }
      );
    }

    // Send notification emails to CEO and Managers
    let notificationSent = false;
    try {
      // Get CEO and Manager emails
      const { data: managers } = await supabase
        .from('users')
        .select('email, roles!inner(level)')
        .gte('roles.level', 90) // CEO (100) and Manager (90)
        .not('email', 'is', null);

      if (managers && managers.length > 0) {
        const managerEmails = (managers as { email?: string }[])
          .map((m) => m.email)
          .filter(Boolean) as string[];

        if (managerEmails.length > 0) {
          const emailContent = formatMeetingNotificationEmail({
            name: meeting.name,
            email: meeting.email || undefined,
            phone: meeting.phone || undefined,
            message: meeting.message || undefined,
            service_title: meeting.service_title || undefined,
            service_slug: meeting.service_slug || undefined,
            preferred_datetime: meeting.preferred_datetime || undefined,
            created_at: meeting.created_at,
          });

          notificationSent = await sendEmail({
            to: managerEmails,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html,
          });
        }
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    // Update notification status
    if (notificationSent) {
      await supabase
        .from('meetings')
        .update({
          notified: true,
          notification_sent_at: new Date().toISOString(),
        })
        .eq('id', meeting.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Meeting request submitted successfully',
      meeting: {
        id: meeting.id,
        created_at: meeting.created_at,
      },
    });
  } catch (error) {
    console.error('Meeting creation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/meetings
 * Get all meeting requests (CEO/Manager only)
 */
export async function GET(request: NextRequest) {
  try {
    // This endpoint requires authentication
    // For now, we'll return all meetings (in production, you should verify the user's role)
    
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('meetings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: meetings, error, count } = await query;

    if (error) {
      console.error('Failed to fetch meetings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meetings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      meetings: meetings || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
