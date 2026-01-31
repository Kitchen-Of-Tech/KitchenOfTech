-- Payment Gateway Enhancement Tables
-- Migration: Add support for webhooks, refunds, and audit logging

-- 1. Payment Webhooks Table
-- Stores webhook logs from payment providers (bKash, Nagad, Rocket)
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('bkash', 'nagad', 'rocket')),
  provider_transaction_id TEXT NOT NULL,
  webhook_data JSONB NOT NULL,
  status TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for finding duplicate webhooks quickly
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_provider_txn 
  ON payment_webhooks(provider, provider_transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed_at 
  ON payment_webhooks(processed_at DESC);

-- 2. Payment Refunds Table
-- Tracks all refund operations
CREATE TABLE IF NOT EXISTS payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
  refund_amount DECIMAL(10, 2) NOT NULL CHECK (refund_amount > 0),
  refund_reason TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  refunded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  refunded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_transaction_id 
  ON payment_refunds(transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_refunded_at 
  ON payment_refunds(refunded_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_status 
  ON payment_refunds(status);

-- 3. Payment Audit Logs Table
-- Comprehensive logging of all payment operations
CREATE TABLE IF NOT EXISTS payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('submit', 'approve', 'reject', 'refund', 'update', 'delete', 'webhook')),
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  changes_made JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_transaction_id 
  ON payment_audit_logs(transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_user_id 
  ON payment_audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_action 
  ON payment_audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_created_at 
  ON payment_audit_logs(created_at DESC);

-- 4. Add new columns to payment_transactions table
-- For refund tracking
ALTER TABLE payment_transactions 
  ADD COLUMN IF NOT EXISTS refund_status TEXT CHECK (refund_status IN ('none', 'partial_refund', 'refunded'));

ALTER TABLE payment_transactions 
  ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE payment_transactions 
  ADD COLUMN IF NOT EXISTS refund_reason TEXT;

ALTER TABLE payment_transactions 
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE payment_transactions 
  ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE payment_transactions 
  ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT;

ALTER TABLE payment_transactions 
  ADD COLUMN IF NOT EXISTS provider_response JSONB;

-- For currency support
ALTER TABLE payment_transactions 
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BDT' CHECK (currency IN ('BDT', 'USD', 'EUR', 'GBP'));

ALTER TABLE payment_transactions 
  ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 4) DEFAULT 1.0;

ALTER TABLE payment_transactions 
  ADD COLUMN IF NOT EXISTS currency_amount DECIMAL(10, 2);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_payment_transactions_refund_status 
  ON payment_transactions(refund_status) WHERE refund_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_txn_id 
  ON payment_transactions(provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_currency 
  ON payment_transactions(currency);

-- 5. Payment Reminders Table
-- Track automated payment reminders
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'sms', 'both')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_reminders_transaction_id 
  ON payment_reminders(transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_reminders_status 
  ON payment_reminders(status);

CREATE INDEX IF NOT EXISTS idx_payment_reminders_scheduled_for 
  ON payment_reminders(scheduled_for);

-- 6. Add RLS (Row Level Security) policies
-- Payment Webhooks - Admin only
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all webhooks" ON payment_webhooks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id 
      WHERE users.id = auth.uid() AND roles.level >= 90
    )
  );

-- Payment Refunds - Admin only for insert/update, users can view their own
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own refunds" ON payment_refunds
  FOR SELECT
  USING (
    transaction_id IN (
      SELECT id FROM payment_transactions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all refunds" ON payment_refunds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id 
      WHERE users.id = auth.uid() AND roles.level >= 90
    )
  );

CREATE POLICY "Admins can create refunds" ON payment_refunds
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id 
      WHERE users.id = auth.uid() AND roles.level >= 90
    )
  );

-- Payment Audit Logs - Admin only
ALTER TABLE payment_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs" ON payment_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id 
      WHERE users.id = auth.uid() AND roles.level >= 90
    )
  );

CREATE POLICY "System can insert audit logs" ON payment_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Payment Reminders - Admin only
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reminders" ON payment_reminders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN roles ON users.role_id = roles.id 
      WHERE users.id = auth.uid() AND roles.level >= 90
    )
  );

-- 7. Create views for common queries
-- Active refunds view
CREATE OR REPLACE VIEW active_refunds AS
SELECT 
  pr.*,
  pt.transaction_id,
  pt.amount as transaction_amount,
  pt.user_id,
  u.full_name as user_name,
  u.email as user_email
FROM payment_refunds pr
JOIN payment_transactions pt ON pr.transaction_id = pt.id
JOIN users u ON pt.user_id = u.id
WHERE pr.status = 'completed'
ORDER BY pr.refunded_at DESC;

-- Payment analytics summary view
CREATE OR REPLACE VIEW payment_analytics_summary AS
SELECT 
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  SUM(amount) FILTER (WHERE status = 'approved') as total_revenue,
  SUM(refunded_amount) FILTER (WHERE status = 'approved') as total_refunded,
  SUM(amount - COALESCE(refunded_amount, 0)) FILTER (WHERE status = 'approved') as net_revenue,
  AVG(amount) FILTER (WHERE status = 'approved') as avg_transaction_value
FROM payment_transactions;

-- Comments for documentation
COMMENT ON TABLE payment_webhooks IS 'Stores webhook logs from payment providers for idempotency and debugging';
COMMENT ON TABLE payment_refunds IS 'Tracks all refund operations for payment transactions';
COMMENT ON TABLE payment_audit_logs IS 'Comprehensive audit trail of all payment operations';
COMMENT ON TABLE payment_reminders IS 'Automated reminders for pending payments';
COMMENT ON COLUMN payment_transactions.refund_status IS 'Status of refund: none, partial_refund, or refunded';
COMMENT ON COLUMN payment_transactions.currency IS 'Currency code: BDT, USD, EUR, GBP';
COMMENT ON COLUMN payment_transactions.exchange_rate IS 'Exchange rate at time of transaction (relative to BDT)';
