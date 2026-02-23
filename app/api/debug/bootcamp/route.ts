/**
 * GET /api/debug/bootcamp
 *
 * Debug endpoint — returns raw GROQ results for bootcamp documents.
 * REMOVE or protect this route before production deployment.
 *
 * Usage:
 *   http://localhost:3000/api/debug/bootcamp            → active bootcamps
 *   http://localhost:3000/api/debug/bootcamp?all=true   → ALL bootcamps
 *   http://localhost:3000/api/debug/bootcamp?slug=xxx   → single bootcamp by slug
 */
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity/client';
import { groq } from 'next-sanity';
import {
  ACTIVE_BOOTCAMPS_QUERY,
  ALL_BOOTCAMPS_QUERY,
  BOOTCAMP_DETAIL_QUERY,
} from '@/lib/sanity/queries';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';
  const slug = searchParams.get('slug');

  try {
    let data: unknown;
    let usedQuery: string;

    if (slug) {
      data = await client.fetch(BOOTCAMP_DETAIL_QUERY, { slug });
      usedQuery = `BOOTCAMP_DETAIL_QUERY (slug=${slug})`;
    } else if (all) {
      data = await client.fetch(ALL_BOOTCAMPS_QUERY);
      usedQuery = 'ALL_BOOTCAMPS_QUERY';
    } else {
      data = await client.fetch(ACTIVE_BOOTCAMPS_QUERY);
      usedQuery = 'ACTIVE_BOOTCAMPS_QUERY (status in [open, planning, running])';
    }

    // Also fetch a count of all bootcamp docs for diagnosis
    const countQuery = groq`count(*[_type == "bootcamp"])`;
    const totalCount = await client.fetch<number>(countQuery);

    const allStatusQuery = groq`*[_type == "bootcamp"]{ _id, name, status, "slug": slug.current }`;
    const allStatuses = await client.fetch(allStatusQuery);

    return NextResponse.json(
      {
        meta: {
          usedQuery,
          totalBootcampsInSanity: totalCount,
          resultCount: Array.isArray(data) ? data.length : (data ? 1 : 0),
          allBootcampStatuses: allStatuses,
        },
        data,
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Debug bootcamp fetch error:', error);
    return NextResponse.json(
      {
        error: 'Sanity fetch failed',
        details: error instanceof Error ? error.message : String(error),
        hint: 'Check NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN in .env.local',
      },
      { status: 500 }
    );
  }
}
