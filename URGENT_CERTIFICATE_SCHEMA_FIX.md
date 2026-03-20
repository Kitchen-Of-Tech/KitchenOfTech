# ⚠️ URGENT: Certificate Schema Missing Columns

## Problem

The database is missing the following columns that the API code expects:
- `credential_code` 
- `level`
- `grade` (maps to existing `final_score`)
- `institution`
- `instructor_notes`
- `issue_date` (maps to existing `issued_at`)

**Error Message**: `Could not find the 'credential_code' column of 'certificates' in the schema cache`

## Solution

You have two options to fix this:

### ✅ Option 1: Use Supabase Dashboard (Recommended - 2 minutes)

1. Go to: https://app.supabase.com/
2. Log in and select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query** (or paste in the editor)
5. Copy and paste ALL of this SQL:

```sql
-- Add missing certificate columns
BEGIN;

-- Add credential_code column (unique)
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS credential_code VARCHAR(100) UNIQUE;

-- Add level column
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS level VARCHAR(100);

-- Add issue_date column
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS issue_date TIMESTAMPTZ DEFAULT NOW();

-- Add grade column
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
```

6. Click **Run** (or press Ctrl+Enter)
7. Wait for it to complete (should show "✓" next to the query)
8. Go back to terminal and try inserting certificates again

### ⚠️ Option 2: Use Terminal (if Option 1 doesn't work)

If you have `psql` installed locally:

```powershell
# Set your Supabase credentials
$env:PGHOST = "ejrnlhymgnhrghutevch.supabase.co"
$env:PGPORT = "5432"
$env:PGUSER = "postgres"
$env:PGPASSWORD = "<your_postgres_password>"
$env:PGDATABASE = "postgres"

# Run the SQL file
psql -f .\supabase\migrations\20260320_fix_certificate_schema.sql
```

## After Applying the Migration

1. **Test the API**:
```bash
# Try inserting a certificate
curl -X POST http://localhost:3000/api/dashboard/certificates/single-insert \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "John Doe",
    "courseName": "Web Development",
    "credentialCode": "WEB-DEV-2024-001",
    "level": "Advanced"
  }'
```

2. **Rebuild the Next.js app**:
```bash
npx next build
```

3. **Verify it works**:
```bash
npm run dev
```

## Verification Checklist

- [ ] Logged into Supabase dashboard
- [ ] Ran SQL query successfully
- [ ] No error messages
- [ ] New columns appear in database schema
- [ ] Certificate insertion works
- [ ] Build completes: 102/102 pages

## Database Schema After Migration

The certificates table will have these columns:

**Existing Columns**:
- id (UUID) - primary key
- certificate_id (VARCHAR) - system generated (KOT-2026-...)
- enrollment_id (UUID) - optional reference
- user_id (UUID) - optional reference
- course_id (VARCHAR)
- student_name (VARCHAR)
- course_name (VARCHAR)
- instructor_name (VARCHAR)
- issued_at (TIMESTAMPTZ)
- valid_until (TIMESTAMPTZ)
- final_score (DECIMAL)
- skills (TEXT[])
- certificate_url (TEXT)

**NEW Columns Added**:
- credential_code (VARCHAR) ✨ **NEW** - unique credential code
- level (VARCHAR) ✨ **NEW** - proficiency level
- issue_date (TIMESTAMPTZ) ✨ **NEW** - when certificate was issued
- grade (DECIMAL) ✨ **NEW** - final grade (0-100)
- institution (VARCHAR) ✨ **NEW** - issuing institution
- instructor_notes (TEXT) ✨ **NEW** - instructor comments

## API Endpoints That Now Work

After migration, these endpoints will work:

```
POST /api/dashboard/certificates/single-insert
POST /api/dashboard/certificates/batch-insert
POST /api/dashboard/certificates/csv-import
GET /api/education/certificate/verify-by-credential
```

## Issues?

If you get an error:

1. **"Already exists"** → Normal, columns already exist (skip)
2. **"Permission denied"** → Use service role key, not anon key
3. **"Cannot connect"** → Check Supabase URL and credentials in .env.local

## Next Steps

After applying the migration:

1. ✅ Test certificate insertion via API
2. ✅ Rebuild Next.js (`npx next build`)
3. ✅ Run the development server (`npm run dev`)
4. ✅ Test creating certificates in the dashboard
5. ✅ Deploy to production

---

**Status**: 🔴 **BLOCKING** - Migration required before certificate operations work
**Time to Fix**: ⏱️ 2-5 minutes via Supabase dashboard
**Difficulty**: 🟢 **EASY** - Copy/paste SQL in dashboard
