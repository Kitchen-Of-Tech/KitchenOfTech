import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sanityWriteClient } from '@/lib/sanity/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.facebookId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // Fetch articles published in the period and calculate upvotes per author
    const articles = await sanityWriteClient.fetch(`
      *[_type == "article" && status == "published" && publishedAt > $startDate] {
        "authorId": author->_id,
        upvotes
      }
    `, { startDate: startDate.toISOString() });

    // Aggregate upvotes by author
    const authorUpvotes: { [key: string]: number } = {};
    articles.forEach((article: any) => {
      if (article.authorId) {
        authorUpvotes[article.authorId] = (authorUpvotes[article.authorId] || 0) + (article.upvotes || 0);
      }
    });

    // Fetch author details and sort by upvotes
    const authorIds = Object.keys(authorUpvotes);
    if (authorIds.length === 0) {
      return NextResponse.json({ rankings: [] });
    }

    const authors = await sanityWriteClient.fetch(`
      *[_type == "articleAuthor" && _id in $authorIds] {
        _id,
        name,
        email,
        profileImage,
        totalArticles,
        totalUpvotes,
        totalViews
      }
    `, { authorIds });

    // Add period upvotes and sort
    const rankings = authors
      .map((author: any) => ({
        ...author,
        periodUpvotes: authorUpvotes[author._id] || 0,
      }))
      .sort((a: any, b: any) => b.periodUpvotes - a.periodUpvotes)
      .slice(0, 50); // Top 50 authors

    return NextResponse.json({ rankings });
  } catch (error) {
    console.error('Error fetching author rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}
