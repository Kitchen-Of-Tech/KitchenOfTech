-- BootKot Bootcamp Registrations
-- Stores participant registrations submitted via the bootcamp registration form.
-- Replaces the Google Sheets integration (API keys cannot write to Sheets; OAuth2 required).

CREATE TABLE IF NOT EXISTS public.bootcamp_registrations (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ   NOT NULL    DEFAULT NOW(),

  -- Bootcamp reference
  bootcamp_id         TEXT          NOT NULL,
  bootcamp_name       TEXT          NOT NULL,

  -- Participant details (mirror the BootcampRegistration type in types/index.ts)
  name                TEXT          NOT NULL,
  date_of_birth       DATE          NOT NULL,
  occupation          TEXT          NOT NULL,
  institute           TEXT,
  phone_number        TEXT          NOT NULL,
  whatsapp_number     TEXT          NOT NULL,
  email               TEXT          NOT NULL,
  interests           TEXT,
  registration_reason TEXT          NOT NULL,

  -- Workflow status
  status              TEXT          NOT NULL    DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted'))
);

-- Index for fast lookups by bootcamp and email
CREATE INDEX IF NOT EXISTS idx_bootcamp_registrations_bootcamp_id
  ON public.bootcamp_registrations (bootcamp_id);

CREATE INDEX IF NOT EXISTS idx_bootcamp_registrations_email
  ON public.bootcamp_registrations (email);

-- Prevent duplicate registrations for the same email + bootcamp
CREATE UNIQUE INDEX IF NOT EXISTS uq_bootcamp_registrations_email_bootcamp
  ON public.bootcamp_registrations (bootcamp_id, lower(email));

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.bootcamp_registrations ENABLE ROW LEVEL SECURITY;

-- Service-role (server-side API) has full access (bypasses RLS by default).
-- Authenticated dashboard users (staff) can read all registrations.
CREATE POLICY "Staff can read registrations"
  ON public.bootcamp_registrations
  FOR SELECT
  TO authenticated
  USING (true);

-- No public INSERT allowed via PostgREST — the API route uses service_role key.
-- No public UPDATE/DELETE — staff mutations go through the API route too.
