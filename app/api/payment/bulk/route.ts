import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// POST /api/payment/bulk - Bulk payment operations (Admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { operation, transaction_ids, filters } = body;

    // Validation
    if (!operation) {
      return NextResponse.json({ error: 'Operation is required' }, { status: 400 });
    }

    const supabaseAdmin = await createAdminClient();

    // Determine which transactions to process
    let targetTransactionIds: string[] = [];

    if (transaction_ids && Array.isArray(transaction_ids) && transaction_ids.length > 0) {
      targetTransactionIds = transaction_ids;
    } else if (filters) {
      // Fetch transactions based on filters
      let query = supabaseAdmin
        .from('payment_transactions')
        .select('id');

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.purchase_type) {
        query = query.eq('purchase_type', filters.purchase_type);
      }
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data: transactions } = await query;
      targetTransactionIds = transactions?.map(t => t.id) || [];
    }

    if (targetTransactionIds.length === 0) {
      return NextResponse.json({ error: 'No transactions to process' }, { status: 400 });
    }

    // Limit bulk operations to prevent abuse
    if (targetTransactionIds.length > 100) {
      return NextResponse.json({ 
        error: 'Bulk operation limited to 100 transactions at a time',
        requested: targetTransactionIds.length 
      }, { status: 400 });
    }

    // Process based on operation type
    let result;
    switch (operation) {
      case 'approve':
        result = await bulkApprove(supabaseAdmin, targetTransactionIds, user.id);
        break;
      case 'reject':
        result = await bulkReject(supabaseAdmin, targetTransactionIds, user.id, body.reason);
        break;
      case 'export':
        result = await bulkExport(supabaseAdmin, targetTransactionIds);
        break;
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      operation,
      processed: result.processed,
      failed: result.failed,
      results: result.results,
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json({ 
      error: 'Failed to process bulk operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Bulk approve transactions
async function bulkApprove(supabase: any, transactionIds: string[], userId: string) {
  const results = [];
  let processed = 0;
  let failed = 0;

  for (const transactionId of transactionIds) {
    try {
      // Fetch transaction
      const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('*, payment_method:payment_methods(*)')
        .eq('id', transactionId)
        .single();

      if (!transaction) {
        results.push({ id: transactionId, status: 'error', message: 'Transaction not found' });
        failed++;
        continue;
      }

      if (transaction.status !== 'pending') {
        results.push({ id: transactionId, status: 'skipped', message: `Status is ${transaction.status}` });
        continue;
      }

      // Update transaction
      await supabase
        .from('payment_transactions')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      // Create accounting entry
      await supabase
        .from('accounting_entries')
        .insert({
          entry_type: 'income',
          amount: transaction.amount,
          category: 'payment_received',
          description: `Bulk approved - ${transaction.purpose || 'Payment'}`,
          entry_date: new Date().toISOString(),
          transaction_id: transactionId,
          created_by: userId,
        });

      // Handle course enrollment
      if (transaction.purchase_type === 'course' && transaction.course_id) {
        // Check for pending enrollment linked to this payment
        const { data: pendingEnrollment } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('payment_transaction_id', transactionId)
          .eq('status', 'pending')
          .single();

        if (pendingEnrollment) {
          // Activate the pending enrollment
          await supabase
            .from('course_enrollments')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', pendingEnrollment.id);
        } else {
          // Check if enrollment already exists (backward compatibility)
          const { data: existingEnrollment } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('user_id', transaction.user_id)
            .eq('course_id', transaction.course_id)
            .single();

          if (!existingEnrollment) {
            await supabase
              .from('course_enrollments')
              .insert({
                user_id: transaction.user_id,
                course_id: transaction.course_id,
                enrolled_at: new Date().toISOString(),
                payment_transaction_id: transactionId,
                status: 'active',
                payment_amount: transaction.amount,
              });
          }
        }
      }

      // Update invoice
      if (transaction.invoice_id) {
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            transaction_id: transactionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', transaction.invoice_id);
      }

      results.push({ id: transactionId, status: 'success', message: 'Approved' });
      processed++;

    } catch (error) {
      results.push({ 
        id: transactionId, 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      failed++;
    }
  }

  return { processed, failed, results };
}

// Bulk reject transactions
async function bulkReject(supabase: any, transactionIds: string[], userId: string, reason?: string) {
  const results = [];
  let processed = 0;
  let failed = 0;

  for (const transactionId of transactionIds) {
    try {
      const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (!transaction) {
        results.push({ id: transactionId, status: 'error', message: 'Transaction not found' });
        failed++;
        continue;
      }

      if (transaction.status !== 'pending') {
        results.push({ id: transactionId, status: 'skipped', message: `Status is ${transaction.status}` });
        continue;
      }

      await supabase
        .from('payment_transactions')
        .update({
          status: 'rejected',
          rejection_reason: reason || 'Bulk rejected by admin',
          rejected_at: new Date().toISOString(),
          rejected_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      // Update invoice
      if (transaction.invoice_id) {
        await supabase
          .from('invoices')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', transaction.invoice_id);
      }

      results.push({ id: transactionId, status: 'success', message: 'Rejected' });
      processed++;

    } catch (error) {
      results.push({ 
        id: transactionId, 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      failed++;
    }
  }

  return { processed, failed, results };
}

// Export transaction data
async function bulkExport(supabase: any, transactionIds: string[]) {
  const { data: transactions } = await supabase
    .from('payment_transactions')
    .select(`
      *,
      user:users(id, full_name, email),
      payment_method:payment_methods(provider, account_name, account_number),
      invoice:invoices(invoice_number)
    `)
    .in('id', transactionIds)
    .order('created_at', { ascending: false });

  return {
    processed: transactions?.length || 0,
    failed: 0,
    results: transactions || [],
  };
}
