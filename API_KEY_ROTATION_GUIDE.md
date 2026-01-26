# 🔐 API Key Rotation Guide

**Status:** ⚠️ **CRITICAL - REQUIRED BEFORE PRODUCTION**  
**Estimated Time:** 30-45 minutes  
**Date:** January 27, 2026

---

## ⚠️ Why This Is Critical

Your current API keys are **exposed in the codebase** and potentially in Git history. This means:

1. **Sanity Token** - Anyone can modify your CMS content
2. **Supabase Service Role Key** - Full database access, bypass RLS
3. **Resend API Key** - Send emails from your domain

**You MUST rotate these keys before deploying to production.**

---

## 📋 Pre-Rotation Checklist

Before you start, make sure you have:

- [ ] Access to Sanity dashboard (https://sanity.io/manage)
- [ ] Access to Supabase dashboard (https://supabase.com/dashboard)
- [ ] Access to Resend dashboard (https://resend.com/api-keys)
- [ ] `.env.local` file ready to update
- [ ] No running dev servers (stop them before rotating)
- [ ] Backup of current `.env.local` (just in case)

---

## 🔄 Step-by-Step Rotation Process

### 1️⃣ Rotate Sanity API Token

**Current Exposed Token Location:**
- File: `.env.local`
- Variable: `SANITY_API_TOKEN`

**Steps:**

1. **Go to Sanity Dashboard**
   ```
   https://sanity.io/manage
   ```

2. **Navigate to Your Project**
   - Click on your project: "KitchenOfTech"
   - Go to "API" section in left sidebar

3. **Find the Exposed Token**
   - Look for tokens in the "Tokens" tab
   - Find the token that starts with the prefix in your `.env.local`

4. **Delete the Exposed Token**
   - Click the three dots (⋮) next to the token
   - Click "Delete"
   - Confirm deletion

5. **Create New Token**
   - Click "Add API token"
   - Name: `Production Editor Token - Jan 2026`
   - Permissions: **Editor** (allows read + write)
   - Click "Create"

6. **Copy the New Token**
   - ⚠️ **IMPORTANT:** Copy it immediately - you can only see it once!
   - Format: `skXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

7. **Update `.env.local`**
   ```bash
   # Old (exposed)
   # SANITY_API_TOKEN=skXXXXXXXXXXXXXXXXXXXXX_OLD_TOKEN

   # New (secure)
   SANITY_API_TOKEN=skXXXXXXXXXXXXXXXXXXXXX_NEW_TOKEN
   ```

---

### 2️⃣ Rotate Supabase Service Role Key

**Current Exposed Key Location:**
- File: `.env.local`
- Variable: `SUPABASE_SERVICE_ROLE_KEY`

**Steps:**

1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Select Your Project**
   - Click on "KitchenOfTech" project

3. **Navigate to API Settings**
   - Click "Settings" in left sidebar
   - Click "API" under Settings

4. **Find Service Role Key Section**
   - Scroll down to "Project API keys"
   - Find "service_role" key (secret)

5. **Generate New Service Role Key**
   - ⚠️ **Note:** Supabase doesn't allow direct key rotation through UI
   - You need to **reset the project's JWT secret** to invalidate old keys
   
   **Option A: Reset JWT Secret (Recommended)**
   - Go to "Settings" → "API"
   - Scroll to "JWT Settings"
   - Click "Generate new JWT secret"
   - ⚠️ This will invalidate ALL existing tokens
   - Confirm the action

   **Option B: Contact Support**
   - If you need to preserve existing user sessions
   - Contact Supabase support for key rotation without JWT reset

6. **Copy New Service Role Key**
   - After JWT reset, new keys are generated
   - Copy the new `service_role` key
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

7. **Update `.env.local`**
   ```bash
   # Old (exposed)
   # SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_OLD

   # New (secure)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_NEW
   ```

8. **Also Update Anon Key** (if needed)
   ```bash
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_NEW_ANON
   ```

---

### 3️⃣ Rotate Resend API Key

**Current Exposed Key Location:**
- File: `.env.local`
- Variable: `RESEND_API_KEY`

**Steps:**

1. **Go to Resend Dashboard**
   ```
   https://resend.com/api-keys
   ```

2. **Find the Exposed Key**
   - Look for your current API key in the list
   - Check the "Created" date to identify it

3. **Delete the Exposed Key**
   - Click the trash icon (🗑️) next to the key
   - Confirm deletion

4. **Create New API Key**
   - Click "Create API Key"
   - Name: `KitchenOfTech Production - Jan 2026`
   - Permission: **Full Access** (or specific domain)
   - Click "Create"

5. **Copy the New Key**
   - ⚠️ **IMPORTANT:** Copy immediately - shown only once!
   - Format: `re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

6. **Update `.env.local`**
   ```bash
   # Old (exposed)
   # RESEND_API_KEY=re_XXXXXXXXXXXXXX_OLD

   # New (secure)
   RESEND_API_KEY=re_XXXXXXXXXXXXXX_NEW
   ```

---

### 4️⃣ Update JWT Secret

**Current JWT Secret:**
- File: `.env.local`
- Variable: `JWT_SECRET`

**Steps:**

1. **Generate New Secure Secret**
   
   Use one of these methods:

   **Method A: OpenSSL (Recommended)**
   ```powershell
   # In PowerShell
   [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   ```

   **Method B: Node.js**
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   **Method C: Online Generator**
   ```
   https://generate-secret.vercel.app/32
   ```

2. **Update `.env.local`**
   ```bash
   # Old (if exposed)
   # JWT_SECRET=your_old_secret_here

   # New (secure - minimum 32 characters)
   JWT_SECRET=YOUR_NEW_GENERATED_SECRET_HERE_MIN_32_CHARS
   ```

---

## 🔍 Verification Steps

After rotating all keys, verify everything works:

### 1. Check Environment Variables

```powershell
# Run the env validation
npm run build
```

Should see:
```
✅ Environment variables validated successfully
📊 Optional Services:
  - Rate Limiting: ✅ Enabled
  - Error Monitoring: ❌ Disabled
  - Analytics: ❌ Disabled
```

### 2. Test Sanity Connection

1. Start dev server:
   ```powershell
   npm run dev
   ```

2. Open Sanity Studio:
   ```
   http://localhost:3000/studio
   ```

3. Try to:
   - View documents ✅
   - Edit a document ✅
   - Publish changes ✅

### 3. Test Supabase Connection

1. Test database query:
   ```powershell
   # Create test file: test-supabase.js
   node test-supabase.js
   ```

2. Check if queries work:
   - User authentication ✅
   - Database reads ✅
   - Database writes ✅

### 4. Test Resend Email

1. Use the contact form or trigger an email
2. Check Resend dashboard for sent emails
3. Verify email delivery ✅

---

## 📝 Updated .env.local Template

After rotation, your `.env.local` should look like this:

```bash
# ========================================
# Site Configuration
# ========================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ========================================
# Sanity CMS - ROTATED ✅
# ========================================
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=skXXXXXXXXXXXXXXXXXXXXX_NEW_TOKEN  # ← NEW TOKEN

# ========================================
# Supabase - ROTATED ✅
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_NEW_ANON  # ← NEW
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_NEW_SERVICE  # ← NEW

# ========================================
# Authentication - ROTATED ✅
# ========================================
JWT_SECRET=YOUR_NEW_GENERATED_SECRET_MIN_32_CHARS  # ← NEW SECRET

# ========================================
# Email (Resend) - ROTATED ✅
# ========================================
RESEND_API_KEY=re_XXXXXXXXXXXXXX_NEW  # ← NEW KEY
FROM_EMAIL=noreply@kitchenoftech.com

# ========================================
# Rate Limiting (Upstash Redis) - OPTIONAL
# ========================================
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# ========================================
# Error Monitoring (Sentry) - OPTIONAL
# ========================================
SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io
SENTRY_AUTH_TOKEN=your_auth_token
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project

# ========================================
# Feature Flags
# ========================================
ENABLE_ANALYTICS=false
ENABLE_RATE_LIMITING=true
ENABLE_ERROR_MONITORING=true

# ========================================
# Environment
# ========================================
NODE_ENV=development
```

---

## 🔒 Security Best Practices

After rotation, follow these practices:

### 1. Never Commit API Keys

**Check `.gitignore`:**
```bash
# Should contain:
.env
.env.local
.env*.local
```

**Verify:**
```powershell
# Check what Git is tracking
git status

# If .env.local is shown, immediately:
git rm --cached .env.local
git commit -m "Remove exposed env file"
```

### 2. Remove Keys from Git History

If keys were committed to Git:

```powershell
# Option 1: BFG Repo-Cleaner (Recommended)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Option 2: git filter-branch (Manual)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ WARNING: Rewrites history)
git push origin --force --all
```

### 3. Use Environment-Specific Keys

- **Development:** Separate keys for local testing
- **Staging:** Separate keys for staging environment
- **Production:** Unique keys for production

### 4. Rotate Keys Regularly

- **Every 90 days:** Routine rotation
- **Immediately:** If exposure is suspected
- **After team changes:** When employees leave

### 5. Monitor API Usage

- **Sanity:** Check usage in dashboard
- **Supabase:** Monitor database activity
- **Resend:** Track email sending patterns

Look for:
- ⚠️ Unexpected API calls
- ⚠️ Unusual traffic patterns
- ⚠️ Failed authentication attempts

---

## 🚨 Emergency Response

If you suspect active exploitation:

### Immediate Actions (Do Now)

1. **Rotate ALL keys immediately** (follow guide above)
2. **Check Sanity Studio** for unauthorized content changes
3. **Check Supabase logs** for suspicious database queries
4. **Check Resend dashboard** for unauthorized emails sent
5. **Review Git history** for when keys were exposed
6. **Enable 2FA** on all service accounts

### Investigation Steps

1. **Sanity Audit:**
   - Go to "History" in Sanity Studio
   - Check for unauthorized edits
   - Look for deleted content

2. **Supabase Audit:**
   - Go to "Database" → "Logs"
   - Filter by service_role usage
   - Check for unusual queries

3. **Resend Audit:**
   - Check "Logs" for sent emails
   - Verify all recipients are legitimate
   - Look for spam patterns

### Damage Control

If unauthorized access detected:

1. **Backup Everything:**
   ```powershell
   # Export Sanity data
   npx sanity dataset export production backup.tar.gz

   # Export Supabase data
   # Via dashboard or CLI
   ```

2. **Lock Down Access:**
   - Enable IP allowlisting (if available)
   - Set up API rate limits
   - Enable webhook signatures

3. **Notify Stakeholders:**
   - Inform team members
   - Update security documentation
   - File incident report

---

## ✅ Post-Rotation Checklist

After completing all rotations:

- [ ] All 4 keys rotated (Sanity, Supabase, JWT, Resend)
- [ ] `.env.local` updated with new keys
- [ ] Old keys deleted from service dashboards
- [ ] Build passes (`npm run build`)
- [ ] Dev server runs successfully
- [ ] Sanity Studio accessible
- [ ] Database queries working
- [ ] Email sending functional
- [ ] Keys removed from Git history
- [ ] `.gitignore` properly configured
- [ ] Team notified of rotation
- [ ] Documentation updated
- [ ] Calendar reminder set (rotate in 90 days)

---

## 🎯 Production Deployment Checklist

Before deploying to Vercel/production:

- [ ] All API keys rotated ✅
- [ ] Environment variables set in Vercel dashboard
- [ ] Different keys for production (not same as dev)
- [ ] IP allowlisting enabled (if available)
- [ ] Rate limiting configured
- [ ] Error monitoring active (Sentry)
- [ ] Domain verification complete
- [ ] SSL/TLS enabled
- [ ] Security headers configured (CSP, etc.)
- [ ] Monitoring alerts set up

---

## 📞 Support Contacts

If you encounter issues:

**Sanity:**
- Dashboard: https://sanity.io/manage
- Support: support@sanity.io
- Docs: https://www.sanity.io/docs

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Support: support@supabase.com
- Docs: https://supabase.com/docs

**Resend:**
- Dashboard: https://resend.com
- Support: support@resend.com
- Docs: https://resend.com/docs

---

## 📚 Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Environment Variable Security](https://12factor.net/config)
- [API Key Management Best Practices](https://cloud.google.com/docs/authentication/api-keys)

---

## 🎉 Completion

Once you've completed all steps:

1. Mark TODO #2 as complete
2. Test the entire application thoroughly
3. Proceed with production deployment
4. Set a calendar reminder to rotate keys again in 90 days

**Estimated Total Time:** 30-45 minutes  
**Difficulty:** Medium  
**Required Skills:** Dashboard navigation, environment variable management

---

**Last Updated:** January 27, 2026  
**Next Rotation Due:** April 27, 2026 (90 days)

