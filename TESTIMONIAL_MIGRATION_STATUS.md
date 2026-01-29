# Testimonial Migration Status

## Overview
Migration from Supabase to Sanity CMS with image upload capability.

## ✅ Completed Phases

### Phase 1: Sanity Schema (COMPLETE)
- ✅ Updated `sanity/schemas/testimonial.ts` with 20 fields
- ✅ Added: email, position, clientImage, status, verifiedBadge, timestamps
- ✅ Configured validation, preview, and orderings
- **Files Modified**: 1

### Phase 2: Sanity Write API (COMPLETE)
- ✅ Created `lib/sanity/write.ts` with 7 utility functions:
  - `uploadImageToSanity()` - Handles File/Buffer/Blob uploads
  - `createTestimonial()` - Creates testimonial with optional image
  - `updateTestimonial()` - Updates with automatic timestamps
  - `deleteTestimonial()` - Removes testimonial
  - `fetchTestimonials()` - Query with filters (status, limit)
  - `fetchTestimonialById()` - Fetch single testimonial
  - `getTestimonialStats()` - Get counts by status
- **Files Created**: 1

### Phase 3: API Routes (COMPLETE)
- ✅ Created `app/api/testimonials/submit/route.ts`
  - Multipart/form-data support
  - Image validation (5MB max, JPG/PNG/WEBP)
  - Rate limiting applied
- ✅ Updated `app/api/testimonials/route.ts`
  - GET handler uses Sanity `fetchTestimonials()`
  - Removed duplicate POST handler
  - Added rate limiting
- ✅ Updated `app/api/testimonials/[id]/route.ts`
  - Added GET handler for single testimonial
  - PATCH handler uses Sanity `updateTestimonial()`
  - DELETE handler uses Sanity `deleteTestimonial()`
  - Rate limiting applied
  - User permission checks maintained (CEO/Manager only)
- **Files Modified**: 2
- **Files Created**: 1

### Phase 4: Frontend Components (PARTIAL - 25%)
- ✅ Updated `components/testimonial/TestimonialSubmitForm.tsx`
  - Added image upload UI with drag-and-drop zone
  - Image preview with remove button
  - Client-side validation (5MB, JPG/PNG/WEBP)
  - Changed to FormData submission
  - Visual feedback for image errors
- ⏳ PENDING: `components/testimonial/TestimonialDisplay.tsx`
- ⏳ PENDING: `components/dashboard/TestimonialManagementClient.tsx`
- ⏳ PENDING: `components/landing/TestimonialsSection.tsx`
- **Files Modified**: 1

---

## ⏳ Remaining Work

### Phase 4: Frontend Components (Continue)

#### 1. Update TestimonialDisplay Component
**File**: `components/testimonial/TestimonialDisplay.tsx`
**Tasks**:
- Update API call to fetch from `/api/testimonials?status=approved`
- Update data structure mapping (Sanity format vs Supabase format)
- Display `clientImage` if available using Sanity image URL
- Use `urlFor()` from Sanity image helper
- Handle missing images gracefully

#### 2. Update TestimonialManagementClient Component
**File**: `components/dashboard/TestimonialManagementClient.tsx`
**Tasks**:
- Update `fetchTestimonials()` to use new API structure
- Update approve/reject handlers to call `/api/testimonials/[id]`
- Display client images in testimonial cards
- Update field mappings (clientName, testimonial, etc.)
- Handle Sanity `_id` format

#### 3. Update TestimonialsSection Component
**File**: `components/landing/TestimonialsSection.tsx`
**Tasks**:
- Update API integration if fetching testimonials
- Display client images
- Use Sanity image URLs

---

### Phase 5: Database Cleanup

#### 1. Export Existing Data (Backup)
**Action**: Export current testimonials from Supabase
```sql
COPY (SELECT * FROM testimonials) TO 'testimonials_backup.csv' CSV HEADER;
```

#### 2. Remove Supabase Testimonials Table
**File**: Create `supabase/migrations/003_remove_testimonials_table.sql`
```sql
-- Drop testimonials table
DROP TABLE IF EXISTS testimonials CASCADE;

-- Keep testimonial_links table (still useful for secure links)
-- Update RLS policies if needed
```

**Note**: The `testimonial_links` table can remain if you want to keep the secure link generation feature. Otherwise, remove it too.

---

### Phase 6: Types & Validation

#### 1. Update TypeScript Types
**File**: `types/auth.ts` or create `types/testimonial.ts`
**Tasks**:
- Update `Testimonial` interface to match Sanity structure
- Add new fields:
  ```typescript
  interface Testimonial {
    _id: string;
    clientName: string;
    email: string;
    clientCompany?: string;
    position?: string;
    clientImage?: SanityImageAsset;
    clientLogo?: SanityImageAsset;
    rating: number;
    testimonial: string;
    projectType?: string;
    status: 'pending' | 'approved' | 'rejected';
    verifiedBadge?: boolean;
    featured?: boolean;
    submittedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    linkToken?: string;
  }
  ```

#### 2. Update Validation Schemas
**File**: `lib/validations/testimonial.ts` (create if doesn't exist)
**Tasks**:
- Update Zod schemas to match new structure
- Add image file validation
```typescript
import { z } from 'zod';

export const testimonialSubmitSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  message: z.string().min(50).max(1000),
  rating: z.number().int().min(1).max(5),
});

export const imageFileSchema = z.custom<File>(
  (val) => val instanceof File,
  { message: 'Must be a File' }
).refine(
  (file) => file.size <= 5 * 1024 * 1024,
  { message: 'Image size must not exceed 5MB' }
).refine(
  (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
  { message: 'Image must be JPG, PNG, or WEBP' }
);
```

---

### Phase 7: Testing & Verification

#### Test Cases
1. **Testimonial Submission (Public)**
   - ✅ Submit with image
   - ✅ Submit without image
   - ✅ Validate image size limit (5MB)
   - ✅ Validate image types (JPG/PNG/WEBP)
   - ✅ Validate testimonial length (50-1000 chars)
   - ✅ Validate email format
   - ✅ Rate limiting (10 requests/min)

2. **Admin Approval Workflow**
   - ✅ View pending testimonials
   - ✅ Approve testimonial (sets approvedAt timestamp)
   - ✅ Reject testimonial (sets rejectedAt timestamp)
   - ✅ Delete testimonial
   - ✅ Permission checks (CEO/Manager only)

3. **Public Display**
   - ✅ Show only approved testimonials
   - ✅ Display client images
   - ✅ Display client logos
   - ✅ Show ratings
   - ✅ Filter by project type

4. **Sanity Studio**
   - ✅ View all testimonials
   - ✅ Edit testimonials
   - ✅ See client images
   - ✅ Change status manually
   - ✅ Preview works correctly

5. **Supabase Cleanup**
   - ✅ Testimonials table removed
   - ✅ No errors from old Supabase queries
   - ✅ testimonial_links table status (keep or remove?)

---

## Key Changes Summary

### API Endpoints
| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/testimonials` | GET | List testimonials | ✅ Sanity |
| `/api/testimonials/submit` | POST | Submit with image | ✅ Sanity |
| `/api/testimonials/[id]` | GET | Fetch single | ✅ Sanity |
| `/api/testimonials/[id]` | PATCH | Approve/Reject | ✅ Sanity |
| `/api/testimonials/[id]` | DELETE | Delete | ✅ Sanity |

### Data Structure Changes
| Field (Old Supabase) | Field (New Sanity) | Type | Notes |
|----------------------|-------------------|------|-------|
| `id` | `_id` | string | Sanity ID format |
| `name` | `clientName` | string | Renamed |
| `message` | `testimonial` | text | Renamed |
| `image_url` | `clientImage` | image | Now uploaded to Sanity |
| `approved_at` | `approvedAt` | datetime | Camel case |
| `rejected_at` | `rejectedAt` | datetime | Camel case |
| `created_at` | `submittedAt` | datetime | Renamed |
| N/A | `position` | string | NEW |
| N/A | `verifiedBadge` | boolean | NEW |

### Image Upload Flow
```
User selects image → Client validation → FormData submission → 
API validation → Upload to Sanity Assets → Create testimonial with image reference →
Testimonial stored in Sanity → Admin approves → Display on public page
```

---

## Environment Variables Required

```env
# Sanity (Write API)
SANITY_API_TOKEN=your_write_token_here
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production

# Rate Limiting
UPSTASH_REDIS_REST_URL=your_redis_url (optional, falls back to Map)
UPSTASH_REDIS_REST_TOKEN=your_redis_token (optional)

# Supabase (for user authentication only)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Progress Tracking

### Overall Progress: 65%

- ✅ Phase 1: Sanity Schema (100%)
- ✅ Phase 2: Sanity Write API (100%)
- ✅ Phase 3: API Routes (100%)
- 🔄 Phase 4: Frontend Components (25%)
- ⏳ Phase 5: Database Cleanup (0%)
- ⏳ Phase 6: Types & Validation (0%)
- ⏳ Phase 7: Testing (0%)

### Files Modified/Created: 6
- ✅ `sanity/schemas/testimonial.ts`
- ✅ `lib/sanity/write.ts` (NEW)
- ✅ `app/api/testimonials/submit/route.ts` (NEW)
- ✅ `app/api/testimonials/route.ts`
- ✅ `app/api/testimonials/[id]/route.ts`
- ✅ `components/testimonial/TestimonialSubmitForm.tsx`

### Estimated Time Remaining: 1.5 hours
- Phase 4 completion: 45 minutes
- Phase 5: 15 minutes
- Phase 6: 15 minutes
- Phase 7: 30 minutes

---

## Next Steps

1. **Update TestimonialDisplay component** to fetch from Sanity
2. **Update TestimonialManagementClient** for admin dashboard
3. **Update TestimonialsSection** on landing page
4. **Create types/testimonial.ts** with proper interfaces
5. **Remove Supabase testimonials table**
6. **Full system testing**

---

## Rollback Plan

If issues arise, you can rollback by:
1. Revert API endpoints to use Supabase
2. Keep Sanity schema for future migration
3. Existing Supabase data is intact (no data loss)
4. No database migrations have been run yet

**Note**: Phase 5 (database cleanup) should only be done after thorough testing of Phases 1-4.

---

Last Updated: 2024
