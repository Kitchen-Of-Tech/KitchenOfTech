"use client";

import { useEffect, useState, useCallback } from "react";
import { PaymentTransaction } from "@/types/auth";
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface PaymentStatusTrackerProps {
  purchaseType?: string;
  purchaseId?: string;
  refreshInterval?: number; // in milliseconds
}

export default function PaymentStatusTracker({
  purchaseType,
  purchaseId,
  refreshInterval = 30000, // 30 seconds default
}: PaymentStatusTrackerProps) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      let url = "/api/payment/transactions";
      const params = new URLSearchParams();
      
      if (purchaseType) params.append("purchase_type", purchaseType);
      if (purchaseId) params.append("purchase_id", purchaseId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      } else {
        setError("Failed to load transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [purchaseType, purchaseId]);

  useEffect(() => {
    fetchTransactions();
    
    // Set up auto-refresh for pending transactions
    const hasPending = transactions.some((t) => t.status === "pending");
    if (hasPending) {
      const interval = setInterval(fetchTransactions, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [transactions, refreshInterval, fetchTransactions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "refunded":
        return <RefreshCw className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 border-green-500/20 text-green-400";
      case "rejected":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      case "refunded":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
      default:
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    }
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
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <div className="text-center text-red-400 py-4">{error}</div>
      </GlassCard>
    );
  }

  if (transactions.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">No transactions found</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Payment Status</h3>
        <button
          onClick={fetchTransactions}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <GlassCard key={transaction.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(transaction.status)}
                    <span className="font-medium text-white capitalize">
                      {transaction.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Transaction ID: {transaction.transaction_id}
                  </div>
                  
                  <div className="text-sm text-gray-500 mt-1">
                    {formatDate(transaction.created_at)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-white">
                    {transaction.currency} {transaction.amount.toLocaleString()}
                  </div>
                  <div
                    className={`
                    mt-1 px-2 py-1 rounded text-xs font-medium inline-block
                    ${getStatusColor(transaction.status)}
                  `}
                  >
                    {transaction.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {transaction.status === "pending" && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex gap-2 text-amber-400 text-sm">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Under Review</div>
                      <div className="text-xs text-amber-300 mt-1">
                        Your payment is being verified. You&apos;ll receive a
                        notification once it&apos;s approved.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {transaction.status === "rejected" &&
                transaction.rejection_reason && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Rejection Reason</div>
                        <div className="text-xs text-red-300 mt-1">
                          {transaction.rejection_reason}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {transaction.status === "approved" && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Payment Confirmed</div>
                      <div className="text-xs text-green-300 mt-1">
                        Your payment has been verified and your purchase is now
                        active.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {transaction.purchase_details && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <ExternalLink className="w-3 h-3" />
                    <span className="capitalize">
                      {transaction.purchase_type}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
