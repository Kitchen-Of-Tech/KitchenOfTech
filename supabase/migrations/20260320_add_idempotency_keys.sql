-- Add idempotency support to payment system (Manual Approval Workflow)
-- Kitchen of Tech uses MANUAL payment approval workflow
-- Customer submits payment details, admin reviews and approves/rejects
-- Idempotency keys prevent duplicate submissions from form retries

-- =============================================
-- 1. ADD IDEMPOTENCY KEY COLUMN TO TRANSACTIONS
-- =============================================
ALTER TABLE public.payment_transactions 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- Create index for idempotency key lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_idempotency 
ON public.payment_transactions(idempotency_key) 
WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN public.payment_transactions.idempotency_key 
IS 'Unique key to prevent duplicate payment form submissions (UUID format)';

-- =============================================
-- 2. MIGRATE EXISTING DATA
-- =============================================
-- Set idempotency_key for existing transactions if not already set
UPDATE public.payment_transactions 
SET idempotency_key = id::text 
WHERE idempotency_key IS NULL;

-- =============================================
-- 3. ENSURE PAYMENT FLOW IS MANUAL
-- =============================================
-- All payments created via submit endpoint will be in 'pending' status
-- Admin must manually review and approve/reject in Payment Management dashboard

COMMENT ON VIEW duplicate_webhook_attempts 
IS 'Shows webhook deliveries that were attempted multiple times';
