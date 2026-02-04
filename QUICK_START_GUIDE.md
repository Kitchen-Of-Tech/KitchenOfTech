# Quick Start Guide - Final Steps to Launch 🚀

## You're Almost There! (1 hour to launch)

All features are implemented and working. You just need to add your **real tracking IDs** to start tracking conversions.

---

## ✅ What's Already Done

- ✅ Google Tag Manager component created
- ✅ Facebook Pixel component created  
- ✅ Facebook Conversions API implemented
- ✅ Team member pages fixed (full descriptions showing)
- ✅ Hire buttons working (open meeting form modals)
- ✅ Meeting form audited (production ready)
- ✅ All code tested and working

---

## ⚠️ What You Need to Do

### Step 1: Get Your Tracking IDs (30 minutes)

#### 1.1 Google Tag Manager Container ID
**Time**: 5 minutes

1. Go to https://tagmanager.google.com
2. Create a new container if you don't have one:
   - Click **Create Account**
   - Account Name: KitchenOfTech
   - Container Name: kitchenoftech.org
   - Target Platform: **Web**
   - Click **Create**
3. Copy the **Container ID** (format: `GTM-XXXXXXX`)
   - Shows at top: "Container GTM-XXXXXXX"
4. Save it somewhere

**Result**: `GTM-XXXXXXX`

---

#### 1.2 Google Analytics Measurement ID  
**Time**: 5 minutes

1. Go to https://analytics.google.com
2. Create property if you don't have one:
   - Click **Admin** (bottom left)
   - Click **Create Property**
   - Property Name: KitchenOfTech
   - Time zone: Your timezone
   - Currency: USD
   - Click **Next**
   - Choose your business category
   - Click **Create**
3. Set up a **Web Data Stream**:
   - Platform: **Web**
   - Website URL: https://kitchenoftech.org
   - Stream Name: Main Website
   - Click **Create Stream**
4. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)
   - Shows at top right: "Measurement ID: G-XXXXXXXXXX"
5. Save it somewhere

**Result**: `G-XXXXXXXXXX`

---

#### 1.3 Facebook Pixel ID
**Time**: 5 minutes

1. Go to https://business.facebook.com/events_manager2
2. Create a Pixel if you don't have one:
   - Click **Connect Data Sources** → **Web** → **Meta Pixel**
   - Click **Connect**
   - Name: KitchenOfTech
   - Website URL: https://kitchenoftech.org
   - Click **Continue**
3. Skip the "Add Pixel to Website" section (we've already done this)
4. Copy the **Pixel ID** (16-digit number)
   - Go to **Settings** tab
   - Shows at top: "Pixel ID: 1234567890123456"
5. Save it somewhere

**Result**: `1234567890123456`

---

#### 1.4 Facebook Conversions API Access Token
**Time**: 5 minutes

1. Still in Facebook Events Manager (https://business.facebook.com/events_manager2)
2. Select your Pixel
3. Go to **Settings** tab
4. Scroll down to **Conversions API** section
5. Click **Generate Access Token** button
6. Copy the token (starts with `EAAG...`, very long)
7. **IMPORTANT**: Save this somewhere secure! You can't see it again.

**Result**: `EAAGm7r5KU...very_long_token_here`

---

### Step 2: Update Environment Variables (10 minutes)

#### 2.1 Update Local `.env.local` File

Open `c:\Users\Admin\Desktop\KitchenOfTech\.env.local` and replace:

```bash
# OLD (placeholders)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=YOUR_PIXEL_ID_HERE
FACEBOOK_CONVERSIONS_API_TOKEN=YOUR_ACCESS_TOKEN_HERE

# NEW (your real values)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-1234567890  # ← Your GA ID
NEXT_PUBLIC_GTM_ID=GTM-ABC1234             # ← Your GTM ID
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1234567890123456  # ← Your FB Pixel ID
FACEBOOK_CONVERSIONS_API_TOKEN=EAAGm7r5KU...   # ← Your FB Token
```

**Save the file.**

---

#### 2.2 Update Vercel Environment Variables

1. Go to https://vercel.com/kitchenoftech/kitchenoftech/settings/environment-variables
2. Add/Update these variables (set Environment to **Production**):

```
Variable Name: NEXT_PUBLIC_GA_MEASUREMENT_ID
Value: G-1234567890
```

```
Variable Name: NEXT_PUBLIC_GTM_ID
Value: GTM-ABC1234
```

```
Variable Name: NEXT_PUBLIC_FACEBOOK_PIXEL_ID
Value: 1234567890123456
```

```
Variable Name: FACEBOOK_CONVERSIONS_API_TOKEN
Value: EAAGm7r5KU...your_long_token
```

3. Click **Save** for each
4. After adding all, click **Redeploy** button (appears at top)

---

### Step 3: Test Locally (10 minutes)

```bash
# Open terminal in VS Code (Ctrl + `)

# Build the project
npm run build

# Start production server
npm start
```

**Open**: http://localhost:3000

**Test**:
1. Open browser DevTools (F12) → Network tab
2. Refresh page
3. Check that `gtm.js` and `fbevents.js` load ✅
4. Go to `/team` page
5. Click on a team member
6. Click "Hire [Name]" button
7. Fill out meeting form
8. Submit
9. Should see success message ✅

**Check Console** for tracking messages:
- "GTM loaded"
- "Facebook Pixel initialized"

---

### Step 4: Deploy to Production (5 minutes)

```bash
# In VS Code terminal

# Add all changes
git add .

# Commit
git commit -m "chore: add real tracking IDs for production"

# Push (Vercel will auto-deploy)
git push origin main
```

**Wait 2-3 minutes** for Vercel to build and deploy.

Check status: https://vercel.com/kitchenoftech/kitchenoftech/deployments

---

### Step 5: Verify Tracking on Production (10 minutes)

#### 5.1 Install Browser Extensions

**Chrome Web Store**:
1. [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)

---

#### 5.2 Test on Live Site

1. **Go to**: https://kitchenoftech.org
2. **Open** Tag Assistant extension
   - Should show green badge with number
   - Click it → Should see "GTM-XXXXXXX"
3. **Open** Meta Pixel Helper extension
   - Should show green checkmark
   - Click it → Should see your Pixel ID
4. **Go to**: https://kitchenoftech.org/team
5. **Click** on any team member
6. **Click** "Hire [Name]" button
7. **Fill out** the meeting form:
   - Name: Test User
   - Email: test@example.com
   - Select a service
8. **Submit** the form
9. **Check** Meta Pixel Helper:
   - Should show "Lead" event fired ✅

---

#### 5.3 Verify in Facebook Events Manager

1. Go to https://business.facebook.com/events_manager2
2. Select your Pixel
3. Click **Test Events** tab
4. You should see the "Lead" event appear within 30 seconds
5. Expand it to see:
   - Event Name: Lead
   - Event Source: Server (this is from Conversions API!) ✅
   - Customer Information: Email (hashed), Phone (if provided)
   - Custom Data: service, meeting_id

---

#### 5.4 Verify in Google Analytics

1. Go to https://analytics.google.com
2. Select your property
3. Click **Reports** → **Realtime** → **Overview**
4. You should see your session active
5. Page views updating as you navigate

---

## 🎉 You're Done! Congratulations!

Your site is now:
- ✅ Tracking visitors with Google Analytics
- ✅ Managing tags with Google Tag Manager  
- ✅ Tracking conversions with Facebook Pixel
- ✅ Sending server-side events for better accuracy
- ✅ Ready to run Facebook ads with proper attribution

---

## 📊 What Gets Tracked

### Automatic Tracking
- **Page Views**: Every page navigation
- **Meeting Requests**: Lead event on submission
- **Team Member Hires**: Lead event with team member info

### Available Events (you can add these later)
- `FacebookEvents.ViewContent()` - View service details
- `FacebookEvents.AddToCart()` - Add service to cart
- `FacebookEvents.Purchase()` - Complete purchase
- `FacebookEvents.Contact()` - Contact button clicks

---

## 🚨 Troubleshooting

### "No GTM Container Found"
- Double-check the Container ID in `.env.local` and Vercel
- Format must be: `GTM-XXXXXXX` (no spaces, no quotes)
- Redeploy after updating Vercel variables

### "Facebook Pixel Not Loading"
- Check Pixel ID is exactly 16 digits
- No spaces, no quotes in `.env.local` and Vercel
- Clear browser cache and refresh

### "Server Events Not Showing"
- Check Access Token is correctly set in Vercel
- Variable name must be exactly: `FACEBOOK_CONVERSIONS_API_TOKEN`
- Token must start with `EAAG`
- Check Vercel function logs for errors

### "Lead Event Not Firing"
- Open browser Console (F12)
- Check for JavaScript errors
- Submit meeting form again
- Wait 30 seconds, then check Facebook Test Events tab

---

## 📞 Need Help?

### Check Documentation
All detailed guides are in your project folder:

1. **PRODUCTION_CHECKLIST.md** - Complete launch checklist
2. **FACEBOOK_SERVER_SIDE_TRACKING.md** - Conversions API setup
3. **MEETING_AUDIT_REPORT.md** - Meeting form details
4. **PROJECT_SUMMARY.md** - Everything we implemented

### Check Logs
- **Vercel Logs**: https://vercel.com → Deployments → View Function Logs
- **Browser Console**: F12 → Console tab
- **Facebook Diagnostics**: Events Manager → Diagnostics tab

---

## 🎯 Success Checklist

After following all steps above, verify:

- [ ] GTM Container loads on homepage (Tag Assistant shows green)
- [ ] Facebook Pixel loads on homepage (Pixel Helper shows green)
- [ ] Google Analytics shows real-time visitor (you)
- [ ] Meeting form submits successfully
- [ ] Lead event appears in Facebook Test Events (within 30 seconds)
- [ ] Email notification received by manager
- [ ] No errors in Vercel logs
- [ ] No errors in browser console
- [ ] Site loads fast (< 3 seconds)
- [ ] Mobile view works correctly

**If all checked**: 🎉 **YOU'RE LIVE!** 🎉

---

## 📈 Next Steps After Launch

### Week 1
- Monitor analytics daily
- Check for any errors in Vercel logs
- Test from different devices
- Gather user feedback

### Month 1
- Review Facebook Event Match Quality score (goal: > 6.0)
- Optimize based on analytics data
- A/B test different CTAs
- Add more tracking events as needed

### Ongoing
- Keep environment variables secure
- Update dependencies monthly
- Monitor performance (Lighthouse)
- Refresh content regularly

---

## 🚀 Ready to Launch?

Just follow the 5 steps above:

1. ⏱️ Get Tracking IDs (30 min)
2. ⏱️ Update Environment Variables (10 min)
3. ⏱️ Test Locally (10 min)
4. ⏱️ Deploy to Production (5 min)
5. ⏱️ Verify Tracking (10 min)

**Total Time**: ~1 hour

**Let's make it happen!** 🎉

---

**Quick Reference**:
- Vercel: https://vercel.com/kitchenoftech
- Google Analytics: https://analytics.google.com
- GTM: https://tagmanager.google.com
- Facebook Events: https://business.facebook.com/events_manager2

**Your site**: https://kitchenoftech.org

Good luck! 🚀
