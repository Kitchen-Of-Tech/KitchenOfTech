# Deployment Readiness Checklist - Kitchen of Tech

**Date**: February 22, 2026
**Project Version**: 1.0.0

## ✅ Bug Fixes Completed

### Blog Page Issues - FIXED
- [x] Blog posts now display properly on `/blog` page
- [x] Blog post detail pages created at `/blog/[slug]`
- [x] Related articles shown on detail pages
- [x] Empty state message when no blogs published
- [x] Meta data and SEO tags working

### Portfolio Page Issues - FIXED
- [x] Portfolio items displaying correctly
- [x] Empty state added for no projects
- [x] Filter functionality working
- [x] Featured projects section functional

### Education Page Issues - VERIFIED
- [x] Course catalog displays correctly
- [x] Empty state handling implemented
- [x] Filter and search working
- [x] Course detail pages functional

---

## ✅ BootKot Feature - NEW FEATURE COMPLETE

### Backend Implementation
- [x] Sanity schema created for bootcamps (`sanity/schemas/bootcamp.ts`)
- [x] Schema registered in Sanity index
- [x] Bootcamp queries written in `lib/sanity/queries.ts`
- [x] TypeScript types defined (`types/index.ts`)
- [x] API endpoint created: `/api/bootcamp/register`
- [x] Form validation with Zod
- [x] Google Sheets integration

### Frontend Implementation
- [x] Main BootKot listing page (`app/bootkot/page.tsx`)
- [x] Dynamic bootcamp detail pages (`app/bootkot/[slug]/page.tsx`)
- [x] Registration form component (`components/bootcamp/BootcampRegistrationForm.tsx`)
- [x] Empty state handling
- [x] Navigation link added to Navbar
- [x] Responsive design for all devices

### Data Management
- [x] Google Sheets API integration
- [x] Registration form validation
- [x] Error handling and user feedback
- [x] Email validation
- [x] Phone number validation
- [x] Age validation

---

## 📋 Pre-Deployment Setup Checklist

### Environment Variables (IMPORTANT: Google Sheets Config Now Per-Bootcamp)
- [ ] NEXT_PUBLIC_SANITY_PROJECT_ID set
- [ ] NEXT_PUBLIC_SANITY_DATASET set
- [ ] NEXT_PUBLIC_SANITY_API_VERSION set
- [ ] SANITY_API_TOKEN set
- [ ] **NOTE**: ~~GOOGLE_SHEETS_ID and GOOGLE_SHEETS_API_KEY~~ - These are now configured per-bootcamp in Sanity, not in environment variables
- [ ] All other required env vars in `.env.local`

### Google Sheets Setup (Per-Bootcamp)
For each bootcamp you want to create:
- [ ] Google Sheet created with name "{BootcampName} Registrations"
- [ ] Spreadsheet ID obtained from URL
- [ ] Google Cloud project created (one project can serve all bootcamps)
- [ ] Google Sheets API enabled in Cloud project
- [ ] API key created with Google Sheets API restriction
- [ ] API key restricted to your domain via HTTP referrers
- [ ] Sheet is publicly accessible or shared appropriately
- [ ] Tested API can access the sheet

### Sanity CMS Setup (NEW: Per-Bootcamp Google Sheets Config)
- [ ] Logged into Sanity account
- [ ] Bootcamp schema deployed
- [ ] **For each bootcamp created:**
  - [ ] Basic info filled in (name, slug, description)
  - [ ] Details completed (dates, duration, level, technologies)
  - [ ] Banner image uploaded
  - [ ] Instructors added with images/bios
  - [ ] **Google Sheets Configuration section filled:**
    - [ ] Spreadsheet ID entered
    - [ ] API Key entered
  - [ ] Status set to "open" for active registration
  - [ ] Publish bootcamp document
- [ ] Courses published in Education section
- [ ] Blog posts published
- [ ] Portfolio items added (if applicable)

### Content Verification
- [ ] At least 1 bootcamp created with "open" status
- [ ] At least 3 blog posts published
- [ ] At least 2 portfolio items (optional)
- [ ] At least 2 courses in Education section
- [ ] Team members added (if applicable)
- [ ] Testimonials added (if applicable)

---

## 🧪 Testing Checklist

### Blog Feature Testing
- [ ] Navigate to `/blog` - verify posts display
- [ ] Click on blog post - verify detail page loads
- [ ] Check related articles show correct posts
- [ ] Verify empty state shows when no posts
- [ ] Test responsive design on mobile/tablet
- [ ] Check meta tags for SEO

### Portfolio Feature Testing
- [ ] Navigate to `/portfolio` - verify items display
- [ ] Check empty state shows when no items
- [ ] Test filter functionality
- [ ] Verify images load correctly
- [ ] Test responsive design
- [ ] Check navigation to project URLs

### BootKot Feature Testing (Per-Bootcamp Configuration)
- [ ] Navigate to `/bootkot` - main page loads
- [ ] At least one bootcamp displays (with "open" or "running" status)
- [ ] Click bootcamp card - detail page opens
- [ ] Detail page shows all bootcamp info correctly:
  - [ ] Banner image displays
  - [ ] Bootcamp name and description visible
  - [ ] Start date and duration correct
  - [ ] Instructors displayed with images
  - [ ] Syllabus shows week-by-week breakdown
  - [ ] Prerequisites and outcomes listed
- [ ] Registration form visible on detail page:
  - [ ] All 9 form fields present
  - [ ] Form is properly formatted
  - [ ] Submit button enabled (if slots available)
- [ ] **Google Sheets Integration Test** (Per-Bootcamp):
  - [ ] Verify bootcamp has Google Sheets config in Sanity:
    - [ ] Spreadsheet ID field filled
    - [ ] API Key field filled
  - [ ] Fill registration form with valid data
  - [ ] Submit form - success message appears
  - [ ] Check **correct Google Sheet** for new entry (this bootcamp's sheet)
  - [ ] Verify data is in correct columns
- [ ] **Test Multiple Bootcamps** (Different Sheets):
  - [ ] Create second bootcamp with different Google Sheet
  - [ ] Register for first bootcamp
  - [ ] Register for second bootcamp  
  - [ ] Verify data appears in ONLY the corresponding sheet for each registration
- [ ] Test validation errors:
  - [ ] Empty required field
  - [ ] Invalid email format
  - [ ] Invalid phone number
  - [ ] Age out of range
  - [ ] Short registration reason
- [ ] Test bootcamp full status
- [ ] Test responsive form on mobile
- [ ] Verify all form inputs are accessible

### Navigation Testing
- [ ] BootKot link appears in navbar
- [ ] All navigation links working
- [ ] Mobile menu functions correctly
- [ ] Logo redirects to home

### Performance Testing
- [ ] Pages load within 3 seconds
- [ ] Images load with proper optimization
- [ ] No console errors in browser dev tools
- [ ] Google PageSpeed Insights score > 80
- [ ] Lighthouse performance test

---

## 🔒 Security Checklist

- [ ] No sensitive keys committed to repo
- [ ] `.env.local` in `.gitignore`
- [ ] API endpoint validates all inputs
- [ ] Email validation prevents XSS
- [ ] Phone validation prevents injection
- [ ] CORS properly configured
- [ ] Rate limiting considered for registration API
- [ ] Google Sheets API key has minimal permissions
- [ ] Form submission uses POST method
- [ ] Content Security Policy headers set

---

## 📱 Responsive Design Checklist

- [ ] Mobile (375px): All pages functional
- [ ] Tablet (768px): Layout adapts correctly
- [ ] Desktop (1920px): Full feature display
- [ ] Forms accessible on all breakpoints
- [ ] Images responsive across devices
- [ ] Navigation optimized for mobile

---

## 🚀 Production Deployment Checklist

### Before Deployment
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Environment variables set in production
- [ ] Database backups completed
- [ ] Google Sheets API working in production

### Deployment Steps
1. [ ] Run `npm run build` - verify successful build
2. [ ] Run `npm run type-check` - verify no TypeScript errors
3. [ ] Run `npm run lint` - verify no linting issues
4. [ ] Commit all changes to git
5. [ ] Create deployment branch
6. [ ] Test on staging environment
7. [ ] Verify all features in staging
8. [ ] Deploy to production

### Post-Deployment
- [ ] Monitor error logs for 24 hours
- [ ] Test registration on production
- [ ] Verify Google Sheets receives data
- [ ] Monitor API performance
- [ ] Check analytics for user behavior
- [ ] Get approval from stakeholders
- [ ] Document any issues found

---

## 📊 Analytics & Monitoring

- [ ] Set up Google Analytics 4 tracking
- [ ] Track bootcamp registrations
- [ ] Monitor page performance
- [ ] Set up error alerts
- [ ] Create dashboard for registrations
- [ ] Monitor API response times
- [ ] Track form abandonment rate

---

## 📝 Documentation

- [ ] BOOTKOT_SETUP_GUIDE.md completed ✓
- [ ] Deployment checklist completed ✓
- [ ] Code comments added for complex logic
- [ ] API documentation created
- [ ] User guide for Sanity CMS created
- [ ] Troubleshooting guide created

---

## ✨ Final Code Quality

- [ ] No console.log() in production code (only errors)
- [ ] All TypeScript types properly defined
- [ ] No unused imports or variables
- [ ] Consistent code formatting (prettier configured)
- [ ] No deprecated dependencies
- [ ] Updated dependencies to latest stable versions
- [ ] Removed old/backup files

---

## 🎉 Sign-Off

**Developer**: _______________  
**Date**: _______________

**QA/Tester**: _______________  
**Date**: _______________

**Project Manager**: _______________  
**Date**: _______________

---

## 📞 Post-Deployment Support

### Common Issues & Solutions

**Registrations not appearing in Google Sheets**
- Verify API key is correct
- Check spreadsheet ID
- Ensure sheet is accessible
- Review browser console for errors

**Blog posts not displaying**
- Clear Next.js cache: `rm -rf .next`
- Verify posts are published in Sanity
- Check slug format

**BootKot page empty**
- Create bootcamp in Sanity
- Set status to "open" or "running"
- Verify startDate is valid
- Clear cache and refresh

**Form validation errors**
- Check phone number format
- Ensure email is valid
- Verify age is between 13-100
- Registration reason minimum 10 characters

---

**Version**: 1.0.0  
**Last Updated**: February 22, 2026  
**Next Review**: March 22, 2026
