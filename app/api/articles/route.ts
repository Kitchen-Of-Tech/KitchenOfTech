import { NextRequest, NextResponse } from 'next/server';
import { sanityFetch } from '@/lib/sanity/client';
import { ARTICLES_QUERY, ARTICLES_TRENDING_QUERY } from '@/lib/sanity/queries';
import type { Article } from '@/types';

/**
 * GET /api/articles
 * Fetch articles with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter'); // 'trending' or null
    const days = parseInt(searchParams.get('days') || '30');

    let articles: Article[];

    if (filter === 'trending') {
      // Fetch trending articles from last X days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      articles = await sanityFetch<Article[]>({
        query: ARTICLES_TRENDING_QUERY,
        params: {
          startDate: startDate.toISOString(),
          limit: 50,
        },
        tags: ['article'],
      });
    } else {
      // Fetch all published articles (newest first)
      articles = await sanityFetch<Article[]>({
        query: ARTICLES_QUERY,
        tags: ['article'],
      });
    }

    return NextResponse.json(
      {
        success: true,
        articles: articles || [],
        count: articles?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles',
        articles: [],
      },
      { status: 500 }
    );
  }
}
