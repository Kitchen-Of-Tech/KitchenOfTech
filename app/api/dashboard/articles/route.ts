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
    const includeAll = searchParams.get('includeAll') === 'true';
    const status = searchParams.get('status');

    // Build query
    let query = `*[_type == "article"`;
    
    if (status && status !== 'all') {
      query += ` && status == "${status}"`;
    }
    
    query += `] | order(publishedAt desc) {
      _id,
      title,
      slug,
      "author": author-> {
        _id,
        name,
        email,
        profileImage
      },
      coverImage,
      excerpt,
      category,
      status,
      publishedAt,
      upvotes,
      downvotes,
      views,
      commentCount
    }`;

    const articles = await sanityWriteClient.fetch(query);

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching dashboard articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
