"use client";

import { useEffect, useState, useCallback } from "react";
import { PaymentTransaction } from "@/types/auth";
import {
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function AdminPaymentDashboard() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch("/api/payment/transactions");
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterTransactions = useCallback(() => {
    let filtered = transactions;

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.transaction_id.toLowerCase().includes(query) ||
          t.user?.email?.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, statusFilter, searchQuery]);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  const handleApprove = async (transactionId: string) => {
    setActionLoading(transactionId);
    try {
      const response = await fetch("/api/payment/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_id: transactionId }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTransactions();
        setSelectedTransaction(null);
      } else {
        alert(data.error || "Failed to approve payment");
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Failed to approve payment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (transactionId: string, rejectionReason: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setActionLoading(transactionId);
    try {
      const response = await fetch("/api/payment/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: transactionId,
          rejection_reason: rejectionReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTransactions();
        setSelectedTransaction(null);
      } else {
        alert(data.error || "Failed to reject payment");
      }
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert("Failed to reject payment");
    } finally {
      setActionLoading(null);
    }
  };

  const getStats = () => {
    const pending = transactions.filter((t) => t.status === "pending").length;
    const approved = transactions.filter((t) => t.status === "approved").length;
    const rejected = transactions.filter((t) => t.status === "rejected").length;
    const totalAmount = transactions
      .filter((t) => t.status === "approved")
      .reduce((sum, t) => sum + t.amount, 0);

    return { pending, approved, rejected, totalAmount };
  };

  const stats = getStats();

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
        <h2 className="text-2xl font-bold text-white">Payment Management</h2>
        <button
          onClick={() => fetchTransactions()}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400" />
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
          <div>
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-cyan-400">
              {stats.totalAmount.toLocaleString()} BDT
            </p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by transaction ID or user email..."
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

      <GlassCard className="p-6">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-300">{transaction.user?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-mono text-gray-300">
                        {transaction.transaction_id}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-white font-medium">
                      {transaction.currency} {transaction.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                          transaction.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : transaction.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-cyan-400"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Transaction ID</p>
                  <p className="text-sm font-mono text-white">
                    {selectedTransaction.transaction_id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Amount</p>
                  <p className="text-sm font-medium text-white">
                    {selectedTransaction.currency} {selectedTransaction.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">User Email</p>
                  <p className="text-sm text-white">{selectedTransaction.user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className="text-sm text-white capitalize">{selectedTransaction.status}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Created At</p>
                  <p className="text-sm text-white">
                    {formatDate(selectedTransaction.created_at)}
                  </p>
                </div>
              </div>

              {selectedTransaction.rejection_reason && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-300">{selectedTransaction.rejection_reason}</p>
                </div>
              )}

              {selectedTransaction.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedTransaction.id)}
                    disabled={actionLoading === selectedTransaction.id}
                    className="flex-1 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedTransaction.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt("Enter rejection reason:");
                      if (reason) {
                        handleReject(selectedTransaction.id, reason);
                      }
                    }}
                    disabled={actionLoading === selectedTransaction.id}
                    className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedTransaction.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    Reject
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
