import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Facebook Conversions API
 * Server-side event tracking for better accuracy and iOS 14+ compatibility
 * 
 * Documentation: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_CONVERSIONS_API_TOKEN;
const FACEBOOK_API_VERSION = 'v18.0';

interface ConversionEvent {
  event_name: string;
  event_time: number;
  action_source: string;
  event_source_url?: string;
  user_data: {
    em?: string; // email (hashed)
    ph?: string; // phone (hashed)
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // _fbc cookie
    fbp?: string; // _fbp cookie
  };
  custom_data?: Record<string, unknown>;
}

/**
 * Hash data with SHA256 (required by Facebook)
 */
function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Extract cookies from request
 */
function getCookies(request: NextRequest): { fbc?: string; fbp?: string } {
  const cookies = request.cookies;
  return {
    fbc: cookies.get('_fbc')?.value,
    fbp: cookies.get('_fbp')?.value,
  };
}

/**
 * POST /api/facebook/conversions
 * Send conversion events to Facebook
 */
export async function POST(request: NextRequest) {
  try {
    if (!FACEBOOK_PIXEL_ID || !FACEBOOK_ACCESS_TOKEN) {
      console.error('Facebook Conversions API not configured');
      return NextResponse.json(
        { error: 'Facebook Conversions API not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      event_name,
      email,
      phone,
      event_source_url,
      custom_data,
    } = body;

    if (!event_name) {
      return NextResponse.json(
        { error: 'event_name is required' },
        { status: 400 }
      );
    }

    // Get client info
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const cookies = getCookies(request);

    // Build user data with hashed PII
    const user_data: ConversionEvent['user_data'] = {
      client_ip_address: clientIP,
      client_user_agent: userAgent,
      fbc: cookies.fbc,
      fbp: cookies.fbp,
    };

    // Hash email and phone if provided
    if (email) {
      user_data.em = hashData(email);
    }
    if (phone) {
      user_data.ph = hashData(phone);
    }

    // Build conversion event
    const event: ConversionEvent = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: event_source_url || request.headers.get('referer') || undefined,
      user_data,
      custom_data: custom_data || undefined,
    };

    // Send to Facebook Conversions API
    const facebookResponse = await fetch(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${FACEBOOK_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [event],
          access_token: FACEBOOK_ACCESS_TOKEN,
        }),
      }
    );

    const result = await facebookResponse.json();

    if (!facebookResponse.ok) {
      console.error('Facebook Conversions API error:', result);
      return NextResponse.json(
        { error: 'Failed to send event to Facebook', details: result },
        { status: facebookResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      events_received: result.events_received,
      fbtrace_id: result.fbtrace_id,
    });
  } catch (error) {
    console.error('Conversions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
