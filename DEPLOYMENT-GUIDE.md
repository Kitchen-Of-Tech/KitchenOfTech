# 🚀 Deployment Guide - Vercel

## Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Environment variables ready

---

## Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Production build ready for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/kitchenoftech.git
git branch -M main
git push -u origin main
```

---

## Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `./` (leave as is)

---

## Step 3: Configure Environment Variables

Add these in Vercel dashboard:

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=owj91fgd
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Step 4: Configure Build Settings

**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`  
**Development Command:** `npm run dev`

**Node.js Version:** 18.x or 20.x

---

## Step 5: Deploy!

Click **"Deploy"** button and wait ~2-3 minutes.

---

## Step 6: Custom Domain Setup

### Add Domain in Vercel
1. Go to Project Settings → Domains
2. Add `kitchenoftech.org`
3. Add `www.kitchenoftech.org`

### Update DNS Records

**At your domain registrar:**

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Wait 24-48 hours** for DNS propagation.

---

## Step 7: Verify Deployment

1. **Check Homepage:** https://kitchenoftech.org
2. **Test 3D Laptop:** Should load and animate
3. **Test Sanity CMS:** /studio should work
4. **Test All Pages:**
   - /services
   - /blog
   - /portfolio
   - /team
   - /testimonials
   - /certificate-verify

---

## 🔧 Troubleshooting

### Build Fails
- Check environment variables are set
- Verify Node.js version (18.x or 20.x)
- Check build logs for errors

### 3D Laptop Not Loading
- Check if models are in `public/models/obj/`
- Verify file paths are correct
- Check browser console for errors

### Sanity Studio Not Working
- Verify CORS origins in Sanity dashboard
- Add Vercel domain to allowed origins
- Check API version and dataset name

### Supabase Connection Issues
- Verify Supabase URL and anon key
- Check if project is active
- Verify table permissions

---

## 📊 Post-Deployment Checklist

- [ ] Homepage loads correctly
- [ ] 3D laptop animates smoothly
- [ ] All pages are accessible
- [ ] Sanity Studio works at /studio
- [ ] Forms submit to Supabase
- [ ] Google Analytics tracking works
- [ ] Images load from Sanity CDN
- [ ] Mobile responsive design works
- [ ] SSL certificate is active (https)
- [ ] Custom domain resolves correctly

---

## 🎯 Performance Monitoring

### Run Lighthouse Audit
```bash
# Install Lighthouse CLI
npm install -g @lhci/cli

# Run audit
lighthouse https://kitchenoftech.org --view
```

### Vercel Analytics
1. Go to Project → Analytics
2. Enable Web Analytics (free)
3. Monitor real user metrics

---

## 🔄 Continuous Deployment

Every push to `main` branch will:
1. Trigger automatic build
2. Run type checking
3. Deploy to production
4. Update live site

**Deployment Branch:** `main`  
**Production URL:** https://kitchenoftech.org  
**Preview URL:** Auto-generated for PRs

---

## 📱 Testing URLs

- **Production:** https://kitchenoftech.org
- **WWW:** https://www.kitchenoftech.org
- **Vercel Default:** https://kitchenoftech.vercel.app

---

## 🛡️ Security Best Practices

1. **Never commit `.env.local`** - Already in .gitignore
2. **Rotate API keys** if exposed
3. **Enable Vercel Authentication** for /studio if needed
4. **Use environment variables** for all secrets
5. **Enable CORS** only for your domain

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Sanity Docs:** https://www.sanity.io/docs
- **Supabase Docs:** https://supabase.com/docs

---

## 🎉 Success!

Once deployed, your website will be live at:
**https://kitchenoftech.org**

**Estimated Total Time:** 15-30 minutes  
**DNS Propagation:** 24-48 hours  

---

*Happy Deploying! 🚀*
