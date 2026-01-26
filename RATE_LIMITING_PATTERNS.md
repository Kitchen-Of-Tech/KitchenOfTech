# ⚡ Rate Limiting Quick Reference

Quick copy-paste patterns for applying rate limiting to your API routes.

---

## 📋 Basic Pattern

```typescript
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  // Apply rate limiting - ALWAYS AT THE TOP
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.LIMITER_NAME);
  if (rateLimitResponse) return rateLimitResponse;
  
  // Your existing code...
}
```

---

## 🎯 Which Limiter to Use?

### `rateLimiters.auth` - 5 requests/minute
**Use for:**
- Login endpoints
- Signup endpoints
- Password reset requests
- Email verification sends

**Example:**
```typescript
// app/api/auth/login/route.ts ✅ ALREADY APPLIED
const rateLimitResponse = await applyRateLimit(request, rateLimiters.auth);
```

---

### `rateLimiters.testimonial` - 2 requests/hour
**Use for:**
- Testimonial submissions
- Review submissions
- Feedback forms
- Survey responses

**Example:**
```typescript
// app/api/testimonials/route.ts ✅ ALREADY APPLIED
const rateLimitResponse = await applyRateLimit(request, rateLimiters.testimonial);
```

---

### `rateLimiters.payment` - 10 requests/hour
**Use for:**
- Payment submissions
- Invoice generation
- Payment link creation
- Transaction processing

**Example:**
```typescript
// app/api/payment/submit/route.ts ✅ ALREADY APPLIED
const rateLimitResponse = await applyRateLimit(request, rateLimiters.payment);
```

---

### `rateLimiters.apiStrict` - 20 requests/minute
**Use for:**
- Admin operations (approve/reject)
- User management (create/delete/update)
- Password changes
- Role assignments
- Data exports
- Sensitive configuration changes

**Examples:**
```typescript
// app/api/payment/approve/route.ts ✅ ALREADY APPLIED
// app/api/payment/reject/route.ts ✅ ALREADY APPLIED
// app/api/users/route.ts ✅ ALREADY APPLIED
// app/api/users/[id]/password/route.ts ✅ ALREADY APPLIED
const rateLimitResponse = await applyRateLimit(request, rateLimiters.apiStrict);
```

---

### `rateLimiters.api` - 100 requests/minute
**Use for:**
- General API endpoints
- Data fetching (if POST)
- Search endpoints
- Filter/sort operations
- Non-sensitive operations

**Example:**
```typescript
// app/api/search/route.ts
const rateLimitResponse = await applyRateLimit(request, rateLimiters.api);
```

---

### `rateLimiters.upload` - 5 requests/10 minutes
**Use for:**
- File uploads
- Image uploads
- Document submissions
- Media processing

**Example:**
```typescript
// app/api/upload/route.ts
const rateLimitResponse = await applyRateLimit(request, rateLimiters.upload);
```

---

## 🚨 Endpoints That NEED Rate Limiting

### High Priority (Apply First)
- [x] `/api/auth/login` - ✅ DONE
- [x] `/api/testimonials` (POST) - ✅ DONE
- [x] `/api/payment/submit` - ✅ DONE
- [x] `/api/payment/approve` - ✅ DONE
- [x] `/api/payment/reject` - ✅ DONE
- [x] `/api/users` (POST) - ✅ DONE
- [x] `/api/users/[id]/password` - ✅ DONE

### Recommended (Apply Next)
- [ ] `/api/auth/logout` - Use `rateLimiters.api`
- [ ] `/api/testimonials/[id]` (PUT/DELETE) - Use `rateLimiters.apiStrict`
- [ ] `/api/users/[id]` (PUT/DELETE) - Use `rateLimiters.apiStrict`
- [ ] `/api/projects` (POST/PUT/DELETE) - Use `rateLimiters.apiStrict`
- [ ] `/api/tasks` (POST/PUT/DELETE) - Use `rateLimiters.apiStrict`
- [ ] `/api/teams` (POST/PUT/DELETE) - Use `rateLimiters.apiStrict`
- [ ] `/api/payment/methods` (POST/PUT/DELETE) - Use `rateLimiters.apiStrict`
- [ ] `/api/payment/invoices` (POST) - Use `rateLimiters.payment`
- [ ] `/api/education/enroll` - Use `rateLimiters.api`
- [ ] `/api/education/quiz/submit` - Use `rateLimiters.api`
- [ ] `/api/education/assignment/submit` - Use `rateLimiters.upload`

---

## 📝 Copy-Paste Examples

### For Authentication Routes
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.auth);
  if (rateLimitResponse) return rateLimitResponse;

  // Your existing code...
}
```

### For Admin Operations
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.apiStrict);
  if (rateLimitResponse) return rateLimitResponse;

  // Your existing code...
}
```

### For Dynamic Routes with Params
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.apiStrict);
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;
  // Your existing code...
}
```

### For Routes with Multiple Methods
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';

// GET doesn't need rate limiting (reads only)
export async function GET(request: NextRequest) {
  // Your existing code...
}

// POST needs rate limiting
export async function POST(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.api);
  if (rateLimitResponse) return rateLimitResponse;

  // Your existing code...
}

// PUT needs rate limiting
export async function PUT(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.apiStrict);
  if (rateLimitResponse) return rateLimitResponse;

  // Your existing code...
}

// DELETE needs rate limiting
export async function DELETE(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.apiStrict);
  if (rateLimitResponse) return rateLimitResponse;

  // Your existing code...
}
```

---

## 🎨 Custom Rate Limiter

Need a custom limit? Add to `lib/ratelimit.ts`:

```typescript
export const rateLimiters = {
  // ...existing limiters
  
  // Custom: Contact form (3 per hour)
  contact: createRateLimiter(3, '1 h' as Duration),
  
  // Custom: Newsletter signup (1 per day)
  newsletter: createRateLimiter(1, '24 h' as Duration),
  
  // Custom: API key generation (2 per week)
  apiKeyGen: createRateLimiter(2, '7 d' as Duration),
};
```

Then use it:
```typescript
const rateLimitResponse = await applyRateLimit(request, rateLimiters.contact);
```

---

## 🧪 Testing

### Test in Browser Console
```javascript
// Send 6 requests (should block after 5)
for (let i = 1; i <= 6; i++) {
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'test', password: 'test' })
  })
  .then(r => r.json())
  .then(data => console.log(`Request ${i}:`, data));
}
```

### Test in PowerShell
```powershell
for ($i=1; $i -le 6; $i++) {
  curl http://localhost:3000/api/auth/login `
    -X POST `
    -H "Content-Type: application/json" `
    -d '{"username":"test","password":"test"}'
  Write-Host "Request $i completed"
}
```

---

## 📊 Response Headers

Every rate-limited response includes:

```
X-RateLimit-Limit: 5              # Max requests allowed
X-RateLimit-Remaining: 3           # Requests left
X-RateLimit-Reset: 2026-01-26T... # When limit resets
```

When exceeded (429):
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": "2026-01-26T10:30:00.000Z"
}
```

---

## 🚫 Common Mistakes

### ❌ Wrong: Rate limiting GET requests
```typescript
// DON'T do this - GET requests are read-only
export async function GET(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.api);
  // ...
}
```

### ✅ Right: Only rate limit mutations
```typescript
// Only rate limit POST/PUT/DELETE
export async function POST(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.api);
  // ...
}
```

### ❌ Wrong: Rate limiting after authentication
```typescript
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(); // ❌ TOO LATE
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.api);
  // ...
}
```

### ✅ Right: Rate limiting FIRST
```typescript
export async function POST(request: NextRequest) {
  // ✅ Rate limit BEFORE any other operations
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.api);
  if (rateLimitResponse) return rateLimitResponse;
  
  const user = await getCurrentUser();
  // ...
}
```

---

## 🎯 Checklist

Use this checklist when adding rate limiting:

- [ ] Import `applyRateLimit` and `rateLimiters`
- [ ] Add rate limit check as **first line** in handler
- [ ] Choose appropriate limiter based on endpoint sensitivity
- [ ] Return immediately if rate limit exceeded
- [ ] Test with 6+ rapid requests
- [ ] Verify response headers
- [ ] Verify 429 status on limit exceeded

---

**Quick Reference Complete!** Copy-paste and customize as needed. 🚀
