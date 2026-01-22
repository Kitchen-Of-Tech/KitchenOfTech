"use client";

import { useEffect, useState } from "react";
import { PaymentMethod } from "@/types/auth";
import { CreditCard, Smartphone, Building2, Wallet } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Image from "next/image";

interface PaymentMethodSelectorProps {
  selectedMethodId?: string;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export default function PaymentMethodSelector({
  selectedMethodId,
  onSelect,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payment/methods");
      const data = await response.json();

      if (data.success) {
        setMethods(data.paymentMethods);
      } else {
        setError("Failed to load payment methods");
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      setError("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "mobile_banking":
      case "mobile":
        return <Smartphone className="w-5 h-5" />;
      case "bank_transfer":
      case "bank":
        return <Building2 className="w-5 h-5" />;
      case "card":
      case "credit_card":
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
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

  if (methods.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="text-center text-gray-400 py-4">
          No payment methods available at the moment.
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        Select Payment Method
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => !disabled && onSelect(method)}
            disabled={disabled}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-300
              ${
                selectedMethodId === method.id
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-white/10 bg-white/5 hover:border-cyan-500/50 hover:bg-white/10"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`
                p-2 rounded-lg
                ${
                  selectedMethodId === method.id
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-white/10 text-gray-400"
                }
              `}
              >
                {method.icon_url ? (
                  <Image
                    src={method.icon_url}
                    alt={method.name}
                    width={20}
                    height={20}
                    className="w-5 h-5 object-contain"
                  />
                ) : (
                  getIcon(method.type)
                )}
              </div>
              
              <div className="flex-1 text-left">
                <div className="font-medium text-white">{method.name}</div>
                <div className="text-xs text-gray-400 capitalize">
                  {method.type.replace("_", " ")}
                </div>
              </div>
              
              {selectedMethodId === method.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
