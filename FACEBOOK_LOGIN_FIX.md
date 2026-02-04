# 🔧 Facebook Login Fix - Complete Checklist

## Error: "Facebook Login is currently unavailable for this app"

This error occurs when Facebook App is missing required configuration or is in Development Mode with restrictions.

---

## ✅ STEP-BY-STEP FIX

### **Step 1: Basic Settings (CRITICAL)**

Go to: https://developers.facebook.com/apps/2664380460608660/settings/basic/

**Required Fields:**

1. **App Domains:**
   ```
   kitchenoftech.org
   ```
   ⚠️ NO `https://` or `www` - just the domain name

2. **Privacy Policy URL:**
   ```
   https://kitchenoftech.org/privacy
   ```
   ✅ Must be live and accessible (you already have this)

3. **Terms of Service URL:**
   ```
   https://kitchenoftech.org/terms
   ```
   ✅ Must be live and accessible (you already have this)

4. **App Icon:** 
   - Upload 1024x1024px icon
   - Required for public apps

5. **Category:**
   - Select: **Business** or **Productivity**

6. **Contact Email:**
   - Add a valid email address
   - This is where Facebook will contact you

**⚠️ CLICK "SAVE CHANGES" at the bottom!**

---

### **Step 2: Facebook Login Settings**

Go to: https://developers.facebook.com/apps/2664380460608660/fb-login/settings/

**Valid OAuth Redirect URIs:**
```
https://kitchenoftech.org/api/auth/callback/facebook
http://localhost:3000/api/auth/callback/facebook
```

**Client OAuth Settings:**
- ✅ Use Strict Mode for Redirect URIs: **Yes**
- ✅ Login from Devices: **No** (unless you have mobile app)

**⚠️ CLICK "SAVE CHANGES"!**

---

### **Step 3: App Mode (MOST IMPORTANT)**

Your app might be in **Development Mode**. Here's how to fix:

#### **Option A: Make App Public (Recommended for Production)**

1. Go to: https://developers.facebook.com/apps/2664380460608660/app-review/

2. Look for **"App Mode"** toggle at the top

3. Current status is likely: **"Development"** (red/orange)

4. **Switch to "Live"** (green)

5. Facebook will check:
   - ✅ Privacy Policy URL is valid
   - ✅ Terms of Service URL is valid
   - ✅ App Domain is set
   - ✅ Contact Email is set
   - ✅ App Icon is uploaded

6. If all requirements met, toggle will turn GREEN = **Live**

#### **Option B: Add Test Users (If staying in Development)**

If you keep the app in Development Mode:

1. Go to: **Roles** → **Test Users**
2. Click **"Add Test Users"**
3. Create 2-3 test accounts
4. **OR** Add your personal Facebook account:
   - Go to **Roles** → **Roles**
   - Click **"Add Administrators"** or **"Add Developers"**
   - Add your Facebook account

**⚠️ Only accounts added as Developers/Testers/Admins can use the app in Development Mode!**

---

### **Step 4: Verify Data Use Checkup**

Facebook might require you to complete a Data Use Checkup:

1. Go to: **Settings** → **Advanced**

2. Look for: **"Data Use Checkup"** or warning banners

3. If you see a warning, click **"Start Checkup"**

4. Answer questions about:
   - What data you collect (public_profile, email)
   - How you use the data (authentication, user profiles)
   - Data retention policy

5. Complete the checkup

---

### **Step 5: Verify Your Domain**

Sometimes Facebook requires domain verification:

1. Go to: **Settings** → **Basic** → Scroll down to **"App Domains"**

2. Click **"Add Domain"**

3. Enter: `kitchenoftech.org`

4. Facebook will provide a verification method:
   - **Meta Tag** (add to your website's `<head>`)
   - **DNS TXT Record** (add to your domain DNS)
   - **HTML File Upload** (upload file to root)

5. Choose easiest method and complete verification

---

## 🔍 DIAGNOSTIC CHECKLIST

Check each item in Facebook Dashboard:

### **Basic Settings:**
- [ ] App Display Name: **Set** (e.g., "KitchenOfTech")
- [ ] App Contact Email: **Set and verified**
- [ ] App Icon: **Uploaded** (1024x1024px)
- [ ] App Domain: `kitchenoftech.org` **Added**
- [ ] Privacy Policy URL: `https://kitchenoftech.org/privacy` **Set**
- [ ] Terms of Service URL: `https://kitchenoftech.org/terms` **Set**
- [ ] Category: **Selected** (Business)

### **Facebook Login Settings:**
- [ ] Valid OAuth Redirect URIs: **Added both URLs**
- [ ] Redirect URIs saved successfully
- [ ] Test check shows: ✅ "Valid redirect URI"

### **App Review & Status:**
- [ ] App Mode: **Live** (green) - OR -
- [ ] App Mode: **Development** with your account added as Developer/Tester
- [ ] No pending Data Use Checkup warnings
- [ ] No policy violation warnings

### **Permissions:**
- [ ] `public_profile` - Available
- [ ] `email` - Available

---

## 🚨 COMMON ISSUES & FIXES

### **Issue 1: "App is in Development Mode"**

**Symptoms:**
- Error: "Facebook Login is currently unavailable"
- Only works for app developers

**Fix:**
1. Switch app to **Live** mode
2. OR add your Facebook account as Administrator/Developer
3. Go to: **Roles** → **Roles** → **Add People**

---

### **Issue 2: "Privacy Policy URL Required"**

**Symptoms:**
- Can't switch to Live mode
- Warning about missing Privacy Policy

**Fix:**
1. Ensure `https://kitchenoftech.org/privacy` is live and accessible
2. Open in incognito browser to verify
3. Re-enter URL in Facebook Dashboard
4. Save changes

---

### **Issue 3: "Invalid OAuth Redirect URI"**

**Symptoms:**
- Redirect fails after Facebook login
- Error about invalid URI

**Fix:**
1. Verify exact format:
   ```
   https://kitchenoftech.org/api/auth/callback/facebook
   ```
2. No trailing slash
3. Must match your NEXTAUTH_URL domain
4. Save changes and wait 1-2 minutes

---

### **Issue 4: "App Not Set Up"**

**Symptoms:**
- "This app is still in development mode"
- Can't login with regular Facebook accounts

**Fix:**
1. Complete all Basic Settings fields
2. Switch to Live mode
3. OR add users to Roles

---

## 🎯 RECOMMENDED SOLUTION

Based on your setup, here's what you should do:

### **For Immediate Testing:**

1. **Add yourself as Administrator:**
   ```
   Dashboard → Roles → Roles → Add Administrators
   → Enter your Facebook email/profile
   ```

2. **Keep app in Development Mode** (for now)

3. **Test Facebook Login** with your account

### **For Production (Going Live):**

1. **Complete ALL Basic Settings:**
   - Upload App Icon
   - Add Contact Email
   - Verify Privacy Policy is accessible
   - Verify Terms is accessible
   - Set App Domain

2. **Switch App Mode to "Live":**
   ```
   Dashboard → App Review → Toggle "Development" → "Live"
   ```

3. **Monitor for any warnings** in the Dashboard

---

## 📱 TESTING PROCEDURE

After making changes:

### **Test 1: Development Mode (with your account)**

1. Ensure you're added as Administrator/Developer
2. Visit: `https://kitchenoftech.org/articles/submit`
3. Click "Continue with Facebook"
4. Should show Facebook login dialog
5. Should redirect back successfully

### **Test 2: Live Mode (with any account)**

1. Switch app to Live
2. Try with a different Facebook account (not developer)
3. Should work for any Facebook user

---

## 🔐 YOUR CURRENT CONFIGURATION

```bash
# From your .env.local
NEXTAUTH_URL=https://kitchenoftech.org
FACEBOOK_CLIENT_ID=2664380460608660
FACEBOOK_CLIENT_SECRET=e5412625eed111b6d5865540daf07bc2
```

✅ **Configuration is correct!**

The issue is in the **Facebook App Dashboard settings**, not your code.

---

## 📞 IMMEDIATE ACTION ITEMS

**Do these NOW in order:**

1. ✅ **Go to Basic Settings**
   - Add Contact Email
   - Upload App Icon (if missing)
   - Verify App Domain: `kitchenoftech.org`
   - Save Changes

2. ✅ **Go to Roles → Roles**
   - Add yourself as Administrator
   - Use your Facebook email/profile

3. ✅ **Test Facebook Login**
   - Visit: https://kitchenoftech.org/articles/submit
   - Click "Continue with Facebook"
   - Should work now!

4. ✅ **Later: Switch to Live Mode**
   - After testing works in Development
   - Complete any Data Use Checkup
   - Toggle App Mode to "Live"

---

## 🎓 WHY THIS ERROR HAPPENS

Facebook shows this error when:

1. **App in Development Mode** - You're not added as Developer/Tester
2. **Missing Required Fields** - Privacy Policy, Terms, Contact Email
3. **Pending Review** - Facebook is reviewing your app changes
4. **Policy Violation** - App flagged for policy issues (check warnings)
5. **Domain Not Verified** - Your domain isn't verified with Facebook

**Most Common Cause:** App is in Development Mode and your Facebook account isn't added as a developer.

---

## ✅ SUCCESS INDICATORS

You'll know it's fixed when:

1. ✅ No warnings in Facebook Dashboard
2. ✅ Facebook Login button works
3. ✅ Redirects to Facebook login page
4. ✅ Returns to your site successfully
5. ✅ User session created
6. ✅ Can submit articles

---

## 📧 NEED HELP?

If still not working after following ALL steps:

1. **Check Facebook Dashboard top banner** for any warnings/errors
2. **Screenshot the error** you see when clicking Facebook Login
3. **Check browser console** (F12) for errors
4. **Verify Privacy/Terms pages** are accessible publicly
5. **Wait 2-5 minutes** after saving changes (Facebook cache)

---

**App ID:** 2664380460608660  
**Domain:** kitchenoftech.org  
**Status:** Need to configure in Facebook Dashboard

**Next Step:** Follow Step 1 above and add yourself as Administrator!
