import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET /api/payment/accounting/reports - Generate financial reports (Admin only)
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

    const reportType = searchParams.get('type'); // 'profit_loss', 'revenue_by_category', 'monthly_summary'
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Determine date range
    let fromDate: string;
    let toDate: string;

    if (startDate && endDate) {
      fromDate = startDate;
      toDate = endDate;
    } else if (year && month) {
      // Specific month
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      fromDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      toDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${lastDay}`;
    } else if (year) {
      // Entire year
      fromDate = `${year}-01-01`;
      toDate = `${year}-12-31`;
    } else {
      // Default to current month
      const now = new Date();
      const yearNum = now.getFullYear();
      const monthNum = now.getMonth() + 1;
      fromDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      toDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${lastDay}`;
    }

    switch (reportType) {
      case 'profit_loss':
        return await generateProfitLossReport(supabaseAdmin, fromDate, toDate);
      
      case 'revenue_by_category':
        return await generateRevenueByCategoryReport(supabaseAdmin, fromDate, toDate);
      
      case 'monthly_summary':
        return await generateMonthlySummaryReport(supabaseAdmin, year || String(new Date().getFullYear()));
      
      default:
        return NextResponse.json({ error: 'Invalid report type. Use: profit_loss, revenue_by_category, or monthly_summary' }, { status: 400 });
    }
  } catch (error) {
    console.error('Reports generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Generate Profit & Loss report
async function generateProfitLossReport(supabase: Awaited<ReturnType<typeof createAdminClient>>, fromDate: string, toDate: string) {
  // Fetch all entries in date range
  const { data: entries, error } = await supabase
    .from('accounting_entries')
    .select('entry_type, amount, category')
    .gte('entry_date', fromDate)
    .lte('entry_date', toDate);

  if (error) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }

  // Calculate totals
  let totalIncome = 0;
  let totalExpenses = 0;
  const incomeByCategory: Record<string, number> = {};
  const expensesByCategory: Record<string, number> = {};

  (entries || []).forEach((entry) => {
    const amount = parseFloat(String(entry.amount));
    const category = String(entry.category);

    if (entry.entry_type === 'income') {
      totalIncome += amount;
      incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
    } else if (entry.entry_type === 'expense') {
      totalExpenses += amount;
      expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
    }
  });

  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  return NextResponse.json({
    report_type: 'profit_loss',
    period: { from: fromDate, to: toDate },
    summary: {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      profit_margin_percent: profitMargin.toFixed(2),
    },
    income_by_category: incomeByCategory,
    expenses_by_category: expensesByCategory,
    generated_at: new Date().toISOString(),
  });
}

// Generate Revenue by Category report
async function generateRevenueByCategoryReport(supabase: Awaited<ReturnType<typeof createAdminClient>>, fromDate: string, toDate: string) {
  const { data: entries, error } = await supabase
    .from('accounting_entries')
    .select('amount, category')
    .eq('entry_type', 'income')
    .gte('entry_date', fromDate)
    .lte('entry_date', toDate);

  if (error) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }

  const revenueByCategory: Record<string, { total: number; count: number }> = {};
  let totalRevenue = 0;

  (entries || []).forEach((entry) => {
    const amount = parseFloat(String(entry.amount));
    const category = String(entry.category);
    totalRevenue += amount;

    if (!revenueByCategory[category]) {
      revenueByCategory[category] = { total: 0, count: 0 };
    }
    revenueByCategory[category].total += amount;
    revenueByCategory[category].count += 1;
  });

  // Calculate percentages
  const categoryBreakdown = Object.entries(revenueByCategory).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count,
    average: data.count > 0 ? data.total / data.count : 0,
    percentage: totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0,
  })).sort((a, b) => b.total - a.total);

  return NextResponse.json({
    report_type: 'revenue_by_category',
    period: { from: fromDate, to: toDate },
    total_revenue: totalRevenue,
    categories: categoryBreakdown,
    generated_at: new Date().toISOString(),
  });
}

// Generate Monthly Summary report (for entire year)
async function generateMonthlySummaryReport(supabase: Awaited<ReturnType<typeof createAdminClient>>, year: string) {
  const yearNum = parseInt(year);
  const fromDate = `${yearNum}-01-01`;
  const toDate = `${yearNum}-12-31`;

  const { data: entries, error } = await supabase
    .from('accounting_entries')
    .select('entry_type, amount, entry_date')
    .gte('entry_date', fromDate)
    .lte('entry_date', toDate);

  if (error) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }

  // Group by month
  const monthlyData: Record<string, { income: number; expenses: number; net: number }> = {};

  for (let month = 1; month <= 12; month++) {
    const monthKey = `${yearNum}-${String(month).padStart(2, '0')}`;
    monthlyData[monthKey] = { income: 0, expenses: 0, net: 0 };
  }

  (entries || []).forEach((entry) => {
    const amount = parseFloat(String(entry.amount));
    const entryDate = String(entry.entry_date);
    const monthKey = entryDate.substring(0, 7); // YYYY-MM

    if (monthlyData[monthKey]) {
      if (entry.entry_type === 'income') {
        monthlyData[monthKey].income += amount;
      } else if (entry.entry_type === 'expense') {
        monthlyData[monthKey].expenses += amount;
      }
      monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expenses;
    }
  });

  // Convert to array and calculate totals
  const months = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data,
  }));

  const yearTotals = months.reduce(
    (acc, month) => ({
      income: acc.income + month.income,
      expenses: acc.expenses + month.expenses,
      net: acc.net + month.net,
    }),
    { income: 0, expenses: 0, net: 0 }
  );

  return NextResponse.json({
    report_type: 'monthly_summary',
    year: yearNum,
    months,
    year_totals: yearTotals,
    average_monthly: {
      income: yearTotals.income / 12,
      expenses: yearTotals.expenses / 12,
      net: yearTotals.net / 12,
    },
    generated_at: new Date().toISOString(),
  });
}
