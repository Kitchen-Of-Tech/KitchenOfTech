import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * Middleware to require 2FA for sensitive payment operations
 * Prevents unauthorized payment approval/refunds if device is compromised
 */

interface TwoFASession {
  verified_at: number;
  verified_method: 'totp' | 'backup_code';
  user_agent: string;
}

// Cache verified 2FA sessions
const verifiedSessions = new Map<string, TwoFASession>();
const SESSION_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Main middleware: Require 2FA for sensitive operations
 */
export async function require2FA(request: NextRequest): Promise<NextResponse | null> {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Get session ID from request header
    const sessionId = request.headers.get('x-2fa-session-id');
    if (!sessionId) {
      return NextResponse.json(
        {
          error: '2FA Verification Required',
          message: 'Please verify with 2FA before proceeding',
          needsVerification: true,
          verifyUrl: '/api/auth/2fa/verify',
        },
        { status: 403 }
      );
    }

    // Check cached session
    const session = verifiedSessions.get(sessionId);
    if (!session || Date.now() - session.verified_at > SESSION_TTL) {
      // Session expired
      verifiedSessions.delete(sessionId);
      return NextResponse.json(
        {
          error: '2FA Session Expired',
          message: 'Please re-verify with 2FA',
          sessionExpired: true,
        },
        { status: 403 }
      );
    }

    // 2FA verification passed
    return null;
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}

/**
 * Create 2FA session
 */
export function create2FASession(userId: string, method: 'totp' | 'backup_code'): string {
  const sessionId = `2fa_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  verifiedSessions.set(sessionId, {
    verified_at: Date.now(),
    verified_method: method,
    user_agent: userAgent,
  });

  // Auto-cleanup after TTL
  setTimeout(() => {
    verifiedSessions.delete(sessionId);
  }, SESSION_TTL);

  return sessionId;
}

/**
 * Verify 2FA session exists and is valid
 */
export function verify2FASession(sessionId: string): boolean {
  const session = verifiedSessions.get(sessionId);
  if (!session) return false;

  if (Date.now() - session.verified_at > SESSION_TTL) {
    verifiedSessions.delete(sessionId);
    return false;
  }

  return true;
}

/**
 * Clear 2FA session
 */
export function clear2FASession(sessionId: string): void {
  verifiedSessions.delete(sessionId);
}

