"use client";

import { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Search, Filter, Link2, Copy, Mail, Plus } from 'lucide-react';
import type { User, Testimonial } from '@/types/auth';

interface TestimonialManagementClientProps {
  currentUser: User;
}

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export default function TestimonialManagementClient({ currentUser }: TestimonialManagementClientProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Service categories state
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  
  // Link generation state
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  
  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    fetchTestimonials();
    fetchServiceCategories();
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

  const fetchServiceCategories = async () => {
    try {
      const response = await fetch('/api/service-categories?includeInactive=true');
      if (response.ok) {
        const data = await response.json();
        setServiceCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch service categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    setCategoryLoading(true);
    setError('');

    try {
      const response = await fetch('/api/service-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null,
          display_order: serviceCategories.length + 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add category');
      }

      setSuccess('Category added successfully!');
      setNewCategoryName('');
      setNewCategoryDescription('');
      fetchServiceCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setCategoryLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/service-categories?id=${categoryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      setSuccess('Category deleted successfully!');
      fetchServiceCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleToggleCategoryActive = async (category: ServiceCategory) => {
    setCategoryLoading(true);
    setError('');

    try {
      const response = await fetch('/api/service-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: category.id,
          is_active: !category.is_active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update category');
      }

      fetchServiceCategories();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Open approval modal for categorization
  const handleApproveClick = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setSelectedService('');
    setShowApprovalModal(true);
  };

  // Confirm approval with service category
  const handleConfirmApproval = async () => {
    if (!selectedTestimonial || !selectedService) {
      setError('Please select a service category');
      return;
    }

    setActionLoading(selectedTestimonial.id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/testimonials/${selectedTestimonial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'approve', 
          user_id: currentUser.id,
          service_name: selectedService
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve testimonial');
      }

      setSuccess(`Testimonial approved and categorized as "${selectedService}"!`);
      setShowApprovalModal(false);
      setSelectedTestimonial(null);
      setSelectedService('');
      fetchTestimonials();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (testimonialId: string, action: 'approve' | 'reject') => {
    // For approve action, open modal instead
    if (action === 'approve') {
      const testimonial = testimonials.find(t => t.id === testimonialId);
      if (testimonial) {
        handleApproveClick(testimonial);
      }
      return;
    }

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

  // Link generation handlers
  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkLoading(true);
    setError('');
    setGeneratedLink('');
    setLinkCopied(false);

    try {
      const response = await fetch('/api/testimonials/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: linkEmail || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate link');
      }

      setGeneratedLink(data.url);
      setLinkEmail('');
      setSuccess('Testimonial link generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Testimonial Management</h1>
          <p className="text-white/60 mt-1">Review and manage client testimonials</p>
        </div>
        <button
          onClick={() => setShowLinkGenerator(!showLinkGenerator)}
          className="px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-glow-md transition-all flex items-center gap-2"
        >
          <Link2 className="w-4 h-4" />
          Generate Link
        </button>
      </div>

      {/* Link Generator */}
      {showLinkGenerator && (
        <div className="glass rounded-xl p-6 border border-primary/20 bg-primary/5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Generate Testimonial Link
          </h3>
          <form onSubmit={handleGenerateLink} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Client Email (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <p className="text-white/60 text-xs mt-2">
                Optional: Pre-fill the email field in the testimonial form
              </p>
            </div>

            <button
              type="submit"
              disabled={linkLoading}
              className="w-full px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {linkLoading ? 'Generating...' : 'Generate Link'}
            </button>
          </form>

          {generatedLink && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors flex items-center gap-2 text-white"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-blue-400 text-sm mt-2">
                <strong>Important:</strong> This link expires in 7 days and can only be used once.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Category Management */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Service Categories
          </h3>
          <button
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            {showCategoryManager ? 'Hide Manager' : 'Manage Categories'}
          </button>
        </div>

        {showCategoryManager && (
          <div className="space-y-6">
            {/* Add New Category */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white/80 font-medium mb-4">Add New Category</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Web Development"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="e.g., Custom websites and web applications"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleAddCategory}
                disabled={categoryLoading || !newCategoryName.trim()}
                className="mt-4 px-6 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-glow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {categoryLoading ? 'Adding...' : 'Add Category'}
              </button>
            </div>

            {/* Category List */}
            <div className="space-y-2">
              <h4 className="text-white/80 font-medium mb-3">Existing Categories</h4>
              {serviceCategories.length === 0 ? (
                <p className="text-white/40 text-sm">No categories yet. Add your first category above.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {serviceCategories
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((category) => (
                      <div
                        key={category.id}
                        className={`p-4 rounded-lg border transition-all ${
                          category.is_active
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/5 border-red-500/20 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-white font-medium">{category.name}</h5>
                              {!category.is_active && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {category.description && (
                              <p className="text-white/60 text-sm mt-1">{category.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleCategoryActive(category)}
                              disabled={categoryLoading}
                              className={`p-2 rounded-lg transition-all ${
                                category.is_active
                                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                  : 'bg-white/5 text-white/40 hover:bg-white/10'
                              }`}
                              title={category.is_active ? 'Deactivate' : 'Activate'}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={categoryLoading}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                              title="Delete"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
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

      {/* Approval Modal */}
      {showApprovalModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 border border-white/10 max-w-md w-full">
            <h3 className="text-white font-bold text-xl mb-4">Approve Testimonial</h3>
            
            <div className="mb-6">
              <p className="text-white/60 text-sm mb-2">Testimonial from:</p>
              <p className="text-white font-semibold">{selectedTestimonial.name}</p>
              <p className="text-white/60 text-sm">{selectedTestimonial.company}</p>
            </div>

            <div className="mb-6">
              <label className="block text-white/80 text-sm font-medium mb-3">
                Select Service Category *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {serviceCategories
                  .filter((cat) => cat.is_active)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedService(category.name)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedService === category.name
                          ? 'bg-gradient-primary text-white border-2 border-primary'
                          : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                      }`}
                      title={category.description || undefined}
                    >
                      {category.name}
                    </button>
                  ))}
              </div>
              {serviceCategories.filter((cat) => cat.is_active).length === 0 && (
                <p className="text-red-400 text-xs mt-2">
                  No active service categories. Please add categories in the category manager.
                </p>
              )}
              {!selectedService && serviceCategories.filter((cat) => cat.is_active).length > 0 && (
                <p className="text-yellow-400 text-xs mt-2">
                  Please select a service category to continue
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedTestimonial(null);
                  setSelectedService('');
                }}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                disabled={!selectedService || actionLoading === selectedTestimonial.id}
                className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === selectedTestimonial.id ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
