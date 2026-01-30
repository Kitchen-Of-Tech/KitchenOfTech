"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ThumbsUp, ThumbsDown, Eye, MessageCircle, Calendar, Clock, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/lib/sanity/client';
import type { Article, ArticleComment } from '@/types';
import { useRouter } from 'next/navigation';
import GoogleAd, { AdSlots } from '@/components/articles/GoogleAd';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const sessionHook = useSession();
  const session = sessionHook?.data;
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchArticle();
    fetchComments();
    if (session?.user?.facebookId) {
      fetchUserVote();
    }
  }, [params.slug, session]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data.article);
        // Increment view count
        await fetch(`/api/articles/${params.slug}/view`, { method: 'POST' });
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/articles/${params.slug}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchUserVote = async () => {
    try {
      const response = await fetch(`/api/articles/${params.slug}/vote`);
      if (response.ok) {
        const data = await response.json();
        setUserVote(data.vote);
      }
    } catch (error) {
      console.error('Failed to fetch user vote:', error);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch(`/api/articles/${params.slug}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserVote(data.newVote);
        // Refresh article to get updated vote counts
        fetchArticle();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/articles/${params.slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });

      if (response.ok) {
        setCommentText('');
        fetchComments();
        fetchArticle(); // Refresh to update comment count
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl mb-4">Article not found</h1>
          <Link href="/articles" className="text-primary hover:underline">
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  const portableTextComponents = {
    types: {
      image: ({ value }: any) => (
        <figure className="my-8">
          <img
            src={urlFor(value as any).width(800).url()}
            alt={value.alt || ''}
            className="w-full rounded-lg"
          />
          {value.caption && (
            <figcaption className="text-white/60 text-sm mt-2 text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      ),
      code: ({ value }: { value: {code: string, language?: string} }) => (
        <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto my-6">
          <code className="text-green-400 text-sm">{value.code}</code>
        </pre>
      ),
    },
    block: {
      h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-4xl font-bold text-white mt-8 mb-4">{children}</h1>,
      h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-3xl font-bold text-white mt-6 mb-3">{children}</h2>,
      h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-2xl font-bold text-white mt-5 mb-2">{children}</h3>,
      h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-xl font-bold text-white mt-4 mb-2">{children}</h4>,
      normal: ({ children }: { children?: React.ReactNode }) => <p className="text-white/80 text-lg leading-relaxed mb-4">{children}</p>,
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="border-l-4 border-primary pl-4 italic text-white/70 my-6">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">{children}</ul>,
      number: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside text-white/80 space-y-2 mb-4">{children}</ol>,
    },
    marks: {
      strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-white">{children}</strong>,
      em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
      code: ({ children }: { children?: React.ReactNode }) => (
        <code className="bg-black/30 px-2 py-1 rounded text-primary text-sm">{children}</code>
      ),
      link: ({ value, children }: { value?: {href: string}, children?: React.ReactNode }) => (
        <a
          href={value?.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {children}
        </a>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>

        {/* Top Banner Ad */}
        <div className="mb-6">
          <GoogleAd adSlot={AdSlots.ARTICLE_TOP} adFormat="horizontal" />
        </div>

        {/* Article Header */}
        <div className="max-w-4xl mx-auto">{/* Article Header */}
          {article.coverImage && (
            <div className="relative w-full h-96 rounded-2xl overflow-hidden mb-8">
              <Image
                src={urlFor(article.coverImage as any).width(1200).height(600).url()}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="mb-8">
            {article.category && (
              <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full mb-4 inline-block">
                {article.category.replace('-', ' ')}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {article.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-center gap-6 text-white/60 mb-4">
              <div className="flex items-center gap-3">
                {article.author.profileImage && (
                  <Image
                    src={urlFor(article.author.profileImage as any).width(40).height(40).url()}
                    alt={article.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <span className="text-white font-medium">{article.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
              {article.readingTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{article.readingTime} min read</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{article.views} views</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{article.commentCount} comments</span>
              </div>
            </div>
          </div>

          {/* Voting Section */}
          <div className="glass rounded-2xl p-6 border border-white/10 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleVote('upvote')}
                  disabled={!session}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    userVote === 'upvote'
                      ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span className="font-semibold">{article.upvotes}</span>
                </button>
                <button
                  onClick={() => handleVote('downvote')}
                  disabled={!session}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    userVote === 'downvote'
                      ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span className="font-semibold">{article.downvotes}</span>
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
            {!session && (
              <p className="text-yellow-400 text-sm mt-4">
                Please <Link href="/auth/signin" className="underline">sign in</Link> to vote
              </p>
            )}
          </div>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <PortableText
              value={article.content as any}
              components={portableTextComponents}
            />
          </div>

          {/* In-Article Ad */}
          <div className="mb-8">
            <GoogleAd adSlot={AdSlots.ARTICLE_IN_CONTENT} adFormat="rectangle" />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6">
              Comments ({article.commentCount})
            </h3>

            {/* Comment Form */}
            {session ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  rows={4}
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/40 text-sm">
                    {commentText.length}/500 characters
                  </span>
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="px-6 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-8">
                <p className="text-yellow-400">
                  Please <Link href="/auth/signin" className="underline">sign in</Link> to leave a comment
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-white/40 text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {comment.author.profileImage && (
                        <Image
                          src={urlFor(comment.author.profileImage as any).width(32).height(32).url()}
                          alt={comment.author.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">
                            {comment.author.name}
                          </span>
                          <span className="text-white/40 text-sm">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-white/80">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Ad */}
          <div className="mt-8">
            <GoogleAd adSlot={AdSlots.ARTICLE_BOTTOM} adFormat="horizontal" />
          </div>
        </div>
      </div>
    </div>
  );
}
