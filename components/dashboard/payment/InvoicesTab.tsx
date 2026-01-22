"use client";

import { useState } from 'react';
import { FileText, Plus, Download } from 'lucide-react';
import type { User } from '@/types/auth';

interface InvoicesTabProps {
  currentUser: User;
}

export default function InvoicesTab({ currentUser }: InvoicesTabProps) {
  return (
    <div className="space-y-4">
      {/* Coming Soon Notice */}
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
          <FileText className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Invoice System</h3>
        <p className="text-white/60 max-w-md mx-auto">
          Create professional invoices with line items, tax calculations, and automatic payment link generation. Coming soon!
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="glass rounded-xl p-4 border border-white/10">
            <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">Professional Invoices</h4>
            <p className="text-sm text-white/60">Generate branded invoices with your company details</p>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/10">
            <Plus className="w-6 h-6 text-primary mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">Line Items</h4>
            <p className="text-sm text-white/60">Add multiple items with quantities and prices</p>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/10">
            <Download className="w-6 h-6 text-primary mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">PDF Export</h4>
            <p className="text-sm text-white/60">Download and email invoices as PDF</p>
          </div>
        </div>
      </div>
    </div>
  );
}
