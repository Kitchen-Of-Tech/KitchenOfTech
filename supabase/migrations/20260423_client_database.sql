-- Kitchen of Tech - Client Database Feature
-- Stores cold outreach client records and relationship tracking

-- =============================================
-- 1. CLIENT BUSINESS TYPES (OPTION LIST)
-- =============================================
CREATE TABLE IF NOT EXISTS public.client_business_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. CLIENT FOUND SOURCES (OPTION LIST)
-- =============================================
CREATE TABLE IF NOT EXISTS public.client_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. CLIENT RECORDS TABLE
-- =============================================
CREATE SEQUENCE IF NOT EXISTS public.client_id_seq;

CREATE OR REPLACE FUNCTION public.generate_client_id()
RETURNS TEXT AS $$
DECLARE
  year_text TEXT := to_char(NOW(), 'YYYY');
  next_number TEXT;
BEGIN
  next_number := LPAD(nextval('public.client_id_seq')::TEXT, 5, '0');
  RETURN 'CL-' || year_text || '-' || next_number;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.client_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT UNIQUE NOT NULL DEFAULT public.generate_client_id(),

  -- Status
  client_status TEXT NOT NULL DEFAULT 'Initial' CHECK (client_status IN (
    'Initial',
    '1st Attack',
    'Fellows',
    'Attack Plan Done',
    'Replied',
    'Project Planning',
    'Project Revision',
    'Project Running',
    'Re Follow Up',
    'Cold',
    'Connected',
    'Re Cold',
    'Follow Up',
    'Black Listed',
    'Not Client',
    'Client'
  )),
  possibility TEXT NOT NULL CHECK (possibility IN ('High', 'Medium', 'Low')),

  -- Basic Info
  client_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  client_description TEXT,
  client_business_type TEXT,
  client_found_from TEXT,

  -- Media
  client_media JSONB DEFAULT '[]',

  -- Links
  important_links TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '[]',

  -- Contact
  phone_numbers TEXT[] DEFAULT '{}',
  whatsapp_numbers TEXT[] DEFAULT '{}',
  imo_numbers TEXT[] DEFAULT '{}',
  emails TEXT[] DEFAULT '{}',

  -- Location
  country TEXT,
  address TEXT,

  -- Consultation time
  consultation_time_local TEXT,
  consultation_timezone TEXT,
  consultation_time_bdt TEXT,

  -- Outreach
  cold_email TEXT,
  cold_message TEXT,
  follow_up_emails TEXT[] DEFAULT '{}',
  follow_up_messages TEXT[] DEFAULT '{}',

  comment TEXT,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS idx_client_records_status ON public.client_records(client_status);
CREATE INDEX IF NOT EXISTS idx_client_records_possibility ON public.client_records(possibility);
CREATE INDEX IF NOT EXISTS idx_client_records_country ON public.client_records(country);
CREATE INDEX IF NOT EXISTS idx_client_records_business_type ON public.client_records(client_business_type);
CREATE INDEX IF NOT EXISTS idx_client_records_found_from ON public.client_records(client_found_from);
CREATE INDEX IF NOT EXISTS idx_client_records_followup_emails ON public.client_records USING GIN (follow_up_emails);
CREATE INDEX IF NOT EXISTS idx_client_records_followup_messages ON public.client_records USING GIN (follow_up_messages);

-- =============================================
-- 3A. UPDATE CHECK CONSTRAINT (IDEMPOTENT)
-- =============================================
ALTER TABLE public.client_records
  DROP CONSTRAINT IF EXISTS client_records_client_status_check;

ALTER TABLE public.client_records
  ADD CONSTRAINT client_records_client_status_check
  CHECK (client_status IN (
    'Initial',
    '1st Attack',
    'Fellows',
    'Attack Plan Done',
    'Replied',
    'Project Planning',
    'Project Revision',
    'Project Running',
    'Re Follow Up',
    'Cold',
    'Connected',
    'Re Cold',
    'Follow Up',
    'Black Listed',
    'Not Client',
    'Client'
  ));

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.client_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sources ENABLE ROW LEVEL SECURITY;

-- Manager only access
DROP POLICY IF EXISTS "Admins can manage client records" ON public.client_records;
CREATE POLICY "Admins can manage client records"
  ON public.client_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

DROP POLICY IF EXISTS "Admins can manage client business types" ON public.client_business_types;
CREATE POLICY "Admins can manage client business types"
  ON public.client_business_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

DROP POLICY IF EXISTS "Admins can manage client sources" ON public.client_sources;
CREATE POLICY "Admins can manage client sources"
  ON public.client_sources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- =============================================
-- 5. TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION public.update_client_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_client_records_updated_at ON public.client_records;

CREATE TRIGGER update_client_records_updated_at
  BEFORE UPDATE ON public.client_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_records_updated_at();

-- =============================================
-- 6. COMMENTS
-- =============================================
COMMENT ON TABLE public.client_records IS 'Client database for cold outreach tracking and relationship status';
COMMENT ON COLUMN public.client_records.client_id IS 'Auto-generated client identifier (CL-YYYY-00001)';
COMMENT ON COLUMN public.client_records.client_media IS 'Array of compressed media assets stored as JSON objects';
COMMENT ON COLUMN public.client_records.consultation_time_local IS 'Client local time as entered by manager';
COMMENT ON COLUMN public.client_records.consultation_time_bdt IS 'Converted Bangladesh time for internal scheduling';
