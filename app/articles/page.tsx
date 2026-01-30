"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, Clock, ChevronRight, PenSquare, ThumbsUp, Eye, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity/client';
import type { Article } from '@/types';
import { useSession } from 'next-auth/react';
import GoogleAd, { AdSlots } from '@/components/articles/GoogleAd';

export default function ArticlesPage() {
  const sessionHook = useSession();
  const session = sessionHook?.data;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'newest' | 'trending'>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'ai-ml', label: 'AI & ML' },
    { value: 'cloud-computing', label: 'Cloud Computing' },
    { value: 'devops', label: 'DevOps' },
    { value: 'ui-ux', label: 'UI/UX Design' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'general-tech', label: 'General Tech' },
  ];

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'trending'
        ? '/api/articles?filter=trending&days=30'
        : '/api/articles';
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      } else {
        console.error('Failed to fetch articles: HTTP', response.status);
        setArticles([]);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !categoryFilter || article.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Tech <span className="text-gradient-primary">Articles</span>
            </h1>
            <p className="text-lg text-white/70 mb-8">
              Explore insightful articles from our community of tech enthusiasts and experts
            </p>

            {/* Submit Article Button */}
            <Link
              href="/articles/submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-glow-md transition-all"
            >
              <PenSquare className="w-5 h-5" />
              Submit Your Article
            </Link>
          </div>
        </div>
      </div>

      {/* Top Banner Ad */}
      <div className="container-custom mb-8">
        <GoogleAd adSlot={AdSlots.ARTICLES_LIST_TOP} adFormat="horizontal" />
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="glass rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* Filter by Status */}
            <div className="glass rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3">Sort By</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilter('newest')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filter === 'newest'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Newest
                </button>
                <button
                  onClick={() => setFilter('trending')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filter === 'trending'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Trending (30 Days)
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="glass rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setCategoryFilter(null)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    !categoryFilter
                      ? 'bg-primary/20 text-primary'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      categoryFilter === cat.value
                        ? 'bg-primary/20 text-primary'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Articles Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="glass rounded-xl p-12 border border-white/10 text-center">
                <p className="text-white/60 text-lg">
                  No articles found. {searchQuery && 'Try a different search term.'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredArticles.map((article, index) => (
                  <React.Fragment key={article._id}>
                    <Link
                      href={`/articles/${article.slug.current}`}
                      className="glass rounded-xl overflow-hidden border border-white/10 hover:border-primary/30 transition-all group"
                    >
                    {/* Cover Image */}
                    {article.coverImage && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={urlFor(article.coverImage as any).width(600).height(400).url()}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Category Badge */}
                      {article.category && (
                        <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs rounded-full mb-3">
                          {categories.find(c => c.value === article.category)?.label || article.category}
                        </span>
                      )}

                      {/* Title */}
                      <h3 className="text-white font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="text-white/60 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Author & Meta */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          {article.author.profileImage ? (
                            <Image
                              src={urlFor(article.author.profileImage as any).width(32).height(32).url()}
                              alt={article.author.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                              {article.author.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-white text-sm font-medium">
                              {article.author.name}
                            </p>
                            <p className="text-white/40 text-xs">
                              {formatDate(article.publishedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-white/40 text-xs">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {article.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {article.commentCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* In-Feed Ad - Every 6 articles */}
                  {(index + 1) % 6 === 0 && index !== filteredArticles.length - 1 && (
                    <div className="md:col-span-2">
                      <GoogleAd adSlot={AdSlots.ARTICLES_LIST_SIDEBAR} adFormat="rectangle" className="my-4" />
                    </div>
                  )}
                </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
