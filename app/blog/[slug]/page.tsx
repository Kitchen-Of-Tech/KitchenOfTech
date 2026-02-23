'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { PortableText } from '@portabletext/react';
import type { PortableTextComponents } from '@portabletext/react';
import { Footer } from '@/components/layout/Footer';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { GlassCard } from '@/components/ui/GlassCard';
import { sanityFetch, urlFor } from '@/lib/sanity/client';
import { BLOG_POST_QUERY, BLOG_POSTS_QUERY } from '@/lib/sanity/queries';
import type { BlogPost } from '@/types';
import type { Image as SanityImageSource } from 'sanity';

// Portable Text component overrides for styled rendering
const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-white/80 leading-relaxed text-lg mb-6">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold text-white mt-12 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold text-white mt-10 mb-4">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-semibold text-white mt-8 mb-3">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-6 my-8 italic text-white/70 text-lg">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-6 text-white/80 text-lg ml-4">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-white/80 text-lg ml-4">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-white/90">{children}</em>,
    code: ({ children }) => (
      <code className="bg-white/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-10">
          <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Image
              src={urlFor(value).width(1200).height(675).url()}
              alt={value.alt || ''}
              fill
              className="object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-white/50 text-sm mt-3 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogPostPage({ params: paramsPromise }: BlogPostPageProps) {
  const params = use(paramsPromise);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.slug) {
      setError('Blog post not found');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await sanityFetch<BlogPost>({
          query: BLOG_POST_QUERY,
          params: { slug: params.slug },
          tags: ['blog'],
        });

        if (!data) {
          setError('Blog post not found');
          setLoading(false);
          return;
        }

        setPost(data);

        // Fetch related posts by category
        const allPosts = await sanityFetch<BlogPost[]>({
          query: BLOG_POSTS_QUERY,
          tags: ['blog'],
        });

        const related = allPosts
          .filter(
            (p) =>
              p.category === data.category &&
              p.slug.current !== params.slug
          )
          .slice(0, 3);

        setRelatedPosts(related);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark">
        <div className="container-custom pt-40 pb-20">
          <div className="text-center text-white/70">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-dark">
        <div className="container-custom pt-40 pb-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
            <p className="text-white/70 mb-8">{error || 'Blog post not found'}</p>
            <Link href="/blog" className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <main className="pt-24 pb-20 md:pt-32 md:pb-32">
        {/* Back Button */}
        <div className="container-custom mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="container-custom mb-16">
          <ScrollReveal animation="fade-up">
            <div className="space-y-6">
              {/* Category & Meta */}
              <div className="flex flex-wrap gap-4 items-center">
                <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full capitalize">
                  {post.category?.replace('-', ' ') || 'Article'}
                </span>
                {post.publishedDate && (
                  <div className="flex items-center gap-1 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(post.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {post.readTime && (
                  <div className="flex items-center gap-1 text-white/60 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime} min read</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                {post.title}
              </h1>

              {/* Author */}
              {post.author && (
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  {post.author.image?.asset && (
                    <Image
                      src={urlFor(post.author.image as SanityImageSource)
                        .width(60)
                        .height(60)
                        .url()}
                      alt={post.author.name}
                      width={60}
                      height={60}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-1 text-white font-semibold">
                      <User className="w-4 h-4" />
                      {post.author.name}
                    </div>
                    {post.author.bio && (
                      <p className="text-white/70 text-sm">{post.author.bio}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        </section>

        {/* Featured Image */}
        {post.featuredImage?.asset && (
          <section className="container-custom mb-16">
            <ScrollReveal animation="fade-up">
              <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden">
                <Image
                  src={urlFor(post.featuredImage as SanityImageSource)
                    .width(1200)
                    .height(600)
                    .url()}
                  alt={post.title}
                  fill
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* Content */}
        <section className="container-custom">
          <ScrollReveal animation="fade-up">
            <div className="max-w-3xl mx-auto">
              {post.excerpt && !post.content && (
                <p className="text-white/80 leading-relaxed text-lg">{post.excerpt}</p>
              )}
              {post.content && Array.isArray(post.content) && post.content.length > 0 ? (
                <div className="prose-custom">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <PortableText value={post.content as any[]} components={portableTextComponents} />
                </div>
              ) : post.content && typeof post.content === 'string' ? (
                <p className="text-white/80 leading-relaxed text-lg">{post.content}</p>
              ) : !post.excerpt ? (
                <p className="text-white/60 italic text-lg">No content available for this post yet.</p>
              ) : null}
            </div>
          </ScrollReveal>
        </section>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <section className="container-custom mt-16 pt-16 border-t border-white/10">
            <ScrollReveal animation="fade-up">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-white font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/5 text-white/70 text-sm rounded-full border border-white/10 hover:border-primary/50 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-20 border-t border-white/10">
            <div className="container-custom">
              <ScrollReveal animation="fade-up">
                <h2 className="text-3xl font-bold text-white mb-12">
                  Related Articles
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost, index) => (
                  <ScrollReveal key={relatedPost._id} animation="fade-up" delay={index * 100}>
                    <Link href={`/blog/${relatedPost.slug.current}`}>
                      <GlassCard hover className="group overflow-hidden h-full flex flex-col">
                        {relatedPost.featuredImage?.asset && (
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={urlFor(relatedPost.featuredImage as SanityImageSource)
                                .width(400)
                                .height(300)
                                .url()}
                              alt={relatedPost.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-white group-hover:text-gradient transition-all mb-2 line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-white/70 text-sm line-clamp-2 flex-1">
                            {relatedPost.excerpt}
                          </p>
                        </div>
                      </GlassCard>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
