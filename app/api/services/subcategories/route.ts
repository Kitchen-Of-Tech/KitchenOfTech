import { NextResponse } from 'next/server';
import { sanityFetch } from '@/lib/sanity/client';
import { SERVICE_SUBCATEGORIES_QUERY } from '@/lib/sanity/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

export async function GET() {
  try {
    const subcategories = await sanityFetch({
      query: SERVICE_SUBCATEGORIES_QUERY,
      tags: ['serviceSubcategory'],
    });

    return NextResponse.json(subcategories || []);
  } catch (error) {
    console.error('Error fetching service subcategories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service subcategories' },
      { status: 500 }
    );
  }
}
