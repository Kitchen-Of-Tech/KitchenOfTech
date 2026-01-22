import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch all payment methods (active ones for public, all for admin)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user ? await checkIsAdmin(supabase, user.id) : false;
    
    let query = supabase
      .from("payment_methods")
      .select("*")
      .order("display_order", { ascending: true });
    
    // Non-admins can only see active methods
    if (!isAdmin || !includeInactive) {
      query = query.eq("is_active", true);
    }
    
    const { data: methods, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      paymentMethods: methods || [],
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

// POST - Create new payment method (CEO only)
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
    
    // Check if user is CEO
    const isCEO = await checkIsCEO(supabase, user.id);
    if (!isCEO) {
      return NextResponse.json(
        { error: "Forbidden - CEO access only" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, type, account_details, instructions, display_order, icon_url } = body;
    
    // Validate required fields
    if (!name || !type || !account_details) {
      return NextResponse.json(
        { error: "Name, type, and account details are required" },
        { status: 400 }
      );
    }
    
    // Create payment method
    const { data: method, error } = await supabase
      .from("payment_methods")
      .insert({
        name,
        type,
        account_details,
        instructions,
        display_order: display_order || 0,
        icon_url,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      paymentMethod: method,
      message: "Payment method created successfully",
    });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json(
      { error: "Failed to create payment method" },
      { status: 500 }
    );
  }
}

// PUT - Update payment method (CEO only)
export async function PUT(request: NextRequest) {
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
    
    const isCEO = await checkIsCEO(supabase, user.id);
    if (!isCEO) {
      return NextResponse.json(
        { error: "Forbidden - CEO access only" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "Payment method ID is required" },
        { status: 400 }
      );
    }
    
    const { data: method, error } = await supabase
      .from("payment_methods")
      .update({
        ...updates,
        updated_by: user.id,
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      paymentMethod: method,
      message: "Payment method updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json(
      { error: "Failed to update payment method" },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment method (CEO only)
export async function DELETE(request: NextRequest) {
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
    
    const isCEO = await checkIsCEO(supabase, user.id);
    if (!isCEO) {
      return NextResponse.json(
        { error: "Forbidden - CEO access only" },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Payment method ID is required" },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 }
    );
  }
}

// Helper functions
async function checkIsCEO(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("role:roles(level)")
    .eq("id", userId)
    .single();
  
  return ((data?.role as { level: number } | undefined)?.level ?? 999) === 1;
}

async function checkIsAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("role:roles(level)")
    .eq("id", userId)
    .single();
  
  return ((data?.role as { level: number } | undefined)?.level ?? 999) <= 2; // CEO or Manager
}
