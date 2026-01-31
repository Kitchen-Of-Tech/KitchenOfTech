import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { sendPaymentApprovalEmail } from '@/lib/email/notifications';

interface RouteContext {
  params: Promise<{
    provider: string;
  }>;
}

// Webhook secrets for each provider (store in environment variables in production)
const WEBHOOK_SECRETS = {
  bkash: process.env.BKASH_WEBHOOK_SECRET || 'bkash_test_secret',
  nagad: process.env.NAGAD_WEBHOOK_SECRET || 'nagad_test_secret',
  rocket: process.env.ROCKET_WEBHOOK_SECRET || 'rocket_test_secret',
};

// POST /api/payment/webhooks/[provider] - Handle payment gateway webhooks
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { provider } = await context.params;
    
    // Validate provider
    if (!['bkash', 'nagad', 'rocket'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid payment provider' }, { status: 400 });
    }

    const body = await request.text();
    const signature = request.headers.get('x-signature') || request.headers.get('signature');

    // Verify webhook signature
    if (!verifyWebhookSignature(provider, body, signature)) {
      console.error(`Invalid webhook signature from ${provider}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookData = JSON.parse(body);
    
    // Extract transaction data based on provider format
    const transactionData = extractTransactionData(provider, webhookData);
    
    if (!transactionData) {
      console.error(`Failed to extract transaction data from ${provider}`, webhookData);
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Check for idempotency - prevent duplicate processing
    const { data: existingWebhook } = await supabase
      .from('payment_webhooks')
      .select('id')
      .eq('provider', provider)
      .eq('provider_transaction_id', transactionData.providerTransactionId)
      .single();

    if (existingWebhook) {
      console.log(`Duplicate webhook from ${provider}, transaction ${transactionData.providerTransactionId}`);
      return NextResponse.json({ message: 'Webhook already processed', status: 'duplicate' });
    }

    // Log the webhook
    const { data: webhookLog } = await supabase
      .from('payment_webhooks')
      .insert({
        provider,
        provider_transaction_id: transactionData.providerTransactionId,
        webhook_data: webhookData,
        status: transactionData.status,
        amount: transactionData.amount,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Find the corresponding transaction in our system
    const { data: transaction } = await supabase
      .from('payment_transactions')
      .select('*, payment_method:payment_methods(*)')
      .eq('transaction_id', transactionData.ourTransactionId)
      .or(`payment_method.provider.eq.${provider}`)
      .single();

    if (!transaction) {
      console.error(`Transaction not found for webhook: ${transactionData.ourTransactionId}`);
      
      // Update webhook log
      await supabase
        .from('payment_webhooks')
        .update({ processing_error: 'Transaction not found in system' })
        .eq('id', webhookLog?.id);
      
      return NextResponse.json({ 
        error: 'Transaction not found',
        webhook_logged: true 
      }, { status: 404 });
    }

    // Only process if status is changing to success
    if (transactionData.status === 'success' && transaction.status === 'pending') {
      // Auto-approve the transaction
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          status: 'approved',
          provider_transaction_id: transactionData.providerTransactionId,
          provider_response: webhookData,
          approved_at: new Date().toISOString(),
          approved_by: 'system_webhook',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('Failed to update transaction:', updateError);
        throw updateError;
      }

      // Create accounting entry
      await supabase
        .from('accounting_entries')
        .insert({
          entry_type: 'income',
          amount: transaction.amount,
          category: 'payment_received',
          description: `Payment received via ${provider} webhook - ${transaction.purpose || 'Payment'}`,
          entry_date: new Date().toISOString(),
          transaction_id: transaction.id,
          created_by: 'system_webhook',
        });

      // Handle course enrollment if applicable
      if (transaction.purchase_type === 'course' && transaction.course_id) {
        // Check for pending enrollment linked to this payment
        const { data: pendingEnrollment } = await supabase
          .from('course_enrollments')
          .select('id, user_id, course_id')
          .eq('payment_transaction_id', transaction.id)
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

          // Send welcome email to user (Task #8 will complete email integration)
          console.log(`Enrollment ${pendingEnrollment.id} activated for user ${pendingEnrollment.user_id}`);
          
          // Fetch user and course details for email
          const { data: userProfile } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', pendingEnrollment.user_id)
            .single();
          
          if (userProfile) {
            await sendPaymentApprovalEmail({
              userName: userProfile.name || 'Student',
              userEmail: userProfile.email,
              courseName: 'Your Course', // TODO: Fetch from Sanity using course_id
              courseSlug: pendingEnrollment.course_id,
              enrollmentId: pendingEnrollment.id,
              isPending: false,
            });
          }
        } else {
          // Create new enrollment if none exists (backward compatibility)
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
                payment_transaction_id: transaction.id,
                status: 'active',
                payment_amount: transaction.amount,
              });
          }
        }
      }

      // Update invoice if linked
      if (transaction.invoice_id) {
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            transaction_id: transaction.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', transaction.invoice_id);
      }

      console.log(`Successfully processed webhook from ${provider} for transaction ${transaction.id}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      transaction_id: transaction.id,
      status: transactionData.status,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Verify webhook signature
function verifyWebhookSignature(provider: string, body: string, signature: string | null): boolean {
  if (!signature) {
    console.warn(`No signature provided for ${provider} webhook`);
    return false;
  }

  const secret = WEBHOOK_SECRETS[provider as keyof typeof WEBHOOK_SECRETS];
  
  // Generate expected signature using HMAC SHA256
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  // Compare signatures in a timing-safe manner
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    // If lengths don't match, timingSafeEqual throws an error
    return false;
  }
}

// Extract transaction data based on provider format
function extractTransactionData(provider: string, webhookData: any): {
  providerTransactionId: string;
  ourTransactionId: string;
  status: string;
  amount: number;
} | null {
  try {
    switch (provider) {
      case 'bkash':
        // bKash webhook format
        return {
          providerTransactionId: webhookData.trxID || webhookData.transactionID,
          ourTransactionId: webhookData.merchantInvoiceNumber || webhookData.invoice,
          status: webhookData.transactionStatus === 'Completed' ? 'success' : 'failed',
          amount: parseFloat(webhookData.amount),
        };

      case 'nagad':
        // Nagad webhook format
        return {
          providerTransactionId: webhookData.issuerPaymentRefNo || webhookData.paymentRefId,
          ourTransactionId: webhookData.merchantOrderId || webhookData.orderId,
          status: webhookData.status === 'Success' ? 'success' : 'failed',
          amount: parseFloat(webhookData.amount),
        };

      case 'rocket':
        // Rocket webhook format
        return {
          providerTransactionId: webhookData.txnId || webhookData.transactionId,
          ourTransactionId: webhookData.merchantTxnId || webhookData.merchantOrderId,
          status: webhookData.status === 'SUCCESS' ? 'success' : 'failed',
          amount: parseFloat(webhookData.amount),
        };

      default:
        return null;
    }
  } catch (error) {
    console.error(`Error extracting transaction data for ${provider}:`, error);
    return null;
  }
}
