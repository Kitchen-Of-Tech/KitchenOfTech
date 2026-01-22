import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// POST - Approve a payment transaction (CEO/Manager only)
export async function POST(request: NextRequest) {
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
