# Facebook Server-Side Tracking (Conversions API) - Setup Guide

## Overview

Facebook Conversions API allows you to send conversion events directly from your server to Facebook. This provides:

- **Better accuracy**: Not affected by ad blockers or browser tracking prevention
- **iOS 14+ compatibility**: Bypasses Apple's App Tracking Transparency limitations
- **Improved attribution**: More reliable conversion tracking
- **Duplicate event handling**: Facebook automatically deduplicates client + server events

---

## Architecture

### Dual Tracking System
```
User Action
    ↓
Client-Side (Browser)          Server-Side (API)
    ↓                               ↓
FacebookPixel.tsx             /api/facebook/conversions
    ↓                               ↓
Facebook Pixel                Conversions API
    ↓                               ↓
         Facebook Event Manager
                ↓
        (Deduplication Logic)
                ↓
          Facebook Ads
```

---

## Files Created

### 1. API Endpoint
**File**: `app/api/facebook/conversions/route.ts`

**Purpose**: Receives conversion events from your server and forwards them to Facebook

**Features**:
- SHA256 hashing of PII (email, phone) as required by Facebook
- Automatic client IP and User-Agent capture
- Cookie extraction (_fbc, _fbp) for better attribution
- Error handling and logging
- Event validation

**Environment Variables Required**:
```bash
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=YOUR_PIXEL_ID_HERE
FACEBOOK_CONVERSIONS_API_TOKEN=YOUR_ACCESS_TOKEN_HERE
```

### 2. Helper Functions
**File**: `lib/facebook/server-events.ts`

**Purpose**: Convenient wrapper functions for sending server-side events

**Available Functions**:
```typescript
// Lead event (meeting request, contact form)
trackServerLead({ email, phone, custom_data })

// Purchase event (subscription, service purchase)
trackServerPurchase({ value, currency, email, phone })

// Contact event (button click, form start)
trackServerContact({ email, phone })

// Schedule event (meeting scheduled)
trackServerSchedule({ email, phone })

// Complete Registration (user signup)
trackServerCompleteRegistration({ email, phone })

// Custom event
trackServerCustomEvent('CustomEventName', { ... })
```

### 3. Integration Points

#### Meetings API
**File**: `app/api/meetings/route.ts`

**Integration**: Automatically tracks Lead event when meeting request is submitted

```typescript
await trackServerLead({
  email: meeting.email || undefined,
  phone: meeting.phone || undefined,
  event_source_url: referer,
  custom_data: {
    service: meeting.service_title,
    meeting_id: meeting.id,
    content_category: 'Meeting Request',
  },
});
```

**Events Tracked**:
- ✅ Lead event on meeting submission
- Custom data includes: service name, meeting ID, category

---

## Setup Instructions

### Step 1: Get Your Access Token

1. **Go to Facebook Events Manager**
   - URL: https://business.facebook.com/events_manager2/list/pixel/
   - Select your Pixel

2. **Navigate to Settings**
   - Click **Settings** tab
   - Scroll to **Conversions API** section

3. **Generate Access Token**
   - Click **Generate Access Token** button
   - Copy the token (starts with `EAAG...`)
   - Store it securely

   **⚠️ IMPORTANT**: This token has access to your ad account data. Keep it secret!

### Step 2: Update Environment Variables

Update `.env.local`:

```bash
# Client-Side Pixel ID (already set)
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1234567890123456

# Server-Side Access Token (NEW - add this)
FACEBOOK_CONVERSIONS_API_TOKEN=EAAGm7r5KU...your_actual_token_here
```

**Security Notes**:
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for Pixel ID)
- `FACEBOOK_CONVERSIONS_API_TOKEN` is server-only (never exposed to browser)
- Never commit tokens to Git
- Use different tokens for dev/staging/production

### Step 3: Verify Setup

#### Test Event
You can test the API directly:

```bash
curl -X POST http://localhost:3000/api/facebook/conversions \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "Lead",
    "email": "test@example.com",
    "phone": "+1234567890",
    "custom_data": {
      "test": true
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "events_received": 1,
  "fbtrace_id": "A1B2C3..."
}
```

#### Check Facebook Events Manager

1. Go to **Test Events** tab in Events Manager
2. Submit a test meeting request
3. You should see the Lead event appear within seconds
4. Verify event includes:
   - Email (hashed)
   - Phone (hashed)
   - Custom data (service, meeting_id)

---

## Event Deduplication

Facebook automatically deduplicates events sent from both client (Pixel) and server (Conversions API) if they have matching `event_id` or occur within a short time window.

### Current Implementation
- **Client-Side**: FacebookPixel.tsx sends events immediately on user action
- **Server-Side**: Meetings API sends events after successful database insert
- **Deduplication**: Facebook matches events by timestamp, user data, and event name

### Best Practice (Future Enhancement)
Generate a unique `event_id` on the client and pass it to the server:

```typescript
// Client-side
const eventId = `${Date.now()}_${Math.random()}`;
FacebookEvents.Lead({ event_id: eventId });

// Server-side
trackServerLead({ 
  event_id: eventId, // Same ID
  email, phone 
});
```

This ensures perfect deduplication even if timing differs.

---

## Standard Events

Facebook recommends using standard events when possible:

| Event Name | Use Case | Custom Data |
|------------|----------|-------------|
| `Lead` | Meeting request, contact form | content_name, content_category |
| `Purchase` | Service purchase, subscription | value, currency, content_ids |
| `AddToCart` | Add service to cart | value, currency, content_ids |
| `InitiateCheckout` | Start checkout process | value, currency |
| `ViewContent` | View service details | content_name, content_category |
| `CompleteRegistration` | User signup | registration_method |
| `Schedule` | Meeting scheduled | content_name |
| `Contact` | Contact button click | content_name |

---

## Custom Data Parameters

You can include additional context in `custom_data`:

```typescript
trackServerLead({
  email: 'user@example.com',
  custom_data: {
    // Recommended fields
    value: 100,              // Predicted value
    currency: 'USD',         // ISO currency code
    content_name: 'Meeting Request',
    content_category: 'Consultation',
    content_ids: ['service-123'],
    
    // Custom fields
    service_type: 'Web Development',
    team_member: 'John Doe',
    source: 'team-page',
  }
});
```

---

## Privacy & Compliance

### Data Hashing
All PII (Personally Identifiable Information) is hashed using SHA256 before sending to Facebook:

```typescript
// Before: john@example.com
// After: 96a3be3cf272e017046d1b2674a52bd3fa405e0e79136badafa9f6f1b7f76c1a
```

**Hashed Fields**:
- Email addresses (`em`)
- Phone numbers (`ph`)

**Not Hashed**:
- IP addresses (used for location)
- User agent (used for device info)
- Cookies (_fbc, _fbp)

### GDPR Compliance
- Users must consent to tracking (via cookie banner)
- Provide clear privacy policy (✅ already created in `/privacy`)
- Honor opt-out requests
- Allow data deletion requests

### Data Retention
- Facebook stores conversion data for attribution windows (typically 7-28 days)
- No long-term storage of PII on Facebook servers
- Your database (`meetings` table) is the source of truth

---

## Monitoring & Debugging

### Check API Logs
Server-side tracking errors are logged:

```bash
# Look for these in your server logs
"Facebook Conversions API error:"
"Failed to send event to Facebook"
"Conversions API error:"
```

### Facebook Event Diagnostics

1. **Events Manager → Diagnostics**
   - Shows error rate, event volume
   - Alerts for issues

2. **Test Events**
   - Real-time event viewer
   - See exact data received

3. **Event Match Quality Score**
   - Higher score = better attribution
   - Goal: >6.0 out of 10
   - Improve by sending more user data (email, phone, location)

### Common Issues

**❌ "Invalid access token"**
- Token expired or revoked
- Check token in `.env.local`
- Generate new token in Events Manager

**❌ "Pixel ID not found"**
- Wrong Pixel ID
- Verify in Events Manager → Settings

**❌ "No events received"**
- Check network requests in browser DevTools
- Verify API endpoint is running
- Check server logs for errors

**⚠️ Low match quality**
- Send more customer information (email, phone)
- Include _fbc and _fbp cookies
- Hash data correctly

---

## Performance Considerations

### Non-Blocking
Server-side tracking is wrapped in try-catch and doesn't block the main request:

```typescript
try {
  await trackServerLead({ ... });
} catch (fbError) {
  console.error('Failed to track:', fbError);
  // Request continues successfully
}
```

**Result**: Even if Facebook API is down, your meetings still get created.

### Rate Limits
- Facebook allows ~1000 events/second per Pixel
- Your traffic won't hit this limit
- No rate limiting needed

---

## Testing Checklist

### Local Development
- [x] API endpoint created: `/api/facebook/conversions/route.ts`
- [x] Helper functions created: `lib/facebook/server-events.ts`
- [x] Integrated into meetings API
- [x] Environment variables documented
- [ ] Test with actual Facebook token
- [ ] Verify events appear in Test Events tab

### Production
- [ ] Update `.env.production` with real token
- [ ] Verify events appear in Events Manager
- [ ] Check Event Match Quality score
- [ ] Monitor error logs for failed sends
- [ ] Verify deduplication with client-side Pixel
- [ ] Test with real meeting submissions

---

## Next Steps

### 1. Get Your Token (5 minutes)
Follow Step 1 in Setup Instructions above.

### 2. Update Environment Variables (1 minute)
Add `FACEBOOK_CONVERSIONS_API_TOKEN` to `.env.local`.

### 3. Test Locally (5 minutes)
- Start dev server: `npm run dev`
- Submit a test meeting request
- Check console for "Tracking conversion..." log
- Verify in Facebook Test Events

### 4. Deploy to Production (30 minutes)
- Add token to Vercel environment variables
- Deploy changes
- Test with real meeting request
- Monitor Events Manager for events

### 5. Enhance Tracking (Optional)
- Add `Purchase` event to payment flows
- Add `ViewContent` event to service pages
- Add `AddToCart` event if you have cart functionality
- Implement event_id deduplication

---

## Advanced Features (Future)

### Batch Events
Send multiple events in one API call for better performance:

```typescript
// Instead of:
await trackServerLead({ ... });
await trackServerContact({ ... });

// Do:
await sendFacebookServerEvents([
  { event_name: 'Lead', ... },
  { event_name: 'Contact', ... }
]);
```

### Offline Conversions
Track conversions that happen offline (phone calls, in-person meetings):

```typescript
await trackServerSchedule({
  email: 'customer@example.com',
  custom_data: {
    offline: true,
    conversion_date: '2025-01-15',
  }
});
```

### Customer Lifetime Value
Track repeat purchases to optimize for high-value customers:

```typescript
await trackServerPurchase({
  value: 1000,
  currency: 'USD',
  custom_data: {
    predicted_ltv: 5000,
    customer_tier: 'premium',
  }
});
```

---

## Resources

- [Facebook Conversions API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Standard Events Reference](https://developers.facebook.com/docs/meta-pixel/reference)
- [Event Deduplication Guide](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events)
- [Parameter Hashing Guide](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters)

---

## Summary

✅ **Server-side tracking is now implemented!**

**What You Have**:
- API endpoint for receiving conversion events
- Helper functions for common events
- Automatic Lead tracking on meeting submissions
- Proper PII hashing for privacy compliance
- Error handling and logging

**What You Need**:
- Facebook Conversions API Access Token
- Update `.env.local` with token
- Test in Facebook Events Manager
- Deploy to production

**Benefits**:
- More accurate conversion tracking
- iOS 14+ compatibility
- Better ad optimization
- Improved ROAS (Return on Ad Spend)

🚀 **Ready to track conversions with confidence!**
