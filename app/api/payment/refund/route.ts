import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { require2FA } from '@/lib/middleware/require-2fa';
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';

// POST /api/payment/refund - Process refund (Admin only)
export async function POST(request: NextRequest) {
  // Apply rate limiting (10 refunds per hour)
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.payment);
  if (rateLimitResponse) return rateLimitResponse;

  // Require 2FA for refund operations
  const twoFAError = await require2FA(request);
  if (twoFAError) return twoFAError;
  
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
    const { transaction_id, refund_amount, refund_reason } = body;

    // Validation
    if (!transaction_id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    if (!refund_amount || refund_amount <= 0) {
      return NextResponse.json({ error: 'Valid refund amount is required' }, { status: 400 });
    }

    const supabaseAdmin = await createAdminClient();

    // Fetch the original transaction
    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from('payment_transactions')
      .select('*, payment_method:payment_methods(*), invoice:invoices(*)')
      .eq('id', transaction_id)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Validate transaction can be refunded
    if (transaction.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Only approved transactions can be refunded',
        current_status: transaction.status 
      }, { status: 400 });
    }

    // Check if already refunded
    if (transaction.refund_status === 'refunded' || transaction.refund_status === 'partial_refund') {
      return NextResponse.json({ 
        error: 'Transaction already refunded',
        refund_status: transaction.refund_status 
      }, { status: 400 });
    }

    // CHECK REFUND DEADLINE (30 days from transaction creation)
    const REFUND_DEADLINE_DAYS = 30;
    const transactionDate = new Date(transaction.created_at);
    const deadlineDate = new Date(transactionDate.getTime() + REFUND_DEADLINE_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();

    if (now > deadlineDate) {
      const daysOld = Math.floor((now.getTime() - transactionDate.getTime()) / (24 * 60 * 60 * 1000));
      return NextResponse.json({
        error: 'Refund deadline exceeded',
        message: `This transaction is ${daysOld} days old. Refunds are only allowed within ${REFUND_DEADLINE_DAYS} days of the transaction.`,
        transaction_date: transactionDate.toISOString(),
        deadline_date: deadlineDate.toISOString(),
        days_old: daysOld,
        deadline_days: REFUND_DEADLINE_DAYS,
      }, { status: 400 });
    }

    // Validate refund amount
    const maxRefundAmount = transaction.amount - (transaction.refunded_amount || 0);
    if (refund_amount > maxRefundAmount) {
      return NextResponse.json({ 
        error: 'Refund amount exceeds available amount',
        available_amount: maxRefundAmount,
        requested_amount: refund_amount
      }, { status: 400 });
    }

    // Calculate new refund status
    const totalRefundedAmount = (transaction.refunded_amount || 0) + refund_amount;
    const newRefundStatus = totalRefundedAmount >= transaction.amount ? 'refunded' : 'partial_refund';

    // Update transaction with refund information
    const { error: updateError } = await supabaseAdmin
      .from('payment_transactions')
      .update({
        refund_status: newRefundStatus,
        refunded_amount: totalRefundedAmount,
        refund_reason: refund_reason || 'No reason provided',
        refunded_at: new Date().toISOString(),
        refunded_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction_id);

    if (updateError) {
      console.error('Failed to update transaction:', updateError);
      throw updateError;
    }

    // Create reverse accounting entry for the refund
    const { error: accountingError } = await supabaseAdmin
      .from('accounting_entries')
      .insert({
        entry_type: 'expense',
        amount: refund_amount,
        category: 'refund',
        description: `Refund for transaction ${transaction.transaction_id}: ${refund_reason || 'Customer refund request'}`,
        entry_date: new Date().toISOString(),
        transaction_id: transaction.id,
        created_by: user.id,
      });

    if (accountingError) {
      console.error('Failed to create accounting entry:', accountingError);
      // Don't throw - accounting entry is not critical
    }

    // Handle course enrollment reversal if full refund
    if (newRefundStatus === 'refunded' && transaction.purchase_type === 'course' && transaction.course_id) {
      const { error: enrollmentError } = await supabaseAdmin
        .from('enrollments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: `Refund processed: ${refund_reason}`,
        })
        .eq('user_id', transaction.user_id)
        .eq('course_id', transaction.course_id)
        .eq('payment_transaction_id', transaction.id);

      if (enrollmentError) {
        console.error('Failed to update enrollment:', enrollmentError);
      }
    }

    // Update invoice if linked
    if (transaction.invoice_id) {
      const invoiceStatus = newRefundStatus === 'refunded' ? 'refunded' : 'partial_refund';
      await supabaseAdmin
        .from('invoices')
        .update({
          status: invoiceStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.invoice_id);
    }

    // Create refund record for tracking
    const { data: refundRecord, error: refundError } = await supabaseAdmin
      .from('payment_refunds')
      .insert({
        transaction_id: transaction.id,
        refund_amount,
        refund_reason,
        refunded_by: user.id,
        refunded_at: new Date().toISOString(),
        status: 'completed',
      })
      .select()
      .single();

    if (refundError) {
      console.error('Failed to create refund record:', refundError);
    }

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        transaction_id,
        refund_amount,
        total_refunded: totalRefundedAmount,
        original_amount: transaction.amount,
        remaining_amount: transaction.amount - totalRefundedAmount,
        refund_status: newRefundStatus,
        refund_id: refundRecord?.id,
      },
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process refund',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/payment/refund - List refunds (Admin only)
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
    
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('payment_refunds')
      .select(`
        *,
        transaction:payment_transactions(*),
        refunded_by_user:users!payment_refunds_refunded_by_fkey(id, full_name, email)
      `, { count: 'exact' })
      .order('refunded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: refunds, error, count } = await query;

    if (error) {
      console.error('Failed to fetch refunds:', error);
      throw error;
    }

    return NextResponse.json({
      refunds,
      pagination: {
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    console.error('Refunds fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch refunds',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
