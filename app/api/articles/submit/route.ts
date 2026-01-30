import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sanityWriteClient } from '@/lib/sanity/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.facebookId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const tagsJson = formData.get('tags') as string;
    const status = formData.get('status') as 'draft' | 'published';
    const readingTime = parseInt(formData.get('readingTime') as string);
    const coverImageFile = formData.get('coverImage') as File | null;

    // Validate required fields
    if (!title || title.trim().length < 10 || title.trim().length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 10 and 200 characters' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 100) {
      return NextResponse.json(
        { error: 'Content must be at least 100 characters' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // Parse tags
    let tags: string[] = [];
    try {
      tags = tagsJson ? JSON.parse(tagsJson) : [];
    } catch (error) {
      console.error('Failed to parse tags:', error);
    }

    // Find the author by facebookId
    const author = await sanityWriteClient.fetch(
      `*[_type == "articleAuthor" && facebookId == $facebookId][0]`,
      { facebookId: session.user.facebookId }
    );

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found. Please sign in again.' },
        { status: 404 }
      );
    }

    // Check if author is banned
    if (author.isBanned) {
      return NextResponse.json(
        { error: 'Your account has been banned from posting articles.' },
        { status: 403 }
      );
    }

    // Upload cover image to Sanity if provided
    let coverImageAsset = null;
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        const buffer = await coverImageFile.arrayBuffer();
        const uploadedImage = await sanityWriteClient.assets.upload('image', Buffer.from(buffer), {
          filename: coverImageFile.name,
        });
        coverImageAsset = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: uploadedImage._id,
          },
        };
      } catch (error) {
        console.error('Failed to upload image:', error);
        return NextResponse.json(
          { error: 'Failed to upload cover image' },
          { status: 500 }
        );
      }
    }

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Check if slug exists and make it unique
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await sanityWriteClient.fetch(
        `*[_type == "article" && slug.current == $slug][0]`,
        { slug }
      );
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Convert plain text content to PortableText blocks
    // Split content by paragraphs and create blocks
    const contentBlocks = content
      .split('\n\n')
      .filter(para => para.trim())
      .map(para => {
        const trimmed = para.trim();
        
        // Detect headings
        if (trimmed.startsWith('# ')) {
          return {
            _type: 'block',
            style: 'h1',
            children: [{ _type: 'span', text: trimmed.substring(2) }],
          };
        } else if (trimmed.startsWith('## ')) {
          return {
            _type: 'block',
            style: 'h2',
            children: [{ _type: 'span', text: trimmed.substring(3) }],
          };
        } else if (trimmed.startsWith('### ')) {
          return {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: trimmed.substring(4) }],
          };
        } else if (trimmed.startsWith('#### ')) {
          return {
            _type: 'block',
            style: 'h4',
            children: [{ _type: 'span', text: trimmed.substring(5) }],
          };
        } else if (trimmed.startsWith('> ')) {
          return {
            _type: 'block',
            style: 'blockquote',
            children: [{ _type: 'span', text: trimmed.substring(2) }],
          };
        } else {
          // Handle bold, italic, and inline code
          const children: any[] = [];
          let currentText = '';
          let i = 0;
          
          while (i < trimmed.length) {
            // Check for inline code
            if (trimmed[i] === '`') {
              if (currentText) {
                children.push({ _type: 'span', text: currentText });
                currentText = '';
              }
              const endCode = trimmed.indexOf('`', i + 1);
              if (endCode !== -1) {
                children.push({
                  _type: 'span',
                  text: trimmed.substring(i + 1, endCode),
                  marks: ['code'],
                });
                i = endCode + 1;
                continue;
              }
            }
            
            // Check for bold
            if (trimmed.substring(i, i + 2) === '**') {
              if (currentText) {
                children.push({ _type: 'span', text: currentText });
                currentText = '';
              }
              const endBold = trimmed.indexOf('**', i + 2);
              if (endBold !== -1) {
                children.push({
                  _type: 'span',
                  text: trimmed.substring(i + 2, endBold),
                  marks: ['strong'],
                });
                i = endBold + 2;
                continue;
              }
            }
            
            // Check for italic
            if (trimmed[i] === '*' && trimmed[i + 1] !== '*') {
              if (currentText) {
                children.push({ _type: 'span', text: currentText });
                currentText = '';
              }
              const endItalic = trimmed.indexOf('*', i + 1);
              if (endItalic !== -1) {
                children.push({
                  _type: 'span',
                  text: trimmed.substring(i + 1, endItalic),
                  marks: ['em'],
                });
                i = endItalic + 1;
                continue;
              }
            }
            
            currentText += trimmed[i];
            i++;
          }
          
          if (currentText) {
            children.push({ _type: 'span', text: currentText });
          }
          
          return {
            _type: 'block',
            style: 'normal',
            children: children.length > 0 ? children : [{ _type: 'span', text: trimmed }],
          };
        }
      });

    // Create the article document
    const article = await sanityWriteClient.create({
      _type: 'article',
      title: title.trim(),
      slug: {
        _type: 'slug',
        current: slug,
      },
      author: {
        _type: 'reference',
        _ref: author._id,
      },
      coverImage: coverImageAsset,
      excerpt: excerpt?.trim() || content.substring(0, 200).trim() + '...',
      content: contentBlocks,
      tags: tags.slice(0, 10),
      category,
      status: status || 'published',
      publishedAt: status === 'published' ? new Date().toISOString() : undefined,
      readingTime: readingTime || 5,
      upvotes: 0,
      downvotes: 0,
      views: 0,
      commentCount: 0,
      featured: false,
    });

    // Update author's total articles count
    if (status === 'published') {
      await sanityWriteClient
        .patch(author._id)
        .set({ totalArticles: (author.totalArticles || 0) + 1 })
        .commit();
    }

    return NextResponse.json({
      success: true,
      slug: slug,
      articleId: article._id,
      message: status === 'published' ? 'Article published successfully!' : 'Draft saved successfully!',
    });

  } catch (error) {
    console.error('Error submitting article:', error);
    return NextResponse.json(
      { error: 'Failed to submit article. Please try again.' },
      { status: 500 }
    );
  }
}
