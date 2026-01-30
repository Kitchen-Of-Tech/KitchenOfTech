import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sanityWriteClient } from '@/lib/sanity/write';

interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * GET /api/articles/[slug]/comments
 * Get all comments for an article
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get article
    const article = await sanityWriteClient.fetch(
      `*[_type == "article" && slug.current == $slug][0]{ _id }`,
      { slug: params.slug }
    );

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Get comments
    const comments = await sanityWriteClient.fetch(
      `*[_type == "articleComment" && article._ref == $articleId && !isDeleted] | order(createdAt desc) {
        _id,
        content,
        createdAt,
        isEdited,
        editedAt,
        author-> {
          _id,
          name,
          profileImage
        }
      }`,
      { articleId: article._id }
    );

    return NextResponse.json({
      success: true,
      comments: comments || [],
      count: comments?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/articles/[slug]/comments
 * Add a new comment to an article
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.facebookId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { content, parentCommentId } = body;

    if (!content || content.trim().length < 3) {
      return NextResponse.json(
        { error: 'Comment must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Comment must not exceed 500 characters' },
        { status: 400 }
      );
    }

    // Get article
    const article = await sanityWriteClient.fetch(
      `*[_type == "article" && slug.current == $slug][0]{ _id, commentCount }`,
      { slug: params.slug }
    );

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Get author
    const author = await sanityWriteClient.fetch(
      `*[_type == "articleAuthor" && facebookId == $facebookId][0]{ _id, isBanned }`,
      { facebookId: session.user.facebookId }
    );

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    if (author.isBanned) {
      return NextResponse.json({ error: 'You are banned from commenting' }, { status: 403 });
    }

    // Create comment
    const newComment = await sanityWriteClient.create({
      _type: 'articleComment',
      article: {
        _type: 'reference',
        _ref: article._id,
      },
      author: {
        _type: 'reference',
        _ref: author._id,
      },
      content: content.trim(),
      ...(parentCommentId && {
        parentComment: {
          _type: 'reference',
          _ref: parentCommentId,
        },
      }),
      createdAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false,
    });

    // Update article comment count
    await sanityWriteClient
      .patch(article._id)
      .set({ commentCount: (article.commentCount || 0) + 1 })
      .commit();

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: 'Comment posted successfully',
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json(
      { error: 'Failed to post comment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
