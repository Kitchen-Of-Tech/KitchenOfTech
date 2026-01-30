import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sanityWriteClient } from '@/lib/sanity/write';

export async function DELETE(
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

    // Delete the article
    await sanityWriteClient.delete(articleId);

    // Update author's total articles count
    if (article.author && article.author._ref) {
      const author = await sanityWriteClient.fetch(
        `*[_type == "articleAuthor" && _id == $authorId][0]`,
        { authorId: article.author._ref }
      );

      if (author && author.totalArticles > 0) {
        await sanityWriteClient
          .patch(author._id)
          .set({ totalArticles: author.totalArticles - 1 })
          .commit();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
