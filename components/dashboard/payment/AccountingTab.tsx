"use client";

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Plus, X, FileText, Download, ArrowUpCircle, ArrowDownCircle, Filter } from 'lucide-react';
import type { User } from '@/types/auth';

interface AccountingTabProps {
  currentUser: User;
}

interface AccountingEntry {
  id: string;
  entry_type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  entry_date: string;
  transaction?: { id: string; transaction_id: string; amount: number };
  invoice?: { id: string; invoice_number: string; customer_name: string };
  creator?: { id: string; email: string; full_name: string };
  created_at: string;
}

interface Report {
  report_type: string;
  summary?: {
    total_income: number;
    total_expenses: number;
    net_profit: number;
    profit_margin_percent: string;
  };
  income_by_category?: Record<string, number>;
  expenses_by_category?: Record<string, number>;
  categories?: Array<{
    category: string;
    total: number;
    count: number;
    average: number;
    percentage: number;
  }>;
  months?: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
}

export default function AccountingTab({ }: AccountingTabProps) {
  const [activeView, setActiveView] = useState<'entries' | 'reports'>('entries');
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Reports state
  const [reportType, setReportType] = useState<'profit_loss' | 'revenue_by_category' | 'monthly_summary'>('profit_loss');
  const [report, setReport] = useState<Report | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (activeView === 'entries') {
      fetchEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, filterType, startDate, endDate]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/payment/accounting/entries', window.location.origin);
      if (filterType !== 'all') {
        url.searchParams.append('entry_type', filterType);
      }
      if (startDate) {
        url.searchParams.append('start_date', startDate);
      }
      if (endDate) {
        url.searchParams.append('end_date', endDate);
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    }
    setLoading(false);
  };

  const fetchReport = async () => {
    setReportLoading(true);
    try {
      const url = new URL('/api/payment/accounting/reports', window.location.origin);
      url.searchParams.append('type', reportType);
      
      if (startDate && endDate) {
        url.searchParams.append('start_date', startDate);
        url.searchParams.append('end_date', endDate);
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    }
    setReportLoading(false);
  };

  useEffect(() => {
    if (activeView === 'reports') {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, reportType, startDate, endDate]);

  const totalIncome = entries
    .filter(e => e.entry_type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = entries
    .filter(e => e.entry_type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Accounting</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Total Income</span>
              <ArrowUpCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">${totalIncome.toFixed(2)}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Total Expenses</span>
              <ArrowDownCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">${totalExpenses.toFixed(2)}</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Net Profit</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-red-400'}`}>
              ${netProfit.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveView('entries')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeView === 'entries'
              ? 'bg-primary text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Entries
        </button>
        <button
          onClick={() => setActiveView('reports')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeView === 'reports'
              ? 'bg-primary text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Reports
        </button>
      </div>

      {/* Entries View */}
      {activeView === 'entries' && (
        <div className="space-y-4">
          {/* Filters and Actions */}
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-white/60" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                  placeholder="Start Date"
                />

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                  placeholder="End Date"
                />
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
          </div>

          {/* Entries List */}
          {loading ? (
            <div className="text-center py-12 text-white/60">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No accounting entries found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="glass rounded-xl p-4 border border-white/10 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {entry.entry_type === 'income' ? (
                          <ArrowUpCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <h3 className="text-white font-medium">{entry.description}</h3>
                          <p className="text-white/60 text-sm">{entry.category}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-white/60 ml-8">
                        <div>
                          <span className="text-white/40">Date:</span>{' '}
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </div>
                        {entry.transaction && (
                          <div>
                            <span className="text-white/40">Transaction:</span>{' '}
                            {entry.transaction.transaction_id}
                          </div>
                        )}
                        {entry.invoice && (
                          <div>
                            <span className="text-white/40">Invoice:</span>{' '}
                            {entry.invoice.invoice_number}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${
                          entry.entry_type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {entry.entry_type === 'income' ? '+' : '-'}${entry.amount.toFixed(2)}
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports View */}
      {activeView === 'reports' && (
        <div className="space-y-4">
          {/* Report Controls */}
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as typeof reportType)}
                  className="input flex-1"
                >
                  <option value="profit_loss">Profit & Loss</option>
                  <option value="revenue_by_category">Revenue by Category</option>
                  <option value="monthly_summary">Monthly Summary</option>
                </select>

                {reportType !== 'monthly_summary' && (
                  <>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input"
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="input"
                      placeholder="End Date"
                    />
                  </>
                )}
              </div>

              <button
                onClick={fetchReport}
                className="btn-secondary flex items-center gap-2 whitespace-nowrap"
              >
                <TrendingUp className="w-4 h-4" />
                Generate
              </button>
            </div>
          </div>

          {/* Report Display */}
          {reportLoading ? (
            <div className="text-center py-12 text-white/60">Generating report...</div>
          ) : !report ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Select report parameters and click Generate</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profit & Loss Report */}
              {report.report_type === 'profit_loss' && report.summary && (
                <div className="space-y-4">
                  <div className="glass rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">Profit & Loss Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-white/60 text-sm mb-1">Total Income</p>
                        <p className="text-2xl font-bold text-green-400">
                          ${report.summary.total_income.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-400">
                          ${report.summary.total_expenses.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">Net Profit</p>
                        <p
                          className={`text-2xl font-bold ${
                            report.summary.net_profit >= 0 ? 'text-primary' : 'text-red-400'
                          }`}
                        >
                          ${report.summary.net_profit.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">Profit Margin</p>
                        <p className="text-2xl font-bold text-white">
                          {report.summary.profit_margin_percent}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-6 border border-white/10">
                      <h4 className="text-lg font-bold text-white mb-3">Income by Category</h4>
                      <div className="space-y-2">
                        {Object.entries(report.income_by_category || {}).map(([category, amount]) => (
                          <div key={category} className="flex justify-between items-center">
                            <span className="text-white/80">{category}</span>
                            <span className="text-green-400 font-medium">${amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass rounded-xl p-6 border border-white/10">
                      <h4 className="text-lg font-bold text-white mb-3">Expenses by Category</h4>
                      <div className="space-y-2">
                        {Object.entries(report.expenses_by_category || {}).map(([category, amount]) => (
                          <div key={category} className="flex justify-between items-center">
                            <span className="text-white/80">{category}</span>
                            <span className="text-red-400 font-medium">${amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue by Category Report */}
              {report.report_type === 'revenue_by_category' && report.categories && (
                <div className="glass rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Revenue by Category</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/60 py-3 px-4">Category</th>
                          <th className="text-right text-white/60 py-3 px-4">Total</th>
                          <th className="text-right text-white/60 py-3 px-4">Count</th>
                          <th className="text-right text-white/60 py-3 px-4">Average</th>
                          <th className="text-right text-white/60 py-3 px-4">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.categories.map((cat) => (
                          <tr key={cat.category} className="border-b border-white/5">
                            <td className="text-white py-3 px-4">{cat.category}</td>
                            <td className="text-right text-primary font-medium py-3 px-4">
                              ${cat.total.toFixed(2)}
                            </td>
                            <td className="text-right text-white/60 py-3 px-4">{cat.count}</td>
                            <td className="text-right text-white/60 py-3 px-4">
                              ${cat.average.toFixed(2)}
                            </td>
                            <td className="text-right text-white/60 py-3 px-4">
                              {cat.percentage.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Monthly Summary Report */}
              {report.report_type === 'monthly_summary' && report.months && (
                <div className="glass rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Monthly Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/60 py-3 px-4">Month</th>
                          <th className="text-right text-white/60 py-3 px-4">Income</th>
                          <th className="text-right text-white/60 py-3 px-4">Expenses</th>
                          <th className="text-right text-white/60 py-3 px-4">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.months.map((month) => (
                          <tr key={month.month} className="border-b border-white/5">
                            <td className="text-white py-3 px-4">{month.month}</td>
                            <td className="text-right text-green-400 py-3 px-4">
                              ${month.income.toFixed(2)}
                            </td>
                            <td className="text-right text-red-400 py-3 px-4">
                              ${month.expenses.toFixed(2)}
                            </td>
                            <td
                              className={`text-right font-medium py-3 px-4 ${
                                month.net >= 0 ? 'text-primary' : 'text-red-400'
                              }`}
                            >
                              ${month.net.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(report, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${report.report_type}_${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                }}
                className="btn-secondary flex items-center gap-2 mx-auto"
              >
                <Download className="w-4 h-4" />
                Download Report (JSON)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Expense Modal */}
      {showCreateModal && (
        <CreateExpenseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEntries();
          }}
        />
      )}
    </div>
  );
}

// Create Expense Modal Component
function CreateExpenseModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    entry_date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/payment/accounting/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_type: 'expense',
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Failed to create expense:', error);
      alert('Failed to create expense');
    }

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-lg w-full border border-white/10">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Add Expense</h2>
            <button type="button" onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-white/80 mb-2">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input w-full"
                placeholder="e.g., Office Supplies, Marketing, Travel"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">Amount *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input w-full"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input w-full"
                placeholder="Describe the expense..."
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.entry_date}
                onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
