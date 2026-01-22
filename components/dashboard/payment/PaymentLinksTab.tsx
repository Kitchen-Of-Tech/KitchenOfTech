"use client";

import { useState, useEffect } from 'react';
import { Plus, Copy, ExternalLink, Eye, X, Link2, Calendar, DollarSign, Hash } from 'lucide-react';
import type { User } from '@/types/auth';

interface PaymentLink {
  id: string;
  link_id: string;
  title: string;
  description: string | null;
  amount: string;
  currency: string;
  purpose: string;
  reference_id: string | null;
  expiry_date: string | null;
  max_uses: number | null;
  current_uses: number;
  status: 'active' | 'expired' | 'completed' | 'cancelled';
  created_at: string;
  full_url?: string;
}

interface PaymentLinksTabProps {
  currentUser: User;
}

export default function PaymentLinksTab({ currentUser }: PaymentLinksTabProps) {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    purpose: 'invoice',
    reference_id: '',
    expiry_date: '',
    max_uses: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment/links');
      if (!response.ok) throw new Error('Failed to fetch links');
      
      const data = await response.json();
      setLinks(data.links || []);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      const response = await fetch('/api/payment/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          amount: parseFloat(formData.amount),
          purpose: formData.purpose,
          reference_id: formData.reference_id || null,
          expiry_date: formData.expiry_date || null,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create link');
      
      const data = await response.json();
      alert('Payment link created successfully!\n\nLink: ' + data.link.full_url);
      
      await fetchLinks();
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        amount: '',
        purpose: 'invoice',
        reference_id: '',
        expiry_date: '',
        max_uses: '',
      });
    } catch (error) {
      console.error('Failed to create link:', error);
      alert('Failed to create payment link');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'expired': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'completed': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'cancelled': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Payment Links</h2>
          <p className="text-white/60 text-sm mt-1">Generate shareable payment links for invoices and services</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          Generate Link
        </button>
      </div>

      {/* Links List */}
      {loading ? (
        <div className="text-center py-12 text-white/60">Loading payment links...</div>
      ) : links.length === 0 ? (
        <div className="text-center py-12 text-white/60">No payment links yet</div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-medium">{link.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(link.status)}`}>
                      {link.status}
                    </span>
                  </div>
                  
                  {link.description && (
                    <p className="text-sm text-white/60">{link.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium text-white">৳{parseFloat(link.amount).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      <span>{link.current_uses} uses</span>
                      {link.max_uses && <span>/ {link.max_uses} max</span>}
                    </div>
                    {link.expiry_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Expires {new Date(link.expiry_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <span className="capitalize">for {link.purpose}</span>
                  </div>
                  
                  {link.full_url && (
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded text-xs text-white/80 font-mono">
                        {link.full_url}
                      </code>
                      <button
                        onClick={() => copyToClipboard(link.full_url!)}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={link.full_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setSelectedLink(link)}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Link Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Generate Payment Link</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., Web Development Invoice"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 h-20"
                  placeholder="Additional details about this payment"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Amount *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Purpose *</label>
                  <select
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="invoice">Invoice</option>
                    <option value="course">Course Payment</option>
                    <option value="service">Service Payment</option>
                    <option value="product">Product Purchase</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-white/80 text-sm mb-2">Reference ID</label>
                <input
                  type="text"
                  value={formData.reference_id}
                  onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., INV-001, ORDER-123"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Max Uses</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {creating ? 'Generating...' : 'Generate Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Details Modal */}
      {selectedLink && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Payment Link Details</h3>
              <button
                onClick={() => setSelectedLink(null)}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-white/60">Title</label>
                <p className="text-white font-medium mt-1">{selectedLink.title}</p>
              </div>
              
              {selectedLink.description && (
                <div>
                  <label className="text-white/60">Description</label>
                  <p className="text-white mt-1">{selectedLink.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60">Amount</label>
                  <p className="text-white font-medium mt-1">৳{parseFloat(selectedLink.amount).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-white/60">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedLink.status)}`}>
                      {selectedLink.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60">Purpose</label>
                  <p className="text-white capitalize mt-1">{selectedLink.purpose}</p>
                </div>
                {selectedLink.reference_id && (
                  <div>
                    <label className="text-white/60">Reference ID</label>
                    <p className="text-white mt-1">{selectedLink.reference_id}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60">Uses</label>
                  <p className="text-white mt-1">
                    {selectedLink.current_uses} {selectedLink.max_uses && `/ ${selectedLink.max_uses}`}
                  </p>
                </div>
                {selectedLink.expiry_date && (
                  <div>
                    <label className="text-white/60">Expiry Date</label>
                    <p className="text-white mt-1">{new Date(selectedLink.expiry_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-white/60">Created</label>
                <p className="text-white text-xs mt-1">{new Date(selectedLink.created_at).toLocaleString()}</p>
              </div>
              
              {selectedLink.full_url && (
                <div>
                  <label className="text-white/60">Payment URL</label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded text-xs text-white/80 font-mono">
                      {selectedLink.full_url}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedLink.full_url!)}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
