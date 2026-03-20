-- Add Missing Certificate Columns
-- Date: March 20, 2026
-- Purpose: Add credential_code, level, grade, institution, instructor_notes, and issue_date columns

BEGIN;

-- Add credential_code column (unique)
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS credential_code VARCHAR(100) UNIQUE;

-- Add level column
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS level VARCHAR(100);

-- Add issue_date column (migrate from issued_at if needed)
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS issue_date TIMESTAMPTZ DEFAULT NOW();

-- Add valid_until column (already exists, so this is just for documentation)
-- ALTER TABLE certificates ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;

-- Add grade column (replaces final_score)
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS grade DECIMAL(5,2) CHECK (grade >= 0 AND grade <= 100);

-- Add institution column
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS institution VARCHAR(255);

-- Add instructor_notes column
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS instructor_notes TEXT;

-- Migrate data from issued_at to issue_date if needed
UPDATE certificates 
SET issue_date = issued_at 
WHERE issue_date IS NULL AND issued_at IS NOT NULL;

-- Migrate data from final_score to grade if needed
UPDATE certificates 
SET grade = final_score 
WHERE grade IS NULL AND final_score IS NOT NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_certificates_credential_code 
  ON certificates(credential_code);

CREATE INDEX IF NOT EXISTS idx_certificates_level 
  ON certificates(level);

CREATE INDEX IF NOT EXISTS idx_certificates_issue_date 
  ON certificates(issue_date DESC);

CREATE INDEX IF NOT EXISTS idx_certificates_grade 
  ON certificates(grade DESC);

-- Add comments for documentation
COMMENT ON COLUMN certificates.credential_code IS 'Unique credential code issued to certificate holder';
COMMENT ON COLUMN certificates.level IS 'Certificate level (Beginner, Intermediate, Advanced, Master)';
COMMENT ON COLUMN certificates.issue_date IS 'Date certificate was issued';
COMMENT ON COLUMN certificates.grade IS 'Final grade/score (0-100)';
COMMENT ON COLUMN certificates.institution IS 'Issuing institution';
COMMENT ON COLUMN certificates.instructor_notes IS 'Instructor notes about certificate holder';

COMMIT;
