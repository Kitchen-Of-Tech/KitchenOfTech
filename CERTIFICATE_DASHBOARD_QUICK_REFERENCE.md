# Certificate Dashboard - Quick Reference Card

## 🎯 Quick Access
- **URL**: `/dashboard/certificates`
- **Sidebar**: Certificates (Trophy icon)
- **Access**: Manager role or higher
- **Status**: ✅ Live & Production Ready

---

## 📝 Three Input Methods

### 1️⃣ SINGLE ENTRY
**Best for**: Testing, one certificate  
**Time**: 1-2 minutes  
**Max**: 1 certificate
```
1. Fill form fields
2. Click "Insert Certificate"
3. Done ✓
```

### 2️⃣ BATCH JSON
**Best for**: Automation, API integration  
**Time**: 2-3 minutes  
**Max**: 100 certificates
```
1. Download template
2. Prepare JSON array
3. Paste JSON
4. Click "Upload Batch"
5. Done ✓
```

### 3️⃣ CSV IMPORT
**Best for**: Excel/Sheets users  
**Time**: 2-3 minutes  
**Max**: 100 rows
```
1. Download template
2. Fill spreadsheet
3. Export as CSV
4. Upload file
5. Done ✓
```

---

## 📋 Required Data (All Methods)

```
✅ studentName     (string) - Student's full name
✅ courseName      (string) - Course name
✅ enrollmentId    (UUID)   - From course_enrollments
✅ userId          (UUID)   - From users

⭕ issueDate       (date)   - Optional, defaults to today
                             Format: YYYY-MM-DD
```

---

## 📊 CSV Format

```
Header:
studentName,courseName,enrollmentId,userId,issueDate

Example:
John Doe,Web Dev,550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001,2026-03-20
```

---

## ✅ Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| studentName | Required, non-empty | "John Doe" |
| courseName | Required, non-empty | "Web Development" |
| enrollmentId | Required UUID, must exist | "550e8400-..." |
| userId | Required, non-empty | "550e8400-..." |
| issueDate | Optional, YYYY-MM-DD format | "2026-03-20" |

---

## 🔧 API Endpoints

| Method | Endpoint | Max | Response |
|--------|----------|-----|----------|
| POST | `/api/dashboard/certificates/single-insert` | 1 cert | `{ success, certificate }` |
| POST | `/api/dashboard/certificates/batch-insert` | 100 certs | `{ success, count, certificates }` |
| POST | `/api/dashboard/certificates/csv-import` | 100 rows | `{ success, count, skippedRows }` |

---

## 🎓 Examples

### Single Entry Request
```json
{
  "studentName": "Alice Smith",
  "courseName": "React Mastery",
  "enrollmentId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "issueDate": "2026-03-20"
}
```

### Batch JSON
```json
{
  "certificates": [
    { "studentName": "John", "courseName": "Web Dev", ... },
    { "studentName": "Jane", "courseName": "React", ... }
  ]
}
```

### CSV Content
```
studentName,courseName,enrollmentId,userId,issueDate
John Doe,Web Dev,uuid1,uuid2,2026-03-20
Jane Smith,React,uuid3,uuid4,2026-03-21
```

---

## ❌ Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Missing required fields" | Empty field | Fill all 4 required fields |
| "Enrollment not found" | Bad enrollmentId | Verify UUID in database |
| "Invalid JSON format" | Syntax error | Use [jsonlint.com](https://jsonlint.com) |
| "Missing required columns" | Bad CSV header | Use: studentName,courseName,enrollmentId,userId,issueDate |
| "CSV file must be .csv" | Wrong file format | Export from Excel as CSV (Comma delimited) |

---

## 🔐 Security Features

- ✅ Manager+ role only
- ✅ Server-side validation
- ✅ Secure certificate IDs (128-bit crypto)
- ✅ Enrollment verification
- ✅ No SQL injection
- ✅ Encrypted data transfer

---

## ⚡ Performance

| Operation | Time | Records |
|-----------|------|---------|
| Single insert | 200-500ms | 1 |
| Batch (small) | 1-2s | 50 |
| Batch (full) | 2-4s | 100 |

---

## 📞 Troubleshooting

**Can't access page?**
- Verify logged in as Manager+
- Check URL: `/dashboard/certificates`

**Certificates not showing?**
- Refresh page
- Check success message for count
- Verify correct data was entered

**Upload failed?**
- Read error message carefully
- Fix identified issue
- Retry submission

---

## 🎯 Use Cases

| Scenario | Method | Time |
|----------|--------|------|
| Test single cert | Single Entry | 1 min |
| Add 10 certs | CSV Import | 3 min |
| Add 100 certs | Batch JSON | 2 min |
| Manual correction | Single Entry | 1 min |
| Automated nightly | Batch API | <1 min |

---

## 📂 Related Documentation

- Full Guide: `CERTIFICATE_DASHBOARD_FEATURE.md`
- User Guide: `CERTIFICATE_DASHBOARD_QUICKSTART.md`
- Tech Docs: `CERTIFICATE_DASHBOARD_IMPLEMENTATION_COMPLETE.md`

---

## ✨ Quick Tips

1. **Always download template first** - Ensures correct format
2. **Test with single entry** - Verify your data works
3. **Keep batches under 100** - Better performance
4. **Check error messages** - They indicate exactly what to fix
5. **Verify UUIDs exist** - Prevents database errors

---

## 🚀 Ready?

1. Go to `/dashboard/certificates`
2. Choose your method (Single/Batch/CSV)
3. Add your certificates
4. Click upload/insert
5. View results

**That's it!** ✅

