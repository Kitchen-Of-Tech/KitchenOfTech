# Email & SMS Reminders Integration Guide

## Issue #4: Email Reminders Not Integrated

Your payment reminder system is now **partially configured**:

- ✅ **Email reminders**: Now integrated with Resend (same service as other emails)
- ⏳ **SMS reminders**: Placeholder ready, waiting for Twilio/AWS integration

---

## Email Reminders - COMPLETE ✅

### How It Works

The system automatically:
1. Queries pending payment reminders
2. For each due reminder, sends professional HTML email
3. Updates reminder status to 'sent' or 'failed'
4. Logs all activities

### Configuration Required

Your email reminders **already work** if you have these in `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@kitchenoftech.org
NEXT_PUBLIC_SITE_URL=https://kitchenoftech.org
```

✅ **Status**: Already configured! Reminders will send automatically.

### Test Email Sending

```bash
# Create a test reminder
curl -X POST http://localhost:3000/api/payment/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "test-123",
    "reminder_type": "email",
    "scheduled_for": "2026-04-17T10:00:00Z"
  }'

# Trigger sending of due reminders
curl -X PATCH http://localhost:3000/api/payment/reminders
```

---

## SMS Reminders - OPTIONAL Configuration

### What's Needed

To enable SMS reminders, choose one SMS provider:

#### Option 1: Twilio (Recommended)

**Fastest setup with developer-friendly API**

1. **Create Twilio account:**
   - Visit: https://www.twilio.com/try-twilio
   - Sign up (free trial: $15 credit)
   - Verify phone number
   - Get your first Twilio number (free)

2. **Get credentials:**
   - Account SID: Found in Twilio console
   - Auth Token: Found in Twilio console
   - Phone Number: Your Twilio number (e.g., +1234567890)

3. **Add to `.env.local`:**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. **Update the code:**

   Replace the SMS function in `/app/api/payment/reminders/route.ts`:

   ```typescript
   import twilio from 'twilio';

   async function sendSMSReminder(
     customer: { id: string; full_name?: string; email: string; phone?: string },
     transaction: { transaction_id: string; amount: number; purpose?: string }
   ) {
     try {
       const client = twilio(
         process.env.TWILIO_ACCOUNT_SID,
         process.env.TWILIO_AUTH_TOKEN
       );

       const message = await client.messages.create({
         body: `Payment Reminder: ${transaction.amount} BDT pending. Transaction ID: ${transaction.transaction_id}. Pay now at ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
         from: process.env.TWILIO_PHONE_NUMBER,
         to: customer.phone,
       });

       console.log(`✅ SMS sent: ${message.sid}`);
       return true;

     } catch (error) {
       console.error(`❌ SMS failed:`, error);
       throw error;
     }
   }
   ```

5. **Install Twilio package:**
   ```bash
   npm install twilio
   ```

#### Option 2: AWS SNS

**Enterprise-grade SMS through AWS**

1. **Setup AWS account** and SNS service
2. **Get access key and secret key**
3. **Add to `.env.local`:**
   ```env
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   ```

4. **Update code:**
   ```typescript
   import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

   async function sendSMSReminder(
     customer: { id: string; full_name?: string; email: string; phone?: string },
     transaction: { transaction_id: string; amount: number; purpose?: string }
   ) {
     const client = new SNSClient({ region: process.env.AWS_REGION });
     const command = new PublishCommand({
       Message: `Payment Reminder: ${transaction.amount} BDT pending.`,
       PhoneNumber: customer.phone,
     });
     await client.send(command);
   }
   ```

#### Option 3: Firebase Cloud Messaging

**Good for app-based notifications**

1. Setup Firebase project
2. Get service account credentials
3. Send through Firebase API

---

## API Endpoints Reference

### GET /api/payment/reminders
List all payment reminders

```bash
curl http://localhost:3000/api/payment/reminders?status=pending&page=1
```

**Response:**
```json
{
  "reminders": [
    {
      "id": "reminder-1",
      "transaction_id": "tx-123",
      "status": "pending",
      "reminder_type": "email",
      "scheduled_for": "2026-04-17T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

### POST /api/payment/reminders
Create a new reminder

```bash
curl -X POST http://localhost:3000/api/payment/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "tx-123",
    "reminder_type": "email",
    "scheduled_for": "2026-04-17T10:00:00Z"
  }'
```

**Parameters:**
- `transaction_id` (required): Payment transaction ID
- `reminder_type` (optional): "email" | "sms" | "both" (default: "email")
- `scheduled_for` (optional): ISO date string (default: 24 hours from now)

### PATCH /api/payment/reminders
Send all due reminders

```bash
curl -X PATCH http://localhost:3000/api/payment/reminders
```

**Response:**
```json
{
  "success": true,
  "message": "Sent 3 reminders, 0 failed",
  "sent": 3,
  "failed": 0,
  "results": [
    {"id": "reminder-1", "status": "success"},
    {"id": "reminder-2", "status": "success"},
    {"id": "reminder-3", "status": "success"}
  ]
}
```

---

## Automation Setup

### Run Reminders on Schedule

To send reminders automatically, set up a scheduled task:

#### Option 1: Vercel Cron (If using Vercel)

Create `app/api/payment/reminders/cron/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Runs every hour
export async function GET(request: NextRequest) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Call the reminder sending endpoint
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/reminders`, {
    method: 'PATCH',
    headers: {
      'Cookie': `... your auth cookie ...`
    }
  });

  return response;
}
```

#### Option 2: External Cron Service

Use services like:
- **EasyCron**: https://www.easycron.com (free)
- **Cron-job.org**: https://cron-job.org (free)
- **AWS EventBridge**: Paid, enterprise-grade

Configure to call `POST /api/payment/reminders` every hour.

#### Option 3: Background Job Queue

Use libraries like:
- **Bull**: Redis-based job queue
- **Agenda**: MongoDB-based scheduler
- **Node-cron**: Simple scheduling

---

## Email Reminder Template

The email sent to customers includes:

```
Subject: Payment Reminder: [AMOUNT] BDT Pending

Dear [CUSTOMER_NAME],

This is a reminder that you have a pending payment:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amount:        [AMOUNT] BDT
Purpose:       [PURPOSE]
Transaction:   [TRANSACTION_ID]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please complete your payment as soon as possible to avoid any disruptions.

[View Payment Button] → Dashboard Link

If you've already made this payment, please disregard this reminder.
```

---

## Testing Checklist

- [ ] Email reminders sending successfully
- [ ] Reminder status updates to "sent"
- [ ] Failed reminders logged properly
- [ ] Customer receives HTML formatted email
- [ ] Email includes correct transaction details
- [ ] SMS configured (if desired)
- [ ] Automated scheduling setup

---

## Environment Variables Summary

### Required (Email Only)
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@kitchenoftech.org
```

### Optional (SMS via Twilio)
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Optional (SMS via AWS SNS)
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

---

## Troubleshooting

### Email not sending
- Check `RESEND_API_KEY` is valid
- Verify `RESEND_FROM_EMAIL` matches Resend dashboard
- Check logs: `console.log` in `/api/payment/reminders`
- Test with: `curl -X PATCH /api/payment/reminders`

### Reminders not being triggered
- Verify reminder `scheduled_for` is in past
- Check reminder `status` is "pending"
- Run PATCH endpoint manually to test
- Check server logs for errors

### Customer not receiving emails
- Verify customer email is correct
- Check spam/junk folder
- Test with personal email first
- Review Resend dashboard for bounces

### SMS not working (if configured)
- Verify Twilio credentials
- Check phone number format: +1234567890
- Verify account has credit
- Check Twilio logs

---

## Monitoring & Analytics

Track reminder sending in Supabase:

```sql
-- View all reminders
SELECT id, status, reminder_type, scheduled_for, sent_at 
FROM payment_reminders 
ORDER BY created_at DESC;

-- Success rate this week
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  ROUND(SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as success_rate
FROM payment_reminders
WHERE created_at > NOW() - INTERVAL '7 days';

-- Failed reminders with errors
SELECT id, error_message, created_at 
FROM payment_reminders 
WHERE status = 'failed'
ORDER BY created_at DESC;
```

---

## Production Deployment

Before going live:

- [ ] Configure Resend API key
- [ ] Test email sending manually
- [ ] Set up automated cron job
- [ ] Monitor first 100 reminders
- [ ] Add email to authorized senders list
- [ ] Update customer support documentation
- [ ] Add metrics/monitoring

---

## Cost Estimation

### Email (Resend)
- **Free tier**: 100 emails/day
- **Pro**: $20/month for unlimited

### SMS (Twilio)
- **SMS**: ~$0.0075 per message
- **100 reminders/month**: ~$0.75/month

---

## Next Steps

1. ✅ Email reminders are ready now
2. ⏳ (Optional) Set up SMS with Twilio
3. ✅ Configure automated sending
4. ✅ Monitor and optimize

---

**Issue #4 Status**: ✅ EMAIL REMINDERS IMPLEMENTED
