-- Kitchen of Tech - Testimonial System Migration
-- Creates tables for testimonial link generation and testimonial management

-- =============================================
-- 1. TESTIMONIAL LINKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.testimonial_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  email TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_testimonial_links_token ON public.testimonial_links(token);
CREATE INDEX IF NOT EXISTS idx_testimonial_links_expires_at ON public.testimonial_links(expires_at);

-- =============================================
-- 2. TESTIMONIALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.testimonial_links(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  position TEXT,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  image_url TEXT,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES public.users(id),
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_link_id ON public.testimonials(link_id);

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.testimonial_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Testimonial Links Policies
-- Anyone can read unexpired, unused links (for validation)
CREATE POLICY "Anyone can validate unexpired unused links"
  ON public.testimonial_links FOR SELECT
  USING (expires_at > NOW() AND used = false);

-- Authenticated users can create links
CREATE POLICY "Authenticated users can create links"
  ON public.testimonial_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only creators or CEO/Manager can view all links
CREATE POLICY "Creators and admins can view links"
  ON public.testimonial_links FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- Testimonials Policies
-- Anyone can submit a testimonial
CREATE POLICY "Anyone can submit testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (true);

-- Only approved testimonials are publicly visible
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials FOR SELECT
  USING (status = 'approved');

-- CEO and Managers can view all testimonials
CREATE POLICY "Admins can view all testimonials"
  ON public.testimonials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- CEO and Managers can update testimonials (approve/reject)
CREATE POLICY "Admins can update testimonials"
  ON public.testimonials FOR UPDATE
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

-- CEO and Managers can delete testimonials
CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- =============================================
-- 4. FUNCTIONS
-- =============================================

-- Function to automatically mark link as used when testimonial is submitted
CREATE OR REPLACE FUNCTION mark_link_as_used()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.testimonial_links
  SET used = true, used_at = NOW()
  WHERE id = NEW.link_id AND used = false;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_mark_link_used ON public.testimonials;
CREATE TRIGGER trigger_mark_link_used
  AFTER INSERT ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION mark_link_as_used();

-- Function to clean up expired links (can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_links()
RETURNS void AS $$
BEGIN
  DELETE FROM public.testimonial_links
  WHERE expires_at < NOW() - INTERVAL '30 days' AND used = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. GRANTS
-- =============================================

-- Grant access to authenticated users
GRANT SELECT, INSERT ON public.testimonial_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;

-- Grant access to anon users for reading approved testimonials and validating links
GRANT SELECT ON public.testimonial_links TO anon;
GRANT SELECT, INSERT ON public.testimonials TO anon;

-- =============================================
-- 6. COMMENTS
-- =============================================

COMMENT ON TABLE public.testimonial_links IS 'Stores unique links for testimonial submission. Links expire after 7 days and are single-use only.';
COMMENT ON TABLE public.testimonials IS 'Stores client testimonials. Requires approval from CEO or Manager before being displayed publicly.';
COMMENT ON COLUMN public.testimonials.status IS 'pending: awaiting approval, approved: visible on website, rejected: permanently removed';
COMMENT ON FUNCTION mark_link_as_used() IS 'Automatically marks a testimonial link as used when a testimonial is submitted';
COMMENT ON FUNCTION cleanup_expired_links() IS 'Removes expired links older than 30 days. Run periodically via cron job or scheduled function.';
