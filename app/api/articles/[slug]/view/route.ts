import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity/write';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * POST /api/articles/[slug]/view
 * Increment view count for an article
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    // Get article
    const article = await sanityWriteClient.fetch(
      `*[_type == "article" && slug.current == $slug][0]{ _id, views }`,
      { slug }
    );

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Increment view count
    await sanityWriteClient
      .patch(article._id)
      .set({ views: (article.views || 0) + 1 })
      .commit();

    return NextResponse.json({
      success: true,
      views: (article.views || 0) + 1,
    });
  } catch (error) {
    console.error('Error incrementing view:', error);
    return NextResponse.json(
      { error: 'Failed to increment view' },
      { status: 500 }
    );
  }
}
