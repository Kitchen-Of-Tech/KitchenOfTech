"use client";

import { useState, useEffect } from 'react';
import { FileText, Plus, Download, Send, Trash2, Edit, X, Search, Filter } from 'lucide-react';
import type { User } from '@/types/auth';

interface InvoicesTabProps {
  currentUser: User;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount?: number;
  item_type?: string;
  item_id?: string;
  display_order?: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes?: string;
  line_items?: LineItem[];
  created_at: string;
}

export default function InvoicesTab({ }: InvoicesTabProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/payment/invoices', window.location.origin);
      if (filterStatus !== 'all') {
        url.searchParams.append('status', filterStatus);
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      const res = await fetch(`/api/payment/invoices/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchInvoices();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  };

  const handleSendEmail = async (id: string) => {
    if (!confirm('Send this invoice to the customer via email?')) return;
    
    try {
      const res = await fetch(`/api/payment/invoices/${id}/send`, {
        method: 'POST',
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'Invoice sent successfully');
        fetchInvoices();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Failed to send invoice:', error);
    }
  };

  const handleDownloadPDF = (id: string) => {
    window.open(`/api/payment/invoices/${id}/pdf`, '_blank');
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        invoice.invoice_number.toLowerCase().includes(search) ||
        invoice.customer_name.toLowerCase().includes(search) ||
        invoice.customer_email.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    sent: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    paid: 'bg-green-500/20 text-green-300 border-green-500/30',
    overdue: 'bg-red-500/20 text-red-300 border-red-500/30',
    cancelled: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoices</h2>
          <p className="text-white/60">Manage and track your invoices</p>
        </div>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setShowCreateModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Filters and Search */}
      <div className="glass rounded-xl p-4 border border-white/10">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-white/60" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input flex-1"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search by invoice #, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input flex-1"
            />
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="text-center py-12 text-white/60">Loading invoices...</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No invoices found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="glass rounded-xl p-6 border border-white/10 hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Invoice Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{invoice.invoice_number}</h3>
                    <span className={`px-2 py-1 rounded text-xs border ${statusColors[invoice.status]}`}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white/80 mb-1">{invoice.customer_name}</p>
                  <p className="text-white/60 text-sm mb-2">{invoice.customer_email}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-white/60">
                    <div>
                      <span className="text-white/40">Issue:</span> {new Date(invoice.issue_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-white/40">Due:</span> {new Date(invoice.due_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-white/40">Total:</span>{' '}
                      <span className="text-primary font-bold">${invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadPDF(invoice.id)}
                    className="btn-secondary flex items-center gap-2"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSendEmail(invoice.id)}
                    className="btn-secondary flex items-center gap-2"
                    title="Send Email"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  {invoice.status === 'draft' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingInvoice(invoice);
                          setShowCreateModal(true);
                        }}
                        className="btn-secondary flex items-center gap-2"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="btn-danger flex items-center gap-2"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <InvoiceModal
          invoice={editingInvoice}
          onClose={() => {
            setShowCreateModal(false);
            setEditingInvoice(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingInvoice(null);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
}

// Invoice Create/Edit Modal Component
function InvoiceModal({
  invoice,
  onClose,
  onSuccess,
}: {
  invoice: Invoice | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    customer_name: invoice?.customer_name || '',
    customer_email: invoice?.customer_email || '',
    customer_phone: invoice?.customer_phone || '',
    customer_address: invoice?.customer_address || '',
    issue_date: invoice?.issue_date || new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date || '',
    tax_rate: invoice?.tax_rate || 0,
    discount_amount: invoice?.discount_amount || 0,
    notes: invoice?.notes || '',
    status: invoice?.status || 'draft',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>(
    invoice?.line_items || [{ description: '', quantity: 1, unit_price: 0 }]
  );

  const [submitting, setSubmitting] = useState(false);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.unit_price || 0);
    }, 0);
    const taxAmount = (subtotal * (formData.tax_rate || 0)) / 100;
    const total = subtotal + taxAmount - (formData.discount_amount || 0);
    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = invoice
        ? `/api/payment/invoices/${invoice.id}`
        : '/api/payment/invoices';
      
      const method = invoice ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          line_items: lineItems,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save invoice');
      }
    } catch (error) {
      console.error('Failed to save invoice:', error);
      alert('Failed to save invoice');
    }

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">
              {invoice ? 'Edit Invoice' : 'Create Invoice'}
            </h2>
            <button type="button" onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 mb-2">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Customer Email *</label>
                <input
                  type="email"
                  required
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            {/* Dates and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/80 mb-2">Issue Date *</label>
                <input
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Invoice['status'] })}
                  className="input w-full"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-white/80 font-medium">Line Items *</label>
                <button type="button" onClick={addLineItem} className="btn-secondary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div key={index} className="glass rounded-lg p-4 border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-5">
                        <input
                          type="text"
                          placeholder="Description"
                          required
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          className="input w-full text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          required
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="input w-full text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          placeholder="Price"
                          required
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="input w-full text-sm"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center">
                        <span className="text-white/60 text-sm">
                          ${((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}
                        </span>
                      </div>
                      <div className="md:col-span-1 flex items-center">
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax and Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Discount Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                  className="input w-full"
                />
              </div>
            </div>

            {/* Totals Summary */}
            <div className="glass rounded-lg p-4 border border-primary/30">
              <div className="space-y-2">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {formData.tax_rate > 0 && (
                  <div className="flex justify-between text-white/60">
                    <span>Tax ({formData.tax_rate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {formData.discount_amount > 0 && (
                  <div className="flex justify-between text-white/60">
                    <span>Discount:</span>
                    <span>-${formData.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/10">
                  <span>Total:</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-white/80 mb-2">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input w-full"
                placeholder="Additional notes or payment terms..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
