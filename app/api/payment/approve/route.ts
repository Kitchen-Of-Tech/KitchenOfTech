import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';

// POST - Approve a payment transaction (CEO/Manager only)
export async function POST(request: NextRequest) {
  // Apply rate limiting (20 requests per minute for sensitive operations)
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.apiStrict);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if user is admin (CEO or Manager)
    const isAdmin = await checkIsAdmin(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access only" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { transaction_id, admin_notes } = body;
    
    if (!transaction_id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }
    
    // Fetch the transaction to verify it exists and is pending
    const { data: transaction, error: fetchError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("id", transaction_id)
      .single();
    
    if (fetchError || !transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
    
    if (transaction.status !== "pending") {
      return NextResponse.json(
        { error: `Transaction is already ${transaction.status}` },
        { status: 400 }
      );
    }
    
    // Update transaction status to approved
    const { data: updatedTransaction, error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: admin_notes || null,
      })
      .eq("id", transaction_id)
      .select(`
        *,
        payment_method:payment_methods(name, type),
        user:users(id, name, email),
        reviewer:reviewed_by(name, email)
      `)
      .single();
    
    if (updateError) throw updateError;
    
    // Handle course enrollment if this is a course purchase
    if (transaction.purchase_type === "course" && transaction.purchase_id) {
      await handleCourseEnrollment(supabase, transaction);
    }

    // Create accounting entry for approved payment
    await createAccountingEntry(supabase, updatedTransaction, user.id);

    // Update linked invoice status if exists
    if (transaction.invoice_id) {
      await updateInvoiceStatus(supabase, transaction.invoice_id);
    }
    
    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: "Payment approved successfully",
    });
  } catch (error) {
    console.error("Error approving payment:", error);
    return NextResponse.json(
      { error: "Failed to approve payment" },
      { status: 500 }
    );
  }
}

// Helper function to handle course enrollment after approval
async function handleCourseEnrollment(supabase: Awaited<ReturnType<typeof createClient>>, transaction: { user_id: string; purchase_id: string; purchase_type: string }) {
  try {
    // Check if enrollment already exists
    const { data: existingEnrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("user_id", transaction.user_id)
      .eq("course_id", transaction.purchase_id)
      .single();
    
    if (existingEnrollment) {
      // Update enrollment to active
      await supabase
        .from("course_enrollments")
        .update({
          status: "active",
          payment_status: "paid",
        })
        .eq("id", existingEnrollment.id);
    } else {
      // Create new enrollment
      await supabase
        .from("course_enrollments")
        .insert({
          user_id: transaction.user_id,
          course_id: transaction.purchase_id,
          status: "active",
          payment_status: "paid",
          enrollment_date: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error("Error handling course enrollment:", error);
    // Don't throw error, as payment approval was successful
  }
}

// Helper function
async function checkIsAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("role:roles(level)")
    .eq("id", userId)
    .single();
  
  return ((data?.role as { level: number } | undefined)?.level ?? 999) <= 2; // CEO or Manager
}

// Helper function to create accounting entry on approval
async function createAccountingEntry(supabase: Awaited<ReturnType<typeof createClient>>, transaction: Record<string, unknown>, createdById: string) {
  try {
    const supabaseAdmin = await createAdminClient();
    
    // Determine category based on purchase type
    let category = 'Other Income';
    if (transaction.purchase_type === 'course') {
      category = 'Course Sales';
    } else if (transaction.purchase_type === 'product') {
      category = 'Product Sales';
    } else if (transaction.purchase_type === 'service') {
      category = 'Service Revenue';
    }

    const amount = parseFloat(String(transaction.amount)) || 0;
    const description = `Payment from ${transaction.payer_name || 'Unknown'} - ${transaction.purpose || 'No description'}`;
    
    await supabaseAdmin
      .from('accounting_entries')
      .insert({
        entry_type: 'income',
        amount,
        category,
        description,
        entry_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        transaction_id: transaction.id,
        invoice_id: transaction.invoice_id || null,
        metadata: {
          auto_created: true,
          purchase_type: transaction.purchase_type,
          payment_method: transaction.payment_method_id,
        },
        created_by_id: createdById,
      });
    
    console.log(`Created accounting entry for transaction ${transaction.id}`);
  } catch (error) {
    console.error('Error creating accounting entry:', error);
    // Don't throw error, as payment approval was successful
  }
}

// Helper function to update invoice status to paid
async function updateInvoiceStatus(supabase: Awaited<ReturnType<typeof createClient>>, invoiceId: string) {
  try {
    const supabaseAdmin = await createAdminClient();
    
    await supabaseAdmin
      .from('invoices')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);
    
    console.log(`Updated invoice ${invoiceId} status to paid`);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    // Don't throw error, as payment approval was successful
  }
}
