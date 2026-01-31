# Database Migration Guide
**Migration:** Add payment_transaction_id to course_enrollments
**Date:** February 1, 2026
**Status:** Ready to Apply

## 🎯 Purpose
Link course enrollments to payment transactions, enabling the complete enrollment flow:
- Track which payment led to each enrollment
- Activate pending enrollments when payments are approved
- Support both free and paid course enrollments

## 📋 Migration SQL

```sql
-- Add payment_transaction_id column to course_enrollments table
ALTER TABLE course_enrollments 
ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES payment_transactions(id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_payment ON course_enrollments(payment_transaction_id);

-- Comment for documentation
COMMENT ON COLUMN course_enrollments.payment_transaction_id IS 'Links enrollment to payment transaction for paid courses';
```

## 🚀 How to Apply

### Method 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the SQL above
5. Click **Run** (or press Ctrl+Enter)
6. Verify success message

### Method 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or apply specific migration
supabase migration up
```

### Method 3: Direct Database Connection

```bash
# Using psql (if you have direct database access)
psql "postgresql://[YOUR-CONNECTION-STRING]" -f supabase/migrations/20260201_add_payment_to_enrollments.sql
```

## ✅ Verification Steps

After applying the migration, verify it worked:

### 1. Check Column Exists

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'course_enrollments' 
  AND column_name = 'payment_transaction_id';
```

Expected result:
```
column_name              | data_type | is_nullable
-------------------------+-----------+-------------
payment_transaction_id   | uuid      | YES
```

### 2. Check Foreign Key Constraint

```sql
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'course_enrollments'
  AND kcu.column_name = 'payment_transaction_id';
```

### 3. Check Index Exists

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'course_enrollments'
  AND indexname = 'idx_enrollments_payment';
```

### 4. Test Query

```sql
-- This should run without errors
SELECT 
    e.id,
    e.user_id,
    e.course_id,
    e.status,
    e.payment_transaction_id,
    pt.amount,
    pt.status as payment_status
FROM course_enrollments e
LEFT JOIN payment_transactions pt ON e.payment_transaction_id = pt.id
LIMIT 5;
```

## 🔄 Rollback (If Needed)

If you need to undo this migration:

```sql
-- Drop the index
DROP INDEX IF EXISTS idx_enrollments_payment;

-- Drop the column (this will remove all data in this column!)
ALTER TABLE course_enrollments 
DROP COLUMN IF EXISTS payment_transaction_id;
```

⚠️ **Warning:** Rollback will delete any payment linkage data!

## 📊 Impact Assessment

### Before Migration
- Enrollments tracked separately from payments
- Manual linking required
- No automatic activation on payment approval

### After Migration
- Enrollments automatically linked to payments
- Pending enrollments activated when payment approved
- Complete audit trail of enrollment-payment relationship
- Support for free courses (NULL payment_transaction_id)

## 🎯 Next Steps After Migration

1. ✅ Verify all checks pass
2. ✅ Test enrollment flow:
   - Create a free course enrollment (payment_transaction_id should be NULL)
   - Create a paid course enrollment (should create pending enrollment)
   - Approve the payment (enrollment should activate)
3. ✅ Monitor logs for any errors
4. ✅ Update existing enrollments if needed (see Data Migration section)

## 📝 Data Migration (Optional)

If you have existing enrollments without payment linkage and want to link them:

```sql
-- Link existing enrollments to their payments (if identifiable)
UPDATE course_enrollments e
SET payment_transaction_id = pt.id
FROM payment_transactions pt
WHERE e.user_id = pt.user_id
  AND e.course_id = pt.course_id
  AND pt.purchase_type = 'course'
  AND pt.status = 'approved'
  AND e.payment_transaction_id IS NULL
  AND e.enrolled_at >= pt.created_at
  AND e.enrolled_at <= pt.created_at + INTERVAL '1 hour';

-- Check how many were updated
SELECT COUNT(*) as updated_enrollments
FROM course_enrollments
WHERE payment_transaction_id IS NOT NULL;
```

## 🔐 Security Notes

- Column allows NULL (free courses don't have payment transactions)
- Foreign key constraint ensures referential integrity
- Index improves query performance
- RLS policies should already be in place for course_enrollments table

## 📞 Support

If you encounter any issues:
1. Check Supabase logs for detailed error messages
2. Verify payment_transactions table exists and has proper structure
3. Ensure you have sufficient permissions (service_role or postgres role)
4. Contact database administrator if errors persist

---

**Status:** ⏳ Pending Application
**Required:** Yes (for Phase 1 & 2 to work correctly)
**Risk Level:** Low (additive change, doesn't modify existing data)
