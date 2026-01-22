"use client";

import { Code, Key, Copy, Shield } from 'lucide-react';
import type { User } from '@/types/auth';

interface APIDocsTabProps {
  currentUser: User;
}

export default function APIDocsTab({ currentUser }: APIDocsTabProps) {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">API Documentation</h2>
        <p className="text-white/60 text-sm mt-1">Integrate payment system with external applications</p>
      </div>

      {/* API Keys Section */}
      <div className="glass rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-white">API Keys</h3>
        </div>
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <p className="text-white/60">API key management coming soon!</p>
          <p className="text-white/40 text-sm mt-2">Generate and manage API keys for external integrations</p>
        </div>
      </div>

      {/* Available Endpoints */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-white">Available Endpoints</h3>
        </div>

        {/* GET Payment Links */}
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs font-mono">
                GET
              </span>
              <code className="text-white/80">/api/payment/links</code>
            </div>
          </div>
          <p className="text-white/60 text-sm mb-3">Fetch all payment links (Admin only)</p>
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Example Response</span>
              <button
                onClick={() => copyCode(`{
  "links": [
    {
      "id": "uuid",
      "link_id": "pay-abc12345",
      "title": "Course Payment",
      "amount": "5000",
      "status": "active",
      "full_url": "https://yoursite.com/pay/pay-abc12345"
    }
  ]
}`)}
                className="p-1 hover:bg-white/5 rounded"
              >
                <Copy className="w-3 h-3 text-white/40" />
              </button>
            </div>
            <pre className="text-xs text-white/80 font-mono overflow-x-auto">
{`{
  "links": [
    {
      "id": "uuid",
      "link_id": "pay-abc12345",
      "title": "Course Payment",
      "amount": "5000",
      "status": "active",
      "full_url": "https://yoursite.com/pay/pay-abc12345"
    }
  ]
}`}
            </pre>
          </div>
        </div>

        {/* POST Payment Link */}
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-xs font-mono">
                POST
              </span>
              <code className="text-white/80">/api/payment/links</code>
            </div>
          </div>
          <p className="text-white/60 text-sm mb-3">Generate a new payment link</p>
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Request Body</span>
              <button
                onClick={() => copyCode(`{
  "title": "Invoice Payment",
  "description": "Payment for Invoice #001",
  "amount": 10000,
  "purpose": "invoice",
  "reference_id": "INV-001",
  "expiry_date": "2026-12-31",
  "max_uses": 1
}`)}
                className="p-1 hover:bg-white/5 rounded"
              >
                <Copy className="w-3 h-3 text-white/40" />
              </button>
            </div>
            <pre className="text-xs text-white/80 font-mono overflow-x-auto">
{`{
  "title": "Invoice Payment",
  "description": "Payment for Invoice #001",
  "amount": 10000,
  "purpose": "invoice",
  "reference_id": "INV-001",
  "expiry_date": "2026-12-31",
  "max_uses": 1
}`}
            </pre>
          </div>
        </div>

        {/* GET Single Link */}
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs font-mono">
                GET
              </span>
              <code className="text-white/80">/api/payment/links/:linkId</code>
            </div>
          </div>
          <p className="text-white/60 text-sm mb-3">Get payment link details (Public)</p>
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Example Response</span>
              <button
                onClick={() => copyCode(`{
  "link": {
    "title": "Course Payment",
    "amount": "5000",
    "status": "active"
  },
  "payment_methods": [
    {
      "id": "uuid",
      "name": "bKash",
      "type": "mobile_banking",
      "account_details": {
        "phone": "01712345678",
        "name": "John Doe"
      }
    }
  ]
}`)}
                className="p-1 hover:bg-white/5 rounded"
              >
                <Copy className="w-3 h-3 text-white/40" />
              </button>
            </div>
            <pre className="text-xs text-white/80 font-mono overflow-x-auto">
{`{
  "link": {
    "title": "Course Payment",
    "amount": "5000",
    "status": "active"
  },
  "payment_methods": [...]
}`}
            </pre>
          </div>
        </div>

        {/* POST Payment Submission */}
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-xs font-mono">
                POST
              </span>
              <code className="text-white/80">/api/payment/links/:linkId</code>
            </div>
          </div>
          <p className="text-white/60 text-sm mb-3">Submit payment (Public, no auth required)</p>
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Request Body</span>
              <button
                onClick={() => copyCode(`{
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "customer_phone": "01712345678",
  "payment_method_id": "uuid",
  "transaction_id": "TRX123456789",
  "user_note": "Paid via bKash"
}`)}
                className="p-1 hover:bg-white/5 rounded"
              >
                <Copy className="w-3 h-3 text-white/40" />
              </button>
            </div>
            <pre className="text-xs text-white/80 font-mono overflow-x-auto">
{`{
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "customer_phone": "01712345678",
  "payment_method_id": "uuid",
  "transaction_id": "TRX123456789",
  "user_note": "Paid via bKash"
}`}
            </pre>
          </div>
        </div>

        {/* GET Transactions */}
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs font-mono">
                GET
              </span>
              <code className="text-white/80">/api/payment/transactions</code>
            </div>
          </div>
          <p className="text-white/60 text-sm mb-3">Fetch payment transactions (Admin only)</p>
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-white/40 mb-2">Query Parameters</p>
            <pre className="text-xs text-white/80 font-mono">
              ?status=pending | approved | rejected
            </pre>
          </div>
        </div>

        {/* POST Approve Payment */}
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-xs font-mono">
                POST
              </span>
              <code className="text-white/80">/api/payment/approve</code>
            </div>
          </div>
          <p className="text-white/60 text-sm mb-3">Approve a payment transaction (Admin only)</p>
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Request Body</span>
              <button
                onClick={() => copyCode(`{
  "transaction_id": "uuid"
}`)}
                className="p-1 hover:bg-white/5 rounded"
              >
                <Copy className="w-3 h-3 text-white/40" />
              </button>
            </div>
            <pre className="text-xs text-white/80 font-mono">
{`{
  "transaction_id": "uuid"
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Authentication Notice */}
      <div className="glass rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-white mb-1">Authentication</h4>
            <p className="text-sm text-white/60">
              Admin endpoints require authentication via session cookies. Public endpoints (payment link retrieval and submission) do not require authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
