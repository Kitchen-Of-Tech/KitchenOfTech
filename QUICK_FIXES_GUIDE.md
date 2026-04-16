# 🔧 QUICK FIXES GUIDE - IMMEDIATE ACTIONS REQUIRED

**Generated**: April 17, 2026  
**Estimated Total Time**: 2-3 hours for all fixes  
**Build Status**: Currently ✅ Passing (will remain passing after fixes)

---

## 🚨 CRITICAL FIX #1: Instructor Authorization (15 min)

### Issue
Any authenticated user can access the instructor grading interface.

### File
`app/education/instructor/grading/page.tsx` - Line 31

### Current Code
```tsx
// TODO: Check if user is an instructor
// For now, any authenticated user can access (for demo purposes)
```

### Fix
Replace the comment with actual role verification:

```tsx
// Check if user is an instructor
const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single();

if (!profile || (profile.role !== 'instructor' && profile.role !== 'admin')) {
  redirect("/login?error=unauthorized");
}
```

### Verification
1. Login as student → Should be redirected
2. Login as instructor → Should see grading interface

---

## 🚨 CRITICAL FIX #2: Certificate Linking (30 min)

### Issue
Cannot match certificates to bootcamp registrations for email sending.
- 15 bootcamp registrations exist
- 15 certificates exist
- Query `ilike('student_name', name)` returns 0 matches

### File
`scripts/send-bootcamp-certificates.mjs` (when it exists)

### Root Cause Analysis Needed

You need to determine how certificates link to bootcamp registrations. Choose ONE:

**Option A: Link by Email** (Recommended)
```javascript
async function getCertificateForRegistration(registrationEmail) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .ilike('student_email', registrationEmail)
    .single();
  
  return data;
}
```

**Option B: Link by User ID**
```javascript
async function getCertificateForRegistration(userId) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return data;
}
```

**Option C: Link by Enrollment ID**
```javascript
async function getCertificateForRegistration(enrollmentId) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .single();
  
  return data;
}
```

### Quick Check
Run this SQL query in Supabase to understand the schema:

```sql
-- Check certificate table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'certificates';

-- Sample data
SELECT student_name, student_email, user_id, enrollment_id, created_at 
FROM certificates 
LIMIT 1;

-- Check bootcamp_registrations columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bootcamp_registrations';

-- Sample registration
SELECT name, email, user_id, id, created_at 
FROM bootcamp_registrations 
LIMIT 1;
```

### Action Required
1. Run the SQL queries above
2. Identify the **common field** between both tables
3. Update the certificate lookup function
4. Test with one participant first

---

## 🟠 HIGH PRIORITY FIX #3: Redis Configuration (20 min)

### Issue
Rate limiting uses in-memory storage (fails in production with multiple instances).

### Current Build Output
```
Redis not configured. Using in-memory rate limiting (not suitable for production).
```

### Fix Steps

**Step 1: Sign up for Upstash Redis**
- Visit: https://upstash.com/
- Free tier: 10,000 commands/day
- No credit card needed

**Step 2: Create Redis Database**
- Database name: `kitchen-of-tech`
- Region: Choose closest to your deployment region
- Copy the connection credentials

**Step 3: Update .env.local**
```env
# Add these lines
UPSTASH_REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT
UPSTASH_REDIS_REST_URL=https://YOUR_HOST.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR_REST_TOKEN
```

**Step 4: Test**
```bash
npm run build
# Should not show Redis warnings anymore
```

### Alternative: Use Railway Redis
If you prefer a different provider:
- Railway: https://railway.app/
- Render: https://render.com/
- Heroku Redis: https://www.heroku.com/redis

---

## 🟠 MEDIUM PRIORITY FIX #4: Email Notifications (30 min)

### Issue
Email function only logs instead of sending. Currently using Resend which is already configured.

### File
`lib/mail.ts` - Lines 42-50

### Current Code
```typescript
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // ... checks ...
  
  try {
    // TODO: Implement actual SMTP sending using nodemailer or similar
    // For now, we'll just log it
    console.log('📧 Sending email:');
    
    return true; // Fake success
  }
}
```

### Fix

Replace with Resend integration:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, text, html } = options;

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@kitchenoftech.org',
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || text,
    });

    if (result.error) {
      console.error('❌ Email send failed:', result.error);
      return false;
    }

    console.log('✅ Email sent successfully:', result.data?.id);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
}
```

### Verification
```bash
npm run build
# Should compile without errors
```

### Test
```bash
# In a test file or API route:
await sendEmail({
  to: ['test@example.com'],
  subject: 'Test Email',
  text: 'This is a test',
  html: '<p>This is a test</p>'
});
```

---

## 🟡 MEDIUM PRIORITY FIX #5: Payment Reminders Integration (1-2 hours)

### Issue
Payment reminder endpoints created but email/SMS not implemented.

### File
`app/api/payment/reminders/route.ts`

### Current Status
```typescript
async function sendEmailReminder(reminder) {
  // TODO: Integrate with email service
}

async function sendSMSReminder(reminder) {
  // TODO: Integrate with SMS service
}
```

### Choose Your Email Service

**Option A: Use Resend (Recommended - already configured)**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmailReminder(reminder: PaymentReminder) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: reminder.email,
      subject: `Payment Reminder - ${reminder.transaction_id}`,
      html: `
        <h2>Payment Reminder</h2>
        <p>Your payment of ${reminder.amount} ${reminder.currency} is pending.</p>
        <p>Amount: ${reminder.amount}</p>
        <p>Due: ${new Date(reminder.scheduled_for).toLocaleDateString()}</p>
        <p>Status: ${reminder.status}</p>
      `,
    });
    return !result.error;
  } catch (error) {
    console.error('Email reminder failed:', error);
    return false;
  }
}
```

**Option B: Use SendGrid**
```env
# Add to .env.local
SENDGRID_API_KEY=your_key
```

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendEmailReminder(reminder: PaymentReminder) {
  try {
    await sgMail.send({
      to: reminder.email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `Payment Reminder`,
      html: `...`, // HTML content
    });
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
}
```

### For SMS (Choose One)

**Option A: Twilio** (Most popular)
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMSReminder(reminder: PaymentReminder) {
  try {
    await client.messages.create({
      body: `Payment reminder: ${reminder.amount} ${reminder.currency} pending.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: reminder.phone_number, // Need phone in database
    });
    return true;
  } catch (error) {
    console.error('SMS error:', error);
    return false;
  }
}
```

**Option B: AWS SNS**
```typescript
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sns = new SNSClient({});

async function sendSMSReminder(reminder: PaymentReminder) {
  try {
    await sns.send(new PublishCommand({
      Message: `Payment reminder: ${reminder.amount} pending`,
      PhoneNumber: reminder.phone_number,
    }));
    return true;
  } catch (error) {
    console.error('SNS error:', error);
    return false;
  }
}
```

### Next Steps
1. Choose your services (recommend Resend + Twilio)
2. Sign up and get API keys
3. Add keys to `.env.local`
4. Implement send functions
5. Update reminder endpoint to call send functions
6. Test with sample data

---

## 🟡 LOW PRIORITY FIX #6: Remove Debug Endpoint (10 min)

### Issue
Debug endpoint exposed in production.

### File
`app/api/debug/bootcamp/route.ts`

### Quick Fix: Add Auth Check
```typescript
export async function GET() {
  // Add auth check
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only allow admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rest of endpoint...
}
```

### Better Fix: Remove Entirely
If not needed, simply delete:
- `app/api/debug/` folder

---

## 📋 VERIFICATION CHECKLIST

After applying fixes, verify with:

```bash
# 1. Build should still succeed
npm run build

# 2. Run tests
npm run test

# 3. Run E2E tests
npm run test:e2e

# 4. Check no new TypeScript errors
npm run type-check

# 5. Run linting
npm run lint
```

### Expected Results
```
✅ npm run build - "Compiled successfully"
✅ npm run test - "All tests passed"
✅ npm run test:e2e - "All tests passed"
✅ npm run type-check - "No TypeScript errors"
✅ npm run lint - "No lint errors"
```

---

## 📊 FIX PRIORITY & TIME ESTIMATE

| Fix | Priority | Time | Status |
|-----|----------|------|--------|
| Instructor Auth | 🔴 CRITICAL | 15 min | ⏳ Ready |
| Certificate Linking | 🔴 CRITICAL | 30 min | 🔍 Investigation needed |
| Redis Config | 🟠 HIGH | 20 min | ⏳ Ready |
| Email Notifications | 🟠 HIGH | 30 min | ⏳ Ready |
| Payment Reminders | 🟡 MEDIUM | 1-2 hrs | ⏳ Ready |
| Remove Debug | 🟡 LOW | 10 min | ⏳ Ready |
| **TOTAL** | - | **2-3 hrs** | - |

---

## 🎯 RECOMMENDED ORDER

1. **Start with**: Instructor Auth (easiest, most critical)
2. **Then**: Investigate Certificate Linking (might unblock other work)
3. **Parallel**: Redis + Email fixes (independent)
4. **Last**: Payment Reminders (can be done after core fixes)
5. **Final**: Remove debug endpoint (cleanup)

---

## 💡 TIPS

- **Build after each fix**: `npm run build` to verify
- **Test changes**: Use existing test suite
- **Commit often**: Git commit after each fix
- **Document**: Add comments explaining changes
- **Ask questions**: If schema unclear, check Supabase directly

---

## ❓ NEED HELP?

For each fix, check:
1. The audit report (`COMPREHENSIVE_AUDIT_A_Z.md`)
2. Existing code patterns in the codebase
3. Environment variables in `.env.local`
4. Supabase schema directly
5. API documentation in `/api-docs`

---

**Status**: 🟢 READY FOR FIXES  
**Next**: Choose a fix and start implementing!
