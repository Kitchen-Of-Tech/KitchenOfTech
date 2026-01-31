import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';

// POST - Reject a payment transaction (CEO/Manager only)
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
    const { transaction_id, rejection_reason, admin_notes } = body;
    
    if (!transaction_id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }
    
    if (!rejection_reason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
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
    
    // Update transaction status to rejected
    const { data: updatedTransaction, error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason,
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
    
    // Update course enrollment to cancelled if this is a course purchase
    if (transaction.purchase_type === "course" && transaction.purchase_id) {
      await handleCourseCancellation(supabase, transaction);
    }
    
    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: "Payment rejected",
    });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return NextResponse.json(
      { error: "Failed to reject payment" },
      { status: 500 }
    );
  }
}

// Helper function to handle course cancellation after rejection
async function handleCourseCancellation(supabase: Awaited<ReturnType<typeof createClient>>, transaction: { user_id: string; purchase_id: string; purchase_type: string }) {
  try {
    // Update enrollment status to cancelled
    await supabase
      .from("course_enrollments")
      .update({
        status: "cancelled",
        payment_status: "failed",
      })
      .eq("user_id", transaction.user_id)
      .eq("course_id", transaction.purchase_id);
  } catch (error) {
    console.error("Error handling course cancellation:", error);
    // Don't throw error, as payment rejection was successful
  }
}

// Helper function
async function checkIsAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("role:roles(level)")
    .eq("id", userId)
    .single();
  
  // CEO (100) and Manager (90) have admin access
  return ((data?.role as { level: number } | undefined)?.level ?? 0) >= 90;
}
