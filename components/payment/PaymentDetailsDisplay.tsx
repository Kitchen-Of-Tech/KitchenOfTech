"use client";

import { PaymentMethod } from "@/types/auth";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface PaymentDetailsDisplayProps {
  paymentMethod: PaymentMethod;
}

export default function PaymentDetailsDisplay({
  paymentMethod,
}: PaymentDetailsDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderAccountDetails = () => {
    if (!paymentMethod.account_details) return null;

    return Object.entries(paymentMethod.account_details).map(([key, value]) => {
      const displayKey = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      return (
        <div
          key={key}
          className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
        >
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">{displayKey}</div>
            <div className="font-mono text-white font-medium">
              {String(value)}
            </div>
          </div>
          
          <button
            onClick={() => copyToClipboard(String(value), key)}
            className="ml-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Copy to clipboard"
          >
            {copiedField === key ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      );
    });
  };

  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Payment Details
          </h3>
          <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
            {paymentMethod.name}
          </div>
        </div>

        <div className="space-y-3">{renderAccountDetails()}</div>

        {paymentMethod.instructions && (
          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex gap-2 text-blue-400 mb-2">
              <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="text-sm font-medium">Payment Instructions</div>
            </div>
            <div className="text-sm text-gray-300 whitespace-pre-line ml-6">
              {paymentMethod.instructions}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="text-sm text-amber-200">
            <strong>Important:</strong> After making the payment, you will
            receive a transaction ID. Please save it and submit it in the next
            step for verification.
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
