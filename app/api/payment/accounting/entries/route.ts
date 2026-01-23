import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET /api/payment/accounting/entries - List accounting entries (Admin only)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    const { data: userData } = await supabase
      .from('users')
      .select('role:roles(*)')
      .eq('id', user.id)
      .single();

    const role = Array.isArray(userData?.role) ? userData.role[0] : userData?.role;
    if (!role || role.level > 2) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabaseAdmin = await createAdminClient();
    const { searchParams } = new URL(request.url);

    // Filters
    const entryType = searchParams.get('entry_type'); // 'income' or 'expense'
    const category = searchParams.get('category');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabaseAdmin
      .from('accounting_entries')
      .select(`
        *,
        transaction:payment_transactions(id, transaction_id, amount, status),
        invoice:invoices(id, invoice_number, customer_name),
        creator:users!accounting_entries_created_by_id_fkey(id, email, full_name)
      `, { count: 'exact' })
      .order('entry_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (entryType) {
      query = query.eq('entry_type', entryType);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (startDate) {
      query = query.gte('entry_date', startDate);
    }

    if (endDate) {
      query = query.lte('entry_date', endDate);
    }

    const { data: entries, error, count } = await query;

    if (error) {
      console.error('Failed to fetch accounting entries:', error);
      return NextResponse.json({ error: 'Failed to fetch accounting entries' }, { status: 500 });
    }

    return NextResponse.json({
      entries: entries || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Accounting entries GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/payment/accounting/entries - Create accounting entry (Admin only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    const { data: userData } = await supabase
      .from('users')
      .select('role:roles(*)')
      .eq('id', user.id)
      .single();

    const role = Array.isArray(userData?.role) ? userData.role[0] : userData?.role;
    if (!role || role.level > 2) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      entry_type, // 'income' or 'expense'
      amount,
      category,
      description,
      entry_date,
      transaction_id,
      invoice_id,
      metadata,
    } = body;

    // Validation
    if (!entry_type || !['income', 'expense'].includes(entry_type)) {
      return NextResponse.json({ error: 'Invalid entry_type. Must be "income" or "expense"' }, { status: 400 });
    }

    if (!amount || isNaN(parseFloat(String(amount))) || parseFloat(String(amount)) <= 0) {
      return NextResponse.json({ error: 'Invalid amount. Must be a positive number' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const supabaseAdmin = await createAdminClient();

    // Create accounting entry
    const entryData = {
      entry_type,
      amount: parseFloat(String(amount)),
      category,
      description,
      entry_date: entry_date || new Date().toISOString().split('T')[0], // YYYY-MM-DD
      transaction_id: transaction_id || null,
      invoice_id: invoice_id || null,
      metadata: metadata || null,
      created_by_id: user.id,
    };

    const { data: entry, error } = await supabaseAdmin
      .from('accounting_entries')
      .insert(entryData)
      .select(`
        *,
        transaction:payment_transactions(id, transaction_id, amount, status),
        invoice:invoices(id, invoice_number, customer_name),
        creator:users!accounting_entries_created_by_id_fkey(id, email, full_name)
      `)
      .single();

    if (error) {
      console.error('Failed to create accounting entry:', error);
      return NextResponse.json({ error: 'Failed to create accounting entry' }, { status: 500 });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Accounting entry creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
