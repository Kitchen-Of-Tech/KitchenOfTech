import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET /api/payment/analytics - Payment analytics dashboard (Admin only)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role (CEO=100 or Manager=90)
    const { data: userData } = await supabase
      .from('users')
      .select('role:roles(*)')
      .eq('id', user.id)
      .single();

    const role = Array.isArray(userData?.role) ? userData.role[0] : userData?.role;
    if (!role || role.level < 90) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabaseAdmin = await createAdminClient();
    const { searchParams } = new URL(request.url);
    
    const period = searchParams.get('period') || 'month'; // day, week, month, year, all
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Calculate date range
    const dateRange = calculateDateRange(period, startDate, endDate);

    // Fetch all transactions within date range
    const transactionsQuery = supabaseAdmin
      .from('payment_transactions')
      .select(`
        id,
        amount,
        status,
        refund_status,
        refunded_amount,
        purchase_type,
        created_at,
        approved_at,
        user_id,
        payment_method:payment_methods(provider, account_name)
      `)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const { data: transactions, error: transactionsError } = await transactionsQuery;

    if (transactionsError) {
      console.error('Failed to fetch transactions:', transactionsError);
      throw transactionsError;
    }

    // Calculate metrics
    const analytics = {
      overview: calculateOverview(transactions || []),
      revenue: calculateRevenue(transactions || []),
      status_breakdown: calculateStatusBreakdown(transactions || []),
      payment_methods: calculatePaymentMethodDistribution(transactions || []),
      purchase_types: calculatePurchaseTypeDistribution(transactions || []),
      top_customers: await calculateTopCustomers(supabaseAdmin, transactions || []),
      timeline: calculateTimeline(transactions || [], period),
      date_range: dateRange,
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Calculate date range based on period
function calculateDateRange(period: string, startDate: string | null, endDate: string | null) {
  const now = new Date();
  let start: Date;
  const end: Date = new Date(endDate || now);

  if (startDate) {
    start = new Date(startDate);
  } else {
    switch (period) {
      case 'day':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        start = new Date('2020-01-01');
        break;
      default:
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
    }
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    period,
  };
}

// Calculate overview metrics
function calculateOverview(transactions: any[]) {
  const approved = transactions.filter(t => t.status === 'approved');
  const pending = transactions.filter(t => t.status === 'pending');
  const rejected = transactions.filter(t => t.status === 'rejected');
  const refunded = transactions.filter(t => t.refund_status === 'refunded');

  const totalRevenue = approved.reduce((sum, t) => sum + (t.amount - (t.refunded_amount || 0)), 0);
  const totalRefunded = approved.reduce((sum, t) => sum + (t.refunded_amount || 0), 0);
  const averageTransactionValue = approved.length > 0 ? totalRevenue / approved.length : 0;

  return {
    total_transactions: transactions.length,
    approved_count: approved.length,
    pending_count: pending.length,
    rejected_count: rejected.length,
    refunded_count: refunded.length,
    total_revenue: totalRevenue,
    total_refunded: totalRefunded,
    net_revenue: totalRevenue - totalRefunded,
    average_transaction_value: averageTransactionValue,
    approval_rate: transactions.length > 0 ? (approved.length / transactions.length) * 100 : 0,
  };
}

// Calculate revenue metrics
function calculateRevenue(transactions: any[]) {
  const approved = transactions.filter(t => t.status === 'approved');
  
  const grossRevenue = approved.reduce((sum, t) => sum + t.amount, 0);
  const refundedAmount = approved.reduce((sum, t) => sum + (t.refunded_amount || 0), 0);
  const netRevenue = grossRevenue - refundedAmount;

  return {
    gross_revenue: grossRevenue,
    refunded_amount: refundedAmount,
    net_revenue: netRevenue,
    refund_rate: grossRevenue > 0 ? (refundedAmount / grossRevenue) * 100 : 0,
  };
}

// Calculate status breakdown
function calculateStatusBreakdown(transactions: any[]) {
  const statusCounts: Record<string, number> = {};
  const statusAmounts: Record<string, number> = {};

  transactions.forEach(t => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    statusAmounts[t.status] = (statusAmounts[t.status] || 0) + t.amount;
  });

  return Object.keys(statusCounts).map(status => ({
    status,
    count: statusCounts[status],
    amount: statusAmounts[status],
    percentage: (statusCounts[status] / transactions.length) * 100,
  }));
}

// Calculate payment method distribution
function calculatePaymentMethodDistribution(transactions: any[]) {
  const methodCounts: Record<string, number> = {};
  const methodAmounts: Record<string, number> = {};

  transactions.forEach(t => {
    const method = t.payment_method?.provider || 'Unknown';
    methodCounts[method] = (methodCounts[method] || 0) + 1;
    if (t.status === 'approved') {
      methodAmounts[method] = (methodAmounts[method] || 0) + t.amount;
    }
  });

  return Object.keys(methodCounts).map(method => ({
    method,
    count: methodCounts[method],
    amount: methodAmounts[method] || 0,
    percentage: (methodCounts[method] / transactions.length) * 100,
  })).sort((a, b) => b.amount - a.amount);
}

// Calculate purchase type distribution
function calculatePurchaseTypeDistribution(transactions: any[]) {
  const typeCounts: Record<string, number> = {};
  const typeAmounts: Record<string, number> = {};

  transactions.forEach(t => {
    const type = t.purchase_type || 'other';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
    if (t.status === 'approved') {
      typeAmounts[type] = (typeAmounts[type] || 0) + t.amount;
    }
  });

  return Object.keys(typeCounts).map(type => ({
    type,
    count: typeCounts[type],
    amount: typeAmounts[type] || 0,
    percentage: (typeCounts[type] / transactions.length) * 100,
  })).sort((a, b) => b.amount - a.amount);
}

// Calculate top customers
async function calculateTopCustomers(supabase: any, transactions: any[]) {
  const approved = transactions.filter(t => t.status === 'approved');
  const customerSpending: Record<string, number> = {};
  const customerTransactions: Record<string, number> = {};

  approved.forEach(t => {
    const userId = t.user_id;
    customerSpending[userId] = (customerSpending[userId] || 0) + (t.amount - (t.refunded_amount || 0));
    customerTransactions[userId] = (customerTransactions[userId] || 0) + 1;
  });

  const topCustomerIds = Object.entries(customerSpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([userId]) => userId);

  if (topCustomerIds.length === 0) {
    return [];
  }

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('id', topCustomerIds);

  return topCustomerIds.map(userId => {
    const user = users?.find((u: any) => u.id === userId);
    return {
      user_id: userId,
      name: user?.full_name || 'Unknown',
      email: user?.email || '',
      total_spent: customerSpending[userId],
      transaction_count: customerTransactions[userId],
      average_transaction: customerSpending[userId] / customerTransactions[userId],
    };
  });
}

// Calculate timeline data
function calculateTimeline(transactions: any[], period: string) {
  const timelineData: Record<string, { date: string; revenue: number; count: number }> = {};

  transactions
    .filter(t => t.status === 'approved')
    .forEach(t => {
      const date = new Date(t.created_at);
      let key: string;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
        case 'month':
          key = date.toISOString().split('T')[0];
          break;
        case 'year':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!timelineData[key]) {
        timelineData[key] = { date: key, revenue: 0, count: 0 };
      }

      timelineData[key].revenue += t.amount - (t.refunded_amount || 0);
      timelineData[key].count += 1;
    });

  return Object.values(timelineData).sort((a, b) => a.date.localeCompare(b.date));
}
