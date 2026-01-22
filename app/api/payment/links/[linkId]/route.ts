import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

type Params = Promise<{ linkId: string }>;

// GET - Get payment link details (public access for payment page)
export async function GET(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const { linkId } = await segmentData.params;
    
    const adminClient = await createAdminClient();
    
    // Fetch payment link
    const { data: link, error } = await adminClient
      .from("payment_links")
      .select("*")
      .eq("link_id", linkId)
      .single();
    
    if (error || !link) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      );
    }
    
    // Check if link is still valid
    const now = new Date();
    
    if (link.status !== 'active') {
      return NextResponse.json(
        { error: "This payment link is no longer active", status: link.status },
        { status: 400 }
      );
    }
    
    if (link.expiry_date && new Date(link.expiry_date) < now) {
      // Update status to expired
      await adminClient
        .from("payment_links")
        .update({ status: 'expired' })
        .eq("id", link.id);
      
      return NextResponse.json(
        { error: "This payment link has expired", status: 'expired' },
        { status: 400 }
      );
    }
    
    if (link.current_uses >= link.max_uses) {
      // Update status to completed
      await adminClient
        .from("payment_links")
        .update({ status: 'completed' })
        .eq("id", link.id);
      
      return NextResponse.json(
        { error: "This payment link has reached its maximum uses", status: 'completed' },
        { status: 400 }
      );
    }
    
    // Fetch available payment methods
    const { data: paymentMethods } = await adminClient
      .from("payment_methods")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    
    return NextResponse.json({
      success: true,
      link,
      paymentMethods: paymentMethods || [],
    });
  } catch (error) {
    console.error("Error fetching payment link:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment link" },
      { status: 500 }
    );
  }
}

// POST - Submit payment via link (public access)
export async function POST(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const { linkId } = await segmentData.params;
    
    const adminClient = await createAdminClient();
    
    // Fetch payment link
    const { data: link, error: linkError } = await adminClient
      .from("payment_links")
      .select("*")
      .eq("link_id", linkId)
      .single();
    
    if (linkError || !link) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      );
    }
    
    // Validate link status
    if (link.status !== 'active') {
      return NextResponse.json(
        { error: "This payment link is no longer active" },
        { status: 400 }
      );
    }
    
    if (link.expiry_date && new Date(link.expiry_date) < new Date()) {
      return NextResponse.json(
        { error: "This payment link has expired" },
        { status: 400 }
      );
    }
    
    if (link.current_uses >= link.max_uses) {
      return NextResponse.json(
        { error: "This payment link has reached its maximum uses" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      payment_method_id,
      transaction_id,
      user_note,
    } = body;
    
    // Validate required fields
    if (!customer_name || !customer_email || !payment_method_id || !transaction_id) {
      return NextResponse.json(
        { error: "Customer name, email, payment method, and transaction ID are required" },
        { status: 400 }
      );
    }
    
    // Get client IP and user agent
    const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';
    
    // Create payment transaction
    const { data: transaction, error: txError } = await adminClient
      .from("payment_transactions")
      .insert({
        user_id: null, // Guest payment (no user_id)
        payment_method_id,
        transaction_id,
        amount: link.amount,
        currency: link.currency,
        purchase_type: link.purpose,
        purchase_id: link.reference_id || linkId,
        purchase_details: link.metadata,
        customer_name,
        customer_email,
        customer_phone,
        user_note,
        payment_link_id: link.id,
        invoice_id: null, // Will be set if link was created from invoice
        metadata: {
          ...link.metadata,
          link_title: link.title,
          link_description: link.description,
        },
        ip_address,
        user_agent,
        status: 'pending',
      })
      .select()
      .single();
    
    if (txError) throw txError;
    
    // Log the verification action
    await adminClient
      .from("payment_verification_logs")
      .insert({
        transaction_id: transaction.id,
        action: 'submitted',
        performed_by: null,
        notes: `Payment submitted via link: ${linkId}`,
      });
    
    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
      },
      message: "Payment submitted successfully! Your payment is pending approval.",
    });
  } catch (error) {
    console.error("Error submitting payment via link:", error);
    return NextResponse.json(
      { error: "Failed to submit payment" },
      { status: 500 }
    );
  }
}
