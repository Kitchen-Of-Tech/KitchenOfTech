# Certificate Fields Quick Reference Guide

## Certificate Data Structure

### Required Fields
These fields MUST be provided for every certificate:

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| **studentName** | String | John Doe | Student's full name |
| **courseName** | String | Web Development Mastery | Name of the course completed |
| **credentialCode** | String (100 chars) | WEB-DEV-2024-001 | Unique credential identifier - NEW |
| **level** | String (100 chars) | Advanced | Proficiency level - NEW |
| **enrollmentId** | UUID | 550e8400-e29b-41d4-a716-446655440000 | Link to enrollment record |
| **userId** | UUID | 550e8400-e29b-41d4-a716-446655440001 | Student's user ID |

### Optional Fields
These fields can be omitted or left empty:

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| **issueDate** | YYYY-MM-DD | 2026-03-20 | Certificate issue date (defaults to today) |
| **validUntil** | YYYY-MM-DD | 2028-03-20 | Certificate expiration date |
| **grade** | Number 0-100 | 95.5 | Final grade or score (must be 0-100) |
| **institution** | String (255 chars) | KitchenOfTech Academy | Issuing organization |
| **instructorNotes** | Text | Excellent performance | Comments from instructor |

## Level Dropdown Values

The `level` field should use one of these values:
- `Beginner` - Foundational level
- `Intermediate` - Intermediate level
- `Advanced` - Advanced level
- `Master` - Master/Expert level

## Usage Examples

### Single Entry Form (UI)
```
Student Name: John Doe
Course Name: Web Development Mastery
Credential Code: WEB-DEV-2024-001
Level: Advanced (select from dropdown)
Enrollment ID: 550e8400-e29b-41d4-a716-446655440000
User ID: 550e8400-e29b-41d4-a716-446655440001
Issue Date: 2026-03-20
Valid Until: 2028-03-20 (optional)
Grade: 95.50 (optional, 0-100)
Institution: KitchenOfTech Academy (optional)
Instructor Notes: Excellent performance in all modules (optional)
```

### CSV Import Format
```csv
studentName,courseName,credentialCode,level,enrollmentId,userId,issueDate,validUntil,grade,institution,instructorNotes
John Doe,Web Development Mastery,WEB-DEV-2024-001,Advanced,550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001,2026-03-20,2028-03-20,95.5,KitchenOfTech Academy,Excellent performance in all modules
Jane Smith,Advanced React,REACT-2024-002,Master,550e8400-e29b-41d4-a716-446655440002,550e8400-e29b-41d4-a716-446655440003,2026-03-21,2028-03-21,98.0,KitchenOfTech Academy,Outstanding achievement
```

### Batch JSON Format
```json
{
  "certificates": [
    {
      "studentName": "John Doe",
      "courseName": "Web Development Mastery",
      "credentialCode": "WEB-DEV-2024-001",
      "level": "Advanced",
      "enrollmentId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "issueDate": "2026-03-20",
      "validUntil": "2028-03-20",
      "grade": 95.5,
      "institution": "KitchenOfTech Academy",
      "instructorNotes": "Excellent performance in all modules"
    },
    {
      "studentName": "Jane Smith",
      "courseName": "Advanced React",
      "credentialCode": "REACT-2024-002",
      "level": "Master",
      "enrollmentId": "550e8400-e29b-41d4-a716-446655440002",
      "userId": "550e8400-e29b-41d4-a716-446655440003",
      "issueDate": "2026-03-21",
      "validUntil": "2028-03-21",
      "grade": 98.0,
      "institution": "KitchenOfTech Academy",
      "instructorNotes": "Outstanding achievement"
    }
  ]
}
```

## Validation Rules

### Credential Code
- Required field
- Maximum 100 characters
- Must be unique (no duplicates in system)
- Suggested format: `[COURSE]-[YEAR]-[SEQUENCE]` (e.g., WEB-DEV-2024-001)

### Level
- Required field
- Must be one of: Beginner, Intermediate, Advanced, Master
- Case-sensitive (exact match required)

### Grade
- Optional field
- Must be a number between 0 and 100 (inclusive)
- Decimal values allowed (e.g., 95.5)
- Database stores as DECIMAL(5,2) - max 999.99

### Dates
- Format must be YYYY-MM-DD (ISO format)
- Valid Until should be after Issue Date
- Dates are stored in UTC/ISO format in database

### Institution
- Optional field
- Maximum 255 characters
- Any text allowed

### Instructor Notes
- Optional field
- Text field (no length limit in typical use)
- Supports multi-line text

## API Response Format

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Successfully inserted 1 certificate",
  "count": 1,
  "certificate": {
    "id": "uuid",
    "certificate_id": "KOT-2026-XXXXXXXXXXXXX",
    "student_name": "John Doe",
    "course_name": "Web Development Mastery",
    "credential_code": "WEB-DEV-2024-001",
    "level": "Advanced",
    "issue_date": "2026-03-20T00:00:00Z",
    "valid_until": "2028-03-20T00:00:00Z",
    "grade": 95.5,
    "institution": "KitchenOfTech Academy",
    "instructor_notes": "Excellent performance in all modules"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "CSV validation failed",
  "details": [
    "Row 2: Missing or empty credentialCode",
    "Row 3: Grade must be a number between 0 and 100"
  ],
  "totalErrors": 2
}
```

## Certificate Display

When certificates are verified or viewed, all fields are displayed:

- Student Name
- Course Name
- Credential Code (displayed prominently)
- Level
- Issue Date
- Valid Until (if set, shows expiration)
- Grade (if set, displays as X.XX/100)
- Institution (if set)
- Instructor Notes (if set)
- Certificate ID (system-generated, for verification)

## Tips & Best Practices

1. **Credential Codes**: Use a consistent naming convention (e.g., `[SUBJECT]-[YEAR]-[NUMBER]`)
2. **Levels**: Standardize on the four provided options for consistency
3. **Dates**: Always use YYYY-MM-DD format to avoid parsing errors
4. **Batch Imports**: Download the template CSV to ensure correct format
5. **Grades**: Use 0-100 scale; if using different scales, convert first
6. **Institution**: Use consistent naming across all certificates
7. **Expiration**: Set valid_until for time-limited certifications

## Common Errors & Solutions

### Error: "Missing or empty credentialCode"
**Solution**: Ensure the credentialCode field is filled for every certificate

### Error: "Grade must be a number between 0 and 100"
**Solution**: Check grade value is numeric and in 0-100 range (e.g., 95.5 is valid, 105 is not)

### Error: "Invalid validUntil format"
**Solution**: Use YYYY-MM-DD format (e.g., 2028-03-20, not 03/20/2028)

### Error: "Missing required columns"
**Solution**: For CSV, verify header includes: studentName, courseName, credentialCode, level, enrollmentId, userId

### Error: "Unknown level"
**Solution**: Use exact case-sensitive values: Beginner, Intermediate, Advanced, or Master

## Migration Checklist

Before deploying new certificate entries:
- [ ] Verify all required fields are populated
- [ ] Check credential codes are unique
- [ ] Validate grade values are 0-100
- [ ] Confirm dates are in YYYY-MM-DD format
- [ ] Test with single entry first
- [ ] Use template CSV to ensure format
- [ ] Verify certificates display correctly in verification page
