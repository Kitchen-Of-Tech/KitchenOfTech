"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Trash2, 
  Eye, 
  Archive, 
  TrendingUp, 
  FileText,
  Users,
  ThumbsUp,
  MessageCircle,
  Filter
} from 'lucide-react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity/client';
import type { Article } from '@/types';

type ArticleStatus = 'all' | 'published' | 'draft' | 'archived';

export default function DashboardArticlesPage() {
  const sessionHook = useSession();
  const session = sessionHook?.data;
  const authStatus = sessionHook?.status || 'loading';
  const router = useRouter();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus>('all');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Check authentication and role
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/articles');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (session) {
      fetchArticles();
    }
  }, [session, statusFilter]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const response = await fetch(`/api/dashboard/articles?includeAll=true${statusParam}`);
      
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setDeleting(articleId);
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArticles(articles.filter(a => a._id !== articleId));
        alert('Article deleted successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    } finally {
      setDeleting(null);
    }
  };

  const handleArchiveArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/archive`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchArticles();
        alert('Article archived successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to archive article');
      }
    } catch (error) {
      console.error('Error archiving article:', error);
      alert('Failed to archive article');
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    draft: articles.filter(a => a.status === 'draft').length,
    archived: articles.filter(a => a.status === 'archived').length,
    totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0),
    totalUpvotes: articles.reduce((sum, a) => sum + (a.upvotes || 0), 0),
    totalComments: articles.reduce((sum, a) => sum + (a.commentCount || 0), 0),
  };

  if (authStatus === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Articles Management
          </h1>
          <p className="text-white/60">
            Manage all articles, view stats, and moderate content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-white/60 text-sm">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white/60 text-sm">Published</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.published}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              <span className="text-white/60 text-sm">Drafts</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.draft}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Archive className="w-5 h-5 text-gray-400" />
              <span className="text-white/60 text-sm">Archived</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.archived}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="text-white/60 text-sm">Views</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <ThumbsUp className="w-5 h-5 text-green-400" />
              <span className="text-white/60 text-sm">Upvotes</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalUpvotes}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <span className="text-white/60 text-sm">Comments</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalComments}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-6 border border-white/10 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ArticleStatus)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="glass rounded-xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/60 text-lg">No articles found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">Article</th>
                    <th className="text-left p-4 text-white/60 font-medium">Author</th>
                    <th className="text-left p-4 text-white/60 font-medium">Status</th>
                    <th className="text-left p-4 text-white/60 font-medium">Views</th>
                    <th className="text-left p-4 text-white/60 font-medium">Votes</th>
                    <th className="text-left p-4 text-white/60 font-medium">Comments</th>
                    <th className="text-left p-4 text-white/60 font-medium">Date</th>
                    <th className="text-left p-4 text-white/60 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr
                      key={article._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {article.coverImage && (
                            <Image
                              src={urlFor(article.coverImage as any).width(60).height(40).url()}
                              alt={article.title}
                              width={60}
                              height={40}
                              className="rounded object-cover"
                            />
                          )}
                          <div>
                            <Link
                              href={`/articles/${article.slug.current}`}
                              className="text-white font-medium hover:text-primary transition-colors line-clamp-1"
                            >
                              {article.title}
                            </Link>
                            {article.category && (
                              <span className="text-white/40 text-xs">
                                {article.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {article.author.profileImage && (
                            <Image
                              src={urlFor(article.author.profileImage as any).width(24).height(24).url()}
                              alt={article.author.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                          <span className="text-white/80 text-sm">
                            {article.author.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            article.status === 'published'
                              ? 'bg-green-500/20 text-green-400'
                              : article.status === 'draft'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td className="p-4 text-white/80">{article.views}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-400">↑{article.upvotes}</span>
                          <span className="text-red-400">↓{article.downvotes}</span>
                        </div>
                      </td>
                      <td className="p-4 text-white/80">{article.commentCount}</td>
                      <td className="p-4 text-white/60 text-sm">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/articles/${article.slug.current}`}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="View Article"
                          >
                            <Eye className="w-4 h-4 text-white/60" />
                          </Link>
                          {article.status !== 'archived' && (
                            <button
                              onClick={() => handleArchiveArticle(article._id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Archive Article"
                            >
                              <Archive className="w-4 h-4 text-yellow-400" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteArticle(article._id)}
                            disabled={deleting === article._id}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
