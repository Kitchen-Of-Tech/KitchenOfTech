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
  created_at: string;
  updated_at: string;
}

interface PaymentManagementClientProps {
  currentUser: User;
}

export default function PaymentManagementClient({ currentUser }: PaymentManagementClientProps) {
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
      // Parse account details JSON
      const parsedDetails = JSON.parse(accountDetailsJson);
      
      const payload = {
        ...formData,
        account_details: parsedDetails,
        user_id: currentUser.id,
        ...(id && { id }), // Include id in body for PUT
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

      setSuccess(id ? 'Payment method updated successfully!' : 'Payment method created successfully!');
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

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/payment/methods?id=${id}&user_id=${currentUser.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete payment method');
      }

      setSuccess('Payment method deleted successfully!');
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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Methods</h1>
          <p className="text-white/60 mt-2">
            Manage payment options for course enrollments and services
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            handleCancelEdit();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Payment Method
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Add New Payment Method</h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                handleCancelEdit();
              }}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Payment Method Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                placeholder="e.g., bKash"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Type *
              </label>
              <select
                value={formData.type || 'mobile_banking'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentMethod['type'] })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="mobile_banking">Mobile Banking</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Card Payment</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-white/80">
                Active
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Account Details (JSON) *
            </label>
            <textarea
              value={accountDetailsJson}
              onChange={(e) => setAccountDetailsJson(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 font-mono text-sm"
              rows={6}
              placeholder='{"number": "+880XXXXXXXXXX", "type": "Personal"}'
            />
            <p className="text-xs text-white/40 mt-1">
              Enter account details in JSON format. Example for mobile banking: {`{"number": "+880XXXXXXXXXX", "type": "Personal"}`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Instructions
            </label>
            <textarea
              value={formData.instructions || ''}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              rows={3}
              placeholder="Instructions for users on how to make the payment..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSave()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Payment Method
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                handleCancelEdit();
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Methods List */}
      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="glass-card p-6">
            {editingId === method.id ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Edit Payment Method</h3>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Payment Method Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type || 'mobile_banking'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentMethod['type'] })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="mobile_banking">Mobile Banking</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="card">Card Payment</option>
                      <option value="crypto">Cryptocurrency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.display_order || 0}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id={`is_active_${method.id}`}
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor={`is_active_${method.id}`} className="text-sm font-medium text-white/80">
                      Active
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Account Details (JSON) *
                  </label>
                  <textarea
                    value={accountDetailsJson}
                    onChange={(e) => setAccountDetailsJson(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 font-mono text-sm"
                    rows={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={formData.instructions || ''}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleSave(method.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-500/10 rounded-lg">
                      <CreditCard className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{method.name}</h3>
                      <p className="text-sm text-white/60">{getTypeLabel(method.type)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.is_active ? (
                        <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded-full">
                          Inactive
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs bg-white/5 text-white/60 rounded-full">
                        Order: {method.display_order}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(method)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
                      title={method.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {method.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(method)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-white/60 mb-2">Account Details</h4>
                    <div className="bg-white/5 rounded-lg p-3 font-mono text-sm text-white/80">
                      <pre>{JSON.stringify(method.account_details, null, 2)}</pre>
                    </div>
                  </div>

                  {method.instructions && (
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-2">Instructions</h4>
                      <div className="bg-white/5 rounded-lg p-3 text-sm text-white/80">
                        {method.instructions}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span>Created: {new Date(method.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(method.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {paymentMethods.length === 0 && (
          <div className="glass-card p-12 text-center">
            <CreditCard className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Payment Methods</h3>
            <p className="text-white/60 mb-4">
              Add your first payment method to start accepting payments
            </p>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
                handleCancelEdit();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add Payment Method
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
