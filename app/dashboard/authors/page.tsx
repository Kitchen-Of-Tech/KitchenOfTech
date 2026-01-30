"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Ban, 
  CheckCircle, 
  TrendingUp, 
  Award,
  Users,
  FileText,
  Eye,
  ThumbsUp,
  Calendar
} from 'lucide-react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity/client';

interface ArticleAuthor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: any;
  bio?: string;
  facebookId: string;
  joinedAt: string;
  isActive: boolean;
  isBanned: boolean;
  bannedReason?: string;
  totalArticles: number;
  totalUpvotes: number;
  totalDownvotes: number;
  totalViews: number;
}

type RankingPeriod = '7days' | '30days' | '1year';

export default function DashboardAuthorsPage() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const authStatus = sessionData?.status || 'loading';
  const router = useRouter();
  
  const [authors, setAuthors] = useState<ArticleAuthor[]>([]);
  const [rankings, setRankings] = useState<ArticleAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>('30days');
  const [selectedAuthor, setSelectedAuthor] = useState<ArticleAuthor | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banning, setBanning] = useState(false);

  // Check authentication
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/authors');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (session) {
      fetchAuthors();
      fetchRankings();
    }
  }, [session, rankingPeriod]);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/authors');
      
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors || []);
      }
    } catch (error) {
      console.error('Failed to fetch authors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async () => {
    try {
      const response = await fetch(`/api/articles/authors/rankings?period=${rankingPeriod}`);
      
      if (response.ok) {
        const data = await response.json();
        setRankings(data.rankings || []);
      }
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    }
  };

  const handleBanAuthor = async () => {
    if (!selectedAuthor || !banReason.trim()) {
      alert('Please provide a reason for banning');
      return;
    }

    setBanning(true);
    try {
      const response = await fetch(`/api/articles/authors/${selectedAuthor._id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ban: !selectedAuthor.isBanned,
          reason: banReason,
        }),
      });

      if (response.ok) {
        fetchAuthors();
        setShowBanModal(false);
        setSelectedAuthor(null);
        setBanReason('');
        alert(`Author ${selectedAuthor.isBanned ? 'unbanned' : 'banned'} successfully`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update author ban status');
      }
    } catch (error) {
      console.error('Error updating ban status:', error);
      alert('Failed to update author ban status');
    } finally {
      setBanning(false);
    }
  };

  const filteredAuthors = authors.filter((author) => {
    const matchesSearch =
      author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const stats = {
    total: authors.length,
    active: authors.filter(a => a.isActive).length,
    banned: authors.filter(a => a.isBanned).length,
    totalArticles: authors.reduce((sum, a) => sum + (a.totalArticles || 0), 0),
    totalViews: authors.reduce((sum, a) => sum + (a.totalViews || 0), 0),
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
            Authors Management
          </h1>
          <p className="text-white/60">
            Manage authors, view rankings, and moderate content creators
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-white/60 text-sm">Total Authors</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white/60 text-sm">Active</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.active}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Ban className="w-5 h-5 text-red-400" />
              <span className="text-white/60 text-sm">Banned</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.banned}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-white/60 text-sm">Total Articles</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalArticles}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <span className="text-white/60 text-sm">Total Views</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
          </div>
        </div>

        {/* Rankings Section */}
        <div className="glass rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Top Authors</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRankingPeriod('7days')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  rankingPeriod === '7days'
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setRankingPeriod('30days')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  rankingPeriod === '30days'
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setRankingPeriod('1year')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  rankingPeriod === '1year'
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                1 Year
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rankings.slice(0, 10).map((author, index) => (
              <div
                key={author._id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4"
              >
                <div className={`text-2xl font-bold ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-orange-400' :
                  'text-white/40'
                }`}>
                  #{index + 1}
                </div>
                {author.profileImage && (
                  <Image
                    src={urlFor(author.profileImage).width(48).height(48).url()}
                    alt={author.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium">{author.name}</p>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {author.totalUpvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {author.totalArticles}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="glass rounded-xl p-6 border border-white/10 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search authors by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Authors Table */}
        <div className="glass rounded-xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredAuthors.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/60 text-lg">No authors found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">Author</th>
                    <th className="text-left p-4 text-white/60 font-medium">Email</th>
                    <th className="text-left p-4 text-white/60 font-medium">Articles</th>
                    <th className="text-left p-4 text-white/60 font-medium">Upvotes</th>
                    <th className="text-left p-4 text-white/60 font-medium">Views</th>
                    <th className="text-left p-4 text-white/60 font-medium">Joined</th>
                    <th className="text-left p-4 text-white/60 font-medium">Status</th>
                    <th className="text-left p-4 text-white/60 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuthors.map((author) => (
                    <tr
                      key={author._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {author.profileImage ? (
                            <Image
                              src={urlFor(author.profileImage).width(40).height(40).url()}
                              alt={author.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                              {author.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-white font-medium">{author.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-white/80 text-sm">{author.email}</td>
                      <td className="p-4 text-white/80">{author.totalArticles}</td>
                      <td className="p-4 text-white/80">{author.totalUpvotes}</td>
                      <td className="p-4 text-white/80">{author.totalViews.toLocaleString()}</td>
                      <td className="p-4 text-white/60 text-sm">
                        {new Date(author.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {author.isBanned ? (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                            Banned
                          </span>
                        ) : author.isActive ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedAuthor(author);
                            setBanReason(author.bannedReason || '');
                            setShowBanModal(true);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                            author.isBanned
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {author.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ban Modal */}
        {showBanModal && selectedAuthor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 border border-white/10 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-4">
                {selectedAuthor.isBanned ? 'Unban' : 'Ban'} Author
              </h3>
              <p className="text-white/60 mb-4">
                {selectedAuthor.isBanned
                  ? `Are you sure you want to unban ${selectedAuthor.name}?`
                  : `Are you sure you want to ban ${selectedAuthor.name}? They will not be able to post articles or comments.`
                }
              </p>
              {!selectedAuthor.isBanned && (
                <div className="mb-4">
                  <label className="block text-white font-medium mb-2">
                    Reason for banning <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Enter the reason for banning this author..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedAuthor(null);
                    setBanReason('');
                  }}
                  disabled={banning}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanAuthor}
                  disabled={banning || (!selectedAuthor.isBanned && !banReason.trim())}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedAuthor.isBanned
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {banning ? 'Processing...' : selectedAuthor.isBanned ? 'Unban' : 'Ban'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
