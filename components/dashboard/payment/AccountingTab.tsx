"use client";

import { BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import type { User } from '@/types/auth';

interface AccountingTabProps {
  currentUser: User;
}

export default function AccountingTab({ currentUser }: AccountingTabProps) {
  return (
    <div className="space-y-4">
      {/* Coming Soon Notice */}
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
          <BarChart3 className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Accounting Module</h3>
        <p className="text-white/60 max-w-md mx-auto">
          Track revenue, expenses, and generate financial reports. Automatic accounting entries created on payment approval. Coming soon!
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="glass rounded-xl p-4 border border-white/10">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">Revenue Tracking</h4>
            <p className="text-sm text-white/60">Automatic revenue entries from approved payments</p>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/10">
            <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">Expense Management</h4>
            <p className="text-sm text-white/60">Log and categorize business expenses</p>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/10">
            <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">Financial Reports</h4>
            <p className="text-sm text-white/60">Monthly P&L, revenue summaries, and trends</p>
          </div>
        </div>
      </div>
    </div>
  );
}
