# Team Page Testing Checklist

## Pre-Test Setup
- [ ] Stop current dev server (Ctrl+C)
- [ ] Clear Next.js cache: `Remove-Item -Recurse -Force .next`
- [ ] Start dev server: `npm run dev`

## Test 1: Verify Sanity Data
```bash
node scripts/test-team-data.js
```
- [ ] Script runs without errors
- [ ] Shows 2 team members
- [ ] All fields present for both members

## Test 2: Team List Page
Visit: `http://localhost:3000/team`

### Visual Checks
- [ ] Page loads without errors
- [ ] "Featured Members" section appears
- [ ] 2 team member cards displayed
- [ ] Both cards have profile images
- [ ] Names: "MD. SAKIB HASAN" and "Muzahidul Islam Utshab"
- [ ] Designations shown correctly
- [ ] "Featured" badge on both cards
- [ ] "Available" indicator on both cards
- [ ] Stats show "2+ Team Members"
- [ ] Stats show "2 Available Now"

### Console Checks
Open Browser DevTools (F12) → Console tab:
- [ ] See: "✅ Team members fetched: 2"
- [ ] See: "📋 Team members data: [...]"
- [ ] See: "📊 Team breakdown: ..."
- [ ] No error messages

## Test 3: Team Detail Page 1
Click on "MD. SAKIB HASAN" card or visit:
`http://localhost:3000/team/md-sakib-hasan`

- [ ] Page loads successfully
- [ ] Profile image appears
- [ ] Name displayed: "MD. SAKIB HASAN"
- [ ] Designation: "Founder"
- [ ] Description/bio text appears
- [ ] Sections render (if data exists):
  - [ ] Experience section
  - [ ] Education section
  - [ ] Skills section
  - [ ] Technologies section
  - [ ] Portfolio section
- [ ] "Hire Now" button appears
- [ ] Social links appear (if any)

## Test 4: Team Detail Page 2
Click on "Muzahidul Islam Utshab" card or visit:
`http://localhost:3000/team/muzahidul-islam-utshab`

- [ ] Page loads successfully
- [ ] Profile image appears
- [ ] Name displayed: "Muzahidul Islam Utshab"
- [ ] Designation: "Business Development Manager"
- [ ] Description/bio text appears
- [ ] All sections render correctly

## Test 5: Dynamic Update (Optional)
Test that new data appears automatically:

1. Go to Sanity Studio:
   ```
   http://localhost:3000/studio
   ```

2. Create a test team member:
   - [ ] Click "Team Members"
   - [ ] Click "Create New Team Member"
   - [ ] Fill required fields:
     - Name: "Test Member"
     - Slug: "test-member"
     - Designation: "Test Role"
     - Upload an image
     - Add description
   - [ ] Check "Featured"
   - [ ] Check "Available"
   - [ ] Click "Publish"

3. Test page update:
   - [ ] Go to `/team` page
   - [ ] Wait 60 seconds (or refresh page)
   - [ ] New member appears in list
   - [ ] Console shows "✅ Team members fetched: 3"

4. Clean up:
   - [ ] Delete test member from Sanity Studio

## Test 6: Network Checks
In Browser DevTools (F12) → Network tab:

- [ ] Reload `/team` page
- [ ] Look for Sanity API requests
- [ ] Check response status: 200 OK
- [ ] Verify response contains team member data

## Test 7: Error Handling
Temporarily break Sanity connection to test error handling:

1. Stop Sanity Studio (if running separately)
2. Visit `/team` page
3. Check console:
   - [ ] Error message appears in console
   - [ ] Page doesn't crash
   - [ ] Shows empty state or fallback UI

## Test 8: Responsive Design
Test on different screen sizes:

- [ ] Desktop (1920x1080)
- [ ] Tablet (768px width)
- [ ] Mobile (375px width)
- [ ] Cards stack properly
- [ ] Images scale correctly
- [ ] Text readable on all sizes

## Issues Found

### Issue 1:
**Description:**
**Expected:**
**Actual:**
**Status:**

### Issue 2:
**Description:**
**Expected:**
**Actual:**
**Status:**

## Test Results Summary

**Date:**
**Tester:**
**Environment:** Development / Production
**Browser:** Chrome / Firefox / Safari / Edge
**Status:** ✅ Pass / ❌ Fail / ⚠️ Partial

### Overall Results
- Total Tests: 8
- Passed: __
- Failed: __
- Skipped: __

### Critical Issues:
-

### Notes:
-

---

## Quick Commands Reference

```powershell
# Clear cache
Remove-Item -Recurse -Force .next

# Install dependencies (if needed)
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Test Sanity data
node scripts/test-team-data.js

# Open Sanity Studio
# Visit: http://localhost:3000/studio
```

## Expected Console Output

When visiting `/team`, you should see:

```
✅ Team members fetched: 2
📋 Team members data: [
  {
    name: 'MD. SAKIB HASAN',
    slug: { current: 'md-sakib-hasan' },
    designation: 'Founder',
    featured: true,
    available: true,
    ...
  },
  {
    name: 'Muzahidul Islam Utshab',
    slug: { current: 'muzahidul-islam-utshab' },
    designation: 'Business Development Manager',
    featured: true,
    available: true,
    ...
  }
]
📊 Team breakdown: {
  total: 2,
  featured: 2,
  available: 2,
  regular: 0
}
```

## Troubleshooting

If tests fail:

1. **No team members showing:**
   - Run: `node scripts/test-team-data.js`
   - Check Sanity Studio: Members are published?
   - Clear cache and restart server

2. **Console errors:**
   - Check browser console for specific error
   - Check terminal for server errors
   - Verify environment variables in `.env.local`

3. **Images not loading:**
   - Check Sanity image URLs
   - Verify CORS settings
   - Check Next.js image configuration

4. **Stale data:**
   - Wait 60 seconds (revalidation period)
   - Hard refresh browser (Ctrl+Shift+R)
   - Clear browser cache

5. **Build errors:**
   - Run: `npm install`
   - Check Node.js version
   - Check package.json dependencies
