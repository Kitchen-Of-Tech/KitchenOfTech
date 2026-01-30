# Articles Feature Setup Guide

## 🚀 Complete Setup Documentation

This guide will walk you through setting up the required credentials for the Articles/Blog feature with Facebook authentication and Google AdSense monetization.

---

## 📋 Required Environment Variables

You need to configure three main services:

1. **NextAuth Secret** - For secure session management
2. **Facebook OAuth** - For author authentication
3. **Google AdSense** - For articles monetization

---

## 1️⃣ NextAuth Secret Configuration

### What is NEXTAUTH_SECRET?

A secret key used to encrypt JWT tokens and secure your authentication sessions.

### How to Generate:

#### Option A: Using OpenSSL (Recommended)
```bash
openssl rand -base64 32
```

#### Option B: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Option C: Using PowerShell
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Option D: Online Generator
Visit: https://generate-secret.vercel.app/32

### Add to .env.local:
```bash
NEXTAUTH_SECRET=your-generated-secret-here
```

**⚠️ Important:** 
- Keep this secret and never commit it to Git
- Use a different secret for production
- Must be at least 32 characters long

---

## 2️⃣ Facebook OAuth Setup

### Step 1: Create a Facebook App

1. **Go to Facebook Developers Console:**
   - Visit: https://developers.facebook.com/
   - Log in with your Facebook account

2. **Create a New App:**
   - Click **"Create App"**
   - Select **"Consumer"** as the app type
   - Click **"Next"**

3. **Fill in App Details:**
   - **App Name:** KitchenOfTech Articles (or your site name)
   - **App Contact Email:** Your email address
   - Click **"Create App"**

### Step 2: Add Facebook Login Product

1. **From your App Dashboard:**
   - Scroll down to **"Add Products to Your App"**
   - Find **"Facebook Login"** and click **"Set Up"**

2. **Choose Platform:**
   - Select **"Web"**
   - Skip the quickstart (we've already integrated it)

### Step 3: Configure OAuth Settings

1. **Go to Facebook Login Settings:**
   - Left sidebar: **Products → Facebook Login → Settings**

2. **Add Valid OAuth Redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://yourdomain.com/api/auth/callback/facebook
   ```
   - Replace `yourdomain.com` with your actual domain
   - Add both development and production URLs

3. **Client OAuth Settings:**
   - ✅ Enable: **"Use Strict Mode for Redirect URIs"**
   - ✅ Enable: **"Client OAuth Login"**
   - ✅ Enable: **"Web OAuth Login"**

4. **Save Changes**

### Step 4: Get Your Credentials

1. **Go to Settings → Basic:**
   - Left sidebar: **Settings → Basic**

2. **Copy Your Credentials:**
   - **App ID** → This is your `FACEBOOK_CLIENT_ID`
   - **App Secret** → Click **"Show"**, verify your password, copy the secret

3. **Add to .env.local:**
   ```bash
   FACEBOOK_CLIENT_ID=your-app-id-here
   FACEBOOK_CLIENT_SECRET=your-app-secret-here
   ```

### Step 5: Make App Live (For Production)

1. **App Review:**
   - Go to **Settings → Basic**
   - Toggle **"App Mode"** from **Development** to **Live**

2. **Required Permissions:**
   - The app uses: `email`, `public_profile`
   - These are approved by default, no review needed

### Testing Facebook Login:

- In **Development Mode**: Only test users and developers can log in
- In **Live Mode**: Anyone can log in
- Manage test users: **Roles → Test Users**

---

## 3️⃣ Google AdSense Setup

### Step 1: Create Google AdSense Account

1. **Sign Up for AdSense:**
   - Visit: https://www.google.com/adsense
   - Click **"Get Started"**
   - Sign in with your Google account

2. **Fill in Website Information:**
   - Enter your website URL: `https://kitchenoftech.org`
   - Submit application for review

### Step 2: Add Your Site

1. **After Approval:**
   - Go to **Sites** in AdSense dashboard
   - Click **"Add site"**
   - Enter: `kitchenoftech.org`

### Step 3: Get Your Publisher ID

1. **Find Your Publisher ID:**
   - AdSense Dashboard → **Account → Account Information**
   - Look for **"Publisher ID"**
   - Format: `ca-pub-XXXXXXXXXXXXXXXX`

2. **Copy the Full ID:**
   ```
   ca-pub-5440986495958060
   ```

3. **Add to .env.local:**
   ```bash
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-5440986495958060
   ```

### Step 4: Create Ad Units

1. **Go to Ads:**
   - AdSense Dashboard → **Ads → By ad unit**

2. **Create Display Ads:**
   - Click **"By ad unit" → "Display ads"**
   - Create the following ad units:

#### Ad Unit 1: Article Top Banner
   - **Name:** Article Top Banner
   - **Type:** Display ad
   - **Size:** Horizontal (728x90 or Responsive)
   - Click **"Create"** → Copy the **Ad Slot ID**

#### Ad Unit 2: Article Sidebar
   - **Name:** Article Sidebar
   - **Type:** Display ad
   - **Size:** Vertical (300x600 or Responsive)
   - Click **"Create"** → Copy the **Ad Slot ID**

#### Ad Unit 3: Article In-Content
   - **Name:** Article In-Content
   - **Type:** Display ad
   - **Size:** Rectangle (300x250 or Responsive)
   - Click **"Create"** → Copy the **Ad Slot ID**

#### Ad Unit 4: Article Bottom
   - **Name:** Article Bottom
   - **Type:** Display ad
   - **Size:** Horizontal (728x90 or Responsive)
   - Click **"Create"** → Copy the **Ad Slot ID**

#### Ad Unit 5: Articles List Top
   - **Name:** Articles List Top
   - **Type:** Display ad
   - **Size:** Horizontal (728x90 or Responsive)
   - Click **"Create"** → Copy the **Ad Slot ID**

#### Ad Unit 6: Articles List In-Feed
   - **Name:** Articles List In-Feed
   - **Type:** In-feed ad
   - **Size:** Responsive
   - Click **"Create"** → Copy the **Ad Slot ID**

#### Ad Unit 7: Submit Page Banner
   - **Name:** Submit Page Banner
   - **Type:** Display ad
   - **Size:** Horizontal (728x90 or Responsive)
   - Click **"Create"** → Copy the **Ad Slot ID**

### Step 5: Update Ad Slot IDs

Open `components/articles/GoogleAd.tsx` and update the `AdSlots` object with your real ad slot IDs:

```typescript
export const AdSlots = {
  ARTICLE_TOP: '1234567890',        // Replace with your Ad Slot ID
  ARTICLE_SIDEBAR: '1234567891',    // Replace with your Ad Slot ID
  ARTICLE_BOTTOM: '1234567892',     // Replace with your Ad Slot ID
  ARTICLE_IN_CONTENT: '1234567893', // Replace with your Ad Slot ID
  ARTICLES_LIST_TOP: '1234567894',  // Replace with your Ad Slot ID
  ARTICLES_LIST_SIDEBAR: '1234567895', // Replace with your Ad Slot ID
  SUBMIT_PAGE: '1234567896',        // Replace with your Ad Slot ID
};
```

---

## 📝 Final .env.local Configuration

Your complete `.env.local` file should look like this:

```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=owj91fgd
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=skUYrg2njp5nCUyDBATrTroTBjOtHk8lRdntrfWop7RcgriWRfxpFmP57VgUBKcMfn45cJLWJSpdFkE7GFfs2RsNjv5uv94GTlcNve9UvjY5abpmSOu0qzvPzBFkHGdUHMglbV59MWGeF1DqKJcrsJ7l0CoMD5eJQL2PHBqIxry6KUQay18l

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ejrnlhymgnhrghutevch.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcm5saHltZ25ocmdodXRldmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzIzNDUsImV4cCI6MjA4NDE0ODM0NX0.HjBuvjxAYWIZcOwPatYq2od8epHmiVcY0NLYU0Q9N7I
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcm5saHltZ25ocmdodXRldmNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU3MjM0NSwiZXhwIjoyMDg0MTQ4MzQ1fQ.9oxwCn8sCKgGK2ajeyPqq8KiU8yLIR5P3Fkvt4nhAHM

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://kitchenoftech.org

# Email Configuration
RESEND_API_KEY=re_WNiQ8k3F_4itva6Ewoznq3YPwmBb9aAao
EMAIL_FROM=noreply@kitchenoftech.com
EMAIL_FROM_NAME=KitchenOfTech

# Security
JWT_SECRET=bfMgEnT87c0CG1fTBOAMynp96GhoT+/wr52FQ+rkmjY=

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=REPLACE_WITH_GENERATED_SECRET_FROM_STEP_1
FACEBOOK_CLIENT_ID=REPLACE_WITH_YOUR_FACEBOOK_APP_ID
FACEBOOK_CLIENT_SECRET=REPLACE_WITH_YOUR_FACEBOOK_APP_SECRET

# Google AdSense (for Articles monetization)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-5440986495958060
```

---

## ✅ Verification Checklist

Before testing, make sure you have:

- [ ] Generated and added `NEXTAUTH_SECRET`
- [ ] Created Facebook App and added `FACEBOOK_CLIENT_ID`
- [ ] Copied Facebook App Secret and added `FACEBOOK_CLIENT_SECRET`
- [ ] Configured Facebook OAuth redirect URIs
- [ ] Created/approved Google AdSense account
- [ ] Added `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- [ ] Created 7 ad units in AdSense
- [ ] Updated ad slot IDs in `components/articles/GoogleAd.tsx`
- [ ] Restarted your development server

---

## 🧪 Testing the Setup

### 1. Test NextAuth & Facebook Login:

```bash
# Restart your dev server
npm run dev
```

1. Visit: `http://localhost:3000/articles`
2. Click **"Submit Your Article"**
3. You should be redirected to Facebook login
4. After login, you should land on the submission page
5. Check the database - a new `articleAuthor` document should be created

### 2. Test Article Submission:

1. Fill in the article form:
   - Title (10-200 chars)
   - Excerpt (optional)
   - Cover image (max 5MB)
   - Category
   - Tags
   - Content (min 100 chars)

2. Click **"Preview"** to see how it looks

3. Click **"Publish Article"**

4. You should be redirected to your published article

### 3. Test AdSense Ads:

**Note:** Ads may not show immediately because:
- AdSense requires your site to be live and approved
- Development environment may block ads
- New ad units need 24-48 hours to activate

To verify ads are properly integrated:
1. Right-click on the page
2. Click **"View Page Source"**
3. Search for `pagead2.googlesyndication.com` - you should find the script
4. Search for `ca-pub-5440986495958060` - you should find your publisher ID

### 4. Test Dashboard:

1. Visit: `http://localhost:3000/dashboard/articles`
   - Should show all articles with stats
   - Test delete/archive functionality

2. Visit: `http://localhost:3000/dashboard/authors`
   - Should show all authors
   - Test ban/unban functionality
   - Check author rankings (7 days/30 days/1 year)

---

## 🚨 Troubleshooting

### Issue: Facebook Login Fails

**Symptoms:** Redirect loop, "OAuth error", or "Invalid redirect URI"

**Solutions:**
1. Check Facebook App Settings → Products → Facebook Login → Settings
2. Verify redirect URI is exactly: `http://localhost:3000/api/auth/callback/facebook`
3. Make sure app is in Development mode (for testing) or Live mode (for production)
4. Check that `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` are correct
5. Verify `NEXTAUTH_URL` matches your current URL

### Issue: Session Not Persisting

**Symptoms:** Keep getting logged out, session is null

**Solutions:**
1. Make sure `NEXTAUTH_SECRET` is set and is at least 32 characters
2. Clear browser cookies and localStorage
3. Restart dev server after changing `.env.local`

### Issue: Ads Not Showing

**Symptoms:** Blank spaces where ads should be

**Solutions:**
1. **Check if AdSense account is approved** - New accounts take 1-3 days
2. **Verify site is added** - Go to AdSense → Sites
3. **Check ad slot IDs** - Make sure they match your AdSense dashboard
4. **Wait 24-48 hours** - New ad units need time to activate
5. **Check browser console** - Look for AdSense errors
6. **Ad blockers** - Disable any ad-blocking extensions
7. **Development mode** - Some ad networks block localhost

**To test ads work in production:**
```bash
npm run build
npm start
```

Then visit: `http://localhost:3000/articles`

### Issue: Articles Not Saving to Sanity

**Symptoms:** "Failed to submit article" error

**Solutions:**
1. Check `SANITY_API_TOKEN` has write permissions
2. Verify Sanity schemas are deployed: `npx sanity deploy`
3. Check browser console for detailed error messages
4. Verify article schemas exist in Sanity Studio

### Issue: Author Not Created on Facebook Login

**Symptoms:** Login works but author missing in Sanity

**Solutions:**
1. Check the API route: `/api/articles/authors/sync`
2. Verify `articleAuthor` schema is deployed
3. Check server logs for errors
4. Test the sync endpoint manually

---

## 🔒 Security Best Practices

### For Production:

1. **Use HTTPS:**
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. **Generate New Production Secrets:**
   - Generate a new `NEXTAUTH_SECRET` for production
   - Never reuse development secrets

3. **Secure Environment Variables:**
   - Use Vercel/Netlify environment variables (not committed to Git)
   - Enable "Encrypted" option for sensitive values

4. **Facebook App Settings:**
   - Remove `localhost` from OAuth redirect URIs in production
   - Only keep your production domain

5. **Monitor AdSense:**
   - Regularly check AdSense policy compliance
   - Monitor invalid click activity
   - Keep ads only on articles pages (already isolated)

---

## 📚 Additional Resources

### NextAuth:
- Documentation: https://next-auth.js.org/
- Facebook Provider: https://next-auth.js.org/providers/facebook

### Facebook Developers:
- App Dashboard: https://developers.facebook.com/apps/
- Login Documentation: https://developers.facebook.com/docs/facebook-login/web

### Google AdSense:
- Dashboard: https://www.google.com/adsense/
- Help Center: https://support.google.com/adsense/
- Policy Center: https://support.google.com/adsense/answer/48182

---

## 🎉 You're All Set!

Once all credentials are configured, your Articles feature is ready to use with:
- ✅ Facebook authentication for authors
- ✅ Article submission with rich content
- ✅ Dashboard management for articles and authors
- ✅ Google AdSense monetization (articles only)

**Happy blogging! 🚀**

---

## 📞 Support

If you encounter any issues not covered in this guide:
1. Check the browser console for errors
2. Check the server terminal for error logs
3. Review the Sanity Studio for data integrity
4. Verify all environment variables are correct

---

*Last Updated: January 30, 2026*
