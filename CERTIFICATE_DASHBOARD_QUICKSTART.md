# Certificate Dashboard - Quick Start Guide

## 🚀 Getting Started

### Step 1: Access the Dashboard
1. Log in as **CEO or Manager**
2. Navigate to: `/dashboard/certificates`
3. Or click **Certificates** in the sidebar menu

---

## 📝 Three Methods to Add Certificates

### Method 1: Single Entry (One at a time)
**Best for**: Testing, occasional entries, data corrections

1. Fill out the form:
   - **Student Name**: Full name of student
   - **Course Name**: Name of the course they completed
   - **Enrollment ID**: UUID from course_enrollments table
   - **User ID**: UUID from users table
   - **Issue Date**: (Optional) Leave blank for today

2. Click **"Insert Certificate"** button
3. View success confirmation with certificate details

**Time**: ~1 minute per certificate

---

### Method 2: Batch JSON (Programmatic)
**Best for**: Bulk imports via API, automation, data integrations

1. Click **"Batch JSON"** tab
2. Click **"Download Template"** to get example format
3. Prepare JSON with up to 100 certificates:
```json
{
  "certificates": [
    {
      "studentName": "John Doe",
      "courseName": "Web Development",
      "enrollmentId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "issueDate": "2026-03-20"
    }
  ]
}
```
4. Paste JSON into the text area
5. Click **"Upload Batch"**
6. View results: count and any errors

**Time**: ~2-3 minutes for 100 certificates

---

### Method 3: CSV Import (Spreadsheet)
**Best for**: Excel/Google Sheets data, largest bulk uploads

1. Click **"CSV Import"** tab
2. Click **"Download Template"** to get CSV format
3. Prepare CSV file in Excel or Google Sheets:

| studentName | courseName | enrollmentId | userId | issueDate |
|------------|------------|------------|--------|-----------|
| John Doe | Web Dev | uuid-here | uuid-here | 2026-03-20 |
| Jane Smith | React | uuid-here | uuid-here | 2026-03-21 |

4. Export as **CSV file**
5. Click upload area or drag-drop CSV file
6. Click **"Import CSV"**
7. View results: count imported and any errors

**Time**: ~2-3 minutes for 100 certificates

---

## ✅ Required Fields

All methods require:
- ✅ `studentName` - Cannot be empty
- ✅ `courseName` - Cannot be empty  
- ✅ `enrollmentId` - Must be valid UUID that exists in database
- ✅ `userId` - Cannot be empty

Optional:
- ⭕ `issueDate` - Defaults to today if not provided

---

## 📋 CSV Format Details

### Required Columns (in CSV header)
```
studentName,courseName,enrollmentId,userId,issueDate
```

### Rules
- First row MUST be header
- No duplicate headers
- Maximum 100 rows per file
- Maximum file size: 5MB
- Date format: YYYY-MM-DD (2026-03-20)

### Example
```csv
studentName,courseName,enrollmentId,userId,issueDate
John Doe,Web Development Mastery,550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001,2026-03-20
Jane Smith,Advanced React,550e8400-e29b-41d4-a716-446655440002,550e8400-e29b-41d4-a716-446655440003,2026-03-21
Bob Johnson,Python Fundamentals,550e8400-e29b-41d4-a716-446655440004,550e8400-e29b-41d4-a716-446655440005,2026-03-22
```

---

## 🎯 Finding Required IDs

### Enrollment ID
1. Open Supabase dashboard
2. Go to `public > course_enrollments` table
3. Copy UUID from `id` column for the enrollment

### User ID
1. Open Supabase dashboard
2. Go to `public > users` table
3. Copy UUID from `id` column for the user

---

## ⚠️ Common Issues & Fixes

### Error: "Missing required fields"
**Problem**: Left a field empty
**Fix**: Fill all 4 required fields (studentName, courseName, enrollmentId, userId)

### Error: "Enrollment not found"
**Problem**: enrollmentId doesn't exist in database
**Fix**: Double-check the UUID is correct from course_enrollments table

### Error: "Invalid JSON format"
**Problem**: JSON syntax error (missing comma, quote, etc.)
**Fix**: Use [jsonlint.com](https://jsonlint.com) to validate JSON

### Error: "Missing required columns"
**Problem**: CSV header missing one of: studentName, courseName, enrollmentId, userId
**Fix**: Add the missing column header to CSV

### CSV not importing
**Problem**: File is not CSV format
**Fix**: Use Excel > Save As > CSV (Comma delimited)

---

## ✨ Features

✅ **Real-time Validation** - Errors shown before submit  
✅ **Template Download** - Get correct format instantly  
✅ **Bulk Operations** - Up to 100 certificates per batch  
✅ **Error Reporting** - See exactly which rows failed  
✅ **Success Feedback** - Know how many were imported  
✅ **Secure IDs** - Cryptographically generated certificate IDs  
✅ **Date Flexibility** - Custom dates or use today's  

---

## 🔒 Security

- Only **Managers and Admins** can access this feature
- All data validated before database insertion
- Enrollment existence verified
- Secure certificate ID generation (128-bit entropy)
- Database validation on every insert

---

## 📊 What Happens After Import

Once certificates are imported:

1. **Certificate records created** in database with:
   - Unique certificate ID: `KOT-YYYY-XXXXXXXX`
   - Student name
   - Course name
   - Issue date
   - Links to enrollment and user

2. **Certificates can be**:
   - Viewed at `/certificate-verify`
   - Downloaded as PDF
   - Shared publicly
   - Verified with certificate ID

3. **No email sent** - You can notify students separately

---

## 💡 Pro Tips

1. **Test first**: Add one certificate manually before bulk import
2. **Use template**: Always download and use the provided template
3. **Validate IDs**: Double-check enrollmentId exists in database
4. **Batch size**: Keep batches under 100 for faster processing
5. **Track progress**: Note count of successful imports
6. **Error handling**: Read error messages carefully - they indicate what to fix

---

## 📞 Support

**Issue**: Not seeing new certificates?
- Refresh page with F5
- Check success message for import count
- Verify enrollment/user IDs are correct

**Issue**: Certificate ID not generating?
- Should auto-generate if not provided
- Format: `KOT-YYYY-XXXXXXXX`
- If stuck, report to admin

**Issue**: Batch upload failed partially?
- Fix the invalid rows
- Resubmit just those rows
- Check error details for reason

---

## ✅ Success Checklist

Before uploading certificates:
- [ ] I have valid enrollmentId UUIDs
- [ ] I have valid userId UUIDs
- [ ] Student names are filled in
- [ ] Course names are filled in
- [ ] Dates are in YYYY-MM-DD format (if provided)
- [ ] CSV has correct columns (if using CSV)
- [ ] File is under 5MB (if using CSV)
- [ ] No more than 100 records per batch

---

**Ready to go!** 🎉 Access `/dashboard/certificates` and start adding certificates!

