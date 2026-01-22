# 🚨 URGENT: Apply Missing Migration

## Problem
When you click "Approve" on a testimonial, you get this error:
```
Could not find the 'service_name' column of 'testimonials' in the schema cache
```

## Root Cause
The `service_name` column was never added to the `testimonials` table.

## Solution: Apply Migration 005

### ✅ Step-by-Step Instructions:

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Copy the Migration SQL**
   - Open file: `supabase/migrations/005_add_testimonial_service_category.sql`
   - Copy the ENTIRE contents (it's short, just 3 SQL statements)

4. **Paste and Run**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for the success message

5. **Verify**
   - You should see: "Success. No rows returned"
   - This is normal for ALTER TABLE statements

6. **Test**
   - Go back to your testimonials dashboard
   - Try approving a testimonial again
   - It should now work!

---

## 📋 The SQL You Need to Run:

```sql
-- Add service_name column to testimonials table for categorization
-- This allows CEO/Manager to categorize testimonials by service type when approving

ALTER TABLE public.testimonials
ADD COLUMN IF NOT EXISTS service_name TEXT;

-- Create index for better filtering by service
CREATE INDEX IF NOT EXISTS idx_testimonials_service_name ON public.testimonials(service_name);

-- Add comment
COMMENT ON COLUMN public.testimonials.service_name IS 'Service category assigned when testimonial is approved (e.g., Web Development, Mobile Development, UI/UX Design, etc.)';
```

---

## 🔄 What This Does:

1. **Adds `service_name` column** to the `testimonials` table
2. **Creates an index** for fast filtering by service category
3. **Adds documentation** comment to the column

---

## ✅ After Applying:

Your testimonial approval flow will work:
1. Click "Approve" on a testimonial
2. Select a service category from the modal
3. Click "Approve" to confirm
4. The testimonial is approved with the selected `service_name`

---

## 🆘 Troubleshooting:

### If you still get errors after applying:
1. **Clear Supabase cache**: In Supabase Dashboard, go to Settings → API → Click "Restart API"
2. **Refresh your app**: Hard refresh (Ctrl+F5) in your browser
3. **Check the column exists**: Run this query in Supabase SQL Editor:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'testimonials' AND column_name = 'service_name';
   ```
   You should see one row returned with `service_name` and `text` type.

---

## 📊 Migration Status:

- ✅ Migration 006 (service_categories table) - APPLIED
- ❌ Migration 005 (service_name column) - **NEEDS TO BE APPLIED** ← You are here
