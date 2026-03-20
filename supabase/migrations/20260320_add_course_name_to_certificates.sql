-- Add course_name column to certificates table for proper display
-- This denormalizes the course name so we don't need joins or Sanity lookups

ALTER TABLE certificates ADD COLUMN IF NOT EXISTS course_name VARCHAR(255);

-- Update any existing certificates with course_id as fallback (if Sanity data isn't available)
-- In production, run a separate script to fetch from Sanity and update these
UPDATE certificates 
SET course_name = 'Course' 
WHERE course_name IS NULL AND course_name != '';

-- Make course_name non-nullable going forward
ALTER TABLE certificates 
ALTER COLUMN course_name SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN certificates.course_name IS 'Denormalized course name for fast display (fetched from Sanity at certificate generation time)';
