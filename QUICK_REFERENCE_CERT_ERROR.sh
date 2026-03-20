#!/usr/bin/env bash
# Quick reference card for certificate schema error

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════════╗
║         CERTIFICATE SCHEMA ERROR - QUICK REFERENCE              ║
╚═══════════════════════════════════════════════════════════════════╝

🔴 ERROR
   Could not find the 'credential_code' column of 'certificates' 
   in the schema cache

🎯 CAUSE
   Database is missing 6 columns that API expects

✅ SOLUTION (2-5 minutes)

   Step 1: Go to Supabase Dashboard
   ───────────────────────────────────
   https://app.supabase.com/
   → Sign in
   → Select KitchenOfTech project

   Step 2: Open SQL Editor
   ───────────────────────
   Left Sidebar → SQL Editor → New Query

   Step 3: Copy & Paste SQL
   ────────────────────────
   
   BEGIN;
   
   ALTER TABLE certificates 
   ADD COLUMN IF NOT EXISTS credential_code VARCHAR(100) UNIQUE;
   
   ALTER TABLE certificates 
   ADD COLUMN IF NOT EXISTS level VARCHAR(100);
   
   ALTER TABLE certificates 
   ADD COLUMN IF NOT EXISTS issue_date TIMESTAMPTZ DEFAULT NOW();
   
   ALTER TABLE certificates 
   ADD COLUMN IF NOT EXISTS grade DECIMAL(5,2) 
   CHECK (grade >= 0 AND grade <= 100);
   
   ALTER TABLE certificates 
   ADD COLUMN IF NOT EXISTS institution VARCHAR(255);
   
   ALTER TABLE certificates 
   ADD COLUMN IF NOT EXISTS instructor_notes TEXT;
   
   UPDATE certificates 
   SET issue_date = issued_at 
   WHERE issue_date IS NULL AND issued_at IS NOT NULL;
   
   UPDATE certificates 
   SET grade = final_score 
   WHERE grade IS NULL AND final_score IS NOT NULL;
   
   CREATE INDEX IF NOT EXISTS idx_certificates_credential_code 
     ON certificates(credential_code);
   
   CREATE INDEX IF NOT EXISTS idx_certificates_level 
     ON certificates(level);
   
   CREATE INDEX IF NOT EXISTS idx_certificates_issue_date 
     ON certificates(issue_date DESC);
   
   CREATE INDEX IF NOT EXISTS idx_certificates_grade 
     ON certificates(grade DESC);
   
   COMMIT;

   Step 4: Click Run
   ────────────────
   Button: [RUN] or Ctrl+Enter
   Wait for: ✓ Success

   Step 5: Verify
   ──────────────
   npx ts-node scripts/verify-certificate-schema.ts

   Expected Output:
   ✅ Certificate schema is correct!


📊 MISSING COLUMNS

   Column              Type                Purpose
   ──────────────────────────────────────────────────────
   credential_code     VARCHAR(100)        Unique credential code
   level               VARCHAR(100)        Proficiency level
   issue_date          TIMESTAMPTZ         When issued
   grade               DECIMAL(5,2)        Score 0-100
   institution         VARCHAR(255)        Issuing organization  
   instructor_notes    TEXT                Notes about holder


🧪 TEST AFTER FIX

   Terminal:
   $ npx ts-node scripts/verify-certificate-schema.ts
   
   Expected: "✅ Certificate schema is correct!"


🚀 AFTER SUCCESSFUL MIGRATION

   1. Start dev server:
      npm run dev

   2. Test API:
      curl -X POST http://localhost:3000/api/dashboard/certificates/single-insert \
        -H "Content-Type: application/json" \
        -d '{
          "studentName": "Test",
          "courseName": "Test",
          "credentialCode": "TEST-001",
          "level": "Beginner"
        }'

   3. Verify build:
      npx next build

   Expected: "Compiled successfully in Xs" + 102/102 pages


❓ ISSUES?

   Problem               Solution
   ─────────────────────────────────────────────────────
   "Already exists"      → OK! Skip it, run full SQL
   "Permission denied"   → Use service role key
   "Schema cache error"  → Wait 30s, refresh, retry
   Still same error      → Try manual method in docs


📚 DOCUMENTATION

   Read first:
   URGENT_CERTIFICATE_SCHEMA_FIX.md

   For details:
   MIGRATION_REQUIRED_CERTIFICATE_SCHEMA.md
   ROOT_CAUSE_CERTIFICATE_ERROR.md
   INVESTIGATION_SUMMARY_CERTIFICATE_ERROR.md


⏱️  TIME: 2-5 minutes
🟢 DIFFICULTY: Easy (copy/paste SQL)
✅ RESULT: All certificate APIs work


EOF
