-- Kitchen of Tech - Team Member Signup Requests
-- Adds pending signup requests and user profile fields

-- =============================================
-- 1. ADD PROFILE FIELDS TO USERS
-- =============================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT;

-- =============================================
-- 2. SIGNUP REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.signup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'teacher', 'client', 'team_member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  department TEXT,
  title TEXT,
  role_id UUID REFERENCES public.roles(id),
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES public.users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signup_requests_status ON public.signup_requests(status);
CREATE INDEX IF NOT EXISTS idx_signup_requests_user_type ON public.signup_requests(user_type);
CREATE INDEX IF NOT EXISTS idx_signup_requests_created_at ON public.signup_requests(created_at);

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage signup requests" ON public.signup_requests;
CREATE POLICY "Admins can manage signup requests"
  ON public.signup_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- =============================================
-- 4. COMMENTS
-- =============================================
COMMENT ON TABLE public.signup_requests IS 'Pending signup requests for approval by CEO';
COMMENT ON COLUMN public.signup_requests.user_type IS 'Requested signup category';
COMMENT ON COLUMN public.signup_requests.status IS 'pending | approved | rejected';
