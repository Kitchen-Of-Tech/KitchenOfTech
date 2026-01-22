import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// POST - Submit a new payment transaction
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const {
      payment_method_id,
      transaction_id,
      amount,
      currency = "BDT",
      purchase_type,
      purchase_id,
      purchase_details,
    } = body;
    
    // Validate required fields
    if (!payment_method_id || !transaction_id || !amount || !purchase_type) {
      return NextResponse.json(
        { error: "Payment method, transaction ID, amount, and purchase type are required" },
        { status: 400 }
      );
    }
    
    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }
    
    // Verify payment method exists and is active
    const { data: paymentMethod, error: methodError } = await supabase
      .from("payment_methods")
      .select("id, name, is_active")
      .eq("id", payment_method_id)
      .single();
    
    if (methodError || !paymentMethod) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }
    
    if (!paymentMethod.is_active) {
      return NextResponse.json(
        { error: "This payment method is currently inactive" },
        { status: 400 }
      );
    }
    
    // Check for duplicate transaction ID (prevent double submissions)
    const { data: existingTransaction } = await supabase
      .from("payment_transactions")
      .select("id")
      .eq("transaction_id", transaction_id)
      .single();
    
    if (existingTransaction) {
      return NextResponse.json(
        { error: "This transaction ID has already been submitted" },
        { status: 400 }
      );
    }
    
    // Create payment transaction
    const { data: transaction, error } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: user.id,
        payment_method_id,
        transaction_id,
        amount,
        currency,
        purchase_type,
        purchase_id,
        purchase_details,
        status: "pending",
      })
      .select(`
        *,
        payment_method:payment_methods(name, type)
      `)
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      transaction,
      message: "Payment transaction submitted successfully. Your purchase is pending approval.",
    });
  } catch (error) {
    console.error("Error submitting payment:", error);
    return NextResponse.json(
      { error: "Failed to submit payment transaction" },
      { status: 500 }
    );
  }
}
