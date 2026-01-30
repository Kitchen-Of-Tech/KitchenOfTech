import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

/**
 * POST /api/articles/authors/sync
 * Create or update article author from Facebook auth
 */
export async function POST(request: NextRequest) {
  try {
    const { facebookId, name, email, profileImage } = await request.json();

    if (!facebookId || !name) {
      return NextResponse.json(
        { error: 'Facebook ID and name are required' },
        { status: 400 }
      );
    }

    // Check if author already exists
    const existingAuthor = await sanityClient.fetch(
      `*[_type == "articleAuthor" && facebookId == $facebookId][0]`,
      { facebookId }
    );

    if (existingAuthor) {
      // Update existing author
      const updated = await sanityClient
        .patch(existingAuthor._id)
        .set({
          name,
          email: email || existingAuthor.email,
          isActive: true, // Re-activate if previously deactivated
        })
        .commit();

      return NextResponse.json({ author: updated }, { status: 200 });
    }

    // Upload profile image if provided
    let profileImageAsset;
    if (profileImage) {
      try {
        const imageResponse = await fetch(profileImage);
        const imageBuffer = await imageResponse.arrayBuffer();
        const asset = await sanityClient.assets.upload('image', Buffer.from(imageBuffer), {
          filename: `${facebookId}-profile.jpg`,
        });
        profileImageAsset = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        };
      } catch (error) {
        console.error('Failed to upload profile image:', error);
      }
    }

    // Create new author
    const newAuthor = await sanityClient.create({
      _type: 'articleAuthor',
      facebookId,
      name,
      email: email || null,
      profileImage: profileImageAsset || null,
      joinedAt: new Date().toISOString(),
      isActive: true,
      isBanned: false,
      totalArticles: 0,
      totalUpvotes: 0,
      totalDownvotes: 0,
      totalViews: 0,
    });

    return NextResponse.json({ author: newAuthor }, { status: 201 });
  } catch (error) {
    console.error('Error syncing author:', error);
    return NextResponse.json(
      { error: 'Failed to sync author' },
      { status: 500 }
    );
  }
}
