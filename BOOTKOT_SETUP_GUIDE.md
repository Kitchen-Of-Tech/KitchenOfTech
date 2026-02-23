# BootKot - Setup & Deployment Guide

## Overview
BootKot is the new bootcamp registration feature that allows users to register for upcoming intensive bootcamps and stores their data in Google Sheets.

## Features Implemented

### 1. Blog Page Fix ✅
- **Issue**: Blog posts were not displaying on the blog page
- **Solution**: Added complete blog post rendering logic with grid layout and empty state handling
- **Details**:
  - `app/blog/page.tsx` - Shows list of published blog posts
  - `app/blog/[slug]/page.tsx` - Detailed blog post view with related articles

### 2. Portfolio Page Enhancement ✅
- **Issue**: No empty state handling
- **Solution**: Added empty state message when no portfolio items exist
- **Files**: `app/portfolio/page.tsx`

### 3. Education Page ✅
- **Status**: Already properly implemented with empty state handling
- **File**: `components/education/CourseCatalog.tsx`

### 4. BootKot Feature ✅
New bootcamp registration system with:
- Dynamic bootcamp pages
- Registration form with validation
- Google Sheets integration for data storage
- Sanity CMS for bootcamp management

## Environment Variables Required

**IMPORTANT**: As of the latest update, Google Sheets configuration is now managed per-bootcamp in Sanity CMS, not in environment variables. This approach is more secure and allows different bootcamps to use different Google Sheets.

Add these to your `.env.local` file (only if you need Sanity API access):

```bash
# Existing Sanity Configuration (REQUIRED)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_token
```

**Note**: `GOOGLE_SHEETS_ID` and `GOOGLE_SHEETS_API_KEY` should NO LONGER be in environment variables. They are now configured per-bootcamp in Sanity CMS.

## Setting Up Google Sheets Integration (Per-Bootcamp)

### Step 1: Create a Google Sheet for Each Bootcamp
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet for each bootcamp's registrations
3. Name it "{BootcampName} Registrations"
4. Note the spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
5. Add column headers in row 1 (optional, the API will handle this):
   - Timestamp, Bootcamp ID, Bootcamp Name, Name, Email, Phone, WhatsApp, Age, Address, Institute, Facebook ID, Interests, Reason, Status

### Step 2: Get Google Sheets API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key
5. **Security Tip**: Restrict the API key in Cloud Console:
   - Go to "APIs & Services" → "Credentials"
   - Click on your API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain(s): `yourdomain.com/*`
   - Under "API restrictions", select "Google Sheets API"
   - Click "Save"

### Step 3: Make Your Sheets Accessible
1. Open each Google Sheet
2. Click "Share"
3. Change to "Anyone with the link can view" OR restrict to specific email
4. Copy the shareable link (make note of this)

### Step 4: Add Google Sheets Config to Sanity CMS
1. Go to your Sanity Studio
2. Create or edit a bootcamp document
3. Scroll to "Settings" → "Google Sheets Configuration"
4. Fill in:
   - **Spreadsheet ID**: The ID from your Google Sheet URL
   - **API Key**: Your Google Sheets API key from Cloud Console
5. Click "Publish" to save the bootcamp

### Step 5: Test the Configuration
1. Navigate to `/bootkot/[bootcamp-slug]` in your application
2. Fill out the registration form
3. Submit it
4. Check your Google Sheet - the data should appear in a new row
5. If it doesn't appear, check:
   - The API key is correct and has Google Sheets API access
   - The spreadsheet ID is correct
   - The sheet is accessible (not restricted)
   - Check browser console and server logs for errors

## File Structure

### New Files Created

```
app/
├── bootkot/
│   ├── page.tsx                    # Main BootKot listing page
│   └── [slug]/
│       └── page.tsx                # Individual bootcamp detail page
├── api/
│   └── bootcamp/
│       └── register/
│           └── route.ts            # Registration API endpoint
└── blog/
    └── [slug]/
        └── page.tsx                # Blog post detail page

components/
├── bootcamp/
│   └── BootcampRegistrationForm.tsx  # Registration form component

sanity/
└── schemas/
    └── bootcamp.ts                # Sanity schema for bootcamps

lib/
└── sanity/
    └── queries.ts                 # Added bootcamp queries

types/
└── index.ts                       # Added Bootcamp and BootcampRegistration types
```

## Sanity CMS Setup

### Adding the Bootcamp Schema

The bootcamp schema has been added to `sanity/schemas/index.ts`. 

**To deploy to Sanity:**

1. Push the schema updates:
```bash
npm run build
```

2. Deploy to Sanity:
```bash
sanity deploy
```

Or in Sanity Studio, you'll see the new "Bootcamps" collection automatically.

### Creating Your First Bootcamp

1. Go to your Sanity Studio (`/studio`)
2. Navigate to "Bootcamps"
3. Create a new document with:
   - **Basic Info**: Name, short description, slug
   - **Details**: Start/end dates, duration, level, technologies
   - **Banner & Media**: Upload banner image, add instructors
   - **Settings**: Set status to "open" for registrations, add prerequisites/outcomes

## API Endpoint

### POST `/api/bootcamp/register`

**How It Works:**
1. Form submission sends registration data and bootcamp ID
2. API fetches bootcamp document from Sanity to get Google Sheets credentials
3. Validates all form inputs on server-side
4. Appends registration data to the bootcamp's Google Sheet
5. Returns success/error response

**Request Body:**
```json
{
  "bootcampId": "sanity_id",
  "bootcampName": "Web Development Bootcamp",
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1 (555) 123-4567",
  "whatsappNumber": "+1 (555) 123-4567",
  "age": 25,
  "address": "123 Main St",
  "institute": "University Name",
  "facebookId": "john.doe.123",
  "interests": ["Web Development", "React"],
  "registrationReason": "I want to learn web development..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful! We will contact you soon.",
  "data": {
    "bootcampId": "sanity_id",
    "email": "john@example.com",
    "timestamp": "2024-02-22T10:30:00Z"
  }
}
```

**Error Response (Missing Google Sheets Config):**
```json
{
  "error": "Bootcamp registration is not properly configured. Please contact support."
}
```

**Note**: The API automatically fetches Google Sheets credentials from the bootcamp document in Sanity, so each bootcamp can have its own Google Sheet.

## Testing

### Test the Registration Form

1. Create a bootcamp in Sanity with status "open"
2. Navigate to `/bootkot`
3. Click on a bootcamp
4. Fill out the registration form
5. Submit and verify:
   - Success message appears
   - Check your Google Sheet for the new entry

### Test Error Handling

Try submitting with:
- Invalid email format
- Missing required fields
- Invalid phone number
- Age outside valid range (13-100)

## Deployment Checklist

- [ ] All environment variables set in `.env.local`
- [ ] Google Sheets API key is valid and has correct permissions
- [ ] Google Sheet is accessible via API
- [ ] Sanity schema is deployed
- [ ] At least one bootcamp created with "open" status
- [ ] Blog posts published in Sanity
- [ ] Portfolio items added (optional)
- [ ] Courses created in Sanity (Education page)
- [ ] Navigation links visible in Navbar
- [ ] Registration form validates correctly
- [ ] Google Sheets receives registrations

## Troubleshooting

### Registrations not appearing in Google Sheets

1. Check API key is correct and enabled
2. Check spreadsheet ID matches
3. Verify the sheet is public or accessible
4. Check browser console for errors
5. Verify email format in form is valid

### Blog posts not showing

1. Ensure blog posts have status "published" in Sanity
2. Check that `publishedDate` is set
3. Verify slug format is correct
4. Clear Next.js cache: `rm -rf .next`

### BootKot page showing "No Bootcamps Available"

1. Create at least one bootcamp in Sanity
2. Set bootcamp status to "open" or "running"
3. Verify startDate is in future or present
4. Clear cache and refresh

## Performance Optimization

- Blog and Bootcamp pages use `revalidate: 3600` for ISR (incremental static regeneration)
- Images are optimized with Next.js Image component
- Google Sheets API uses simple REST calls for better performance
- Sanity queries are tagged for smart invalidation

## Security Notes

**✅ Advantages of Per-Bootcamp Google Sheets Configuration:**

1. **Better Security**: API keys are not exposed in environment files
2. **Per-Bootcamp Control**: Each bootcamp can use different Google Sheets and API keys
3. **Easy Rotation**: Update API keys directly in Sanity without redeploying
4. **Separate Data**: Each bootcamp's data stays in its own spreadsheet
5. **No .env Exposure**: Sensitive data is stored in Sanity, not in repository

**Security Best Practices:**

- Form submissions validate all inputs on client and server
- Never share API keys in public repositories
- Restrict Google Sheets API key:
  - Use HTTP referrer restrictions (your domain only)
  - Use API restrictions (only allow Google Sheets API)
- Regularly rotate API keys (quarterly recommended)
- Use Sanity's access control to limit who can edit bootcamp configurations
- Consider adding rate limiting to `/api/bootcamp/register`
- Monitor Google Sheets for suspicious activity
- Never commit `.env.local` to version control

## Future Enhancements

1. Email confirmation for registrations
2. Payment integration for paid bootcamps
3. Automated attendance tracking
4. Certificate generation
5. Communication dashboard
6. Bootcamp feedback system
7. Advanced analytics

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review environment variables
3. Check Next.js and Sanity logs
4. Test API endpoint with Postman

---

**Last Updated**: February 22, 2026
**Version**: 1.0.0
