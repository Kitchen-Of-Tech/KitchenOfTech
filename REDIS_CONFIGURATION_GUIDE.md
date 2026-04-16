# Redis Configuration Guide

## Issue #3: Redis Not Configured

Currently, your application uses **in-memory rate limiting**, which is not suitable for production because:
- ❌ Works only in single-instance deployments
- ❌ Resets on server restart
- ❌ Fails across multiple serverless functions
- ❌ Cannot handle high traffic

## Solution: Configure Upstash Redis (Free)

### Option 1: Upstash (Recommended - No Infrastructure)

**Fastest Setup (5 minutes)**

1. **Sign up for free account:**
   - Visit: https://upstash.com
   - Click "Sign Up"
   - Use GitHub/Google login (faster)
   - No credit card required

2. **Create Redis database:**
   - Click "Create Database"
   - Name: `kitchen-of-tech`
   - Region: Select closest to your deployment
   - Tier: **Free** (10,000 commands/day)
   - Click "Create"

3. **Get connection credentials:**
   - Copy: `UPSTASH_REDIS_REST_URL`
   - Copy: `UPSTASH_REDIS_REST_TOKEN`

4. **Add to `.env.local`:**
   ```env
   UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```

5. **Test the connection:**
   ```bash
   npm run build
   # Should no longer show "Redis not configured" warnings
   ```

### Option 2: Railway.app

1. Visit: https://railway.app
2. Create new project → Add Redis
3. Copy connection string
4. Add to `.env.local`:
   ```env
   UPSTASH_REDIS_URL=redis://default:password@host:port
   ```

### Option 3: AWS ElastiCache (Production-Grade)

1. Create ElastiCache Redis cluster in AWS
2. Get connection endpoint
3. Add to `.env.local`:
   ```env
   UPSTASH_REDIS_URL=redis://your-endpoint:6379
   ```

---

## Configuration Steps (Detailed)

### Step 1: Create Upstash Account

```
1. Go to https://upstash.com
2. Click "Sign Up"
3. Choose login method (GitHub recommended)
4. Verify email
```

### Step 2: Create Database

```
Dashboard → New Database
├─ Name: kitchen-of-tech
├─ Region: us-east-1 (or closest region)
├─ Type: Redis
├─ Tier: Free
└─ Create
```

### Step 3: Get Credentials

After creation, you'll see:
```
Endpoint: your-id.upstash.io
Eviction: LRU
Throughput: ... req/sec
Read: ... /sec
Write: ... /sec
```

Click "Redis@xxxxxxxxx" or scroll down to find:
- **UPSTASH_REDIS_REST_URL**: `https://your-url.upstash.io`
- **UPSTASH_REDIS_REST_TOKEN**: `Abcd...xyz`

### Step 4: Update `.env.local`

Add these lines to your existing `.env.local`:

```env
# Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**Example:**
```env
UPSTASH_REDIS_REST_URL=https://east-fearless-seahorse-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXhFASCb1234xyz789abc...
```

### Step 5: Verify Configuration

```bash
# Rebuild to test configuration
npm run build

# The warning should be gone:
# ✅ "Redis not configured" warning should disappear
```

---

## How the Application Uses Redis

The app uses Redis for:

**1. Rate Limiting**
   - Location: `lib/rate-limit.ts`
   - Purpose: Prevent API abuse
   - Limit: 100 requests per 15 minutes per IP
   - Storage: Redis (instead of in-memory)

**2. Session Caching** (Optional)
   - Faster session lookups
   - Reduced database queries

**3. Real-time Features** (Future)
   - Live updates
   - User presence tracking

---

## Testing Redis Connection

After configuration, you can test:

```typescript
// Test in an API route or server action
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Test connection
const result = await redis.ping();
console.log("Redis connected:", result === "PONG");
```

---

## Monitoring & Limits

### Free Tier Limits
- **10,000 commands/month** (about 340/day)
- **1 database**
- **256 MB storage**
- **1 concurrent connection**
- **Full Redis commands support**

### When to Upgrade
- Approaching 10,000 commands/month
- Need more databases
- Higher throughput required
- Production with many users

Upgrade on Upstash dashboard anytime ($0.25/million commands over limit).

---

## Environment Variables Reference

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `UPSTASH_REDIS_REST_URL` | ✅ Yes | `https://east-xyz.upstash.io` | Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ Yes | `AXh...` | Authentication token |

Both must be set for production deployments.

---

## Troubleshooting

### "Redis not configured" still appears
- **Issue**: Variables not loaded
- **Solution**: 
  1. Restart dev server: `npm run dev`
  2. Verify `.env.local` saved correctly
  3. Check variable names (case-sensitive)

### Connection timeout
- **Issue**: Network issue
- **Solution**:
  1. Verify URL copied exactly
  2. Check token is correct
  3. Ensure region is accessible from your location
  4. Try different region database

### "Invalid token" error
- **Issue**: Token expired or wrong
- **Solution**:
  1. Regenerate token in Upstash dashboard
  2. Copy entire token (including `AXh...` prefix)
  3. No extra spaces

### Rate limiting not working
- **Issue**: Falling back to in-memory
- **Solution**:
  1. Verify Redis is running: `redis-cli ping`
  2. Check environment variables loaded: `npm run dev` with logging
  3. Restart application

---

## Production Deployment Checklist

After configuring Redis:

- [ ] Redis URL and token added to `.env.local`
- [ ] Local build succeeds: `npm run build`
- [ ] No "Redis not configured" warnings
- [ ] Add same environment variables to your hosting platform:
  - **Vercel**: Project Settings → Environment Variables
  - **Railway**: Variables section
  - **Self-hosted**: `.env` file or system variables
- [ ] Redeploy application
- [ ] Test rate limiting works
- [ ] Monitor Redis usage in Upstash dashboard

---

## Cost Analysis

**Free Tier (Upstash)**
- Cost: **$0**
- Limit: 10,000 commands/month
- Suitable for: Development, testing, small sites

**Pro Tier**
- Cost: **Pay-as-you-go**
- $0.25 per 1 million commands
- Suitable for: Production with growing traffic

**ElastiCache (AWS)**
- Cost: **~$0.015/hour** for minimal setup
- Suitable for: Enterprise with high throughput

---

## Next Steps

1. ✅ Sign up for Upstash (free)
2. ✅ Create Redis database
3. ✅ Copy URL and token
4. ✅ Add to `.env.local`
5. ✅ Run `npm run build`
6. ✅ Verify no warnings
7. ✅ Deploy to production

**Estimated time**: 5-10 minutes

---

## Support & Resources

- **Upstash Docs**: https://upstash.com/docs
- **Rate Limiting**: https://upstash.com/docs/redis/features/ratelimiting
- **REST API**: https://upstash.com/docs/redis/features/rest
- **CLI**: https://upstash.com/docs/redis/features/cli

---

**Issue #3 Status**: ✅ CONFIGURATION GUIDE PROVIDED
