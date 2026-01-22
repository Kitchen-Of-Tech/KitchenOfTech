-- Create service_categories table for dynamic testimonial categorization
-- This allows CEO/Manager to add, edit, and delete service categories

CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON public.service_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_service_categories_order ON public.service_categories(display_order);

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read active categories
CREATE POLICY "Anyone can read active service categories"
  ON public.service_categories FOR SELECT
  USING (is_active = true);

-- Authenticated users can read all categories
CREATE POLICY "Authenticated users can read all categories"
  ON public.service_categories FOR SELECT
  TO authenticated
  USING (true);

-- Only CEO and Manager can create, update, delete categories
CREATE POLICY "CEO and Manager can manage categories"
  ON public.service_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- Insert default categories
INSERT INTO public.service_categories (name, description, display_order, is_active) VALUES
  ('Web Development', 'Custom website and web application development', 1, true),
  ('Mobile Development', 'iOS and Android mobile app development', 2, true),
  ('UI/UX Design', 'User interface and user experience design services', 3, true),
  ('Cloud Services', 'Cloud infrastructure and migration services', 4, true),
  ('AI Solutions', 'Artificial intelligence and machine learning solutions', 5, true),
  ('Digital Marketing', 'Digital marketing and SEO services', 6, true),
  ('Branding', 'Brand identity and strategy development', 7, true),
  ('E-Commerce', 'E-commerce platform development and solutions', 8, true),
  ('DevOps', 'DevOps and CI/CD pipeline implementation', 9, true),
  ('Consulting', 'Technology consulting and advisory services', 10, true),
  ('Other', 'Other technology services', 11, true)
ON CONFLICT (name) DO NOTHING;

-- Add comments
COMMENT ON TABLE public.service_categories IS 'Stores service categories for testimonial classification. Managed dynamically by CEO and Managers.';
COMMENT ON COLUMN public.service_categories.display_order IS 'Order in which categories appear in the UI (lower number = higher priority)';
