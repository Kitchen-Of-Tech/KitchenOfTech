import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sanityWriteClient } from '@/lib/sanity/write';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.facebookId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug: articleSlug } = await params;

    // Fetch the article by slug
    const article = await sanityWriteClient.fetch(
      `*[_type == "article" && slug.current == $articleSlug][0]`,
      { articleSlug }
    );

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Delete the article
    await sanityWriteClient.delete(article._id);

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
