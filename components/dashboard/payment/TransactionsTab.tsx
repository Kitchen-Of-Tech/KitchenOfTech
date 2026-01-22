"use client";

import { useState, useEffect } from 'react';
import { Check, X, Eye, Search, Filter, Calendar, DollarSign } from 'lucide-react';
import type { User } from '@/types/auth';

interface Transaction {
  id: string;
  payment_method_id: string;
  transaction_id: string;
  amount: string;
  currency: string;
  user_note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  payment_link_id: string | null;
  payment_method: {
    method_name: string;
    account_details: string;
  };
  reviewer?: {
    full_name: string;
  };
}

interface TransactionsTabProps {
  currentUser: User;
  onStatsUpdate: () => void;
}

export default function TransactionsTab({ currentUser, onStatsUpdate }: TransactionsTabProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/payment/transactions'
        : `/api/payment/transactions?status=${statusFilter}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId: string) => {
    if (!confirm('Are you sure you want to approve this payment?')) return;
    
    try {
      setProcessing(transactionId);
      const response = await fetch('/api/payment/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId }),
      });

      if (!response.ok) throw new Error('Failed to approve payment');
      
      await fetchTransactions();
      onStatsUpdate();
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Failed to approve payment:', error);
      alert('Failed to approve payment');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (transactionId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      setProcessing(transactionId);
      const response = await fetch('/api/payment/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId, rejection_reason: reason }),
      });

      if (!response.ok) throw new Error('Failed to reject payment');
      
      await fetchTransactions();
      onStatsUpdate();
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Failed to reject payment:', error);
      alert('Failed to reject payment');
    } finally {
      setProcessing(null);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.payment_method.method_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                statusFilter === status
                  ? 'bg-gradient-primary text-white'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="text-center py-12 text-white/60">Loading transactions...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12 text-white/60">No transactions found</div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-white font-medium">{tx.transaction_id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                    {tx.payment_link_id && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium border border-blue-500/20 bg-blue-500/10 text-blue-400">
                        Payment Link
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium text-white">৳{parseFloat(tx.amount).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(tx.submitted_at).toLocaleDateString()}</span>
                    </div>
                    <span>via {tx.payment_method.method_name}</span>
                    {tx.customer_name && <span>by {tx.customer_name}</span>}
                  </div>
                  
                  {tx.user_note && (
                    <p className="text-sm text-white/60 italic">"{tx.user_note}"</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTransaction(tx)}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {tx.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(tx.id)}
                        disabled={processing === tx.id}
                        className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(tx.id)}
                        disabled={processing === tx.id}
                        className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Transaction Details</h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-white/60">Transaction ID</label>
                <p className="text-white font-mono mt-1">{selectedTransaction.transaction_id}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60">Amount</label>
                  <p className="text-white font-medium mt-1">৳{parseFloat(selectedTransaction.amount).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-white/60">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-white/60">Payment Method</label>
                <p className="text-white mt-1">{selectedTransaction.payment_method.method_name}</p>
                <p className="text-white/60 text-xs mt-1">{selectedTransaction.payment_method.account_details}</p>
              </div>
              
              {selectedTransaction.customer_name && (
                <div>
                  <label className="text-white/60">Customer Information</label>
                  <div className="mt-1 space-y-1">
                    <p className="text-white">{selectedTransaction.customer_name}</p>
                    {selectedTransaction.customer_email && (
                      <p className="text-white/60 text-xs">{selectedTransaction.customer_email}</p>
                    )}
                    {selectedTransaction.customer_phone && (
                      <p className="text-white/60 text-xs">{selectedTransaction.customer_phone}</p>
                    )}
                  </div>
                </div>
              )}
              
              {selectedTransaction.user_note && (
                <div>
                  <label className="text-white/60">Note</label>
                  <p className="text-white mt-1">{selectedTransaction.user_note}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60">Submitted At</label>
                  <p className="text-white text-xs mt-1">{new Date(selectedTransaction.submitted_at).toLocaleString()}</p>
                </div>
                {selectedTransaction.reviewed_at && (
                  <div>
                    <label className="text-white/60">Reviewed At</label>
                    <p className="text-white text-xs mt-1">{new Date(selectedTransaction.reviewed_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              {selectedTransaction.reviewer && (
                <div>
                  <label className="text-white/60">Reviewed By</label>
                  <p className="text-white mt-1">{selectedTransaction.reviewer.full_name}</p>
                </div>
              )}
            </div>
            
            {selectedTransaction.status === 'pending' && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleApprove(selectedTransaction.id)}
                  disabled={processing === selectedTransaction.id}
                  className="flex-1 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-50 font-medium"
                >
                  Approve Payment
                </button>
                <button
                  onClick={() => handleReject(selectedTransaction.id)}
                  disabled={processing === selectedTransaction.id}
                  className="flex-1 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50 font-medium"
                >
                  Reject Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
