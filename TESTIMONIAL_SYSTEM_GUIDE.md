# Testimonial System - Complete Setup & Troubleshooting Guide

## 🎯 Overview
Complete testimonial management system with admin dashboard, public submission, and link generation.

---

## 📋 Current Issue: Dashboard Redirect

### Problem
When accessing `/dashboard/testimonials`, users are redirected back to `/dashboard`.

### Root Cause
The page checks if `user.role?.level > 2` and redirects non-admin users. Only CEO (level 1) and Manager (level 2) can access this page.

### Solution
**Check your current user's role level:**

```javascript
// Run this in browser console on dashboard page:
console.log('User role:', user?.role);
```

---

## 🔧 Complete Setup Steps

### Step 1: Apply Missing Migration

**Execute this SQL in Supabase Dashboard SQL Editor:**

```sql
-- Add is_verified column to testimonials table
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Create index for verified testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_verified ON public.testimonials(is_verified);

-- Update RLS policy to allow reading approved testimonials publicly
DROP POLICY IF EXISTS "Anyone can read approved testimonials" ON public.testimonials;

CREATE POLICY "Anyone can read approved testimonials"
  ON public.testimonials FOR SELECT
  USING (status = 'approved');
```

### Step 2: Verify Database Tables

Run this to check all testimonial tables exist:

```sql
-- Check testimonials table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'testimonials';

-- Check testimonial_links table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'testimonial_links';
```

Expected columns in `testimonials`:
- ✅ id (uuid)
- ✅ link_id (uuid, nullable)
- ✅ name (text)
- ✅ email (text)
- ✅ company (text, nullable)
- ✅ position (text, nullable)
- ✅ message (text)
- ✅ rating (integer)
- ✅ status (text)
- ✅ is_verified (boolean) ← NEW
- ✅ image_url (text, nullable)
- ✅ approved_by (uuid, nullable)
- ✅ approved_at (timestamptz, nullable)
- ✅ rejected_by (uuid, nullable)
- ✅ rejected_at (timestamptz, nullable)
- ✅ created_at (timestamptz)

---

## 🔌 API Endpoints

### 1. List Testimonials
```
GET /api/testimonials
GET /api/testimonials?status=pending
GET /api/testimonials?status=approved
GET /api/testimonials?status=rejected
```

**Response:**
```json
{
  "success": true,
  "testimonials": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Tech Corp",
      "position": "CEO",
      "message": "Great service!",
      "rating": 5,
      "status": "pending",
      "is_verified": false,
      "created_at": "2026-01-22T..."
    }
  ]
}
```

### 2. Submit Testimonial
```
POST /api/testimonials
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Tech Corp",
  "position": "CEO",
  "message": "Amazing experience! Highly recommended.",
  "rating": 5,
  "link_token": "optional-token-if-using-link",
  "image_url": "optional-profile-image-url"
}
```

### 3. Approve/Reject Testimonial
```
PATCH /api/testimonials/[id]
```

**Request Body:**
```json
{
  "action": "approve",  // or "reject"
  "user_id": "current-user-uuid"
}
```

### 4. Delete Testimonial
```
DELETE /api/testimonials/[id]?user_id=current-user-uuid
```

### 5. Generate Testimonial Link
```
POST /api/testimonials/links
```

**Request Body:**
```json
{
  "email": "client@example.com",
  "expires_in_days": 30,
  "user_id": "current-user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "link": {
    "id": "uuid",
    "token": "unique-token-string",
    "email": "client@example.com",
    "expires_at": "2026-02-22T...",
    "full_url": "https://yourdomain.com/testimonial/unique-token-string"
  }
}
```

---

## 🎨 Frontend Components

### 1. Admin Dashboard
**File:** `components/dashboard/TestimonialManagementClient.tsx`
**Route:** `/dashboard/testimonials`
**Access:** CEO & Manager only (role level ≤ 2)

**Features:**
- View all testimonials with status filters
- Search by name, email, or company
- Approve/reject testimonials
- Delete testimonials
- Real-time statistics

### 2. Testimonial Submission Form
**File:** `components/testimonial/TestimonialSubmitForm.tsx`
**Usage:** Can be embedded on any page or accessed via link

**Features:**
- 5-star rating system
- Validation (min 50 characters for message)
- Optional company and position
- Link token support for tracking

### 3. Testimonial Display
**File:** `components/testimonial/TestimonialDisplay.tsx`
**Usage:** Display approved testimonials publicly

**Features:**
- Shows only approved testimonials
- Verified badge support
- Responsive grid layout
- Rating stars display

### 4. Admin Testimonial Dashboard
**File:** `components/testimonial/AdminTestimonialDashboard.tsx`
**Alternative admin interface with enhanced features:**
- Bulk actions
- Advanced filtering
- Quick approve/reject buttons
- Verification toggle

---

## 🚨 Troubleshooting

### Issue 1: "Redirected to dashboard when accessing testimonials"

**Diagnosis:**
```javascript
// Check user role in browser console
const checkUserRole = async () => {
  const res = await fetch('/api/auth/user');
  const data = await res.json();
  console.log('User role level:', data.user?.role?.level);
  console.log('Can access testimonials:', data.user?.role?.level <= 2);
};
checkUserRole();
```

**Fix:**
- Ensure user has CEO (level 1) or Manager (level 2) role
- If user has higher level (3+), they cannot access this page
- Create a CEO/Manager user if needed using `scripts/setup-ceo.js`

### Issue 2: "is_verified column not found"

**Fix:** Apply migration 004 (see Step 1 above)

### Issue 3: "Cannot submit testimonial"

**Check:**
1. Database tables exist (`testimonials`, `testimonial_links`)
2. RLS policies are enabled
3. API route `/api/testimonials` is accessible
4. Required fields are provided (name, email, message)

**Test API:**
```bash
curl -X POST http://localhost:3000/api/testimonials \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test testimonial with more than 50 characters to meet validation requirements.",
    "rating": 5
  }'
```

### Issue 4: "Testimonials not showing in dashboard"

**Check:**
1. API returns testimonials: `curl http://localhost:3000/api/testimonials`
2. Component is rendering: Check browser console for errors
3. User is authenticated: Check `currentUser` prop

---

## 🧪 Testing Workflow

### Test 1: Submit a Testimonial
1. Go to `/testimonial-link` (if you have a token) or use the form directly
2. Fill in all fields:
   - Name: John Doe
   - Email: john@example.com
   - Company: Test Corp
   - Position: Tester
   - Message: (min 50 characters)
   - Rating: 5 stars
3. Submit and verify success message

### Test 2: Manage from Dashboard
1. Login as CEO or Manager
2. Go to `/dashboard/testimonials`
3. See pending testimonials
4. Click "Approve" or "Reject"
5. Verify status changes
6. Test search and filters

### Test 3: Generate Link
1. Login as admin
2. Access link generation (via dashboard or direct API)
3. Generate link with email
4. Share link with client
5. Client submits via link
6. Verify link is marked as "used"

### Test 4: Public Display
1. Create some approved testimonials
2. Use `TestimonialDisplay` component
3. Verify only approved testimonials show
4. Test verified badge display

---

## 🔐 Role-Based Access Control

| Role    | Level | Can Access Dashboard | Can Approve/Reject | Can Delete | Can Generate Links |
|---------|-------|---------------------|-------------------|------------|-------------------|
| CEO     | 1     | ✅                  | ✅                | ✅         | ✅                |
| Manager | 2     | ✅                  | ✅                | ✅         | ✅                |
| Others  | 3+    | ❌                  | ❌                | ❌         | ❌                |

---

## 📊 Database Schema

### testimonials table
```sql
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.testimonial_links(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  position TEXT,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_verified BOOLEAN DEFAULT false,
  image_url TEXT,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES public.users(id),
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### testimonial_links table
```sql
CREATE TABLE public.testimonial_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  email TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ✅ Verification Checklist

- [ ] Migration 002 applied (testimonials tables)
- [ ] Migration 004 applied (is_verified column)
- [ ] RLS policies enabled
- [ ] User has CEO or Manager role
- [ ] API endpoints respond correctly
- [ ] Dashboard loads without redirect
- [ ] Can submit testimonials
- [ ] Can approve/reject testimonials
- [ ] Can delete testimonials
- [ ] Can generate links
- [ ] Public display works

---

## 🎯 Quick Fixes

### Create Admin User
```bash
node scripts/setup-ceo.js
```

### Check Current User Role
```bash
node scripts/check-user.js
```

### Verify Database Tables
```bash
node scripts/apply-migrations.js
```

---

## 📞 Support

If issues persist:
1. Check browser console for errors
2. Check API response in Network tab
3. Verify database tables in Supabase Dashboard
4. Confirm user role level
5. Apply all migrations in order

---

**Last Updated:** January 22, 2026
**Migration Files:** 002, 004
**Required Role:** CEO or Manager (level ≤ 2)
