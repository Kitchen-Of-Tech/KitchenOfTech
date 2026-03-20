# 🎓 Certificate System - Quick Start Guide

**Date**: March 20, 2026  
**Status**: ✅ Ready to Use

---

## 🚀 Quick Start (5 Minutes)

### 1. Set Environment Variable
```bash
# Add to .env.local
NEXT_PUBLIC_BASE_URL=https://kitchenoftech.com  # or http://localhost:3000
```

### 2. Create Test Certificate
```bash
# Go to dashboard
http://localhost:3000/dashboard/certificates

# Fill in form:
- Student Name: John Doe
- Course Name: React Advanced
- Credential Code: REACT-ADV-2024-001
- Level: Advanced
- Grade: 95
- Instructor Name: Jane Smith

# Click Submit
```

### 3. See Your Certificate with QR Code
```
Certificate displayed with:
- Your Illustrator template background
- QR code at red box location
- All text overlaid
- Beautiful professional appearance
```

### 4. Test QR Code
```bash
# On phone:
- Open camera
- Point at QR code
- Click notification to verify
- See certificate details
```

### 5. Print Certificate
```bash
# On verification page:
- Click "Print Certificate"
- Browser print dialog appears
- QR code prints clearly
- Can save as PDF
```

---

## 📂 Important Files

| File | Purpose | Action |
|---|---|---|
| `Certificate.svg` | Your template (red box removed) | View in browser |
| `CertificateQRCode.tsx` | QR code generator | Integrates automatically |
| `CertificateTemplateDisplay.tsx` | Display component | Use when showing certs |
| `.env.local` | Environment config | Update BASE_URL |

---

## 🔗 Important URLs

### Dashboard
```
http://localhost:3000/dashboard/certificates
→ Create, import, manage certificates
```

### Verification (After QR Scan)
```
http://localhost:3000/certificate-verify?code=CREDENTIAL_CODE
→ Shows certificate details
```

### Verification by ID (Legacy)
```
http://localhost:3000/api/education/certificate/verify?certificateId=KOT-2026-ABC
→ JSON response with certificate
```

---

## 📊 Data Flow

```
┌─────────────────────┐
│  Create Certificate │  Dashboard form or API
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  API Inserts Data   │  Validates, generates IDs
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Store in Database  │  Supabase PostgreSQL
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Display Template   │  CertificateTemplateDisplay
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Generate QR Code   │  From credential_code
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Render Certificate │  SVG template + QR + text
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  User Scans QR      │  Phone camera
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Verification Page  │  Shows certificate details
└─────────────────────┘
```

---

## 🎨 What You Get

### Certificate Template
```
┌─────────────────────────────────────────┐
│                                         │
│      YOUR ILLUSTRATOR DESIGN HERE      │
│                                         │
│  Student: John Doe                      │
│  Course: React Advanced                 │
│  Grade: 95%                             │
│                                         │
│  ┌────────┐  Issue: March 20, 2026     │
│  │        │  Valid: March 20, 2028     │
│  │ QR     │  Credential: REACT-ADV-... │
│  │ CODE   │  Certificate: KOT-2026-... │
│  │        │                             │
│  └────────┘  Instructor: Jane Smith    │
│              Institution: Kitchen Tech │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 Customization

### Change QR Code Position
Edit `components/certificate/CertificateTemplateDisplay.module.css`:
```css
.qrcodeContainer {
  left: 19.78%;      /* Move horizontally */
  top: 60.15%;       /* Move vertically */
  width: 13.04%;     /* Resize */
}
```

### Change Text Positions
Edit `.module.css` for each text field:
```css
.studentName {
  left: 35%;    /* Your X position */
  top: 35%;     /* Your Y position */
  width: 50%;   /* Width for wrapping */
}
```

### Change Text Size
```css
.studentName {
  font-size: calc(2.5vw);  /* Scales with viewport */
  /* Or fixed: font-size: 24px; */
}
```

---

## 🧪 Testing Checklist

```
☐ Create certificate - works?
☐ QR code displays - works?
☐ QR code scannable - works?
☐ Scan redirects - works?
☐ Verification shows - works?
☐ Can print - works?
☐ Print has QR - works?
☐ Mobile responsive - works?
```

---

## 🐛 Troubleshooting

### QR Code Not Showing
```
Problem: QR code missing from certificate
Solution: Check NEXT_PUBLIC_BASE_URL is set
```

### QR Code Not Scannable
```
Problem: Phone camera can't read QR
Solution: Increase QR code size or contrast
```

### Text Overlapping
```
Problem: Text overlaps with template
Solution: Adjust position in .module.css
```

### Print Quality Poor
```
Problem: Blurry certificate when printed
Solution: Use 300 DPI print settings
```

---

## 📱 Mobile Testing

### QR Code Scanning
- iPhone: Built-in camera app
- Android: Built-in camera app
- Any phone: Google Lens or QR apps

### Testing Flow
```
1. Create certificate
2. Take phone screenshot of page
3. Open on another phone/device
4. Scan QR code from screenshot
5. Should open verification page
```

---

## 📊 API Quick Reference

### Create Certificate (Single)
```bash
POST /api/dashboard/certificates/single-insert
Content-Type: application/json

{
  "studentName": "John Doe",
  "courseName": "React Advanced",
  "credentialCode": "REACT-ADV-2024-001",
  "level": "Advanced",
  "grade": 95,
  "instructorName": "Jane Smith"
}
```

### Create Certificate (Batch)
```bash
POST /api/dashboard/certificates/batch-insert
Content-Type: application/json

{
  "certificates": [
    { /* certificate 1 */ },
    { /* certificate 2 */ }
  ]
}
```

### Verify Certificate
```bash
GET /api/education/certificate/verify-by-credential?credentialCode=REACT-ADV-2024-001

Response:
{
  "success": true,
  "certificate": { /* full certificate */ },
  "isExpired": false
}
```

---

## 🎯 Success Indicators

You'll know it's working when:

✅ Certificate creates without errors  
✅ QR code appears on certificate  
✅ QR code is positioned correctly  
✅ Scanning with phone opens verification page  
✅ Verification page shows certificate details  
✅ Can print certificate  
✅ Printed QR code scans  
✅ Print quality is professional  

---

## 🚀 Deployment

### Local Development
```bash
npm run dev
# Open http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Vercel Deployment
```bash
git push origin main
# Auto-deploys to Vercel
```

---

## 📞 Need Help?

### Check These Files
- `CERTIFICATE_QR_CODE_INTEGRATION.md` - Detailed implementation
- `CERTIFICATE_IMPLEMENTATION_COMPLETE.md` - Full overview
- `DEPLOYMENT_CHECKLIST_CERTIFICATES.md` - Production readiness

### Common Questions

**Q: Where's my SVG template?**
- A: `public/certificates/Certificate.svg`

**Q: How do I change text positions?**
- A: Edit `CertificateTemplateDisplay.module.css`

**Q: Why isn't the QR code scanning?**
- A: Check environment variable is set

**Q: Can I change the QR code size?**
- A: Yes, edit the `size` prop in component

**Q: How do I print?**
- A: Click print button on verification page

---

## ✨ Features Summary

```
Certificate System
├── 3 Creation Methods
│   ├── Single form
│   ├── Batch JSON
│   └── CSV import
├── 2 Verification Methods
│   ├── By Certificate ID
│   └── By Credential Code (QR)
├── QR Code
│   ├── Auto-generated
│   ├── Scannable
│   └── Positioned at red box
├── Display
│   ├── Your Illustrator template
│   ├── Dynamic text overlays
│   ├── Responsive design
│   └── Print-ready
└── Security
    ├── Role-based access
    ├── Database encryption
    ├── Input validation
    └── RLS policies
```

---

## 🎉 Ready to Go!

Everything is set up and ready to use:

1. ✅ Template imported
2. ✅ QR code integrated
3. ✅ APIs working
4. ✅ Components created
5. ✅ Build successful
6. ✅ Documentation complete

**Start creating certificates now!** 🚀

---

**Questions?** Check the detailed guides:
- `CERTIFICATE_QR_CODE_INTEGRATION.md` - Full technical guide
- `DEPLOYMENT_CHECKLIST_CERTIFICATES.md` - Production checklist
- `CERTIFICATE_IMPLEMENTATION_COMPLETE.md` - Complete overview

