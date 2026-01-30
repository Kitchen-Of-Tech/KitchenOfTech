import { NextResponse } from 'next/server';
import { sanityFetch } from '@/lib/sanity/client';
import { SERVICE_SUBCATEGORIES_QUERY } from '@/lib/sanity/queries';
import type { ServiceSubcategory } from '@/types';

/**
 * GET /api/sanity/subcategories
 * Fetch all service subcategories from Sanity CMS
 */
export async function GET() {
  try {
    const subcategories = await sanityFetch<ServiceSubcategory[]>({
      query: SERVICE_SUBCATEGORIES_QUERY,
      tags: ['serviceSubcategory'],
    });

    return NextResponse.json(
      {
        success: true,
        subcategories: subcategories || [],
        count: subcategories?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching service subcategories:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch service subcategories',
        subcategories: [],
      },
      { status: 500 }
    );
  }
}
