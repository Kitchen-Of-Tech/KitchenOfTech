# Payment API - Implementation Fixes Guide

This document provides step-by-step fixes for the critical issues identified in the audit.

---

## CRITICAL FIX #1: Webhook Secrets Vulnerability

### Problem
Fallback hardcoded webhook secrets in production code. If environment variables missing, app uses test secrets.

### File to Fix
`/app/api/payment/webhooks/[provider]/route.ts`

### Current Code (DANGEROUS)
```typescript
const WEBHOOK_SECRETS = {
  bkash: process.env.BKASH_WEBHOOK_SECRET || 'bkash_test_secret',
  nagad: process.env.NAGAD_WEBHOOK_SECRET || 'nagad_test_secret',
  rocket: process.env.ROCKET_WEBHOOK_SECRET || 'rocket_test_secret',
};
```

### Fixed Code
```typescript
// Helper function with proper error handling
function getWebhookSecrets() {
  const secrets: Record<string, string> = {};
  const providers = ['bkash', 'nagad', 'rocket'];
  
  for (const provider of providers) {
    const secretKey = `${provider.toUpperCase()}_WEBHOOK_SECRET`;
    const secret = process.env[secretKey];
    
    if (!secret) {
      throw new Error(
        `Missing required environment variable: ${secretKey}\n` +
        `Please set all payment provider webhook secrets before starting the application.`
      );
    }
    
    // Validate secret length (should be at least 32 chars)
    if (secret.length < 32) {
      console.warn(`Warning: ${secretKey} appears to be a test secret (too short)`);
    }
    
    secrets[provider] = secret;
  }
  
  return secrets;
}

// Initialize at module level (will fail fast on startup)
let WEBHOOK_SECRETS: Record<string, string> = {};
try {
  WEBHOOK_SECRETS = getWebhookSecrets();
} catch (error) {
  console.error('CRITICAL: Payment system initialization failed:', error);
  // In production, this should stop the application
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { provider } = await context.params;
    
    if (!provider || !['bkash', 'nagad', 'rocket'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid payment provider' },
        { status: 400 }
      );
    }
    
    const body = await request.text();
    const signature = request.headers.get('x-signature') || request.headers.get('signature');
    
    // Use the safe secrets object
    const secret = WEBHOOK_SECRETS[provider];
    
    // Verify webhook signature
    if (!verifyWebhookSignature(provider, body, signature, secret)) {
      console.error(`Invalid webhook signature from ${provider}`);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // ... rest of webhook processing
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Update signature verification to use secret parameter
function verifyWebhookSignature(
  provider: string,
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const expectedSignature = hmac.digest('hex');
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error(`Signature verification error for ${provider}:`, error);
    return false;
  }
}
```

### Validation
```bash
# Verify secrets are required
BKASH_WEBHOOK_SECRET="" npm run dev
# Should fail with clear error message

# Verify with valid secrets
BKASH_WEBHOOK_SECRET="test_bkash_secret_at_least_32_characters_long"
NAGAD_WEBHOOK_SECRET="test_nagad_secret_at_least_32_characters_long"
ROCKET_WEBHOOK_SECRET="test_rocket_secret_at_least_32_characters_long"
npm run dev
# Should start successfully
```

---

## CRITICAL FIX #2: Add Idempotency Keys

### Problem
Duplicate POST requests could create multiple payment transactions. Network timeouts or client retries cause duplicate submissions.

### Files to Fix
1. `/supabase/migrations/NEXT_add_idempotency.sql` (NEW)
2. `/app/api/payment/submit/route.ts`
3. `/app/api/payment/links/[linkId]/route.ts`

### Migration File
```sql
-- Create migration: supabase/migrations/20260420_add_idempotency_keys.sql

-- Add idempotency_key to payment_transactions
ALTER TABLE public.payment_transactions
ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_idempotency_key 
  ON public.payment_transactions(idempotency_key);

-- Add comment
COMMENT ON COLUMN public.payment_transactions.idempotency_key 
  IS 'Idempotency key from client request headers - prevents duplicate submissions';

-- Create idempotency log for webhook processing
CREATE TABLE IF NOT EXISTS public.webhook_idempotency_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  webhook_id TEXT NOT NULL,
  transaction_id UUID REFERENCES public.payment_transactions(id),
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, webhook_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_idempotency_logs_provider_id 
  ON public.webhook_idempotency_logs(provider, webhook_id);

COMMENT ON TABLE public.webhook_idempotency_logs 
  IS 'Tracks processed webhooks to prevent duplicate processing';
```

### API Endpoint Fix
```typescript
// File: /app/api/payment/submit/route.ts

export async function POST(request: NextRequest) {
  // Validate CSRF token
  const csrfError = await requireCsrfToken(request);
  if (csrfError) return csrfError;
  
  // Apply rate limiting (10 payments per hour)
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.payment);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // NEW: Extract idempotency key from headers
    const idempotencyKey = request.headers.get('idempotency-key') || 
                          request.headers.get('x-idempotency-key');
    
    if (!idempotencyKey) {
      return NextResponse.json(
        {
          error: 'Idempotency key required',
          error_code: 'MISSING_IDEMPOTENCY_KEY',
          help: 'Include idempotency-key header with a unique UUID'
        },
        { status: 400 }
      );
    }
    
    // Validate idempotency key format
    if (!/^[a-f0-9-]{36}$/.test(idempotencyKey)) {
      return NextResponse.json(
        {
          error: 'Invalid idempotency key format',
          error_code: 'INVALID_IDEMPOTENCY_KEY',
          help: 'Idempotency key must be a valid UUID'
        },
        { status: 400 }
      );
    }
    
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }
    
    // NEW: Check if this idempotency key was already processed
    const { data: existingTransaction, error: checkError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .single();
    
    if (!checkError && existingTransaction) {
      // Already processed - return cached result
      return NextResponse.json(
        {
          success: true,
          transaction: existingTransaction,
          message: 'This payment was already submitted (returning cached result)',
          is_duplicate_request: true
        },
        { status: 200 }
      );
    }
    
    const body = await request.json();
    const {
      payment_method_id,
      transaction_id,
      amount,
      currency = "BDT",
      purchase_type,
      purchase_id,
      purchase_details,
    } = body;
    
    // Validate required fields
    if (!payment_method_id || !transaction_id || !amount || !purchase_type) {
      return NextResponse.json(
        {
          error: "Payment method, transaction ID, amount, and purchase type are required",
          error_code: 'MISSING_REQUIRED_FIELDS'
        },
        { status: 400 }
      );
    }
    
    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        {
          error: "Amount must be greater than 0",
          error_code: 'INVALID_AMOUNT'
        },
        { status: 400 }
      );
    }
    
    // Verify payment method exists and is active
    const { data: paymentMethod, error: methodError } = await supabase
      .from("payment_methods")
      .select("id, name, is_active")
      .eq("id", payment_method_id)
      .single();
    
    if (methodError || !paymentMethod) {
      return NextResponse.json(
        {
          error: "Invalid payment method",
          error_code: 'INVALID_PAYMENT_METHOD'
        },
        { status: 400 }
      );
    }
    
    if (!paymentMethod.is_active) {
      return NextResponse.json(
        {
          error: "This payment method is currently inactive",
          error_code: 'PAYMENT_METHOD_INACTIVE'
        },
        { status: 400 }
      );
    }
    
    // Check for duplicate transaction ID (prevent double submissions)
    const { data: existingByTxId } = await supabase
      .from("payment_transactions")
      .select("id, idempotency_key")
      .eq("transaction_id", transaction_id)
      .eq("user_id", user.id)
      .single();
    
    if (existingByTxId) {
      // Same user submitted same transaction ID before
      return NextResponse.json(
        {
          error: "This transaction ID has already been submitted",
          error_code: 'DUPLICATE_TRANSACTION_ID',
          previously_submitted_with_key: existingByTxId.idempotency_key
        },
        { status: 400 }
      );
    }
    
    // Create payment transaction with idempotency key
    const { data: transaction, error } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: user.id,
        payment_method_id,
        transaction_id,
        amount,
        currency,
        purchase_type,
        purchase_id,
        purchase_details,
        idempotency_key, // NEW: Store idempotency key
        status: "pending",
      })
      .select(`
        *,
        payment_method:payment_methods(name, type)
      `)
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(
      {
        success: true,
        transaction,
        message: "Payment transaction submitted successfully. Your purchase is pending approval.",
        idempotency_key: idempotencyKey // Return for client verification
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting payment:", error);
    return NextResponse.json(
      {
        error: "Failed to submit payment transaction",
        error_code: 'SUBMISSION_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
```

### Frontend Usage Example
```typescript
// Client-side code to use idempotency key
async function submitPayment(paymentData) {
  const idempotencyKey = crypto.randomUUID();
  
  try {
    const response = await fetch('/api/payment/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'idempotency-key': idempotencyKey, // NEW
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify(paymentData)
    });
    
    if (response.status === 200 && response.json.is_duplicate_request) {
      // Retry detected - show message
      console.log('Payment already submitted, using cached result');
    }
    
    return response.json();
  } catch (error) {
    // Network error - can retry with same idempotencyKey
    // Server will return same result
    console.error('Submission failed:', error);
  }
}
```

---

## CRITICAL FIX #3: Webhook Idempotency

### Problem
Webhook retries from payment providers create duplicate transactions.

### File to Fix
`/app/api/payment/webhooks/[provider]/route.ts`

### Fixed Code
```typescript
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { provider } = await context.params;
    
    // ... existing validation ...
    
    const body = await request.text();
    const signature = request.headers.get('x-signature') || request.headers.get('signature');
    
    // NEW: Extract webhook ID from body (different per provider)
    const webhookData = JSON.parse(body);
    const webhookId = extractWebhookId(provider, webhookData);
    
    if (!webhookId) {
      return NextResponse.json(
        {
          error: 'Unable to extract webhook ID',
          error_code: 'INVALID_WEBHOOK_FORMAT'
        },
        { status: 400 }
      );
    }
    
    const adminClient = await createAdminClient();
    
    // NEW: Check if webhook already processed (idempotency)
    const { data: existingLog } = await adminClient
      .from('webhook_idempotency_logs')
      .select('transaction_id')
      .eq('provider', provider)
      .eq('webhook_id', webhookId)
      .single();
    
    if (existingLog) {
      // Already processed this webhook
      return NextResponse.json(
        {
          success: true,
          message: 'Webhook already processed',
          is_retry: true,
          transaction_id: existingLog.transaction_id
        },
        { status: 200 }
      );
    }
    
    // Verify webhook signature
    if (!verifyWebhookSignature(provider, body, signature)) {
      console.error(`Invalid webhook signature from ${provider}`);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Extract transaction data based on provider format
    const transactionData = extractTransactionData(provider, webhookData);
    
    if (!transactionData) {
      return NextResponse.json(
        {
          error: 'Unable to extract transaction data',
          error_code: 'INVALID_WEBHOOK_FORMAT'
        },
        { status: 400 }
      );
    }
    
    // Check if transaction already exists (by provider reference ID)
    const { data: existingTransaction } = await adminClient
      .from('payment_transactions')
      .select('id, status')
      .eq('payment_gateway_reference_id', transactionData.payment_gateway_reference_id)
      .single();
    
    let transaction;
    
    if (existingTransaction) {
      // Update existing transaction
      const { data: updated, error: updateError } = await adminClient
        .from('payment_transactions')
        .update({
          status: transactionData.status,
          updated_at: new Date().toISOString(),
          // Don't override user_id or payment details
        })
        .eq('id', existingTransaction.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      transaction = updated;
    } else {
      // Create new transaction
      const { data: created, error: insertError } = await adminClient
        .from('payment_transactions')
        .insert(transactionData)
        .select()
        .single();
      
      if (insertError) throw insertError;
      transaction = created;
    }
    
    // NEW: Log successful webhook processing
    const { error: logError } = await adminClient
      .from('webhook_idempotency_logs')
      .insert({
        provider,
        webhook_id: webhookId,
        transaction_id: transaction.id,
        processed_at: new Date().toISOString()
      });
    
    if (logError) {
      console.error('Failed to log webhook:', logError);
      // Don't fail the webhook, just log the error
    }
    
    // If transaction is approved, handle course enrollment
    if (transaction.status === 'approved') {
      await handleCourseEnrollment(adminClient, transaction);
      
      // Send notification email
      await sendPaymentApprovalEmail(
        transaction.customer_email || transaction.user_id,
        transaction
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        transaction_id: transaction.id,
        message: 'Webhook processed successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Webhook error for ${provider}:`, error);
    return NextResponse.json(
      {
        error: 'Failed to process webhook',
        error_code: 'WEBHOOK_PROCESSING_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Helper: Extract webhook ID based on provider
function extractWebhookId(provider: string, data: any): string | null {
  switch (provider) {
    case 'bkash':
      return data.transactionID || data.id || null;
    case 'nagad':
      return data.paymentRefId || data.id || null;
    case 'rocket':
      return data.trxID || data.id || null;
    default:
      return null;
  }
}

// Helper: Extract transaction data based on provider
function extractTransactionData(provider: string, webhookData: any) {
  switch (provider) {
    case 'bkash':
      return {
        payment_gateway_reference_id: webhookData.transactionID,
        customer_name: webhookData.customerName || null,
        customer_phone: webhookData.customerPhone || null,
        amount: parseFloat(webhookData.amount),
        status: webhookData.transactionStatus === '0000' ? 'approved' : 'rejected',
        metadata: webhookData
      };
    case 'nagad':
      return {
        payment_gateway_reference_id: webhookData.paymentRefId,
        customer_phone: webhookData.customerPhone || null,
        amount: parseFloat(webhookData.amount),
        status: webhookData.status === 'Success' ? 'approved' : 'rejected',
        metadata: webhookData
      };
    case 'rocket':
      return {
        payment_gateway_reference_id: webhookData.trxID,
        customer_phone: webhookData.msisdn || null,
        amount: parseFloat(webhookData.amount),
        status: webhookData.transactionStatus === 'Completed' ? 'approved' : 'rejected',
        metadata: webhookData
      };
    default:
      return null;
  }
}
```

### Database Schema Addition
```sql
-- Add payment_gateway_reference_id column if not exists
ALTER TABLE public.payment_transactions
ADD COLUMN IF NOT EXISTS payment_gateway_reference_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_reference 
  ON public.payment_transactions(payment_gateway_reference_id);
```

---

## CRITICAL FIX #4: Add 2FA for Admin Payment Actions

### Problem
Admins can approve large payments without second factor authentication. Device compromise = full access.

### Files to Fix
1. `/app/api/payment/approve/route.ts`
2. `/app/api/payment/refund/route.ts`
3. `/app/api/payment/reject/route.ts`

### Middleware to Add
```typescript
// File: /lib/middleware/require-2fa.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface TwoFAOptions {
  minimumRoleLevel?: number; // Only require for CEO/Manager (level <= 2)
  minimumAmountBDT?: number; // Only for payments > amount
}

export async function requireTwoFactorAuth(
  request: NextRequest,
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  options: TwoFAOptions = {}
): Promise<NextResponse | null> {
  const {
    minimumRoleLevel = 2, // CEO (1) and Manager (2) by default
    minimumAmountBDT = 0 // Require for all amounts by default
  } = options;
  
  try {
    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role:roles(level)')
      .eq('id', userId)
      .single();
    
    const userRoleLevel = (Array.isArray(userData?.role) 
      ? userData.role[0]?.level 
      : userData?.role?.level) ?? 999;
    
    // Check if 2FA required for this role
    if (userRoleLevel > minimumRoleLevel) {
      // Regular user doesn't need 2FA
      return null;
    }
    
    // Check if 2FA enabled for user
    const { data: twoFASettings } = await supabase
      .from('user_security_settings')
      .select('totp_enabled, totp_secret')
      .eq('user_id', userId)
      .single();
    
    if (!twoFASettings?.totp_enabled) {
      return NextResponse.json(
        {
          error: '2FA is required but not enabled',
          error_code: '2FA_NOT_ENABLED',
          help: 'Enable 2FA in your security settings'
        },
        { status: 403 }
      );
    }
    
    // Check if 2FA token provided
    const authHeader = request.headers.get('authorization') || '';
    const [, credentials] = authHeader.split(' ');
    
    if (!credentials) {
      return NextResponse.json(
        {
          error: '2FA token required',
          error_code: '2FA_TOKEN_REQUIRED',
          help: 'Include 2FA token in Authorization header: Bearer <token>'
        },
        { status: 401 }
      );
    }
    
    // Decode token (format: base64(totp_code:backup_code or empty))
    let totpCode: string | null = null;
    let backupCode: string | null = null;
    
    try {
      const decoded = Buffer.from(credentials, 'base64').toString();
      if (decoded.includes(':')) {
        [totpCode, backupCode] = decoded.split(':');
      } else {
        totpCode = decoded;
      }
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid 2FA token format',
          error_code: 'INVALID_2FA_FORMAT'
        },
        { status: 400 }
      );
    }
    
    // Verify TOTP code
    if (totpCode && totpCode.length === 6) {
      const isValid = await verifyTOTPCode(
        twoFASettings.totp_secret,
        totpCode
      );
      
      if (!isValid) {
        // Log failed attempt
        await logSecurityEvent(supabase, userId, '2FA_FAILED', {
          ip: request.ip,
          user_agent: request.headers.get('user-agent')
        });
        
        return NextResponse.json(
          {
            error: 'Invalid 2FA code',
            error_code: 'INVALID_2FA_CODE'
          },
          { status: 401 }
        );
      }
      
      return null; // 2FA verified
    }
    
    // Check backup code
    if (backupCode) {
      const isValid = await verifyBackupCode(supabase, userId, backupCode);
      
      if (!isValid) {
        await logSecurityEvent(supabase, userId, '2FA_BACKUP_FAILED', {
          ip: request.ip,
          user_agent: request.headers.get('user-agent')
        });
        
        return NextResponse.json(
          {
            error: 'Invalid backup code',
            error_code: 'INVALID_BACKUP_CODE'
          },
          { status: 401 }
        );
      }
      
      // Mark backup code as used
      await disableBackupCode(supabase, userId, backupCode);
      
      return null; // 2FA verified
    }
    
    return NextResponse.json(
      {
        error: '2FA verification failed',
        error_code: '2FA_INVALID'
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      {
        error: '2FA verification failed',
        error_code: '2FA_ERROR'
      },
      { status: 500 }
    );
  }
}

async function verifyTOTPCode(secret: string, code: string): Promise<boolean> {
  // Implementation using speakeasy or similar
  // Verify TOTP code within 30-second window
  const speakeasy = require('speakeasy');
  
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: code,
    window: 1 // Allow 1 window (30 seconds) in either direction
  });
}

async function verifyBackupCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  code: string
): Promise<boolean> {
  const { data: backupCodes } = await supabase
    .from('user_backup_codes')
    .select('used_at')
    .eq('user_id', userId)
    .eq('code_hash', hashCode(code))
    .eq('used_at', null)
    .single();
  
  return !!backupCodes;
}

async function disableBackupCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  code: string
): Promise<void> {
  await supabase
    .from('user_backup_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('code_hash', hashCode(code));
}

async function logSecurityEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  event: string,
  details: any
): Promise<void> {
  await supabase
    .from('security_audit_logs')
    .insert({
      user_id: userId,
      event,
      details,
      created_at: new Date().toISOString()
    });
}

function hashCode(code: string): string {
  // Hash backup code before storage
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(code).digest('hex');
}
```

### Updated Payment Approval Endpoint
```typescript
// File: /app/api/payment/approve/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';
import { sendPaymentApprovalEmail } from '@/lib/email/notifications';
import { requireTwoFactorAuth } from '@/lib/middleware/require-2fa'; // NEW

export async function POST(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.apiStrict);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if user is admin (CEO or Manager)
    const isAdmin = await checkIsAdmin(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access only" },
        { status: 403 }
      );
    }
    
    // NEW: Require 2FA for admin
    const twoFAError = await requireTwoFactorAuth(
      request,
      supabase,
      user.id,
      {
        minimumRoleLevel: 2, // CEO and Manager
        minimumAmountBDT: 0 // All amounts
      }
    );
    
    if (twoFAError) {
      return twoFAError;
    }
    
    const body = await request.json();
    const { transaction_id, admin_notes } = body;
    
    if (!transaction_id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }
    
    const adminClient = await createAdminClient();
    
    // Fetch transaction
    const { data: transaction, error: fetchError } = await adminClient
      .from("payment_transactions")
      .select("*")
      .eq("id", transaction_id)
      .single();
    
    if (fetchError || !transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
    
    // Check status
    if (transaction.status !== "pending") {
      return NextResponse.json(
        {
          error: "Only pending transactions can be approved",
          current_status: transaction.status
        },
        { status: 400 }
      );
    }
    
    // Update transaction status
    const { error: updateError } = await adminClient
      .from("payment_transactions")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes,
      })
      .eq("id", transaction_id);
    
    if (updateError) throw updateError;
    
    // Handle course enrollment if applicable
    if (transaction.purchase_type === "course" && transaction.purchase_id) {
      await handleCourseEnrollment(supabase, transaction);
    }
    
    // Create accounting entry
    await createAccountingEntry(adminClient, {
      entry_type: 'income',
      amount: transaction.amount,
      category: 'course_sales',
      description: `Course payment: ${transaction.transaction_id}`,
      transaction_id: transaction.id,
      created_by: user.id,
    });
    
    // Send notification
    await sendPaymentApprovalEmail(transaction.user_id, transaction);
    
    return NextResponse.json({
      success: true,
      message: "Payment approved successfully",
    });
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json(
      { error: "Failed to approve payment" },
      { status: 500 }
    );
  }
}
```

### Database Schema Addition
```sql
-- Create user_security_settings table
CREATE TABLE IF NOT EXISTS public.user_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  totp_enabled BOOLEAN DEFAULT false,
  totp_secret TEXT, -- Base32 encoded TOTP secret
  backup_codes_generated_at TIMESTAMPTZ,
  session_timeout_minutes INTEGER DEFAULT 30,
  login_alerts_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create backup codes table
CREATE TABLE IF NOT EXISTS public.user_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL, -- SHA256 hash of code
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security audit log
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  event TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_audit_logs_user ON security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_event ON security_audit_logs(event);
CREATE INDEX idx_security_audit_logs_created ON security_audit_logs(created_at);
```

---

## CRITICAL FIX #5: Add Refund Deadline Enforcement

### File to Fix
`/app/api/payment/refund/route.ts`

### Fixed Code
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { requireTwoFactorAuth } from '@/lib/middleware/require-2fa'; // NEW

// Configuration
const REFUND_DEADLINE_DAYS = 30;
const PARTIAL_REFUND_ALLOWED = true;

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
    
    // NEW: Require 2FA for refund operations
    const twoFAError = await requireTwoFactorAuth(request, supabase, user.id, {
      minimumRoleLevel: 2,
      minimumAmountBDT: 0
    });
    if (twoFAError) return twoFAError;

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
      .select('*')
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

    // NEW: Check refund deadline
    const approvedDate = new Date(transaction.approved_at);
    const daysSinceApproval = Math.floor(
      (Date.now() - approvedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceApproval > REFUND_DEADLINE_DAYS) {
      return NextResponse.json({
        error: `Refund period expired (${REFUND_DEADLINE_DAYS} days)`,
        error_code: 'REFUND_DEADLINE_EXCEEDED',
        approved_at: transaction.approved_at,
        deadline_date: new Date(approvedDate.getTime() + REFUND_DEADLINE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        days_since_approval: daysSinceApproval,
        help: 'Contact customer for late refund authorization'
      }, { status: 400 });
    }

    // Check if already fully refunded
    if (transaction.refund_status === 'refunded') {
      return NextResponse.json({
        error: 'Transaction already fully refunded',
        refund_status: transaction.refund_status
      }, { status: 400 });
    }

    // NEW: Prevent over-refunding
    const maxRefundAmount = transaction.amount - (transaction.refunded_amount || 0);
    if (refund_amount > maxRefundAmount) {
      return NextResponse.json({
        error: 'Refund amount exceeds available amount',
        available_amount: maxRefundAmount,
        requested_amount: refund_amount
      }, { status: 400 });
    }

    // NEW: Validate partial refund is allowed
    if (refund_amount < transaction.amount && !PARTIAL_REFUND_ALLOWED) {
      return NextResponse.json({
        error: 'Partial refunds are not allowed',
        amount: transaction.amount,
        requested_refund: refund_amount
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
    }

    // Handle course enrollment reversal if full refund
    if (newRefundStatus === 'refunded' && transaction.purchase_type === 'course') {
      const { error: enrollmentError } = await supabaseAdmin
        .from('enrollments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: `Refund processed: ${refund_reason}`,
        })
        .eq('user_id', transaction.user_id)
        .eq('course_id', transaction.purchase_id)
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

    // Send notification email
    try {
      await sendPaymentRefundEmail(transaction.user_id, {
        amount: refund_amount,
        original_amount: transaction.amount,
        reason: refund_reason,
        status: newRefundStatus
      });
    } catch (emailError) {
      console.error('Failed to send refund email:', emailError);
    }

    return NextResponse.json({
      success: true,
      transaction_id,
      refund_status: newRefundStatus,
      refunded_amount: totalRefundedAmount,
      original_amount: transaction.amount,
      message: newRefundStatus === 'refunded' 
        ? 'Transaction fully refunded'
        : `Partial refund processed (${totalRefundedAmount}/${transaction.amount})`
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
```

---

## Implementation Checklist

- [ ] Fix #1: Remove webhook secret fallbacks
- [ ] Fix #2: Add idempotency key support
- [ ] Fix #3: Add webhook idempotency logging
- [ ] Fix #4: Require 2FA for admin actions
- [ ] Fix #5: Enforce refund deadline
- [ ] Add email notification system
- [ ] Create database migrations
- [ ] Update environment variables documentation
- [ ] Add integration tests
- [ ] Update API documentation
- [ ] Deploy to staging
- [ ] Security review
- [ ] Production deployment
- [ ] Monitor for errors (first 24 hours)

---

**Total Implementation Time:** 16-20 developer-hours  
**Timeline:** 3-4 days with 1 engineer
**Risk Level:** LOW (fixes are additive, don't remove functionality)
