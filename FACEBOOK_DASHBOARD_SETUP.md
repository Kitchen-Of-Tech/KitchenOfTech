# 🔐 Facebook App Dashboard - Quick Setup Guide

## Facebook App Information
**App ID:** 2664380460608660  
**App Name:** KitchenOfTech  
**Status:** Development / Production

---

## 📋 Step-by-Step Configuration

### 1. Access Facebook Developers Console
Go to: https://developers.facebook.com/apps/2664380460608660/settings/basic/

### 2. Add Required URLs

#### Privacy Policy URL
```
https://kitchenoftech.org/privacy
```
OR for testing:
```
http://localhost:3000/privacy
```

#### Terms of Service URL
```
https://kitchenoftech.org/terms
```
OR for testing:
```
http://localhost:3000/terms
```

#### App Domain
```
kitchenoftech.org
```

#### Site URL (if asked)
```
https://kitchenoftech.org
```

### 3. OAuth Redirect URIs

**For NextAuth.js:**

Production:
```
https://kitchenoftech.org/api/auth/callback/facebook
```

Development (for testing):
```
http://localhost:3000/api/auth/callback/facebook
```

**Location in Facebook Dashboard:**
- Go to: `Facebook Login` → `Settings`
- Add to: `Valid OAuth Redirect URIs`

### 4. App Settings Summary

| Setting | Value |
|---------|-------|
| **App ID** | 2664380460608660 |
| **App Secret** | e5412625eed111b6d5865540daf07bc2 |
| **Display Name** | KitchenOfTech |
| **App Domains** | kitchenoftech.org |
| **Privacy Policy URL** | https://kitchenoftech.org/privacy |
| **Terms of Service URL** | https://kitchenoftech.org/terms |
| **Category** | Business |

---

## 🔧 Environment Variables Check

Verify these are in your `.env.local`:

```bash
# Facebook OAuth
FACEBOOK_CLIENT_ID=2664380460608660
FACEBOOK_CLIENT_SECRET=e5412625eed111b6d5865540daf07bc2

# NextAuth
NEXTAUTH_URL=https://kitchenoftech.org
NEXTAUTH_SECRET=6BJ79q7mH9NrbSW42Jt4i7lEYUJIojIhFlSN0mhVYFc=
```

✅ **Already configured in your .env.local**

---

## 🎯 Permissions & Features

### Permissions to Request:

1. **public_profile** (Default)
   - ✅ Usually pre-approved
   - Provides: Name, profile picture, age range, gender

2. **email** (Standard)
   - ✅ Usually pre-approved
   - Provides: User's email address

### How to Check Permissions:

1. Go to: `App Review` → `Permissions and Features`
2. Verify status:
   - ✅ `public_profile` - Should be approved
   - ✅ `email` - Should be approved

---

## 🚀 Testing Facebook Login

### Test Flow:

1. **Start Local Dev Server**
   ```bash
   npm run dev
   ```

2. **Visit Article Submit Page**
   ```
   http://localhost:3000/articles/submit
   ```

3. **Click "Continue with Facebook"**
   - Should redirect to Facebook login
   - Should show permissions dialog
   - Should redirect back to your site

4. **Verify User Session**
   - Check if user name appears
   - Check if profile picture loads
   - Verify can submit articles

### Test Users (Development Mode Only)

If app is in Development Mode, add test users:

1. Go to: `Roles` → `Test Users`
2. Click: `Add Test Users`
3. Create 1-2 test accounts
4. Use these to test Facebook Login without affecting real accounts

---

## 📱 App Review Checklist

### Before Submitting for Review:

- ✅ Privacy Policy page is live and accessible
- ✅ Terms of Service page is live and accessible
- ✅ Both pages clearly mention Facebook Login
- ✅ App Icon uploaded (1024x1024px)
- ✅ App functionality clearly explained
- ✅ Screenshots of app usage provided
- ✅ Data usage clearly documented
- ✅ Test all features work correctly

### What Facebook Reviews:

1. **Privacy Policy** - Must explain Facebook data usage
2. **Terms of Service** - Must include user rights
3. **Data Access** - Only request necessary permissions
4. **User Experience** - App must work as described
5. **Platform Policy** - Must comply with Facebook policies

### Review Timeline:
- Usually 2-5 business days
- May request additional information
- Can resubmit if rejected

---

## 🔍 Common Issues & Solutions

### Issue 1: "Invalid OAuth Redirect URI"
**Solution:**
- Add exact callback URL to Facebook settings
- Format: `https://yourdomain.com/api/auth/callback/facebook`
- No trailing slash

### Issue 2: "App Not Set Up: This app is still in development mode"
**Solution:**
- Add yourself as a developer/tester
- OR submit app for review
- OR make app public (if ready)

### Issue 3: "Privacy Policy URL not accessible"
**Solution:**
- Ensure page is deployed to production
- Test URL in incognito browser
- Check for authentication walls
- Ensure page loads without JavaScript

### Issue 4: Terms page shows 404
**Solution:**
- Verify file exists at `app/terms/page.tsx`
- Check deployment completed successfully
- Clear browser cache
- Test with: `curl https://kitchenoftech.org/terms`

---

## 📊 Facebook App Dashboard Sections

### Essential Settings:

1. **Basic Settings**
   - App ID, App Secret
   - Display Name
   - Contact Email
   - Privacy Policy URL ⭐
   - Terms of Service URL ⭐
   - App Icon
   - Category

2. **Facebook Login Settings**
   - Valid OAuth Redirect URIs ⭐
   - Login from Devices
   - Client OAuth Settings
   - Deauthorize Callback URL

3. **App Review**
   - Permissions Status
   - Submission History
   - App Details

4. **Roles**
   - Administrators
   - Developers
   - Testers
   - Test Users

5. **Advanced Settings**
   - Server IP Whitelist
   - Client Token
   - OAuth Flow Settings

---

## 🎨 Quick Access Links

| Page | URL |
|------|-----|
| **Facebook App Dashboard** | https://developers.facebook.com/apps/2664380460608660/ |
| **Basic Settings** | https://developers.facebook.com/apps/2664380460608660/settings/basic/ |
| **Facebook Login Settings** | https://developers.facebook.com/apps/2664380460608660/fb-login/settings/ |
| **App Review** | https://developers.facebook.com/apps/2664380460608660/app-review/ |
| **Privacy Policy** | https://kitchenoftech.org/privacy |
| **Terms of Service** | https://kitchenoftech.org/terms |

---

## 💡 Pro Tips

1. **Always Test First**
   - Test with localhost before deploying
   - Add test users in development mode
   - Verify all flows work end-to-end

2. **Keep URLs Consistent**
   - Use same domain everywhere
   - Include https:// in production
   - No trailing slashes in redirect URIs

3. **Monitor App Status**
   - Check Facebook App Dashboard regularly
   - Watch for policy violation warnings
   - Keep email updated for notifications

4. **Documentation**
   - Keep record of all settings
   - Screenshot important configurations
   - Document any custom implementations

5. **Security**
   - Never commit secrets to Git
   - Rotate secrets if exposed
   - Use environment variables
   - Keep .env.local secure

---

## ✅ Final Checklist

Before going live with Facebook Login:

- [ ] Privacy Policy deployed to production
- [ ] Terms of Service deployed to production
- [ ] Both URLs added to Facebook App Dashboard
- [ ] OAuth redirect URIs configured
- [ ] App domain added
- [ ] Test Facebook Login flow
- [ ] Verify user data syncing to Sanity
- [ ] Check session persistence (30 days)
- [ ] Test logout functionality
- [ ] Verify article submission works
- [ ] Test comment system with Facebook auth
- [ ] Check author profile display
- [ ] Monitor error logs
- [ ] Submit for App Review (if needed)

---

## 🎯 Current Status

✅ **Completed:**
- Privacy Policy page created
- Terms of Service page created
- Both pages are visually appealing
- Dark mode supported
- Mobile responsive
- SEO optimized
- Facebook-specific sections included
- GDPR & CCPA compliant

⏳ **Pending:**
- Deploy pages to production
- Add URLs to Facebook App Dashboard
- Test Facebook Login flow
- Submit for App Review (if needed)

---

## 📞 Support Resources

**Facebook Developer Support:**
- Docs: https://developers.facebook.com/docs/facebook-login
- Support: https://developers.facebook.com/support
- Community: https://stackoverflow.com/questions/tagged/facebook-graph-api

**Your Support:**
- Email: support@kitchenoftech.com
- Legal: legal@kitchenoftech.com
- Privacy: privacy@kitchenoftech.com

---

**Last Updated:** February 4, 2026  
**App Version:** Production Ready  
**NextAuth Version:** 4.24.13
