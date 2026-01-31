import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{
    transactionId: string;
  }>;
}

// GET /api/payment/verify/[transactionId] - Public endpoint to verify payment
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { transactionId } = await context.params;

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Fetch transaction with minimal public information
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .select(`
        id,
        transaction_id,
        amount,
        status,
        refund_status,
        purpose,
        purchase_type,
        created_at,
        approved_at,
        payment_method:payment_methods(provider, account_name)
      `)
      .eq('transaction_id', transactionId)
      .single();

    if (error || !transaction) {
      return NextResponse.json({ 
        verified: false,
        error: 'Transaction not found',
        message: 'This transaction does not exist in our system'
      }, { status: 404 });
    }

    // Build public verification response
    const paymentMethod = Array.isArray(transaction.payment_method) 
      ? transaction.payment_method[0] 
      : transaction.payment_method;

    const verificationResponse = {
      verified: true,
      transaction: {
        transaction_id: transaction.transaction_id,
        amount: transaction.amount,
        status: transaction.status,
        refund_status: transaction.refund_status || 'none',
        purpose: transaction.purpose || 'Payment',
        purchase_type: transaction.purchase_type,
        payment_method: paymentMethod?.provider || 'Unknown',
        account_name: paymentMethod?.account_name || 'N/A',
        date: transaction.created_at,
        approved_date: transaction.approved_at || null,
      },
      status_description: getStatusDescription(transaction.status, transaction.refund_status),
      valid: transaction.status === 'approved' && !transaction.refund_status,
    };

    return NextResponse.json(verificationResponse);

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      verified: false,
      error: 'Failed to verify transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to get human-readable status description
function getStatusDescription(status: string, refundStatus: string | null): string {
  if (refundStatus === 'refunded') {
    return 'This payment has been fully refunded';
  }
  
  if (refundStatus === 'partial_refund') {
    return 'This payment has been partially refunded';
  }

  switch (status) {
    case 'approved':
      return 'Payment verified and approved';
    case 'pending':
      return 'Payment is pending admin approval';
    case 'rejected':
      return 'Payment has been rejected';
    case 'cancelled':
      return 'Payment has been cancelled';
    default:
      return 'Payment status unknown';
  }
}
