# Testimonial System Analysis & Migration Plan

## 📋 Current System Analysis

### Current Architecture (Supabase-based)

#### **Database Tables**
1. **testimonials** table
   - Fields: id, name, email, company, position, message, rating, status, image_url
   - Status: pending, approved, rejected
   - RLS policies enabled
   - Used by: submission form, admin dashboard

2. **testimonial_links** table
   - Fields: id, email, token, expires_at, used, used_at
   - Purpose: Generate secure one-time links for clients
   - Track link usage

#### **API Endpoints** (Current - Supabase)
- `GET /api/testimonials` - List testimonials with filters
- `POST /api/testimonials` - Submit new testimonial (saves to Supabase)
- `PATCH /api/testimonials/[id]` - Approve/reject testimonial
- `DELETE /api/testimonials/[id]` - Delete testimonial  
- `POST /api/testimonials/links` - Generate testimonial link
- `GET /api/testimonials/links/[token]` - Validate link token

#### **Frontend Components**
1. **TestimonialSubmitForm** (`components/testimonial/TestimonialSubmitForm.tsx`)
   - Submits to `/api/testimonials/submit` (doesn't exist, should be `/api/testimonials`)
   - Fields: name, email, company, position, message, rating
   - **MISSING**: Image upload functionality
   
2. **TestimonialDisplay** (`components/testimonial/TestimonialDisplay.tsx`)
   - Displays approved testimonials
   - Fetches from `/api/testimonials?status=approved`
   
3. **AdminTestimonialDashboard** (`components/testimonial/AdminTestimonialDashboard.tsx`)
   - Admin management interface
   - Approve/reject/delete testimonials
   
4. **TestimonialManagementClient** (`components/dashboard/TestimonialManagementClient.tsx`)
   - Dashboard integration
   - Service category assignment

#### **Pages**
- `/testimonials` - Public testimonials page (using demo data currently)
- `/testimonial-link` - Public submission form
- `/testimonial/[token]` - Token-based submission
- `/dashboard/testimonials` - Admin management

---

## 🎯 Migration Requirements

### 1. **Change Data Storage: Supabase → Sanity**
   - All new testimonials must be saved to Sanity CMS using Sanity Write API
   - Remove dependency on Supabase testimonials table
   - Keep testimonial_links table (or migrate to Sanity if needed)

### 2. **Add Image Upload Feature**
   - Add image/photo upload field to submission form
   - Upload image to Sanity using Sanity Assets API
   - Display client photo in testimonial cards

### 3. **Update Sanity Schema**
   - Current schema has: clientName, clientCompany, clientLogo, rating, testimonial, projectType, featured
   - Need to add: email, position, status, createdAt, approvedAt, rejectedAt

---

## 🔧 Implementation Plan

### Phase 1: Update Sanity Schema ✅
**File**: `sanity/schemas/testimonial.ts`
- Add `email` field (string, required for contact)
- Add `position` field (string, optional - job title)
- Add `status` field (string with options: pending, approved, rejected)
- Add `clientImage` field (image - client's photo)
- Add `submittedAt` field (datetime - when submitted)
- Add `approvedAt` field (datetime - when approved)
- Add `rejectedAt` field (datetime - when rejected)
- Add `verifiedBadge` field (boolean - for verified testimonials)
- Update field names to match current system:
  - `clientName` → keep (maps to `name`)
  - `clientCompany` → keep (maps to `company`)
  - `testimonial` → keep (maps to `message`)
  - `clientLogo` → optional (company logo)
  - `clientImage` → new (client photo)

### Phase 2: Create Sanity Write API Utility ✅
**File**: `lib/sanity/write.ts`
- Create Sanity client with write token
- Function: `createTestimonial(data)` - Submit new testimonial to Sanity
- Function: `updateTestimonialStatus(id, status)` - Update approval status
- Function: `deleteTestimonial(id)` - Delete testimonial
- Function: `uploadImage(file)` - Upload image to Sanity assets
- Handle authentication with SANITY_API_TOKEN (write permissions)

### Phase 3: Update API Routes ✅
**File**: `app/api/testimonials/route.ts`
- Replace Supabase client with Sanity write API
- `POST /api/testimonials` → Save to Sanity instead of Supabase
- `GET /api/testimonials` → Fetch from Sanity instead of Supabase
- Handle image upload in POST endpoint

**File**: `app/api/testimonials/[id]/route.ts`
- `PATCH` → Update status in Sanity
- `DELETE` → Delete from Sanity

**File**: `app/api/testimonials/submit/route.ts` (CREATE)
- New endpoint for public submissions
- Handle multipart/form-data for image uploads
- Validate and upload image to Sanity
- Create testimonial document in Sanity with "pending" status

### Phase 4: Update Frontend Components ✅
**File**: `components/testimonial/TestimonialSubmitForm.tsx`
- Add image upload input with preview
- Update form to handle file upload
- Change fetch to support multipart/form-data
- Fix API endpoint from `/api/testimonials/submit` to proper endpoint
- Add drag-and-drop image upload
- Show image preview before submission

**File**: `components/testimonial/TestimonialDisplay.tsx`
- Update to fetch from new Sanity-based API
- Display client image if available
- Update data structure mapping

**File**: `components/testimonial/AdminTestimonialDashboard.tsx`
- Update to work with Sanity data structure
- Update approve/reject API calls
- Display client images

**File**: `components/dashboard/TestimonialManagementClient.tsx`
- Update all API calls to use new structure
- Support image display

### Phase 5: Database Cleanup ✅
**Action**: Remove Supabase testimonials table
- Drop `testimonials` table from Supabase
- Update RLS policies
- Keep `testimonial_links` table (still useful for secure links)
- Update migration files

**Files to Update**:
- `supabase/migrations/002_testimonial_system.sql`
- Create new migration: `003_remove_testimonials_table.sql`

### Phase 6: Update Types & Validation ✅
**File**: `types/auth.ts` or create `types/testimonial.ts`
- Update Testimonial interface to match Sanity structure
- Add image field types

**File**: `lib/validations/testimonial.ts`
- Update Zod schemas for new structure
- Add image file validation

### Phase 7: Testing ✅
- Test testimonial submission with image
- Test image upload to Sanity
- Test admin approval workflow
- Test testimonial display on public pages
- Test testimonial links functionality
- Verify old Supabase data is no longer used

---

## 📝 Detailed Technical Specifications

### Sanity Schema Update
```typescript
{
  name: 'testimonial',
  type: 'document',
  fields: [
    { name: 'clientName', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'clientCompany', type: 'string' },
    { name: 'position', type: 'string' },
    { name: 'clientImage', type: 'image' }, // NEW - Client photo
    { name: 'clientLogo', type: 'image' },  // Company logo
    { name: 'rating', type: 'number', min: 1, max: 5, required: true },
    { name: 'testimonial', type: 'text', required: true },
    { name: 'projectType', type: 'string' },
    { name: 'status', type: 'string', options: ['pending', 'approved', 'rejected'] },
    { name: 'verifiedBadge', type: 'boolean', default: false },
    { name: 'featured', type: 'boolean', default: false },
    { name: 'submittedAt', type: 'datetime', default: 'now' },
    { name: 'approvedAt', type: 'datetime' },
    { name: 'rejectedAt', type: 'datetime' },
  ]
}
```

### Image Upload Flow
1. User selects image in form
2. Frontend previews image (< 5MB, JPG/PNG/WEBP only)
3. On submit, create FormData with image + fields
4. API receives multipart/form-data
5. Upload image to Sanity Assets API
6. Get image asset reference
7. Create testimonial document with image reference
8. Return success response

### API Response Format
```typescript
{
  success: true,
  testimonial: {
    _id: 'testimonial-uuid',
    clientName: 'John Doe',
    email: 'john@example.com',
    clientCompany: 'Tech Corp',
    position: 'CEO',
    clientImage: { asset: { _ref: 'image-uuid' } },
    rating: 5,
    testimonial: 'Great service!',
    status: 'pending',
    submittedAt: '2026-01-29T...',
  }
}
```

---

## 🚨 Important Notes

### Data Migration
- **Do NOT auto-migrate existing Supabase testimonials** to Sanity (unless requested)
- Existing approved testimonials in Supabase should remain until manual review
- Admin can manually re-enter important testimonials in Sanity Studio if needed

### Backward Compatibility
- During migration, support both systems briefly
- Add feature flag: `USE_SANITY_TESTIMONIALS = true`
- Gradual cutover approach

### Security Considerations
- Validate image file types (jpg, png, webp only)
- Validate image size (< 5MB)
- Sanitize all user inputs
- Rate limit testimonial submissions
- Verify SANITY_API_TOKEN has write permissions
- Keep CSRF protection on POST endpoints

---

## 📦 Dependencies to Add

```json
{
  "@sanity/client": "^7.14.0", // Already installed
  "next-sanity": "^12.0.12"     // Already installed
}
```

---

## 🎯 Success Criteria

- ✅ New testimonials save to Sanity CMS (not Supabase)
- ✅ Image upload works in submission form
- ✅ Client photos display in testimonial cards
- ✅ Admin can approve/reject testimonials in Sanity data
- ✅ Public testimonials page shows Sanity data
- ✅ Supabase testimonials table removed (data archived if needed)
- ✅ All API endpoints updated to use Sanity
- ✅ No breaking changes to testimonial links feature

---

## 📅 Estimated Timeline

- Phase 1 (Schema): 15 minutes
- Phase 2 (Write API): 30 minutes  
- Phase 3 (API Routes): 45 minutes
- Phase 4 (Frontend): 60 minutes
- Phase 5 (Cleanup): 15 minutes
- Phase 6 (Types): 15 minutes
- Phase 7 (Testing): 30 minutes

**Total**: ~3.5 hours

---

## 🔄 Rollback Plan

If issues arise:
1. Set feature flag `USE_SANITY_TESTIMONIALS = false`
2. Revert API routes to use Supabase
3. Keep Supabase table intact until Sanity is stable
4. Test thoroughly before final cutover

---

Ready to proceed with implementation?
