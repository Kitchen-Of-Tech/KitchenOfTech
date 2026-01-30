import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sanityWriteClient } from '@/lib/sanity/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.facebookId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all authors with their stats
    const authors = await sanityWriteClient.fetch(`
      *[_type == "articleAuthor"] | order(joinedAt desc) {
        _id,
        name,
        email,
        phone,
        profileImage,
        bio,
        facebookId,
        joinedAt,
        isActive,
        isBanned,
        bannedReason,
        totalArticles,
        totalUpvotes,
        totalDownvotes,
        totalViews
      }
    `);

    return NextResponse.json({ authors });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    );
  }
}
