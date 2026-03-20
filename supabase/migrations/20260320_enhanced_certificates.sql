-- Enhanced Certificate System - Add New Fields
-- Date: March 20, 2026
-- Purpose: Add comprehensive certificate fields for enhanced tracking

-- ========================================
-- 1. ADD NEW CERTIFICATE COLUMNS
-- ========================================

-- REQUIRED FIELDS
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS credential_code VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS level VARCHAR(100);

-- OPTIONAL FIELDS
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS grade DECIMAL(5,2) CHECK (grade >= 0 AND grade <= 100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS institution VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS instructor_notes TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS issue_date TIMESTAMPTZ DEFAULT NOW();

-- Update issue_date from issued_at if issued_at exists and issue_date is null
UPDATE certificates 
SET issue_date = issued_at 
WHERE issue_date IS NULL AND issued_at IS NOT NULL;

-- ========================================
-- 2. ADD INDEXES FOR NEW COLUMNS
-- ========================================

CREATE INDEX IF NOT EXISTS idx_certificates_credential_code 
  ON certificates(credential_code);

CREATE INDEX IF NOT EXISTS idx_certificates_level 
  ON certificates(level);

CREATE INDEX IF NOT EXISTS idx_certificates_valid_until 
  ON certificates(valid_until DESC);

CREATE INDEX IF NOT EXISTS idx_certificates_grade 
  ON certificates(grade DESC);

CREATE INDEX IF NOT EXISTS idx_certificates_issue_date 
  ON certificates(issue_date DESC);

-- ========================================
-- 3. ADD COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON COLUMN certificates.credential_code IS 'Unique credential/certificate code issued by institution';
COMMENT ON COLUMN certificates.level IS 'Certificate level (e.g., Beginner, Intermediate, Advanced, Master)';
COMMENT ON COLUMN certificates.valid_until IS 'Certificate expiration date (if applicable)';
COMMENT ON COLUMN certificates.grade IS 'Final grade/score achieved (0-100)';
COMMENT ON COLUMN certificates.institution IS 'Issuing institution or organization name';
COMMENT ON COLUMN certificates.instructor_notes IS 'Additional notes from instructor about this certificate';
COMMENT ON COLUMN certificates.issue_date IS 'Date when certificate was issued';

-- ========================================
-- 4. UPDATE CERTIFICATES TABLE COMMENT
-- ========================================

COMMENT ON TABLE certificates IS 'Course completion certificates with enhanced tracking for credentials, levels, grades, and institutional data';
