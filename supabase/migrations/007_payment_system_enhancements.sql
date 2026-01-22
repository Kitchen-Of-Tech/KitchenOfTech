-- Kitchen of Tech - Payment System Enhancements
-- Adds payment links, invoices, accounting, and API key management
-- This makes the payment system universal and reusable for any purpose

-- =============================================
-- 1. ENHANCE payment_transactions TABLE
-- =============================================

-- Add new columns for flexibility and guest payments
ALTER TABLE public.payment_transactions 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS user_note TEXT,
ADD COLUMN IF NOT EXISTS payment_link_id UUID,
ADD COLUMN IF NOT EXISTS invoice_id UUID,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer_email ON public.payment_transactions(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_link ON public.payment_transactions(payment_link_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice ON public.payment_transactions(invoice_id);

-- Add comment
COMMENT ON COLUMN public.payment_transactions.metadata IS 'Flexible JSONB storage for any custom data - makes system universal for any use case';
COMMENT ON COLUMN public.payment_transactions.user_note IS 'Optional note from user when submitting payment';

-- =============================================
-- 2. PAYMENT LINKS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id TEXT UNIQUE NOT NULL, -- Short unique ID for URL (e.g., "pay-abc123")
  
  -- Link Details
  title TEXT NOT NULL,
  description TEXT,
  
  -- Amount
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  
  -- Purpose (flexible)
  purpose TEXT NOT NULL, -- 'invoice', 'order', 'enrollment', 'service', 'product', 'custom'
  reference_id TEXT, -- ID of invoice/order/course/service
  metadata JSONB DEFAULT '{}', -- Flexible data storage for ANY use case
  
  -- Customer Info (optional, can be filled by user on payment page)
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  
  -- Link Settings
  expiry_date TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 1, -- Usually 1 for invoices, can be more
  current_uses INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed', 'cancelled')),
  
  -- Tracking
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_links_link_id ON public.payment_links(link_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON public.payment_links(status);
CREATE INDEX IF NOT EXISTS idx_payment_links_created_by ON public.payment_links(created_by);
CREATE INDEX IF NOT EXISTS idx_payment_links_expiry ON public.payment_links(expiry_date);
CREATE INDEX IF NOT EXISTS idx_payment_links_purpose ON public.payment_links(purpose);

-- Enable RLS
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_links
-- Anyone can read active, non-expired links (for public payment page)
CREATE POLICY "Anyone can read active payment links"
  ON public.payment_links FOR SELECT
  USING (
    status = 'active' 
    AND (expiry_date IS NULL OR expiry_date > NOW())
    AND current_uses < max_uses
  );

-- Authenticated users can read their own links
CREATE POLICY "Users can read own payment links"
  ON public.payment_links FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- CEO and Managers can view all links
CREATE POLICY "Admins can view all payment links"
  ON public.payment_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- CEO and Managers can create links
CREATE POLICY "Admins can create payment links"
  ON public.payment_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- CEO and Managers can update links
CREATE POLICY "Admins can update payment links"
  ON public.payment_links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- Add comments
COMMENT ON TABLE public.payment_links IS 'Shareable payment links for invoices, orders, enrollments, or any custom purpose';
COMMENT ON COLUMN public.payment_links.link_id IS 'Short unique identifier used in URLs (e.g., https://site.com/pay/abc123)';
COMMENT ON COLUMN public.payment_links.metadata IS 'Flexible JSONB storage for any custom data specific to the payment purpose';

-- =============================================
-- 3. INVOICES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL, -- Auto-generated: INV-2026-001
  
  -- Customer Information
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_company TEXT,
  
  -- Invoice Details
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  
  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0, -- e.g., 15.00 for 15%
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  paid_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT, -- Internal notes
  terms TEXT, -- Payment terms shown to customer
  
  -- Links
  payment_link_id UUID REFERENCES public.payment_links(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
  
  -- Tracking
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON public.invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON public.invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
-- Authenticated users can read their own invoices
CREATE POLICY "Users can read own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- CEO and Managers can view all invoices
CREATE POLICY "Admins can view all invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- CEO and Managers can manage invoices
CREATE POLICY "Admins can manage invoices"
  ON public.invoices FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- Add comments
COMMENT ON TABLE public.invoices IS 'Professional invoices with line items, linked to payment links and transactions';
COMMENT ON COLUMN public.invoices.invoice_number IS 'Auto-generated invoice number in format: INV-YYYY-NNN';

-- =============================================
-- 4. INVOICE LINE ITEMS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  
  -- Item Details
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL, -- quantity * unit_price
  
  -- Optional categorization
  item_type TEXT, -- 'service', 'product', 'course', 'custom'
  item_id TEXT, -- Reference to service/product/course ID
  
  -- Order
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_order ON public.invoice_line_items(display_order);

-- Enable RLS
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_line_items (inherit from invoices)
CREATE POLICY "Users can read own invoice items"
  ON public.invoice_line_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_line_items.invoice_id
      AND i.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can manage invoice items"
  ON public.invoice_line_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- Add comments
COMMENT ON TABLE public.invoice_line_items IS 'Individual line items (products/services) within an invoice';

-- =============================================
-- 5. ACCOUNTING ENTRIES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.accounting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entry Details
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense')),
  
  -- Financial
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  
  -- Categorization
  category TEXT NOT NULL, -- 'course_sales', 'service_revenue', 'product_sales', 'marketing', 'operations', 'salaries', etc.
  subcategory TEXT,
  
  -- Description
  description TEXT NOT NULL,
  notes TEXT,
  
  -- Links
  transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE SET NULL, -- Auto-linked for income
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  
  -- Receipt/Proof (for expenses)
  receipt_url TEXT,
  
  -- Fiscal Period
  fiscal_year INTEGER,
  fiscal_month INTEGER, -- 1-12
  
  -- Tracking
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accounting_date ON public.accounting_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_accounting_type ON public.accounting_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_accounting_category ON public.accounting_entries(category);
CREATE INDEX IF NOT EXISTS idx_accounting_fiscal ON public.accounting_entries(fiscal_year, fiscal_month);
CREATE INDEX IF NOT EXISTS idx_accounting_transaction ON public.accounting_entries(transaction_id);

-- Enable RLS
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounting_entries
-- Only CEO and Managers can view accounting data
CREATE POLICY "Admins can view accounting entries"
  ON public.accounting_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- Only CEO and Managers can manage accounting entries
CREATE POLICY "Admins can manage accounting entries"
  ON public.accounting_entries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- Add comments
COMMENT ON TABLE public.accounting_entries IS 'Financial ledger for tracking all income and expenses';
COMMENT ON COLUMN public.accounting_entries.transaction_id IS 'Auto-linked when payment is approved (for income entries)';

-- =============================================
-- 6. API KEYS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Key Details
  key_name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL, -- Hashed API key
  key_prefix TEXT NOT NULL, -- First 12 chars for display (e.g., "pk_live_abc1...")
  
  -- Permissions
  permissions JSONB DEFAULT '["payment.create", "payment.read"]',
  environment TEXT DEFAULT 'production' CHECK (environment IN ('sandbox', 'production')),
  
  -- Usage Tracking
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  
  -- Tracking
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON public.api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON public.api_keys(created_by);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
-- Only CEO can view API keys
CREATE POLICY "CEO can view API keys"
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level = 1
    )
  );

-- Only CEO can manage API keys
CREATE POLICY "CEO can manage API keys"
  ON public.api_keys FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level = 1
    )
  );

-- Add comments
COMMENT ON TABLE public.api_keys IS 'API keys for integrating payment system with external websites/applications';
COMMENT ON COLUMN public.api_keys.key_prefix IS 'First 12 characters of key shown in UI for identification';

-- =============================================
-- 7. ADD FOREIGN KEY CONSTRAINTS (DEFERRED)
-- =============================================

-- Add foreign key from payment_transactions to payment_links
ALTER TABLE public.payment_transactions 
ADD CONSTRAINT fk_payment_transactions_payment_link 
FOREIGN KEY (payment_link_id) REFERENCES public.payment_links(id) ON DELETE SET NULL;

-- Add foreign key from payment_transactions to invoices
ALTER TABLE public.payment_transactions 
ADD CONSTRAINT fk_payment_transactions_invoice 
FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;

-- =============================================
-- 8. CREATE HELPER FUNCTIONS
-- =============================================

-- Function to generate unique link_id
CREATE OR REPLACE FUNCTION generate_payment_link_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    -- Generate random 8-character alphanumeric string
    new_id := 'pay-' || lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if it exists
    IF NOT EXISTS (SELECT 1 FROM public.payment_links WHERE link_id = new_id) THEN
      done := TRUE;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  current_year INTEGER;
  next_number INTEGER;
  new_invoice_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Get the next number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-' || current_year::TEXT || '-(\d+)') AS INTEGER)
  ), 0) + 1 INTO next_number
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || current_year::TEXT || '-%';
  
  -- Format: INV-2026-001
  new_invoice_number := 'INV-' || current_year::TEXT || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update fiscal period on accounting entries
CREATE OR REPLACE FUNCTION set_fiscal_period()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fiscal_year IS NULL THEN
    NEW.fiscal_year := EXTRACT(YEAR FROM NEW.entry_date);
  END IF;
  
  IF NEW.fiscal_month IS NULL THEN
    NEW.fiscal_month := EXTRACT(MONTH FROM NEW.entry_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for fiscal period
CREATE TRIGGER trigger_set_fiscal_period
  BEFORE INSERT OR UPDATE ON public.accounting_entries
  FOR EACH ROW
  EXECUTE FUNCTION set_fiscal_period();

-- Function to update payment link uses
CREATE OR REPLACE FUNCTION increment_payment_link_uses()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_link_id IS NOT NULL THEN
    UPDATE public.payment_links
    SET current_uses = current_uses + 1,
        updated_at = NOW()
    WHERE id = NEW.payment_link_id;
    
    -- Update status to completed if max uses reached
    UPDATE public.payment_links
    SET status = 'completed',
        updated_at = NOW()
    WHERE id = NEW.payment_link_id
    AND current_uses >= max_uses;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment link uses
CREATE TRIGGER trigger_increment_payment_link_uses
  AFTER INSERT ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION increment_payment_link_uses();

-- =============================================
-- 9. CREATE VIEWS FOR REPORTING
-- =============================================

-- View for monthly revenue summary
CREATE OR REPLACE VIEW monthly_revenue_summary AS
SELECT 
  fiscal_year,
  fiscal_month,
  category,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  MIN(entry_date) as period_start,
  MAX(entry_date) as period_end
FROM public.accounting_entries
WHERE entry_type = 'income'
GROUP BY fiscal_year, fiscal_month, category
ORDER BY fiscal_year DESC, fiscal_month DESC, total_amount DESC;

-- View for pending approvals count (for notifications)
CREATE OR REPLACE VIEW pending_approvals_count AS
SELECT 
  COUNT(*) as pending_count,
  SUM(amount) as pending_amount,
  MIN(created_at) as oldest_pending
FROM public.payment_transactions
WHERE status = 'pending';

-- Add comments to views
COMMENT ON VIEW monthly_revenue_summary IS 'Monthly revenue breakdown by category for financial reports';
COMMENT ON VIEW pending_approvals_count IS 'Quick count of pending payment approvals for dashboard notifications';

-- =============================================
-- 10. FINAL COMMENTS
-- =============================================

COMMENT ON SCHEMA public IS 'Kitchen of Tech - Universal Payment System with manual approval workflow';
