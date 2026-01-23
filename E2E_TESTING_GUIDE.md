# 🧪 End-to-End Testing Guide
**Kitchen of Tech Payment System - Complete Workflow Verification**

---

## 🎯 Purpose

This guide walks you through testing the **complete payment workflow** to verify all features work together seamlessly before production launch.

---

## ✅ Pre-Test Checklist

Before starting the E2E tests, verify:

- [x] **Database:** Migration 007 applied ✅
- [x] **Development Server:** Running (`npm run dev`)
- [x] **Authentication:** You can log in as an admin user
- [x] **Environment Variables:** All configured in `.env.local`
  - [x] NEXT_PUBLIC_SUPABASE_URL ✅
  - [x] NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
  - [x] SUPABASE_SERVICE_ROLE_KEY ✅
  - [x] RESEND_API_KEY ✅ (just added)
  - [x] EMAIL_FROM ✅
  - [x] EMAIL_FROM_NAME ✅

---

## 🔄 Complete Payment Workflow Test

### Test Scenario
**Customer enrolls in a course → Submits payment → Admin approves → System generates invoice → Email sent → Accounting updated**

---

## Test 1: Create Payment Link 🔗

### Steps:
1. **Login as Admin** (CEO or Manager role)
2. **Navigate to Dashboard** → `/dashboard`
3. **Go to "Payment Links" tab**
4. **Click "Create Payment Link"**
5. **Fill in details:**
   ```
   Title: Course Enrollment - Web Development Bootcamp
   Description: Full-stack web development course
   Amount: 5000
   Currency: BDT
   Purpose: enrollment
   Reference ID: course-123
   Expiry Date: (7 days from now)
   Max Uses: 1
   ```
6. **Click "Create"**

### Expected Result:
- ✅ Payment link created successfully
- ✅ Link ID generated (e.g., `pay-abc12345`)
- ✅ Status shows "Active"
- ✅ Link appears in the payment links list

### Test Data to Save:
```
Link ID: _______________ (save this for next test)
Link URL: https://kitchenoftech.org/pay/_______________
```

---

## Test 2: Submit Payment (Public User) 💳

### Steps:
1. **Open payment link in browser** (or new incognito tab)
   - URL: `http://localhost:3000/pay/[your-link-id]`
2. **Verify payment page loads** with:
   - ✅ Payment link title and description
   - ✅ Amount displayed (5000 BDT)
   - ✅ Available payment methods listed
3. **Fill in customer details:**
   ```
   Name: John Doe
   Email: john.doe@example.com
   Phone: +880 1234-567890
   Payment Method: (select one - e.g., bKash)
   Transaction ID: TXN123456789 (your test transaction ID)
   Note: (optional) "Excited to learn web development!"
   ```
4. **Click "Submit Payment"**

### Expected Result:
- ✅ Payment submitted successfully
- ✅ Confirmation message shown
- ✅ Transaction status: "Pending Approval"
- ✅ Customer receives transaction reference

### Test Data to Save:
```
Transaction ID: _______________
Customer Email: john.doe@example.com
```

---

## Test 3: View Pending Transaction 📋

### Steps:
1. **Login as Admin** (if not already)
2. **Navigate to Dashboard** → `/dashboard`
3. **Go to "Transactions" tab**
4. **Filter by Status:** "Pending"
5. **Find your test transaction**

### Expected Result:
- ✅ Transaction appears in pending list
- ✅ Shows customer name (John Doe)
- ✅ Shows amount (5000 BDT)
- ✅ Shows transaction ID (TXN123456789)
- ✅ Shows payment method (bKash)
- ✅ "Approve" and "Reject" buttons visible

---

## Test 4: Approve Payment ✅

### Steps:
1. **From Transactions tab**, click **"Approve"** on your test transaction
2. **Confirm approval** in the modal/dialog
3. **Wait for success message**

### Expected Result:
- ✅ Transaction status changes to "Approved"
- ✅ Success message displayed
- ✅ **Accounting entry auto-created** (income)
- ✅ If linked to invoice, invoice status updates to "Paid"

### Verify Auto-Created Accounting Entry:
1. **Go to "Accounting" tab**
2. **Filter by type:** "Income"
3. **Find entry with:**
   - Category: "course_sales" (or appropriate)
   - Amount: 5000 BDT
   - Description: Linked to transaction
   - Entry type: Income (green indicator)

### Expected Accounting Entry:
```
✅ Entry Type: Income
✅ Amount: 5000 BDT
✅ Category: course_sales
✅ Transaction Link: Yes (linked to TXN123456789)
✅ Created automatically on approval
```

---

## Test 5: Create Invoice 📄

### Steps:
1. **Navigate to Dashboard** → "Invoices" tab
2. **Click "Create Invoice"**
3. **Fill in invoice details:**
   ```
   Customer Name: John Doe
   Customer Email: john.doe@example.com
   Customer Phone: +880 1234-567890
   Customer Address: 123 Main St, Dhaka, Bangladesh
   
   Issue Date: (today)
   Due Date: (30 days from now)
   
   Status: Draft (or Sent)
   
   Notes: Thank you for enrolling in our course!
   Terms: Payment due within 30 days
   ```
4. **Add Line Items:**
   ```
   Item 1:
   - Description: Web Development Bootcamp - Full Course
   - Quantity: 1
   - Unit Price: 4500
   - Type: course
   
   Item 2:
   - Description: Course Materials & Certificate
   - Quantity: 1
   - Unit Price: 500
   - Type: service
   ```
5. **Set Tax & Discount:**
   ```
   Tax Rate: 0% (or as applicable)
   Discount: 0 BDT
   ```
6. **Verify Totals:**
   ```
   Subtotal: 5000 BDT
   Tax: 0 BDT
   Discount: 0 BDT
   Total: 5000 BDT
   ```
7. **Click "Create Invoice"**

### Expected Result:
- ✅ Invoice created successfully
- ✅ Invoice number auto-generated (e.g., INV-2026-001)
- ✅ Status shows "Draft" or "Sent"
- ✅ Invoice appears in invoices list

### Test Data to Save:
```
Invoice Number: _______________
Invoice ID: _______________
```

---

## Test 6: Download Invoice PDF 📥

### Steps:
1. **From Invoices tab**, find your test invoice
2. **Click "Download PDF"** or PDF icon
3. **Verify PDF opens/downloads**

### Expected Result:
- ✅ PDF generates successfully
- ✅ PDF contains:
  - ✅ KitchenOfTech branding
  - ✅ Invoice number (INV-2026-001)
  - ✅ Customer details (John Doe, email, address)
  - ✅ Invoice date and due date
  - ✅ Line items table (2 items)
  - ✅ Quantities and prices
  - ✅ Totals section (subtotal, tax, discount, total)
  - ✅ Notes section
  - ✅ Terms section
- ✅ PDF is printable from browser

### Quality Check:
```
✅ Layout is professional
✅ All text is readable
✅ Amounts are correct
✅ No broken styling
✅ Can print to physical PDF
```

---

## Test 7: Email Invoice 📧

### Steps:
1. **From Invoices tab**, find your test invoice
2. **Click "Send Email"** or email icon
3. **Optional:** Add custom message
   ```
   Custom Message: "Dear John, thank you for enrolling! 
   Attached is your course enrollment invoice."
   ```
4. **Click "Send"**
5. **Wait for success message**

### Expected Result:
- ✅ Email sent successfully
- ✅ Success message displayed
- ✅ Invoice status may update to "Sent"

### Verify Email Received:
1. **Check recipient inbox** (john.doe@example.com)
2. **Look for email from:** noreply@kitchenoftech.com
3. **Subject:** Invoice INV-2026-001 from KitchenOfTech

### Email Should Contain:
- ✅ Professional HTML template
- ✅ Purple gradient header with KitchenOfTech branding
- ✅ Invoice details card:
  - Invoice number
  - Issue date
  - Due date
  - Status
- ✅ Line items table with:
  - Description
  - Quantity
  - Rate
  - Amount
- ✅ Totals section:
  - Subtotal: 5000 BDT
  - Tax: 0 BDT
  - Discount: 0 BDT
  - **Total: 5000 BDT**
- ✅ Notes section (yellow highlight)
- ✅ Payment instructions (blue info box)
- ✅ Professional footer

### Quality Check:
```
✅ Email renders correctly in inbox
✅ Responsive design (works on mobile)
✅ All amounts match invoice
✅ Professional appearance
✅ No broken images/styling
```

---

## Test 8: Add Manual Expense Entry 💰

### Steps:
1. **Navigate to Dashboard** → "Accounting" tab
2. **Go to "Entries" sub-tab**
3. **Click "Add Expense"**
4. **Fill in expense details:**
   ```
   Category: marketing
   Amount: 1500
   Description: Facebook ads campaign for course promotion
   Date: (today)
   ```
5. **Click "Add Entry"**

### Expected Result:
- ✅ Expense entry created successfully
- ✅ Shows in entries list with red indicator (expense)
- ✅ Statistics update:
  - Total Expenses increased by 1500 BDT
  - Net Profit decreased by 1500 BDT

---

## Test 9: Generate Financial Reports 📊

### Test 9.1: Profit & Loss Report

#### Steps:
1. **Go to "Reports" sub-tab** in Accounting
2. **Select Report Type:** "Profit & Loss"
3. **Set Date Range:**
   ```
   From: (start of current month)
   To: (today)
   ```
4. **Click "Generate Report"**

#### Expected Result:
- ✅ Report generates successfully
- ✅ **Summary Cards show:**
  - Total Income: 5000 BDT (from approved payment)
  - Total Expenses: 1500 BDT (from manual entry)
  - Net Profit: 3500 BDT
  - Profit Margin: 70%
- ✅ **Income by Category table shows:**
  - course_sales: 5000 BDT
- ✅ **Expenses by Category table shows:**
  - marketing: 1500 BDT

### Test 9.2: Revenue by Category Report

#### Steps:
1. **Select Report Type:** "Revenue by Category"
2. **Same date range**
3. **Click "Generate Report"**

#### Expected Result:
- ✅ Report shows revenue breakdown
- ✅ **Table includes:**
  - Category: course_sales
  - Total: 5000 BDT
  - Count: 1 transaction
  - Average: 5000 BDT
  - Percentage: 100%

### Test 9.3: Monthly Summary Report

#### Steps:
1. **Select Report Type:** "Monthly Summary"
2. **Select Year:** 2026
3. **Click "Generate Report"**

#### Expected Result:
- ✅ Report shows 12-month breakdown
- ✅ **Current month (January 2026) shows:**
  - Income: 5000 BDT
  - Expenses: 1500 BDT
  - Net: 3500 BDT
- ✅ **Yearly totals calculated:**
  - Total Income: 5000 BDT
  - Total Expenses: 1500 BDT
  - Total Net: 3500 BDT
- ✅ **Monthly averages shown**

### Test 9.4: Download Report as JSON

#### Steps:
1. **Click "Download Report"** button
2. **Verify JSON file downloads**

#### Expected Result:
- ✅ JSON file downloads successfully
- ✅ Contains complete report data
- ✅ Properly formatted JSON structure

---

## Test 10: Update Invoice Status 📝

### Steps:
1. **Go back to Invoices tab**
2. **Find your test invoice**
3. **Click "Edit"**
4. **Change Status:** "Draft" → "Paid"
5. **Optional:** Link to transaction
6. **Save changes**

### Expected Result:
- ✅ Invoice status updates successfully
- ✅ "Paid At" timestamp recorded
- ✅ Status indicator updates in UI

---

## Test 11: Filter & Search Tests 🔍

### Test 11.1: Filter Invoices

#### Steps:
1. **Invoices tab** → Use status filter
2. **Filter by:** "Paid"

#### Expected Result:
- ✅ Only paid invoices shown (including your test invoice)

### Test 11.2: Filter Accounting Entries

#### Steps:
1. **Accounting tab → Entries**
2. **Filter by Type:** "Income"
3. **Verify:** Only income entries shown (green indicators)
4. **Filter by Type:** "Expense"
5. **Verify:** Only expense entries shown (red indicators)

### Test 11.3: Date Range Filter

#### Steps:
1. **Use date range filters**
2. **Set:** Start Date and End Date
3. **Verify:** Only entries within range shown

---

## Test 12: Delete Operations ⚠️

### Test 12.1: Delete Invoice (Optional)

#### Steps:
1. **Find test invoice**
2. **Click "Delete"**
3. **Confirm deletion**

#### Expected Result:
- ✅ Invoice deleted successfully
- ✅ Linked line items also deleted (cascade)
- ✅ Invoice removed from list

**Note:** Only test deletion if you want to clean up test data.

---

## 🎯 Verification Summary Checklist

After completing all tests, verify:

### Payment Flow ✅
- [ ] Can create payment links
- [ ] Public payment page loads correctly
- [ ] Payments can be submitted
- [ ] Admins can view pending transactions
- [ ] Payments can be approved
- [ ] Approval creates accounting entry automatically
- [ ] Transaction statuses update correctly

### Invoice System ✅
- [ ] Can create invoices with line items
- [ ] Invoice numbers auto-generate
- [ ] Totals calculate correctly (subtotal, tax, discount)
- [ ] PDF generation works
- [ ] PDF contains all invoice details
- [ ] PDF is printable
- [ ] Invoices can be edited
- [ ] Invoices can be deleted

### Email System ✅
- [ ] Invoice emails send successfully
- [ ] Email template renders correctly
- [ ] Emails received in customer inbox
- [ ] Professional HTML design works
- [ ] All invoice details in email match
- [ ] Mobile responsive email works

### Accounting Module ✅
- [ ] Auto-entry creation on payment approval works
- [ ] Manual expense entries can be added
- [ ] Entry list displays correctly
- [ ] Income/expense indicators work (green/red)
- [ ] Statistics calculate correctly
- [ ] Filters work (type, date range)

### Financial Reports ✅
- [ ] Profit & Loss report generates
- [ ] Revenue by category report generates
- [ ] Monthly summary report generates
- [ ] All calculations are accurate
- [ ] Reports can be downloaded as JSON
- [ ] Report displays are clear and readable

### UI/UX ✅
- [ ] All tabs accessible
- [ ] Forms validate input correctly
- [ ] Error messages display properly
- [ ] Success messages display properly
- [ ] Loading states show during operations
- [ ] Modals open/close correctly
- [ ] Tables display data properly
- [ ] Filters work smoothly
- [ ] Responsive design works on mobile

### Security ✅
- [ ] Admin-only features require authentication
- [ ] Non-admin users cannot access restricted features
- [ ] Public payment page accessible without login
- [ ] RLS policies prevent unauthorized data access
- [ ] No errors in browser console
- [ ] No TypeScript compilation errors

---

## 🐛 Issues to Watch For

### Common Issues:
1. **Email not sending?**
   - Check RESEND_API_KEY in .env.local ✅ (you just added it)
   - Verify EMAIL_FROM domain is verified in Resend
   - Check browser console for errors
   - Check server logs for API errors

2. **PDF not generating?**
   - Check browser console for errors
   - Verify invoice has all required data
   - Try different browser if needed

3. **Accounting entry not auto-created?**
   - Check approval endpoint logs
   - Verify transaction has required fields
   - Check database for entry creation

4. **Reports not generating?**
   - Verify date range is correct
   - Check if entries exist in date range
   - Check browser console for errors

5. **Authentication issues?**
   - Clear browser cookies
   - Re-login as admin
   - Verify user has correct role (level ≤ 2)

---

## 📊 Test Results Template

Use this template to record your test results:

```
═══════════════════════════════════════════════════════════
         KITCHEN OF TECH - E2E TEST RESULTS
═══════════════════════════════════════════════════════════

Test Date: _______________
Tester: _______________
Environment: Development / Production

PAYMENT FLOW:
  [✅/❌] Create Payment Link
  [✅/❌] Submit Payment (Public)
  [✅/❌] View Pending Transaction
  [✅/❌] Approve Payment
  [✅/❌] Auto-Create Accounting Entry

INVOICE SYSTEM:
  [✅/❌] Create Invoice
  [✅/❌] Download PDF
  [✅/❌] Email Invoice
  [✅/❌] Edit Invoice
  [✅/❌] Update Status

ACCOUNTING MODULE:
  [✅/❌] View Auto-Created Entry
  [✅/❌] Add Manual Expense
  [✅/❌] Filter Entries
  [✅/❌] Statistics Calculation

FINANCIAL REPORTS:
  [✅/❌] Profit & Loss Report
  [✅/❌] Revenue by Category
  [✅/❌] Monthly Summary
  [✅/❌] Download JSON

EMAIL VERIFICATION:
  [✅/❌] Email Sent Successfully
  [✅/❌] Email Received
  [✅/❌] HTML Template Correct
  [✅/❌] Responsive Design Works

ISSUES FOUND:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

OVERALL STATUS: [PASS / FAIL / PARTIAL]

NOTES:
___________________________________________________
___________________________________________________
___________________________________________________

═══════════════════════════════════════════════════════════
```

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. **Mark "Final Verification" as complete** in todo list
2. **Proceed to deployment checklist**
3. **Add rate limiting** (recommended)
4. **Set up production monitoring**
5. **Deploy to production**

### If Tests Fail ❌
1. **Document the issue** clearly
2. **Check error logs** (browser console, server logs)
3. **Fix the issue**
4. **Re-run the failed test**
5. **Continue when all tests pass**

---

## 📞 Support

If you encounter issues during testing:

1. Check the documentation:
   - `SECURITY_AUDIT_REPORT.md`
   - `API_TESTING_GUIDE.md`
   - `PAYMENT_SYSTEM_VERIFICATION.md`

2. Check database:
   - Verify RLS policies are active
   - Check if data is being created

3. Check logs:
   - Browser DevTools console
   - Server terminal output
   - Supabase dashboard logs

4. Verify environment:
   - All .env.local variables set
   - Development server running
   - Database connection working

---

**Ready to start testing!** 🎉

Run through these tests systematically and check off each item. This will give you confidence that your payment system works perfectly before launch.

**Good luck!** 🚀
