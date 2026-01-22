# Database Migration Guide

## Overview
This guide will help you apply the database migrations to your Supabase project.

## Prerequisites
- Supabase project created
- Supabase credentials (URL and Service Role Key)
- Node.js installed

## Migration Files
1. `001_rbac_system.sql` - Role-based access control (roles, users tables)
2. `002_testimonial_system.sql` - Testimonial system (testimonials, testimonial_links tables)
3. `003_payment_system.sql` - Payment system (payment_methods, payment_transactions, payment_verification_logs tables)
4. `20260121_education_platform.sql` - Education platform (courses, enrollments, certificates, etc.)

## Option 1: Apply via Supabase Dashboard (Recommended)

### Step 1: Access SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Apply Migrations in Order

#### Migration 1: RBAC System
1. Open `supabase/migrations/001_rbac_system.sql`
2. Copy the entire file content
3. Paste into SQL Editor
4. Click "Run" button
5. Verify: Check if `roles` and `users` tables are created in Table Editor

#### Migration 2: Testimonial System
1. Open `supabase/migrations/002_testimonial_system.sql`
2. Copy the entire file content
3. Paste into SQL Editor
4. Click "Run" button
5. Verify: Check if `testimonials` and `testimonial_links` tables are created

#### Migration 3: Payment System
1. Open `supabase/migrations/003_payment_system.sql`
2. Copy the entire file content
3. Paste into SQL Editor
4. Click "Run" button
5. Verify: Check if `payment_methods`, `payment_transactions`, and `payment_verification_logs` tables are created
6. Verify: Check if 4 initial payment methods are inserted (Bank Transfer, bKash, Nagad, Rocket)

#### Migration 4: Education Platform
1. Open `supabase/migrations/20260121_education_platform.sql`
2. Copy the entire file content
3. Paste into SQL Editor
4. Click "Run" button
5. Verify: Check if course-related tables are created

### Step 3: Verify Row Level Security (RLS)
1. Go to "Authentication" → "Policies" in Supabase Dashboard
2. Verify policies are enabled for all tables
3. Check that policies match migration files

### Step 4: Test Initial Data
Run this query in SQL Editor to verify payment methods:
```sql
SELECT * FROM payment_methods WHERE is_active = true ORDER BY display_order;
```

You should see 4 payment methods: Bank Transfer, bKash, Nagad, Rocket.

## Option 2: Apply via Supabase CLI

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 4: Apply Migrations
```bash
# Apply all migrations
supabase db push

# Or apply specific migration
supabase db push --file supabase/migrations/001_rbac_system.sql
supabase db push --file supabase/migrations/002_testimonial_system.sql
supabase db push --file supabase/migrations/003_payment_system.sql
supabase db push --file supabase/migrations/20260121_education_platform.sql
```

## Option 3: Apply via Node.js Script

### Step 1: Create .env.local
Create a `.env.local` file with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 2: Run Migration Script
```bash
node scripts/apply-migrations.js
```

## Verification Checklist

After applying migrations, verify:

### Tables Created
- [ ] `roles` table exists
- [ ] `users` table exists
- [ ] `testimonials` table exists
- [ ] `testimonial_links` table exists
- [ ] `payment_methods` table exists
- [ ] `payment_transactions` table exists
- [ ] `payment_verification_logs` table exists
- [ ] Course-related tables exist (courses, course_enrollments, etc.)

### RLS Policies
- [ ] Users can read own data
- [ ] Admins can manage all data
- [ ] CEO can manage payment methods
- [ ] Managers can approve payments
- [ ] Testimonials have approval workflow

### Triggers
- [ ] Payment timestamp trigger works
- [ ] Payment status change logging trigger works
- [ ] Testimonial timestamp trigger works

### Initial Data
- [ ] 4 payment methods inserted (Bank Transfer, bKash, Nagad, Rocket)
- [ ] All payment methods are active
- [ ] Display order is correct

## Common Issues

### Issue: "relation already exists"
**Solution:** Table already exists. Skip that migration or drop the table first.

### Issue: "permission denied"
**Solution:** Make sure you're using the Service Role Key, not the Anon Key.

### Issue: RLS policies blocking queries
**Solution:** Verify policies are correct. Use Service Role Key to bypass RLS for testing.

### Issue: Foreign key constraint fails
**Solution:** Apply migrations in order (001, 002, 003, education).

## Rollback

If you need to rollback migrations:

### Drop Payment System
```sql
DROP TABLE IF EXISTS payment_verification_logs CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP FUNCTION IF EXISTS update_payment_timestamp CASCADE;
DROP FUNCTION IF EXISTS log_payment_status_change CASCADE;
```

### Drop Testimonial System
```sql
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS testimonial_links CASCADE;
DROP FUNCTION IF EXISTS update_testimonial_timestamp CASCADE;
```

### Drop RBAC System (WARNING: Will affect all features)
```sql
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
```

## Next Steps

After successful migration:
1. Create initial CEO user via scripts/setup-ceo.js
2. Test authentication flow
3. Test payment submission
4. Test testimonial submission
5. Run production build: `npm run build`

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard
2. Verify environment variables in .env.local
3. Ensure all migrations applied in order
4. Check RLS policies are not too restrictive
