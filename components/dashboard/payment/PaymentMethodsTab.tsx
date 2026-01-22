"use client";

import { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import type { User } from '@/types/auth';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'mobile_banking' | 'card' | 'crypto' | 'other';
  account_details: Record<string, string | number>;
  instructions?: string;
  is_active: boolean;
  display_order: number;
  icon_url?: string;
}

interface PaymentMethodsTabProps {
  currentUser: User;
}

export default function PaymentMethodsTab({ currentUser }: PaymentMethodsTabProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    name: '',
    type: 'mobile_banking',
    account_details: {},
    instructions: '',
    is_active: true,
    display_order: 0,
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [accountDetailsJson, setAccountDetailsJson] = useState('{}');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment/methods');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.methods || []);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingId(method.id);
    setFormData(method);
    setAccountDetailsJson(JSON.stringify(method.account_details, null, 2));
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      type: 'mobile_banking',
      account_details: {},
      instructions: '',
      is_active: true,
      display_order: 0,
    });
    setAccountDetailsJson('{}');
  };

  const handleSave = async (id?: string) => {
    setError('');
    setSuccess('');

    try {
      const parsedDetails = JSON.parse(accountDetailsJson);
      
      const payload = {
        ...formData,
        account_details: parsedDetails,
        user_id: currentUser.id,
        ...(id && { id }),
      };

      const url = '/api/payment/methods';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save payment method');
      }

      setSuccess(id ? 'Payment method updated!' : 'Payment method created!');
      fetchPaymentMethods();
      handleCancelEdit();
      setShowAddForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const response = await fetch(`/api/payment/methods?id=${id}&user_id=${currentUser.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete payment method');
      }

      setSuccess('Payment method deleted!');
      fetchPaymentMethods();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      const response = await fetch('/api/payment/methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: method.id,
          is_active: !method.is_active,
          user_id: currentUser.id,
        }),
      });

      if (response.ok) {
        fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Failed to toggle payment method:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bank: 'Bank Transfer',
      mobile_banking: 'Mobile Banking',
      card: 'Card Payment',
      crypto: 'Cryptocurrency',
      other: 'Other',
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="text-center py-12 text-white/60">Loading payment methods...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Payment Methods</h2>
          <p className="text-white/60 text-sm mt-1">Configure available payment options</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            handleCancelEdit();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Method
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="glass rounded-xl border border-white/10 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">
            {editingId ? 'Edit Payment Method' : 'Add Payment Method'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Method Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., bKash, Nagad"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="mobile_banking">Mobile Banking</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Card Payment</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Account Details (JSON) *</label>
            <textarea
              value={accountDetailsJson}
              onChange={(e) => setAccountDetailsJson(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm h-32"
              placeholder='{"account_number": "01XXXXXXXXX", "account_name": "Your Name"}'
            />
            <p className="text-xs text-white/40 mt-1">
              Format: {`{"key": "value"}`}. Example: {`{"phone": "01712345678", "name": "John Doe"}`}
            </p>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Instructions</label>
            <textarea
              value={formData.instructions || ''}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 h-20"
              placeholder="Payment instructions for users..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Icon URL</label>
              <input
                type="url"
                value={formData.icon_url || ''}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://example.com/icon.png"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-primary bg-white/5 border-white/10 rounded focus:ring-primary/50"
            />
            <label htmlFor="is_active" className="text-white/80 text-sm">Active</label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                handleCancelEdit();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all font-medium"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={() => handleSave(editingId || undefined)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Methods List */}
      <div className="space-y-3">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            No payment methods yet. Add one to get started!
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`glass rounded-xl border p-4 ${
                method.is_active ? 'border-white/10' : 'border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-white">{method.name}</h3>
                    <span className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded text-white/60">
                      {getTypeLabel(method.type)}
                    </span>
                    <button
                      onClick={() => handleToggleActive(method)}
                      className="ml-auto"
                    >
                      {method.is_active ? (
                        <Eye className="w-4 h-4 text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-red-400" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Account Details:</p>
                      <div className="text-sm text-white/80 font-mono bg-black/20 rounded p-2">
                        {Object.entries(method.account_details).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-white/60">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {method.instructions && (
                      <div>
                        <p className="text-xs text-white/40 mb-1">Instructions:</p>
                        <p className="text-sm text-white/60">{method.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(method)}
                    className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
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
