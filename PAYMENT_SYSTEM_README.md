# Custom Payment System - API Documentation

## Overview
A reusable payment gateway system designed for KitchenOfTech and other websites. Supports multiple payment methods with manual approval workflow.

## Architecture

### Database Tables
1. **payment_methods** - Dynamic payment options (bKash, Nagad, Bank Transfer, etc.)
2. **payment_transactions** - All purchase transactions with approval workflow
3. **payment_verification_logs** - Audit trail for all status changes

### API Routes

#### 1. `/api/payment/methods`
Manage payment methods (CEO only for modifications)

**GET** - Fetch payment methods
```typescript
// Public/User: Returns only active methods
// Admin: Can include inactive with ?includeInactive=true
Response: {
  success: true,
  paymentMethods: PaymentMethod[]
}
```

**POST** - Create payment method (CEO only)
```typescript
Request: {
  name: string,              // e.g., "bKash"
  type: string,              // e.g., "mobile_banking"
  account_details: object,   // { account_number, account_name, etc. }
  instructions?: string,     // Payment instructions
  display_order?: number,    // Sort order
  icon_url?: string         // Payment icon URL
}
```

**PUT** - Update payment method (CEO only)
```typescript
Request: {
  id: string,
  ...updates
}
```

**DELETE** - Delete payment method (CEO only)
```typescript
Query: ?id={method_id}
```

#### 2. `/api/payment/submit`
Submit payment transaction (authenticated users)

**POST** - Create transaction
```typescript
Request: {
  payment_method_id: string,    // Selected payment method
  transaction_id: string,       // Payment transaction ID from provider
  amount: number,               // Payment amount
  currency?: string,            // Default: "BDT"
  purchase_type: string,        // "course" | "service" | "product" | "other"
  purchase_id?: string,         // Course ID, service ID, etc.
  purchase_details?: object     // Additional purchase info
}

Response: {
  success: true,
  transaction: PaymentTransaction,
  message: "Payment transaction submitted successfully. Your purchase is pending approval."
}
```

**Features:**
- ✅ Prevents duplicate transaction IDs
- ✅ Validates payment method is active
- ✅ Automatically sets status to "pending"
- ✅ Returns transaction with payment method details

#### 3. `/api/payment/transactions`
List transactions (users see own, admins see all)

**GET** - Fetch transactions
```typescript
Query Parameters:
  - status?: "pending" | "approved" | "rejected" | "refunded"
  - purchase_type?: string
  - user_id?: string (admin only)

Response: {
  success: true,
  transactions: PaymentTransaction[]
}
```

Each transaction includes:
- Transaction details
- Payment method info (name, type, icon)
- User info (name, email)
- Reviewer info (if reviewed)

#### 4. `/api/payment/approve`
Approve pending payment (CEO/Manager only)

**POST** - Approve transaction
```typescript
Request: {
  transaction_id: string,
  admin_notes?: string
}

Response: {
  success: true,
  transaction: PaymentTransaction,
  message: "Payment approved successfully"
}
```

**Auto-Actions:**
- ✅ Updates status to "approved"
- ✅ Records reviewer ID and timestamp
- ✅ If purchase_type is "course", automatically enrolls user
- ✅ Triggers audit log entry (via database trigger)

#### 5. `/api/payment/reject`
Reject pending payment (CEO/Manager only)

**POST** - Reject transaction
```typescript
Request: {
  transaction_id: string,
  rejection_reason: string,  // Required
  admin_notes?: string
}

Response: {
  success: true,
  transaction: PaymentTransaction,
  message: "Payment rejected"
}
```

**Auto-Actions:**
- ✅ Updates status to "rejected"
- ✅ Records reviewer, timestamp, and reason
- ✅ If purchase_type is "course", cancels enrollment
- ✅ Triggers audit log entry (via database trigger)

## Payment Workflow

### User Flow
1. User selects payment method from dropdown
2. System displays payment account details (number, instructions)
3. User makes payment externally and receives transaction ID
4. User submits transaction ID via form
5. Purchase status becomes "pending"
6. User can track status in dashboard

### Admin Flow
1. Admin views pending transactions in CEO Dashboard
2. Admin verifies transaction ID with payment provider
3. Admin approves or rejects with notes
4. System automatically processes enrollment/cancellation
5. User notified of approval/rejection

## TypeScript Types

```typescript
interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  account_details: Record<string, any>;
  instructions?: string;
  is_active: boolean;
  display_order: number;
  icon_url?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentTransaction {
  id: string;
  user_id: string;
  payment_method_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  purchase_type: "course" | "service" | "product" | "other";
  purchase_id?: string;
  purchase_details?: Record<string, any>;
  status: "pending" | "approved" | "rejected" | "refunded";
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentVerificationLog {
  id: string;
  transaction_id: string;
  action: string;
  performed_by: string;
  notes?: string;
  created_at: string;
}
```

## Security Features

### Row Level Security (RLS)
- ✅ Users can only view their own transactions
- ✅ Users can only create transactions for themselves
- ✅ CEO can manage payment methods (level = 1)
- ✅ CEO/Manager can approve/reject (level <= 2)
- ✅ Admins can view all transactions
- ✅ Verification logs read-only for users

### Validation
- ✅ Authentication required for all endpoints
- ✅ Role-based authorization checks
- ✅ Duplicate transaction ID prevention
- ✅ Payment method active status validation
- ✅ Amount must be positive
- ✅ Transaction status validation (can't approve already approved)

### Audit Trail
- ✅ All status changes automatically logged
- ✅ Logs include timestamp, user, action, notes
- ✅ Immutable log entries
- ✅ Full transaction history

## Database Migration

Apply the migration to set up the payment system:

```bash
# Apply migration to Supabase
psql $DATABASE_URL < supabase/migrations/003_payment_system.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Paste contents of `003_payment_system.sql`
3. Run query

## Next Steps (To Complete)

### UI Components Needed:
1. **PaymentMethodSelector** - Dropdown to select payment method
2. **PaymentDetailsDisplay** - Shows account details and instructions
3. **TransactionSubmitForm** - Input for transaction ID and amount
4. **PaymentStatusTracker** - User dashboard showing transaction status
5. **AdminPaymentDashboard** - CEO/Manager view for pending approvals
6. **PaymentMethodManager** - CEO interface to add/edit/disable methods

### Integration Points:
1. Update course enrollment flow to use payment system
2. Add payment UI to course detail page
3. Add payment management section to CEO dashboard
4. Add payment status to student dashboard
5. Add email notifications for approvals/rejections

## Example Usage

### Frontend: Submit Payment
```typescript
const submitPayment = async () => {
  const response = await fetch('/api/payment/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payment_method_id: selectedMethod.id,
      transaction_id: userTransactionId,
      amount: coursePrice,
      purchase_type: 'course',
      purchase_id: courseId,
      purchase_details: {
        course_name: courseName,
        course_slug: courseSlug
      }
    })
  });
  
  const data = await response.json();
  if (data.success) {
    // Show success message
    // Redirect to dashboard
  }
};
```

### Frontend: Approve Payment (Admin)
```typescript
const approvePayment = async (transactionId: string) => {
  const response = await fetch('/api/payment/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction_id: transactionId,
      admin_notes: 'Verified with bKash'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    // Update UI
    // Show success notification
  }
};
```

## Extending for Other Websites

The system is designed to be reusable:

1. **Shared Database**: Use same Supabase instance
2. **purchase_type Field**: Identifies website/product type
3. **purchase_details Field**: Stores website-specific data
4. **API Routes**: Same endpoints work for all sites
5. **Centralized Management**: Single CEO dashboard for all payments

Example for multiple websites:
```typescript
// Website 1: Course enrollment
purchase_type: "course"
purchase_details: { site: "KitchenOfTech", course_name: "..." }

// Website 2: Service booking
purchase_type: "service"
purchase_details: { site: "ServiceSite", service_name: "..." }

// Website 3: Product purchase
purchase_type: "product"
purchase_details: { site: "ShopSite", product_name: "..." }
```

## Support

For issues or questions:
- Database: Check Supabase logs
- API: Check Next.js server logs
- Frontend: Check browser console

## Status

✅ Database Migration Complete
✅ TypeScript Types Complete
✅ API Routes Complete (5/5)
⏳ UI Components Pending
⏳ Integration Pending
⏳ Testing Pending
