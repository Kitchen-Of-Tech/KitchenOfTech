-- Create meetings table for service meeting requests
-- This allows visitors to request meetings for specific services
-- CEO/Managers can view and manage meeting requests in the dashboard

CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Requestor information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  preferred_datetime TIMESTAMPTZ,
  
  -- Service information
  service_slug TEXT,
  service_title TEXT,
  
  -- Meeting status
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'contacted', 'scheduled', 'completed', 'cancelled')),
  
  -- Assignment and notifications
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notified BOOLEAN NOT NULL DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  
  -- Additional metadata
  meta JSONB DEFAULT '{}',
  
  -- Constraints
  CONSTRAINT at_least_one_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON public.meetings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_service_slug ON public.meetings(service_slug);
CREATE INDEX IF NOT EXISTS idx_meetings_assigned_to ON public.meetings(assigned_to);
CREATE INDEX IF NOT EXISTS idx_meetings_email ON public.meetings(email);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert (anyone can request a meeting)
CREATE POLICY "Anyone can create meeting requests"
  ON public.meetings FOR INSERT
  WITH CHECK (true);

-- Policy: CEO and Managers can view all meetings
CREATE POLICY "CEO and Managers can view all meetings"
  ON public.meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND r.level >= 90 -- CEO (100) and Manager (90)
    )
  );

-- Policy: CEO and Managers can update meetings
CREATE POLICY "CEO and Managers can update meetings"
  ON public.meetings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND r.level >= 90
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND r.level >= 90
    )
  );

-- Policy: CEO and Managers can delete meetings
CREATE POLICY "CEO and Managers can delete meetings"
  ON public.meetings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND r.level >= 90
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_meetings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.meetings IS 'Meeting requests from visitors for specific services';
COMMENT ON COLUMN public.meetings.name IS 'Full name of the person requesting the meeting';
COMMENT ON COLUMN public.meetings.email IS 'Email address (at least one contact method required)';
COMMENT ON COLUMN public.meetings.phone IS 'Phone number (at least one contact method required)';
COMMENT ON COLUMN public.meetings.service_slug IS 'Slug of the service being requested (optional if general inquiry)';
COMMENT ON COLUMN public.meetings.status IS 'Current status: requested, contacted, scheduled, completed, cancelled';
COMMENT ON COLUMN public.meetings.assigned_to IS 'User ID of the team member assigned to handle this meeting';
COMMENT ON COLUMN public.meetings.notified IS 'Whether email notification was successfully sent to managers';
