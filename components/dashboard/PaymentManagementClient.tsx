"use client";

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Link2, 
  FileText, 
  Settings, 
  BarChart3, 
  Code,
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react';
import type { User } from '@/types/auth';
import TransactionsTab from '@/components/dashboard/payment/TransactionsTab';
import PaymentLinksTab from '@/components/dashboard/payment/PaymentLinksTab';
import InvoicesTab from '@/components/dashboard/payment/InvoicesTab';
import PaymentMethodsTab from '@/components/dashboard/payment/PaymentMethodsTab';
import AccountingTab from '@/components/dashboard/payment/AccountingTab';
import APIDocsTab from '@/components/dashboard/payment/APIDocsTab';

interface PaymentManagementClientProps {
  currentUser: User;
}

type Tab = 'transactions' | 'links' | 'invoices' | 'methods' | 'accounting' | 'api';

interface Stats {
  todayRevenue: number;
  pendingApprovals: number;
  monthlyTotal: number;
  successRate: number;
}

export default function PaymentManagementClient({ currentUser }: PaymentManagementClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('transactions');
  const [stats, setStats] = useState<Stats>({
    todayRevenue: 0,
    pendingApprovals: 0,
    monthlyTotal: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch pending count
      const txResponse = await fetch('/api/payment/transactions?status=pending');
      if (txResponse.ok) {
        const txData = await txResponse.json();
        const pending = txData.transactions?.length || 0;
        
        // Calculate today's revenue from approved transactions
        const todayResponse = await fetch('/api/payment/transactions?status=approved');
        if (todayResponse.ok) {
          const todayData = await todayResponse.json();
          const today = new Date().toDateString();
          const todayRevenue = todayData.transactions
            ?.filter((t: any) => new Date(t.reviewed_at).toDateString() === today)
            .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0;
          
          // Calculate monthly total
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const monthlyTotal = todayData.transactions
            ?.filter((t: any) => {
              const txDate = new Date(t.reviewed_at);
              return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
            })
            .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0;
          
          // Calculate success rate (approved / total submitted)
          const allResponse = await fetch('/api/payment/transactions');
          if (allResponse.ok) {
            const allData = await allResponse.json();
            const total = allData.transactions?.length || 0;
            const approved = todayData.transactions?.length || 0;
            const successRate = total > 0 ? (approved / total) * 100 : 0;
            
            setStats({
              todayRevenue,
              pendingApprovals: pending,
              monthlyTotal,
              successRate: Math.round(successRate),
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'transactions' as Tab, label: 'Transactions', icon: CreditCard },
    { id: 'links' as Tab, label: 'Payment Links', icon: Link2 },
    { id: 'invoices' as Tab, label: 'Invoices', icon: FileText },
    { id: 'methods' as Tab, label: 'Methods', icon: Settings },
    { id: 'accounting' as Tab, label: 'Accounting', icon: BarChart3 },
    { id: 'api' as Tab, label: 'API Docs', icon: Code },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Payment Management</h1>
        <p className="text-white/60 mt-1">Manage all payment transactions, invoices, and financial data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
            <DollarSign className="w-4 h-4" />
            <span>Today's Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : `৳${stats.todayRevenue.toLocaleString()}`}
          </p>
        </div>

        <div className="glass rounded-xl p-4 border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-center gap-2 text-yellow-400 text-sm mb-2">
            <Calendar className="w-4 h-4" />
            <span>Pending Approvals</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : stats.pendingApprovals}
          </p>
        </div>

        <div className="glass rounded-xl p-4 border border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
            <BarChart3 className="w-4 h-4" />
            <span>Monthly Total</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : `৳${stats.monthlyTotal.toLocaleString()}`}
          </p>
        </div>

        <div className="glass rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
            <Filter className="w-4 h-4" />
            <span>Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : `${stats.successRate}%`}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="glass rounded-xl border border-white/10 overflow-hidden">
        <div className="flex border-b border-white/10 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-gradient-primary border-b-2 border-primary'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'transactions' && <TransactionsTab currentUser={currentUser} onStatsUpdate={fetchStats} />}
          {activeTab === 'links' && <PaymentLinksTab currentUser={currentUser} />}
          {activeTab === 'invoices' && <InvoicesTab currentUser={currentUser} />}
          {activeTab === 'methods' && <PaymentMethodsTab currentUser={currentUser} />}
          {activeTab === 'accounting' && <AccountingTab currentUser={currentUser} />}
          {activeTab === 'api' && <APIDocsTab currentUser={currentUser} />}
        </div>
      </div>
    </div>
  );
}
