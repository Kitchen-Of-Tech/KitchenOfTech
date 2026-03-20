# Certificate System Audit Report
**Date**: March 20, 2026  
**Scope**: UI, API Routes, Database Schema  
**Status**: ⚠️ **CRITICAL ISSUES FOUND**

---

## Executive Summary

The certificate system has **5 critical architectural issues** and **2 security concerns** that need immediate attention. The frontend is out of sync with the database, eligibility checking logic is inconsistent, and the public verification page lacks course name resolution.

---

## 🔴 CRITICAL ISSUES

### 1. **Mismatch Between Frontend Verification Page and Actual System**

**Severity**: 🔴 CRITICAL  
**Location**: `app/certificate-verify/page.tsx` vs actual certificate flow

**Problem**:
- The `/certificate-verify` page uses a **hardcoded demo database** with test certificates (`KOT-2024-WD-001`, etc.)
- It has a **fake 1.5-second timeout** simulating an API call but never actually calls any real API
- The demo certificates include fields that **don't exist in the database** (e.g., `grade`, `skills`, `validUntil`)
- This is a **completely non-functional public-facing page** pretending to verify real certificates

**Database Reality**:
- Real certificates stored in `certificates` table only have: `certificate_id`, `student_name`, `issue_date`, `course_id`, `enrollment_id`, `user_id`
- No `grade`, `validUntil`, `instructor`, or `skills` fields in schema

**Impact**:
- Users see completely fake verification page
- No actual certificate lookup happens
- Could damage brand credibility when users try to verify actual certificates

**Recommendation**:
- Replace demo implementation with real API call to `/api/education/certificate/check?certificateId=...`
- Connect to actual database certificates
- Show actual course name from Sanity

---

### 2. **Missing Course Name in Certificate Database**

**Severity**: 🔴 CRITICAL  
**Location**: Database schema + PDF generation + verification pages

**Problem**:
- `certificates` table has `course_id` (string) but **no `course_name` field**
- `course_id` is just a reference string with no foreign key constraint
- When generating PDFs or displaying certificates, `courseName` is **hardcoded to "Course Name"**
- Certificate verification page shows "Course Name" placeholder instead of actual course

**Affected Code**:
```typescript
// app/api/education/certificate/pdf/route.ts line 59
const courseName = "Course Name"; // TODO: Fetch from Sanity

// app/education/verify-certificate/[slug]/page.tsx line 50
const courseName = "Course Name"; // TODO: Fetch from Sanity using enrollment?.course_id
```

**Database Issue**:
```sql
-- certificates table missing course_name denormalization
-- Only has: course_id VARCHAR(255) NOT NULL
-- Should have: course_name VARCHAR(255) NOT NULL for display
```

**Impact**:
- All generated PDFs show generic "Course Name"
- Certificate records are incomplete
- Verification pages lack context

**Recommendation**:
1. Add migration: `ALTER TABLE certificates ADD COLUMN course_name VARCHAR(255);`
2. Update certificate generation to fetch course name from Sanity and store it
3. Update PDF generation to use stored `course_name` instead of placeholder
4. Backfill existing certificates with course names

---

### 3. **Inconsistent Eligibility Logic Between API and Database Function**

**Severity**: 🔴 CRITICAL  
**Location**: `app/api/education/certificate/check/route.ts` vs `supabase/migrations/20260201_fix_certificate_eligibility.sql`

**Problem**:
- Two completely different eligibility checks exist:
  - **API endpoint** (`check/route.ts`): Implements custom eligibility logic in TypeScript
  - **Database function** (`check_certificate_eligibility`): Implements different logic in PL/pgSQL
- They use **different thresholds and criteria**

**API Logic** (check/route.ts):
```typescript
// Line 80-86: Checks if ANY quiz exists and passes, OR if NO quizzes exist at all
const allQuizzesPassed = quizzesPassed 
  ? Object.values(quizzesPassed).every(passed => passed)
  : true; // If no quizzes, consider as passed ✓ Lenient

// Line 92: Assignments must be marked "completed"
const allAssignmentsCompleted = assignments?.every(a => a.completed) ?? true;
```

**Database Function** (`20260201_fix_certificate_eligibility.sql`):
```sql
-- Line 51-54: Uses 70% threshold for quizzes
v_quizzes_passed := (v_total_quizzes = 0) OR (v_total_quizzes = v_passed_quizzes);
-- where passed = score >= 70

-- Line 62-68: Assignments must be graded AND >= 70%
v_assignments_complete := (v_total_assignments = 0) OR (v_total_assignments = v_graded_assignments);
-- where status='graded' AND grade_percentage >= 70
```

**Discrepancies**:
1. **Quiz threshold**: API has no threshold (any pass = pass), Database requires 70%
2. **Assignment criteria**: API checks `completed` boolean, Database checks `status='graded'` + `grade_percentage >= 70`
3. **No quiz requirement**: Both allow 0 quizzes to pass, but API's logic is more lenient

**Impact**:
- Certificate eligibility is unpredictable
- Users might be eligible via API but ineligible via function
- Generates API is called but RPC function is used elsewhere

**Recommendation**:
1. **Standardize**: Choose ONE source of truth
   - **Option A**: Use database function everywhere (more trustworthy, server-side)
   - **Option B**: Remove function, use API logic only
2. **Preferred**: Option A — move all eligibility checks to database RPC
3. Define clear requirements:
   - All videos completed: Yes/No
   - ALL quizzes attempted with 70%+ pass rate
   - ALL assignments graded with 70%+ score
   - Reject if any are 0 (if they're marked as required)

---

### 4. **Public Certificate Verification Lacks Proper Authentication/Authorization**

**Severity**: 🔴 CRITICAL (Security)  
**Location**: Database RLS policy + API routes + verification pages

**Problem**:
```sql
-- supabase/migrations/20260121_education_platform.sql line 281
CREATE POLICY "Certificates are publicly viewable" ON certificates FOR SELECT USING (true);
```

- **ANY user** (authenticated or not) can view **ANY certificate** by certificate ID
- The `/education/verify-certificate/[slug]` page is **completely public** with no auth
- No audit trail of who viewed which certificate
- No rate limiting (could be scraped for student names + course completions)

**While transparency is good**, there should be:
- Optional opt-in for public visibility (certificate holder chooses)
- Access logging for sensitive education records
- Rate limiting on certificate lookups

**Database Query** (`verify-certificate/[slug]/page.tsx`):
```typescript
const { data: certificate, error } = await supabase
  .from("certificates")
  .select("*")
  .eq("certificate_id", certificateId)  // UUID is the public key — completely guessable
  .single();
```

**Impact**:
- Any certificate can be viewed by anyone knowing the ID
- Student privacy not protected (full name + course info exposed)
- Potential for scraping all certificates if IDs are sequential

**Recommendation**:
1. Add `is_public` boolean field to certificates table (default: false)
2. Update RLS policy to respect `is_public` flag
3. Add logging for certificate views (audit trail)
4. Rate limit certificate lookup endpoint (max 100/hour per IP)
5. Use UUIDs instead of sequential numeric IDs where possible

---

### 5. **PDF Generation Route Uses Deprecated Query Pattern**

**Severity**: 🟡 MEDIUM  
**Location**: `app/api/education/certificate/pdf/route.ts` line 15-26

**Problem**:
```typescript
const { data: certificate, error: certError } = await supabase
  .from("certificates")
  .select(`
    *,
    course_enrollments (
      course_id
    )
  `)
  .eq("certificate_id", certificateId)  // ← Querying by certificate_id, not ID
  .single();
```

**Issues**:
1. Queries by `certificate_id` (text field) instead of `id` (UUID primary key) — inefficient
2. Includes course_enrollments join but never uses it
3. `course_enrollments` selection would fail (foreign key reference not configured in Supabase)
4. Query doesn't include necessary fields like `student_name`, `issue_date`

**Impact**:
- PDF generation may be slow or error out silently
- Joined data is fetched but never used (wasted query)

**Recommendation**:
```typescript
// Better approach
const { data: certificate, error: certError } = await supabase
  .from("certificates")
  .select("id, certificate_id, student_name, issue_date, course_id, user_id, enrollment_id")
  .eq("certificate_id", certificateId)
  .single();

// Then separately fetch course from Sanity if needed
```

---

## 🟡 SECURITY ISSUES

### 6. **Certificate ID Generation Not Cryptographically Unique**

**Severity**: 🟡 MEDIUM  
**Location**: `app/api/education/certificate/generate/route.ts` line 64-66

**Current Implementation**:
```typescript
const timestamp = Date.now();
const random = Math.random().toString(36).substring(2, 8).toUpperCase();
const certificateId = `KOT-${new Date().getFullYear()}-${random}-${timestamp.toString().slice(-4)}`;
```

**Problems**:
1. `Math.random()` is **not cryptographically secure**
2. Only 6 chars of base-36 random = ~36^6 ≈ 2.6B possibilities (weak)
3. Timestamp includes millisecond precision (predictable)
4. **Could allow certificate forgery** if patterns are guessable

**Example weak IDs**:
- `KOT-2026-ABCD12-3456`
- `KOT-2026-EFGH78-3457`

**Recommendation**:
```typescript
// Use crypto for secure random
import { randomBytes } from 'crypto';

const random = randomBytes(8).toString('hex').toUpperCase();
const certificateId = `KOT-${new Date().getFullYear()}-${random}`;
// Result: KOT-2026-A1B2C3D4E5F6G7H8 (128-bit entropy)
```

---

### 7. **Admin Client Used for Public Queries**

**Severity**: 🟡 MEDIUM  
**Location**: `app/api/education/certificate/pdf/route.ts` line 24, `app/education/verify-certificate/[slug]/page.tsx` line 26

**Problem**:
```typescript
// PDF route - no auth, uses admin client
const supabase = createAdminClient();

// Verification page - no auth, uses admin client
const supabase = createAdminClient();
```

- Public routes should use **anon client** with RLS
- Admin client bypasses RLS entirely
- Anyone could exploit this if the endpoint is public

**Recommendation**:
1. PDF route: Should be accessed only by certificate owner OR via anon client with proper RLS
2. Verification page: Use anon client to respect public_certificates RLS policy
3. Keep admin client use limited to admin operations

---

## 🟠 FUNCTIONAL ISSUES

### 8. **Certificate Issue Date vs Created At Mismatch**

**Severity**: 🟠 LOW  
**Location**: Database schema

**Problem**:
- Table has both `issued_at` and uses `created_at` separately
- API generates certificates with `issue_date: new Date().toISOString()`
- Schema says `issued_at TIMESTAMPTZ DEFAULT NOW()`
- Inconsistency in field naming (issue_date vs issued_at)

**Database Schema** (line 159):
```sql
CREATE TABLE certificates (
    -- ...
    issued_at TIMESTAMPTZ DEFAULT NOW(),  // ← Server default
    -- ...
);
```

**API Code** (generate/route.ts line 107):
```typescript
issue_date: new Date().toISOString(),  // ← Different field name!
```

**Recommendation**:
- Use consistent field name throughout: either `issued_at` or `issue_date`
- Let database handle timestamp with `DEFAULT NOW()`
- Don't pass `new Date().toISOString()` from API

---

### 9. **Missing Indexes for Common Queries**

**Severity**: 🟠 LOW  
**Location**: Database schema

**Problem**:
- Queries filter by `certificate_id` but index on `certificate_id` is duplicated
- No index on `enrollment_id` (filtered in many queries)
- No compound index on `(user_id, enrollment_id)` for common joins

**Missing Indexes**:
```sql
-- Currently has duplicate:
-- CREATE INDEX idx_certificates_certificate_id ON certificates(certificate_id);

-- Should add:
CREATE INDEX IF NOT EXISTS idx_certificates_enrollment ON certificates(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_enrollment ON certificates(user_id, enrollment_id);
```

**Impact**: Query performance for certificate lookups

**Recommendation**:
- Add indexes on `enrollment_id` and composite `(user_id, enrollment_id)`
- Remove duplicate `certificate_id` index

---

### 10. **Missing Course Name in Email Notifications**

**Severity**: 🟠 LOW  
**Location**: `app/api/education/certificate/generate/route.ts` line 153

**Problem**:
```typescript
await sendCertificateEmail({
  userName: studentName,
  userEmail: user.email!,
  courseName: "Course", // ← Hardcoded placeholder!
  certificateId: certificateId,
  certificateUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/...`,
});
```

- Email notification includes generic "Course" name
- Should fetch actual course title from Sanity

**Recommendation**:
- Fetch course details from Sanity using `enrollment.course_id`
- Pass actual course name to email function

---

## 📊 AUDIT SUMMARY TABLE

| # | Issue | Severity | Category | Fix Effort |
|---|-------|----------|----------|-----------|
| 1 | Frontend verification page uses demo data | 🔴 CRITICAL | UI | Medium |
| 2 | Missing course_name in database | 🔴 CRITICAL | Schema | Medium |
| 3 | Inconsistent eligibility logic | 🔴 CRITICAL | Logic | High |
| 4 | Public certificate viewing no rate limit | 🔴 CRITICAL | Security | Low |
| 5 | PDF route query inefficient | 🟡 MEDIUM | Perf | Low |
| 6 | Weak certificate ID generation | 🟡 MEDIUM | Security | Low |
| 7 | Admin client for public queries | 🟡 MEDIUM | Security | Low |
| 8 | Date field naming inconsistency | 🟠 LOW | Consistency | Low |
| 9 | Missing database indexes | 🟠 LOW | Perf | Low |
| 10 | Hardcoded course name in email | 🟠 LOW | Email | Low |

---

## 🚨 PRIORITY ACTION ITEMS

### Phase 1: Fix Critical Issues (Do First)
1. **Replace demo verification page** with real implementation
2. **Add course_name to certificates table** (migration + backfill)
3. **Unify eligibility logic** (choose API or DB function as source of truth)
4. **Add rate limiting** to public certificate lookup

### Phase 2: Fix Security Issues (Do Soon)
5. Improve certificate ID generation (use crypto)
6. Fix admin client usage on public routes
7. Add audit logging for certificate views

### Phase 3: Fix Functional Issues (Nice to Have)
8. Standardize date field names
9. Add missing database indexes
10. Fix hardcoded course names in emails

---

## 📝 NOTES

- The `/app/certificate-verify/page.tsx` appears to be a **demo/placeholder** and should not be live
- The actual certificate generation system (`/api/education/certificate/*`) is more robust
- Consider whether certificates should have **lifetime validity** or expiration dates
- No current way for certificate holders to revoke or update certificates

---

## ✅ What's Working Well

- ✓ Certificate generation creates proper database records
- ✓ Authentication checks on API routes (user can only generate their own)
- ✓ Enrollment ownership validation
- ✓ RLS policies on most tables
- ✓ PDF generation with decorative design

---

## 🔄 Recommended Next Steps

1. Create task to fix issue #1 (replace demo page)
2. Create migration for issue #2 (add course_name column)
3. Audit and consolidate eligibility logic (issue #3)
4. Add rate limiting middleware for public routes (issue #4)

