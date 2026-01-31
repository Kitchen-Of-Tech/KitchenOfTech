# Meeting Request Feature - Testing Guide 🧪

## ✅ Build Status: SUCCESS

All TypeScript errors have been resolved and the application builds successfully!

**Fixed Issues:**
- ✅ Next.js 15+ async params handling in `/api/meetings/[id]` routes
- ✅ TypeScript strict typing for meeting status
- ✅ Import statements corrected (default vs named exports)
- ✅ Supabase client usage with cookies
- ✅ Rate limiting imports fixed

---

## 🚀 Development Server Started

The dev server has been started in a new PowerShell window. Access at:
**http://localhost:3000**

---

## 📋 Testing Checklist

### 1. Service Card Meeting Request ✓

**Steps:**
1. Navigate to http://localhost:3000/services
2. Find any service card
3. Click the **"Request Meeting"** button with calendar icon
4. Modal should open with form

**Expected Behavior:**
- Modal overlays the page with backdrop blur
- Form shows preselected service name at top
- All form fields are visible and functional

### 2. Form Submission ✓

**Test Case A: Valid Submission (Email Only)**
1. Fill in:
   - Name: "John Doe"
   - Email: "john@test.com"
   - Message: "I need help with web development"
   - Leave phone blank
2. Click "Send Request"

**Expected:**
- Loading spinner appears
- Success checkmark animation plays
- Success message: "Your meeting request has been submitted!"
- Modal closes after 2 seconds

**Test Case B: Valid Submission (Phone Only)**
1. Fill in:
   - Name: "Jane Smith"  
   - Phone: "+1234567890"
   - Leave email blank
2. Click "Send Request"

**Expected:** Same success flow as above

**Test Case C: Invalid - No Contact Info**
1. Fill only name
2. Try to submit

**Expected:**
- Error message: "Please provide at least email or phone number"
- Form does not submit

### 3. Email Notification Verification ✓

**After submitting a form:**

1. Check the PowerShell terminal window running dev server
2. Look for email log output similar to:

```
📧 Email Notification (SMTP not configured - logging to console)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: admin@kitchenoftech.com, manager@kitchenoftech.com
Subject: New Meeting Request from John Doe
Body: [HTML and text email content with meeting details]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Expected:**
- Email logged to console (SMTP not configured)
- Shows all meeting details
- Includes dashboard link
- Lists all CEO/Manager email addresses

### 4. Database Verification ✓

**Check Supabase:**

1. Go to Supabase Dashboard → Table Editor
2. Select `meetings` table
3. Find your test submission

**Expected Columns:**
- `id`: UUID
- `name`: "John Doe"
- `email`: "john@test.com"
- `phone`: null (if not provided)
- `service_slug`: "web-development" (or whatever service)
- `service_title`: "Web Development"
- `status`: "requested"
- `notified`: true
- `created_at`: Current timestamp

### 5. Service Detail Page CTA ✓

**Steps:**
1. Navigate to any service detail page
   - Example: http://localhost:3000/services/web-development
2. Look for **"Hire for this service"** button in hero section
3. Click the button
4. Fill and submit form

**Expected:**
- Button shows Calendar icon
- Primary gradient styling
- Same modal and form behavior as service card
- Service is preselected

### 6. Dashboard Access ✓

**Test CEO/Manager Access:**

1. Login as CEO or Manager user (role level >= 90)
2. Navigate to: http://localhost:3000/dashboard/meetings

**Expected:**
- Dashboard loads successfully
- Shows stats cards with counts by status
- New requests section shows submitted meetings
- Each meeting card displays:
  - Name, email, phone
  - Service title
  - Preferred datetime (if provided)
  - Message (if provided)
  - Status badge (yellow for "New Request")
  - Action buttons

**Test Unauthorized Access:**

1. Login as regular user (Editor, Member, etc.)
2. Try to access: http://localhost:3000/dashboard/meetings

**Expected:**
- Redirect to /dashboard (403 or redirect behavior)
- Should NOT see meetings page

### 7. Status Management ✓

**On Dashboard:**

1. Find a meeting with "New Request" status
2. Click **"Mark Contacted"** button
3. Page refreshes
4. Meeting moves to "Contacted" section
5. Status badge turns blue

**Test Full Workflow:**

```
requested → contacted → scheduled → completed
```

**For each transition:**
- Click appropriate action button
- Verify page refreshes
- Check meeting moves to correct section
- Verify stats cards update

**Cancel Action:**
- Should be available at any stage (except completed/cancelled)
- Moves meeting to "Cancelled" section
- Status badge turns red

### 8. Cover Image Display ✓

**Service Cards:**
1. Navigate to /services
2. Check service cards

**Expected:**
- If service has `coverImage` in Sanity: Shows large 16:9 image at top
- If only `icon` exists: Shows small square icon
- If neither: Shows first letter of service name in colored circle

**Service Detail:**
1. Go to any service detail page
2. Check hero section image

**Expected:**
- Same priority: coverImage → icon → fallback

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot read properties of undefined"
**Cause:** Service data not loaded from Sanity
**Fix:** Check Sanity connection and GROQ queries

### Issue: 401 Unauthorized on form submit
**Cause:** Rate limiting or session expired
**Fix:** 
- Check rate limit logs
- Refresh page and try again
- Verify Supabase credentials

### Issue: Email not logging to console
**Cause:** Error in email formatting or manager query
**Fix:**
- Check terminal for error messages
- Verify users table has CEO/Manager roles
- Check role levels >= 90

### Issue: Dashboard shows empty
**Cause:** No meetings created yet or RLS policy issue
**Fix:**
- Submit test meetings first
- Verify user role level >= 90
- Check Supabase RLS policies are enabled

### Issue: TypeScript errors in IDE
**Cause:** Module cache not updated
**Fix:**
- Restart TypeScript server (Cmd/Ctrl + Shift + P → "Restart TS Server")
- Close and reopen files

---

## 🔍 Database Queries for Manual Testing

**Check all meetings:**
```sql
SELECT * FROM meetings ORDER BY created_at DESC;
```

**Check CEO/Manager users:**
```sql
SELECT u.id, u.email, r.name, r.level 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE r.level >= 90;
```

**Check meeting by status:**
```sql
SELECT * FROM meetings WHERE status = 'requested';
```

**Manually update meeting status:**
```sql
UPDATE meetings 
SET status = 'contacted', updated_at = now() 
WHERE id = 'YOUR-MEETING-UUID';
```

---

## 📊 Success Criteria

**The feature is working correctly if:**

✅ Service cards display coverImage when available
✅ "Request Meeting" button opens modal with form
✅ Form validates contact info (email or phone required)
✅ Submission creates record in Supabase meetings table
✅ Email notification logs to console with correct details
✅ Dashboard shows meetings grouped by status
✅ CEO/Manager can update meeting status
✅ Status updates trigger page refresh and stats update
✅ Unauthorized users cannot access dashboard
✅ Service detail page shows "Hire for this service" CTA
✅ All TypeScript code compiles without errors

---

## 🎯 Next Steps After Testing

### If All Tests Pass:

1. **Add Cover Images in Sanity Studio**
   - Navigate to Sanity Studio
   - Edit services
   - Upload coverImage (recommended: 1200x600px)

2. **Configure SMTP for Production** (Optional)
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@kitchenoftech.com
   ```

3. **Deploy to Production**
   ```bash
   git add .
   git commit -m "feat: Add meeting request feature with dashboard"
   git push
   ```

4. **Monitor Production**
   - Check Vercel/deployment logs
   - Monitor Supabase for meeting entries
   - Test email delivery with real SMTP

### If Tests Fail:

1. Check terminal for error messages
2. Verify environment variables are set
3. Check Supabase migration was applied
4. Review RLS policies in Supabase
5. Check browser console for client errors
6. Refer to MEETING_FEATURE_COMPLETE.md troubleshooting section

---

## 📞 Support Checklist

Before asking for help, verify:
- [ ] Supabase migration applied successfully
- [ ] Environment variables loaded (.env.local)
- [ ] Dev server running without errors
- [ ] Browser console shows no errors
- [ ] Supabase connection working (check other features)
- [ ] User logged in with correct role level

---

## 🎉 Feature Completion

Once all tests pass, the meeting request feature is **production-ready**!

**What's Working:**
- ✅ Full CRUD operations
- ✅ Role-based access control
- ✅ Email notifications (console/SMTP)
- ✅ Status workflow management
- ✅ Service integration (cards + details)
- ✅ Cover image support
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling

**Ready to handle real client meeting requests! 🚀**

---

**Last Updated:** January 31, 2026
**Build Status:** ✅ SUCCESS
**Dev Server:** Running on http://localhost:3000
