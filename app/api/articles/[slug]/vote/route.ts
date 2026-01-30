import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sanityWriteClient } from '@/lib/sanity/write';

interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * GET /api/articles/[slug]/vote
 * Get user's current vote for an article
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.facebookId) {
      return NextResponse.json({ vote: null });
    }

    // Get article by slug
    const article = await sanityWriteClient.fetch(
      `*[_type == "article" && slug.current == $slug][0]{ _id }`,
      { slug: params.slug }
    );

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Get voter
    const voter = await sanityWriteClient.fetch(
      `*[_type == "articleAuthor" && facebookId == $facebookId][0]{ _id }`,
      { facebookId: session.user.facebookId }
    );

    if (!voter) {
      return NextResponse.json({ vote: null });
    }

    // Check if user has voted
    const existingVote = await sanityWriteClient.fetch(
      `*[_type == "articleVote" && article._ref == $articleId && voter._ref == $voterId][0]`,
      { articleId: article._id, voterId: voter._id }
    );

    return NextResponse.json({
      vote: existingVote?.voteType || null,
    });
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 });
  }
}

/**
 * POST /api/articles/[slug]/vote
 * Vote on an article (upvote/downvote)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.facebookId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { voteType } = body;

    if (voteType !== 'upvote' && voteType !== 'downvote') {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    // Get article
    const article = await sanityWriteClient.fetch(
      `*[_type == "article" && slug.current == $slug][0]{ _id, upvotes, downvotes }`,
      { slug: params.slug }
    );

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Get voter
    const voter = await sanityWriteClient.fetch(
      `*[_type == "articleAuthor" && facebookId == $facebookId][0]{ _id }`,
      { facebookId: session.user.facebookId }
    );

    if (!voter) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    // Check existing vote
    const existingVote = await sanityWriteClient.fetch(
      `*[_type == "articleVote" && article._ref == $articleId && voter._ref == $voterId][0]`,
      { articleId: article._id, voterId: voter._id }
    );

    let newVote: string | null = voteType;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote (toggle off)
        await sanityWriteClient.delete(existingVote._id);
        
        // Update article counts
        if (voteType === 'upvote') {
          await sanityWriteClient
            .patch(article._id)
            .set({ upvotes: Math.max(0, article.upvotes - 1) })
            .commit();
        } else {
          await sanityWriteClient
            .patch(article._id)
            .set({ downvotes: Math.max(0, article.downvotes - 1) })
            .commit();
        }
        
        newVote = null;
      } else {
        // Change vote
        await sanityWriteClient
          .patch(existingVote._id)
          .set({ voteType, votedAt: new Date().toISOString() })
          .commit();
        
        // Update article counts
        if (voteType === 'upvote') {
          await sanityWriteClient
            .patch(article._id)
            .set({
              upvotes: article.upvotes + 1,
              downvotes: Math.max(0, article.downvotes - 1),
            })
            .commit();
        } else {
          await sanityWriteClient
            .patch(article._id)
            .set({
              upvotes: Math.max(0, article.upvotes - 1),
              downvotes: article.downvotes + 1,
            })
            .commit();
        }
      }
    } else {
      // Create new vote
      await sanityWriteClient.create({
        _type: 'articleVote',
        article: {
          _type: 'reference',
          _ref: article._id,
        },
        voter: {
          _type: 'reference',
          _ref: voter._id,
        },
        voteType,
        votedAt: new Date().toISOString(),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      });

      // Update article counts
      if (voteType === 'upvote') {
        await sanityWriteClient
          .patch(article._id)
          .set({ upvotes: article.upvotes + 1 })
          .commit();
      } else {
        await sanityWriteClient
          .patch(article._id)
          .set({ downvotes: article.downvotes + 1 })
          .commit();
      }
    }

    return NextResponse.json({
      success: true,
      newVote,
      message: newVote ? 'Vote recorded' : 'Vote removed',
    });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: 'Failed to process vote', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
