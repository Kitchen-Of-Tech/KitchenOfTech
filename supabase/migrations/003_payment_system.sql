-- Kitchen of Tech - Custom Payment System Migration
-- Creates tables for payment methods management and transaction tracking

-- =============================================
-- 1. PAYMENT METHODS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('bank', 'mobile_banking', 'card', 'crypto', 'other')),
  account_details JSONB NOT NULL, -- Flexible JSON for different payment details
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  icon_url TEXT,
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_order ON public.payment_methods(display_order);

-- =============================================
-- 2. PAYMENT TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  
  -- Transaction Details
  transaction_id TEXT NOT NULL, -- User-submitted transaction ID
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Purchase Details
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('course', 'service', 'product', 'other')),
  purchase_id TEXT NOT NULL, -- ID of course, service, or product
  purchase_details JSONB, -- Additional purchase information
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
  
  -- Review Information
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created ON public.payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON public.payment_transactions(purchase_type);

-- =============================================
-- 3. PAYMENT VERIFICATION LOGS
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'refunded', 'updated')),
  performed_by UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_transaction ON public.payment_verification_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created ON public.payment_verification_logs(created_at);

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verification_logs ENABLE ROW LEVEL SECURITY;

-- Payment Methods Policies
-- Anyone can read active payment methods
CREATE POLICY "Anyone can read active payment methods"
  ON public.payment_methods FOR SELECT
  USING (is_active = true);

-- Only CEO can manage payment methods
CREATE POLICY "CEO can manage payment methods"
  ON public.payment_methods FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level = 1 -- CEO only
    )
  );

-- Payment Transactions Policies
-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own transactions
CREATE POLICY "Users can create transactions"
  ON public.payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- CEO and Managers can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2 -- CEO or Manager
    )
  );

-- CEO and Managers can update transaction status
CREATE POLICY "Admins can update transactions"
  ON public.payment_transactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- Payment Verification Logs Policies
-- Users can read logs for their transactions
CREATE POLICY "Users can read own transaction logs"
  ON public.payment_verification_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_transactions pt
      WHERE pt.id = payment_verification_logs.transaction_id
      AND pt.user_id = auth.uid()
    )
  );

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
  ON public.payment_verification_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- System can insert logs
CREATE POLICY "Authenticated users can create logs"
  ON public.payment_verification_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- 5. TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_methods_timestamp
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_timestamp();

CREATE TRIGGER update_payment_transactions_timestamp
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_timestamp();

-- Auto-create log entry when transaction status changes
CREATE OR REPLACE FUNCTION log_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.payment_verification_logs (transaction_id, action, performed_by, notes)
    VALUES (NEW.id, 'submitted', NEW.user_id, 'Transaction submitted');
  ELSIF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    INSERT INTO public.payment_verification_logs (transaction_id, action, performed_by, notes)
    VALUES (
      NEW.id,
      NEW.status,
      NEW.reviewed_by,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Transaction approved'
        WHEN NEW.status = 'rejected' THEN COALESCE(NEW.rejection_reason, 'Transaction rejected')
        WHEN NEW.status = 'refunded' THEN 'Transaction refunded'
        ELSE 'Status updated'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_transaction_changes
  AFTER INSERT OR UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION log_payment_status_change();

-- =============================================
-- 6. INITIAL DATA
-- =============================================

-- Insert default payment methods (can be customized)
INSERT INTO public.payment_methods (name, type, account_details, instructions, display_order)
VALUES 
  (
    'Bank Transfer',
    'bank',
    '{"bank_name": "Example Bank", "account_name": "Kitchen of Tech", "account_number": "1234567890", "routing_number": "987654321"}'::jsonb,
    'Please transfer the exact amount and use the transaction ID from your bank app.',
    1
  ),
  (
    'bKash',
    'mobile_banking',
    '{"number": "+880XXXXXXXXXX", "type": "Personal"}'::jsonb,
    'Send money to the number above and submit your transaction ID.',
    2
  ),
  (
    'Nagad',
    'mobile_banking',
    '{"number": "+880XXXXXXXXXX", "type": "Personal"}'::jsonb,
    'Send money to the number above and submit your transaction ID.',
    3
  ),
  (
    'Rocket',
    'mobile_banking',
    '{"number": "+880XXXXXXXXXX", "type": "Personal"}'::jsonb,
    'Send money to the number above and submit your transaction ID.',
    4
  )
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
