"use client";

import { useEffect, useState, useCallback } from "react";
import { Testimonial } from "@/types/auth";
import {
  CheckCircle,
  XCircle,
  Star,
  Search,
  Filter,
  Eye,
  Loader2,
  Trash2,
  Shield,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function AdminTestimonialDashboard() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await fetch("/api/testimonials?all=true");
      const data = await response.json();

      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterTestimonials = useCallback(() => {
    let filtered = testimonials;

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => {
        if (statusFilter === "approved") return t.status === "approved";
        if (statusFilter === "pending") return t.status === "pending";
        if (statusFilter === "rejected") return t.status === "rejected";
        return true;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query) ||
          t.message.toLowerCase().includes(query) ||
          t.company?.toLowerCase().includes(query)
      );
    }

    setFilteredTestimonials(filtered);
  }, [testimonials, statusFilter, searchQuery]);

  useEffect(() => {
    fetchTestimonials();
    const interval = setInterval(fetchTestimonials, 60000);
    return () => clearInterval(interval);
  }, [fetchTestimonials]);

  useEffect(() => {
    filterTestimonials();
  }, [filterTestimonials]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch("/api/testimonials/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTestimonials();
        setSelectedTestimonial(null);
      } else {
        alert(data.error || "Failed to approve testimonial");
      }
    } catch (error) {
      console.error("Error approving testimonial:", error);
      alert("Failed to approve testimonial");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch("/api/testimonials/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject" }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTestimonials();
        setSelectedTestimonial(null);
      } else {
        alert(data.error || "Failed to reject testimonial");
      }
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      alert("Failed to reject testimonial");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    setActionLoading(id);
    try {
      const response = await fetch(`/api/testimonials?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await fetchTestimonials();
        setSelectedTestimonial(null);
      } else {
        alert(data.error || "Failed to delete testimonial");
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      alert("Failed to delete testimonial");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerified = async (id: string, isVerified: boolean) => {
    setActionLoading(id);
    try {
      const response = await fetch("/api/testimonials/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: isVerified ? "unverify" : "verify" }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTestimonials();
        if (selectedTestimonial?.id === id) {
          setSelectedTestimonial({ ...selectedTestimonial, is_verified: !isVerified });
        }
      } else {
        alert(data.error || "Failed to update verification status");
      }
    } catch (error) {
      console.error("Error updating verification:", error);
      alert("Failed to update verification status");
    } finally {
      setActionLoading(null);
    }
  };

  const getStats = () => {
    const pending = testimonials.filter((t) => t.status === "pending").length;
    const approved = testimonials.filter((t) => t.status === "approved").length;
    const rejected = testimonials.filter((t) => t.status === "rejected").length;
    const verified = testimonials.filter((t) => t.is_verified).length;

    return { pending, approved, rejected, verified };
  };

  const stats = getStats();

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Testimonial Management</h2>
        <button
          onClick={() => fetchTestimonials()}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            </div>
            <XCircle className="w-8 h-8 text-amber-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Verified</p>
              <p className="text-2xl font-bold text-cyan-400">{stats.verified}</p>
            </div>
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, company, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Testimonials Grid */}
      {filteredTestimonials.length === 0 ? (
        <GlassCard className="p-12">
          <div className="text-center text-gray-400">No testimonials found</div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTestimonials.map((testimonial) => (
            <GlassCard key={testimonial.id} className="p-4 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {renderStars(testimonial.rating)}
                  <h3 className="text-sm font-semibold text-white mt-2">
                    {testimonial.name}
                  </h3>
                  <p className="text-xs text-gray-400">{testimonial.email}</p>
                  {testimonial.company && (
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                      testimonial.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : testimonial.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {testimonial.status}
                  </span>
                  {testimonial.is_verified && (
                    <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 font-medium">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-300 line-clamp-3 flex-1 mb-3">
                {testimonial.message}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs text-gray-500">
                  {formatDate(testimonial.created_at)}
                </span>
                <button
                  onClick={() => setSelectedTestimonial(testimonial)}
                  className="p-1 rounded hover:bg-white/10 transition-colors text-cyan-400"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTestimonial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Testimonial Details</h3>
                <button
                  onClick={() => setSelectedTestimonial(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Name</p>
                    <p className="text-sm text-white">{selectedTestimonial.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Email</p>
                    <p className="text-sm text-white">{selectedTestimonial.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Company</p>
                    <p className="text-sm text-white">{selectedTestimonial.company || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Position</p>
                    <p className="text-sm text-white">{selectedTestimonial.position || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Rating</p>
                    {renderStars(selectedTestimonial.rating)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <p className="text-sm text-white capitalize">{selectedTestimonial.status}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-2">Message</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {selectedTestimonial.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleToggleVerified(selectedTestimonial.id, selectedTestimonial.is_verified)}
                    disabled={actionLoading === selectedTestimonial.id}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                      selectedTestimonial.is_verified
                        ? "bg-gray-500 hover:bg-gray-600 text-white"
                        : "bg-cyan-500 hover:bg-cyan-600 text-white"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    {selectedTestimonial.is_verified ? "Unverify" : "Verify"}
                  </button>

                  {selectedTestimonial.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(selectedTestimonial.id)}
                        disabled={actionLoading === selectedTestimonial.id}
                        className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading === selectedTestimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(selectedTestimonial.id)}
                        disabled={actionLoading === selectedTestimonial.id}
                        className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading === selectedTestimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDelete(selectedTestimonial.id)}
                    disabled={actionLoading === selectedTestimonial.id}
                    className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
