# Dynamic Service Categories - Setup Guide

## ✅ What's Been Implemented

### 1. Database Layer
- **File**: `supabase/migrations/006_service_categories_table.sql`
- **Table**: `service_categories` with the following columns:
  - `id` - UUID primary key
  - `name` - Unique service category name
  - `description` - Optional description
  - `display_order` - For sorting categories
  - `is_active` - Enable/disable without deleting
  - `created_by` - User who created it
  - `created_at`, `updated_at` - Timestamps
- **Default Data**: 11 pre-configured categories (Web Development, Mobile Development, UI/UX Design, etc.)
- **RLS Policies**: 
  - Public can read active categories
  - Authenticated users can read all categories
  - CEO and Manager can add/edit/delete categories

### 2. API Layer
- **File**: `app/api/service-categories/route.ts`
- **Endpoints**:
  - `GET /api/service-categories` - Fetch all active categories (or all with `?includeInactive=true`)
  - `POST /api/service-categories` - Create new category (CEO/Manager only)
  - `PUT /api/service-categories` - Update category (CEO/Manager only)
  - `DELETE /api/service-categories?id=xxx` - Delete category (CEO/Manager only)
- **Security**: All mutations require CEO (level 1) or Manager (level 2) role

### 3. UI Layer
- **File**: `components/dashboard/TestimonialManagementClient.tsx`
- **Features**:
  - ✅ Dynamic category loading from database
  - ✅ Category management section (collapsible)
  - ✅ Add new categories with name and description
  - ✅ Activate/deactivate categories
  - ✅ Delete categories (with usage validation)
  - ✅ Visual status indicators (active/inactive)
  - ✅ Approval modal uses dynamic categories

---

## 🚀 How to Apply the Changes

### Step 1: Apply Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Open the file: `supabase/migrations/006_service_categories_table.sql`
6. Copy the entire contents of the file
7. Paste into the Supabase SQL Editor
8. Click **"Run"** (or press `Ctrl+Enter`)
9. You should see a success message

### Step 2: Verify Migration Applied

Run the verification script:

```powershell
node scripts/check-service-categories.js
```

You should see:
```
✅ Table exists and has data!

📊 Found 11 categories:

1. Web Development - ✓ Active
   Custom websites and web applications
2. Mobile Development - ✓ Active
   iOS and Android mobile apps
...
```

If you see an error, the migration wasn't applied correctly. Re-check Step 1.

### Step 3: Test the Features

1. **Start your development server** (if not running):
   ```powershell
   npm run dev
   ```

2. **Navigate to Testimonials Dashboard**:
   - Login as CEO or Manager
   - Go to `/dashboard/testimonials`

3. **Test Category Management**:
   - Look for the "Service Categories" section
   - Click **"Manage Categories"**
   - You should see all 11 default categories
   - Try adding a new category:
     - Enter name: "Custom Services"
     - Enter description: "Specialized custom solutions"
     - Click "Add Category"
   - Try deactivating a category (click the green checkmark icon)
   - Try deleting an unused category (click the red X icon)

4. **Test Approval Modal**:
   - Generate a testimonial link
   - Submit a test testimonial via the link
   - Go back to the dashboard
   - Click "Approve" on the pending testimonial
   - The modal should show your dynamic categories (not hardcoded)
   - Select a category and approve

---

## 🎯 How to Use

### As CEO/Manager - Managing Categories

1. **Navigate to Testimonials Dashboard**
2. **Open Category Manager**:
   - Click "Manage Categories" button
3. **Add New Category**:
   - Fill in "Category Name" (required)
   - Fill in "Description" (optional)
   - Click "Add Category"
4. **Activate/Deactivate Category**:
   - Click the green checkmark icon to toggle
   - Inactive categories won't show in approval modal
   - Useful for seasonal services
5. **Delete Category**:
   - Click the red X icon
   - Confirm deletion
   - **Note**: Cannot delete if used by testimonials (will show error)
   - In that case, deactivate instead

### As CEO/Manager - Approving Testimonials

1. **Review pending testimonial**
2. **Click "Approve"**
3. **Categorization Modal Opens**:
   - Only shows **active** categories
   - If no active categories, you'll see a warning
   - Select the appropriate service category
   - Click "Approve" to confirm
4. **Testimonial is approved** with the selected category

---

## 📋 Category Lifecycle

```
┌─────────────────┐
│  Add Category   │
│  (Active: true) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│ Active Category │ ◄──► │ Inactive Category │
│ (Shows in modal)│      │ (Hidden in modal) │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Delete Category │
│ (If not in use) │
└─────────────────┘
```

---

## 🛡️ Security & Validation

### Who Can Manage Categories?
- ✅ CEO (level 1)
- ✅ Manager (level 2)
- ❌ Team Members (level 3)
- ❌ Employees (level 4)

### Validation Rules:
1. **Unique Names**: Cannot create two categories with the same name
2. **No Deletion of Used Categories**: If a category is assigned to any testimonial, it cannot be deleted (you'll get a 409 error)
3. **Soft Delete**: Use "deactivate" instead of delete for used categories
4. **Required Fields**: Category name is required (description is optional)

---

## 🐛 Troubleshooting

### "Table does not exist" error
- **Solution**: Run the migration in Supabase Dashboard (Step 1 above)

### "No active service categories" in approval modal
- **Solution**: Go to category manager and activate at least one category

### "Cannot delete category" error
- **Reason**: Category is being used by existing testimonials
- **Solution**: Deactivate the category instead (click the checkmark icon)

### Categories not showing in UI
1. Check browser console for errors
2. Verify migration applied: `node scripts/check-service-categories.js`
3. Check network tab - API should return categories
4. Refresh the page

---

## 🔄 Migration from Hardcoded to Dynamic

### Before (Hardcoded):
```typescript
const SERVICE_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  // ... fixed list
];
```

### After (Dynamic):
```typescript
const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);

// Loaded from database
fetchServiceCategories();
```

### Benefits:
- ✅ No code changes needed to add/remove categories
- ✅ CEO/Manager has full control
- ✅ Can deactivate seasonal services
- ✅ Can add custom categories per client needs
- ✅ Prevents deletion of categories in use

---

## 📊 Database Schema

```sql
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 UI Features

### Category Management Section
- Collapsible section to save space
- Grid layout for easy scanning
- Color-coded status (active = normal, inactive = dimmed with red indicator)
- Add form at the top for quick access
- Delete/toggle buttons on each category card

### Approval Modal Updates
- Only shows active categories
- Sorted by display_order
- Shows description on hover (title attribute)
- Warning if no active categories

---

## 📝 Next Steps (Optional Enhancements)

If you want to add more features later:

1. **Drag-and-drop reordering**: Change display_order by dragging categories
2. **Category icons**: Add icon field and display next to name
3. **Category colors**: Assign colors for visual distinction
4. **Usage statistics**: Show how many testimonials use each category
5. **Bulk operations**: Activate/deactivate multiple categories at once
6. **Category analytics**: Track which services get the most testimonials

---

## ✅ Testing Checklist

- [ ] Migration applied successfully
- [ ] Verification script shows categories
- [ ] Can see category manager in dashboard
- [ ] Can add new category
- [ ] Can deactivate category
- [ ] Can delete unused category
- [ ] Cannot delete used category (proper error)
- [ ] Approval modal shows dynamic categories
- [ ] Only active categories show in approval modal
- [ ] Can approve testimonial with selected category
- [ ] Category saves correctly in database

---

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check the Network tab in DevTools
3. Verify your role level (must be ≤ 2 for category management)
4. Run the verification script: `node scripts/check-service-categories.js`
5. Check Supabase logs in the dashboard

---

**Status**: ✅ All code complete and ready to use!
**Last Updated**: Dynamic service categories implementation
