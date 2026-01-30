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

    const { id: articleId } = await params;

    // Fetch the article
    const article = await sanityWriteClient.fetch(
      `*[_type == "article" && _id == $articleId][0]`,
      { articleId }
    );

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Toggle archive status
    const newStatus = article.status === 'archived' ? 'published' : 'archived';
    
    await sanityWriteClient
      .patch(articleId)
      .set({ status: newStatus })
      .commit();

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: `Article ${newStatus === 'archived' ? 'archived' : 'unarchived'} successfully`,
    });
  } catch (error) {
    console.error('Error archiving article:', error);
    return NextResponse.json(
      { error: 'Failed to archive article' },
      { status: 500 }
    );
  }
}
