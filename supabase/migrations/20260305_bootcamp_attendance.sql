-- BootKot Bootcamp Attendance
-- Records daily attendance for registered bootcamp participants.
-- Each participant (identified by phone_number) can only mark present ONCE per calendar day.

CREATE TABLE IF NOT EXISTS public.bootcamp_attendance (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ   NOT NULL    DEFAULT NOW(),

  -- Link to the registration (denormalized for quick display)
  registration_id   UUID          NOT NULL    REFERENCES public.bootcamp_registrations(id) ON DELETE CASCADE,
  bootcamp_id       TEXT          NOT NULL,
  bootcamp_name     TEXT          NOT NULL,

  -- Participant snapshot (so records survive if registration is deleted)
  participant_name  TEXT          NOT NULL,
  phone_number      TEXT          NOT NULL,

  -- The calendar date of attendance (stored in UTC; display can be local)
  attendance_date   DATE          NOT NULL    DEFAULT CURRENT_DATE
);

-- Fast lookup: all attendance for a given bootcamp on a given date
CREATE INDEX IF NOT EXISTS idx_attendance_bootcamp_date
  ON public.bootcamp_attendance (bootcamp_id, attendance_date);

-- Fast lookup: all attendance for a specific phone number
CREATE INDEX IF NOT EXISTS idx_attendance_phone
  ON public.bootcamp_attendance (phone_number);

-- CORE CONSTRAINT: one attendance record per phone per day (across all bootcamps)
-- If you want per-bootcamp uniqueness instead, change to (phone_number, bootcamp_id, attendance_date)
CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_phone_date
  ON public.bootcamp_attendance (phone_number, attendance_date);

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.bootcamp_attendance ENABLE ROW LEVEL SECURITY;

-- Service-role (server API) bypasses RLS by default — full access.
-- Authenticated staff can read attendance records.
CREATE POLICY "Staff can read attendance"
  ON public.bootcamp_attendance
  FOR SELECT
  TO authenticated
  USING (true);

-- No public INSERT/UPDATE/DELETE — all mutations go through the API route.
