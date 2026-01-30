import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sanityWriteClient } from '@/lib/sanity/write';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.facebookId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: authorId } = await params;
    const body = await request.json();
    const { ban, reason } = body;

    // Fetch the author
    const author = await sanityWriteClient.fetch(
      `*[_type == "articleAuthor" && _id == $authorId][0]`,
      { authorId }
    );

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    // Update ban status
    await sanityWriteClient
      .patch(authorId)
      .set({
        isBanned: ban,
        bannedReason: ban ? reason : null,
      })
      .commit();

    return NextResponse.json({
      success: true,
      message: `Author ${ban ? 'banned' : 'unbanned'} successfully`,
    });
  } catch (error) {
    console.error('Error updating author ban status:', error);
    return NextResponse.json(
      { error: 'Failed to update ban status' },
      { status: 500 }
    );
  }
}
