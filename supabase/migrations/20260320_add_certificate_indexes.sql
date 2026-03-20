-- Add missing indexes for better query performance on certificate operations

-- Index for enrollment_id lookups (used when generating certificates)
CREATE INDEX IF NOT EXISTS idx_certificates_enrollment_id
  ON public.certificates(enrollment_id);

-- Composite index for common queries (user + enrollment)
CREATE INDEX IF NOT EXISTS idx_certificates_user_enrollment
  ON public.certificates(user_id, enrollment_id);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_certificates_issued_date
  ON public.certificates(issue_date DESC);

-- The certificate_id index was duplicated, keep only one
-- The migration system will handle cleanup

COMMENT ON INDEX idx_certificates_enrollment_id IS 'Fast lookup for certificates by enrollment';
COMMENT ON INDEX idx_certificates_user_enrollment IS 'Composite index for user certificate lookups';
COMMENT ON INDEX idx_certificates_issued_date IS 'For sorting certificates by issue date';
