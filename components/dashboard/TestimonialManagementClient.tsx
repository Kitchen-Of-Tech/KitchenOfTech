"use client";

import { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Search, Filter } from 'lucide-react';
import type { User, Testimonial } from '@/types/auth';

interface TestimonialManagementClientProps {
  currentUser: User;
}

export default function TestimonialManagementClient({ currentUser }: TestimonialManagementClientProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (testimonialId: string, action: 'approve' | 'reject') => {
    setActionLoading(testimonialId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, user_id: currentUser.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} testimonial`);
      }

      setSuccess(`Testimonial ${action}d successfully!`);
      fetchTestimonials();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to permanently delete this testimonial?')) {
      return;
    }

    setActionLoading(testimonialId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/testimonials/${testimonialId}?user_id=${currentUser.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete testimonial');
      }

      setSuccess('Testimonial deleted successfully!');
      fetchTestimonials();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch = 
      testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || testimonial.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: testimonials.length,
    pending: testimonials.filter(t => t.status === 'pending').length,
    approved: testimonials.filter(t => t.status === 'approved').length,
    rejected: testimonials.filter(t => t.status === 'rejected').length,
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {success && (
        <div className="glass rounded-lg p-4 border border-green-500/20 bg-green-500/10">
          <p className="text-green-400">{success}</p>
        </div>
      )}
      {error && (
        <div className="glass rounded-lg p-4 border border-red-500/20 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Testimonial Management</h1>
        <p className="text-white/60 mt-1">Review and manage client testimonials</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 border border-white/10">
          <h3 className="text-white/60 text-sm font-medium mb-2">Total</h3>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="glass rounded-xl p-4 border border-yellow-500/20 bg-yellow-500/5">
          <h3 className="text-yellow-400 text-sm font-medium mb-2">Pending</h3>
          <p className="text-2xl font-bold text-white">{stats.pending}</p>
        </div>
        <div className="glass rounded-xl p-4 border border-green-500/20 bg-green-500/5">
          <h3 className="text-green-400 text-sm font-medium mb-2">Approved</h3>
          <p className="text-2xl font-bold text-white">{stats.approved}</p>
        </div>
        <div className="glass rounded-xl p-4 border border-red-500/20 bg-red-500/5">
          <h3 className="text-red-400 text-sm font-medium mb-2">Rejected</h3>
          <p className="text-2xl font-bold text-white">{stats.rejected}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-xl p-4 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="all" className="bg-dark-secondary">All Status</option>
              <option value="pending" className="bg-dark-secondary">Pending</option>
              <option value="approved" className="bg-dark-secondary">Approved</option>
              <option value="rejected" className="bg-dark-secondary">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-white/60">Loading testimonials...</div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="glass rounded-xl p-12 border border-white/10 border-dashed text-center">
            <Star className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">No testimonials found</p>
          </div>
        ) : (
          filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="glass rounded-xl p-6 border border-white/10 hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Testimonial Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{testimonial.name}</h3>
                      <p className="text-white/60 text-sm">
                        {testimonial.position && testimonial.company
                          ? `${testimonial.position} at ${testimonial.company}`
                          : testimonial.position || testimonial.company || testimonial.email}
                      </p>
                    </div>
                    {renderStars(testimonial.rating)}
                  </div>

                  <p className="text-white/80 mb-4 leading-relaxed">{testimonial.message}</p>

                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>Submitted {new Date(testimonial.created_at).toLocaleDateString()}</span>
                    {testimonial.status === 'approved' && testimonial.approved_at && (
                      <span className="text-green-400">
                        Approved {new Date(testimonial.approved_at).toLocaleDateString()}
                      </span>
                    )}
                    {testimonial.status === 'rejected' && testimonial.rejected_at && (
                      <span className="text-red-400">
                        Rejected {new Date(testimonial.rejected_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex md:flex-col gap-2 md:min-w-[120px]">
                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium text-center ${
                    testimonial.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : testimonial.status === 'approved'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                  </div>

                  {/* Action Buttons */}
                  {testimonial.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(testimonial.id, 'approve')}
                        disabled={actionLoading === testimonial.id}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors text-green-400 text-sm disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(testimonial.id, 'reject')}
                        disabled={actionLoading === testimonial.id}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors text-red-400 text-sm disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}

                  {testimonial.status === 'approved' && (
                    <button
                      onClick={() => handleAction(testimonial.id, 'reject')}
                      disabled={actionLoading === testimonial.id}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors text-red-400 text-sm disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  )}

                  {testimonial.status === 'rejected' && (
                    <button
                      onClick={() => handleAction(testimonial.id, 'approve')}
                      disabled={actionLoading === testimonial.id}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors text-green-400 text-sm disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={actionLoading === testimonial.id}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-lg transition-colors text-white/60 hover:text-red-400 text-sm disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
