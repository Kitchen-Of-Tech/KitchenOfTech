import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Middleware to require authentication for API routes
 * Extracts and validates JWT from Authorization header
 * 
 * @returns User object if authenticated, null if not
 */
export async function requireAuth(request: NextRequest): Promise<{ user: AuthenticatedUser | null; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        error: 'Missing or invalid authorization header'
      };
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        user: null,
        error: 'Invalid or expired token'
      };
    }

    // Fetch additional user data (role, etc.) from your users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        user: null,
        error: 'User not found in database'
      };
    }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role || 'user'
      }
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      user: null,
      error: 'Authentication failed'
    };
  }
}

/**
 * Middleware to require admin role
 * First checks authentication, then validates admin role
 * 
 * @returns User object if admin, null if not
 */
export async function requireAdmin(request: NextRequest): Promise<{ user: AuthenticatedUser | null; error?: string }> {
  const { user, error } = await requireAuth(request);

  if (error || !user) {
    return { user: null, error: error || 'Authentication required' };
  }

  if (user.role !== 'admin') {
    return {
      user: null,
      error: 'Admin access required'
    };
  }

  return { user };
}

/**
 * Helper to create standardized error responses
 */
export function createAuthErrorResponse(error: string, status: 401 | 403 = 401) {
  return NextResponse.json(
    {
      success: false,
      error,
      message: status === 401 
        ? 'Authentication required. Please log in.' 
        : 'You do not have permission to access this resource.'
    },
    { status }
  );
}

/**
 * Helper to create success responses with user data
 */
export function createAuthSuccessResponse<T>(data: T, user: AuthenticatedUser) {
  return NextResponse.json({
    success: true,
    data,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
}
