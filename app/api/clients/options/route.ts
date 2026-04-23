import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/auth/server';
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';

function isManager(level?: number) {
  return level === 2;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !isManager(currentUser.role?.level)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [{ data: businessTypes, error: businessError }, { data: sources, error: sourcesError }] = await Promise.all([
      supabase.from('client_business_types').select('*').order('name', { ascending: true }),
      supabase.from('client_sources').select('*').order('name', { ascending: true }),
    ]);

    if (businessError || sourcesError) {
      return NextResponse.json({
        error: businessError?.message || sourcesError?.message || 'Failed to load options',
      }, { status: 500 });
    }

    return NextResponse.json({ businessTypes, sources });
  } catch (error) {
    console.error('Error fetching client options:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.apiStrict);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !isManager(currentUser.role?.level)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { type, name } = await request.json();

    if (!type || !name) {
      return NextResponse.json({ error: 'Type and name are required' }, { status: 400 });
    }

    const table = type === 'businessType' ? 'client_business_types' : type === 'source' ? 'client_sources' : null;

    if (!table) {
      return NextResponse.json({ error: 'Invalid option type' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from(table)
      .insert({ name })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ option: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating client option:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
