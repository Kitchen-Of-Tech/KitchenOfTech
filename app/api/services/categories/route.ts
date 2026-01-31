import { NextResponse } from 'next/server';
import { sanityFetch } from '@/lib/sanity/client';
import { SERVICE_CATEGORIES_QUERY } from '@/lib/sanity/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

export async function GET() {
  try {
    const categories = await sanityFetch({
      query: SERVICE_CATEGORIES_QUERY,
      tags: ['serviceCategory'],
    });

    return NextResponse.json(categories || []);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service categories' },
      { status: 500 }
    );
  }
}
