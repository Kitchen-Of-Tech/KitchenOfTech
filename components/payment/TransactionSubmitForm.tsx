"use client";

import { useState } from "react";
import { PaymentMethod } from "@/types/auth";
import { Send, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface TransactionSubmitFormProps {
  paymentMethod: PaymentMethod;
  amount: number;
  currency?: string;
  purchaseType: "course" | "service" | "product" | "other";
  purchaseId?: string;
  purchaseDetails?: Record<string, unknown>;
  onSuccess: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export default function TransactionSubmitForm({
  paymentMethod,
  amount,
  currency = "BDT",
  purchaseType,
  purchaseId,
  purchaseDetails,
  onSuccess,
  onError,
}: TransactionSubmitFormProps) {
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      setError("Please enter a transaction ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          transaction_id: transactionId.trim(),
          amount,
          currency,
          purchase_type: purchaseType,
          purchase_id: purchaseId,
          purchase_details: purchaseDetails,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess(data.transaction.id);
      } else {
        const errorMsg = data.error || "Failed to submit transaction";
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
    } catch (err) {
      console.error("Error submitting transaction:", err);
      const errorMsg = "Failed to submit transaction. Please try again.";
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Submit Transaction Details
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Payment Method</div>
              <div className="font-medium text-white">{paymentMethod.name}</div>
            </div>
            
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Amount</div>
              <div className="font-medium text-white">
                {currency} {amount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="transactionId"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Transaction ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="transactionId"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter your transaction ID"
            disabled={loading}
            className="
              w-full px-4 py-3 rounded-lg
              bg-white/5 border border-white/10
              text-white placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
            required
          />
          <p className="mt-2 text-xs text-gray-400">
            Enter the transaction ID you received after making the payment
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !transactionId.trim()}
          className="
            w-full py-3 px-6 rounded-lg
            bg-gradient-to-r from-cyan-500 to-blue-500
            text-white font-medium
            hover:from-cyan-600 hover:to-blue-600
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            flex items-center justify-center gap-2
          "
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Transaction
            </>
          )}
        </button>

        <div className="p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
          <p className="text-xs text-gray-400">
            Your transaction will be reviewed by our team. You will receive a
            notification once it&apos;s approved. This usually takes a few
            minutes to a few hours.
          </p>
        </div>
      </form>
    </GlassCard>
  );
}
