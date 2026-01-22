"use client";

import { useState } from 'react';
import { CreditCard, DollarSign, Calendar, Hash, CheckCircle } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  account_details: Record<string, string | number>;
  instructions?: string;
  icon_url?: string;
}

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
}

interface PublicPaymentClientProps {
  link: PaymentLink;
  paymentMethods: PaymentMethod[];
}

export default function PublicPaymentClient({ link, paymentMethods }: PublicPaymentClientProps) {
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    transaction_id: '',
    user_note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`/api/payment/links/${link.link_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          payment_method_id: selectedMethodId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit payment');
      }

      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass rounded-xl border border-white/10 p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Submitted!</h1>
          <p className="text-white/60 mb-6">
            Your payment has been submitted successfully and is pending verification. 
            You will be notified once it has been reviewed.
          </p>
          <div className="text-left glass rounded-lg border border-white/10 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Amount:</span>
              <span className="text-white font-medium">৳{parseFloat(link.amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Transaction ID:</span>
              <span className="text-white font-mono">{formData.transaction_id}</span>
            </div>
            {link.reference_id && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Reference:</span>
                <span className="text-white">{link.reference_id}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Payment Info Card */}
      <div className="glass rounded-xl border border-white/10 p-6">
        <h1 className="text-2xl font-bold text-white mb-2">{link.title}</h1>
        {link.description && (
          <p className="text-white/60 mb-4">{link.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-white/60">Amount</p>
              <p className="text-lg font-bold text-white">৳{parseFloat(link.amount).toLocaleString()}</p>
            </div>
          </div>
          
          {link.expiry_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-white/60">Valid Until</p>
                <p className="text-sm text-white">{new Date(link.expiry_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-white/60">Purpose</p>
              <p className="text-sm text-white capitalize">{link.purpose}</p>
            </div>
          </div>
          
          {link.reference_id && (
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-white/60">Reference</p>
                <p className="text-sm text-white">{link.reference_id}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="glass rounded-xl border border-white/10 p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Complete Payment</h2>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/80">Your Information</h3>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Phone *</label>
              <input
                type="tel"
                required
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="01712345678"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/80">Select Payment Method</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethodId(method.id)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  selectedMethodId === method.id
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {method.icon_url ? (
                    <img src={method.icon_url} alt={method.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <CreditCard className="w-8 h-8 text-primary" />
                  )}
                  <div>
                    <p className="font-medium text-white">{method.name}</p>
                    <p className="text-xs text-white/60 capitalize">{method.type.replace('_', ' ')}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Payment Instructions */}
          {selectedMethod && (
            <div className="glass rounded-lg border border-white/10 p-4 space-y-3">
              <h4 className="font-medium text-white">Payment Details</h4>
              
              <div className="space-y-1">
                {Object.entries(selectedMethod.account_details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-white/60 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-white font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>

              {selectedMethod.instructions && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-white/60 mb-1">Instructions:</p>
                  <p className="text-sm text-white/80">{selectedMethod.instructions}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transaction Details */}
        {selectedMethodId && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/80">Transaction Details</h3>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">Transaction ID / Reference Number *</label>
              <input
                type="text"
                required
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="TRX123456789"
              />
              <p className="text-xs text-white/40 mt-1">
                Enter the transaction ID from your banking app after completing the payment
              </p>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Note (Optional)</label>
              <textarea
                value={formData.user_note}
                onChange={(e) => setFormData({ ...formData, user_note: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 h-20"
                placeholder="Any additional information..."
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !selectedMethodId}
          className="w-full py-3 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : `Submit Payment (৳${parseFloat(link.amount).toLocaleString()})`}
        </button>

        <p className="text-xs text-white/40 text-center">
          Your payment will be reviewed by our team and you will be notified once approved.
        </p>
      </form>
    </div>
  );
}
