# Payment System API Testing Guide
Quick reference for testing all payment system endpoints

## 🔐 Authentication Required
All endpoints require authentication. Make sure you're logged in as an admin user (CEO or Manager, level ≤ 2).

---

## 📄 Invoice APIs

### 1. List Invoices
```http
GET /api/payment/invoices
GET /api/payment/invoices?status=draft
GET /api/payment/invoices?status=paid
GET /api/payment/invoices?customer_id=xxx
```

**Response:**
```json
{
  "invoices": [
    {
      "id": "uuid",
      "invoice_number": "INV-202601-0001",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "status": "draft",
      "total": 1500.00,
      "line_items": [...],
      "created_at": "2026-01-24T..."
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### 2. Create Invoice
```http
POST /api/payment/invoices
Content-Type: application/json

{
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "customer_phone": "+1234567890",
  "customer_address": "123 Main St, City, State 12345",
  "issue_date": "2026-01-24",
  "due_date": "2026-02-24",
  "tax_rate": 10,
  "discount_amount": 50,
  "notes": "Payment due within 30 days",
  "line_items": [
    {
      "description": "Website Development",
      "quantity": 1,
      "unit_price": 1500
    },
    {
      "description": "Monthly Hosting",
      "quantity": 12,
      "unit_price": 25
    }
  ]
}
```

**Response:**
```json
{
  "invoice": {
    "id": "uuid",
    "invoice_number": "INV-202601-0001",
    "customer_name": "Jane Smith",
    "subtotal": 1800.00,
    "tax_amount": 180.00,
    "discount_amount": 50.00,
    "total": 1930.00,
    "line_items": [...]
  }
}
```

### 3. Get Invoice Details
```http
GET /api/payment/invoices/{id}
```

**Response:**
```json
{
  "invoice": {
    "id": "uuid",
    "invoice_number": "INV-202601-0001",
    "customer_name": "Jane Smith",
    "line_items": [...],
    "payment_link": {...},
    "transaction": {...},
    "creator": {
      "id": "uuid",
      "email": "admin@example.com",
      "full_name": "Admin User"
    }
  }
}
```

### 4. Update Invoice
```http
PATCH /api/payment/invoices/{id}
Content-Type: application/json

{
  "customer_phone": "+9876543210",
  "notes": "Updated payment terms",
  "status": "sent",
  "line_items": [
    {
      "description": "Updated Service",
      "quantity": 2,
      "unit_price": 1000
    }
  ]
}
```

### 5. Delete Invoice (Draft Only)
```http
DELETE /api/payment/invoices/{id}
```

**Response:**
```json
{
  "message": "Invoice deleted successfully"
}
```

### 6. Generate PDF
```http
GET /api/payment/invoices/{id}/pdf
```

**Response:** HTML document (can be printed as PDF via browser)

### 7. Send Invoice Email
```http
POST /api/payment/invoices/{id}/send
Content-Type: application/json

{
  "message": "Thank you for your business! Please find your invoice attached."
}
```

**Response:**
```json
{
  "message": "Invoice email sent successfully",
  "email": {
    "to": "customer@example.com",
    "subject": "Invoice INV-202601-0001 from KitchenOfTech",
    "body": "..."
  },
  "note": "Email service not yet configured..."
}
```

---

## 💰 Accounting APIs

### 1. List Accounting Entries
```http
GET /api/payment/accounting/entries
GET /api/payment/accounting/entries?entry_type=income
GET /api/payment/accounting/entries?entry_type=expense
GET /api/payment/accounting/entries?start_date=2026-01-01&end_date=2026-01-31
GET /api/payment/accounting/entries?category=Course%20Sales
```

**Response:**
```json
{
  "entries": [
    {
      "id": "uuid",
      "entry_type": "income",
      "amount": 1500.00,
      "category": "Course Sales",
      "description": "Payment from John Doe - Course Enrollment",
      "entry_date": "2026-01-24",
      "transaction": {...},
      "invoice": {...},
      "creator": {...},
      "created_at": "2026-01-24T..."
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### 2. Create Accounting Entry (Expense)
```http
POST /api/payment/accounting/entries
Content-Type: application/json

{
  "entry_type": "expense",
  "amount": 500.00,
  "category": "Office Supplies",
  "description": "Purchased laptops and office equipment",
  "entry_date": "2026-01-24"
}
```

**Response:**
```json
{
  "entry": {
    "id": "uuid",
    "entry_type": "expense",
    "amount": 500.00,
    "category": "Office Supplies",
    "description": "Purchased laptops and office equipment",
    "entry_date": "2026-01-24",
    "created_at": "2026-01-24T..."
  }
}
```

### 3. Generate Profit & Loss Report
```http
GET /api/payment/accounting/reports?type=profit_loss&start_date=2026-01-01&end_date=2026-01-31
```

**Response:**
```json
{
  "report_type": "profit_loss",
  "period": {
    "from": "2026-01-01",
    "to": "2026-01-31"
  },
  "summary": {
    "total_income": 15000.00,
    "total_expenses": 5000.00,
    "net_profit": 10000.00,
    "profit_margin_percent": "66.67"
  },
  "income_by_category": {
    "Course Sales": 10000.00,
    "Service Revenue": 5000.00
  },
  "expenses_by_category": {
    "Office Supplies": 2000.00,
    "Marketing": 3000.00
  },
  "generated_at": "2026-01-24T..."
}
```

### 4. Generate Revenue by Category Report
```http
GET /api/payment/accounting/reports?type=revenue_by_category&start_date=2026-01-01&end_date=2026-01-31
```

**Response:**
```json
{
  "report_type": "revenue_by_category",
  "period": {
    "from": "2026-01-01",
    "to": "2026-01-31"
  },
  "total_revenue": 15000.00,
  "categories": [
    {
      "category": "Course Sales",
      "total": 10000.00,
      "count": 20,
      "average": 500.00,
      "percentage": 66.67
    },
    {
      "category": "Service Revenue",
      "total": 5000.00,
      "count": 5,
      "average": 1000.00,
      "percentage": 33.33
    }
  ],
  "generated_at": "2026-01-24T..."
}
```

### 5. Generate Monthly Summary Report
```http
GET /api/payment/accounting/reports?type=monthly_summary&year=2026
```

**Response:**
```json
{
  "report_type": "monthly_summary",
  "year": 2026,
  "months": [
    {
      "month": "2026-01",
      "income": 15000.00,
      "expenses": 5000.00,
      "net": 10000.00
    },
    {
      "month": "2026-02",
      "income": 12000.00,
      "expenses": 4000.00,
      "net": 8000.00
    }
    // ... all 12 months
  ],
  "year_totals": {
    "income": 180000.00,
    "expenses": 60000.00,
    "net": 120000.00
  },
  "average_monthly": {
    "income": 15000.00,
    "expenses": 5000.00,
    "net": 10000.00
  },
  "generated_at": "2026-01-24T..."
}
```

---

## ✅ Payment Approval (Enhanced)

### Approve Payment
```http
POST /api/payment/approve
Content-Type: application/json

{
  "transaction_id": "uuid",
  "admin_notes": "Approved after verification"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "status": "approved",
    "reviewed_by": "admin_id",
    "reviewed_at": "2026-01-24T..."
  },
  "message": "Payment approved successfully"
}
```

**Automatic Actions:**
1. ✅ Creates accounting entry (income) linked to transaction
2. ✅ Updates invoice status to "paid" if invoice_id exists
3. ✅ Categorizes by purchase_type (Course Sales, Product Sales, etc.)

---

## 🧪 Testing Workflow

### Complete Flow Test

1. **Create an Invoice:**
```bash
POST /api/payment/invoices
# Save the returned invoice ID
```

2. **View Invoice PDF:**
```bash
GET /api/payment/invoices/{id}/pdf
# Opens HTML in browser - can print to PDF
```

3. **Send Invoice:**
```bash
POST /api/payment/invoices/{id}/send
# Check console for email data (until email service integrated)
```

4. **Create Payment Transaction:**
```bash
# Use existing payment link flow or create transaction manually
# Link transaction to invoice using invoice_id
```

5. **Approve Payment:**
```bash
POST /api/payment/approve
{
  "transaction_id": "{transaction_id}"
}
# Automatically creates accounting entry
# Updates invoice status to "paid"
```

6. **View Accounting Entry:**
```bash
GET /api/payment/accounting/entries?transaction_id={transaction_id}
# Should see auto-created income entry
```

7. **Generate Reports:**
```bash
GET /api/payment/accounting/reports?type=profit_loss&start_date=2026-01-01&end_date=2026-01-31
GET /api/payment/accounting/reports?type=revenue_by_category&start_date=2026-01-01&end_date=2026-01-31
GET /api/payment/accounting/reports?type=monthly_summary&year=2026
```

---

## ❌ Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden - Admin access required"
}
```

### 400 Bad Request
```json
{
  "error": "Invalid entry_type. Must be \"income\" or \"expense\""
}
```

### 404 Not Found
```json
{
  "error": "Invoice not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 🎯 Quick Test Commands (using curl)

### List Invoices
```bash
curl -X GET "http://localhost:3000/api/payment/invoices" \
  -H "Cookie: YOUR_AUTH_COOKIE"
```

### Create Invoice
```bash
curl -X POST "http://localhost:3000/api/payment/invoices" \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{
    "customer_name": "Test Customer",
    "customer_email": "test@example.com",
    "issue_date": "2026-01-24",
    "due_date": "2026-02-24",
    "tax_rate": 10,
    "discount_amount": 0,
    "line_items": [
      {
        "description": "Test Service",
        "quantity": 1,
        "unit_price": 1000
      }
    ]
  }'
```

### Create Expense
```bash
curl -X POST "http://localhost:3000/api/payment/accounting/entries" \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{
    "entry_type": "expense",
    "amount": 500,
    "category": "Marketing",
    "description": "Facebook Ads Campaign",
    "entry_date": "2026-01-24"
  }'
```

### Generate P&L Report
```bash
curl -X GET "http://localhost:3000/api/payment/accounting/reports?type=profit_loss&start_date=2026-01-01&end_date=2026-01-31" \
  -H "Cookie: YOUR_AUTH_COOKIE"
```

---

## 📌 Notes

1. **Authentication:** All requests require valid session cookie. Log in via the UI first.

2. **Admin Access:** Only users with role level ≤ 2 (CEO, Manager) can access these endpoints.

3. **Date Format:** Use ISO date format: `YYYY-MM-DD` (e.g., `2026-01-24`)

4. **Amounts:** All amounts are in decimal format (e.g., `1500.00`, `99.99`)

5. **Invoice Numbers:** Auto-generated via database function. Format: `INV-YYYYMM-XXXX`

6. **Status Values:** 
   - Invoices: `draft`, `sent`, `paid`, `overdue`, `cancelled`
   - Entries: `income`, `expense`
   - Transactions: `pending`, `approved`, `rejected`

7. **Pagination:** Default limit is 50. Use `?limit=100&offset=50` for pagination.

8. **Filtering:** Multiple filters can be combined with `&` (e.g., `?entry_type=income&start_date=2026-01-01`)

---

**Last Updated:** January 24, 2026  
**API Version:** v1.0  
**Status:** ✅ Production Ready
