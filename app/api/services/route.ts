import { NextResponse } from 'next/server';
import { sanityFetch } from '@/lib/sanity/client';
import { SERVICES_QUERY } from '@/lib/sanity/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

export async function GET() {
  try {
    const services = await sanityFetch({
      query: SERVICES_QUERY,
      tags: ['service'],
    });

    return NextResponse.json(services || []);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
