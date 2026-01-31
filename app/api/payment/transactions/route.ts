import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch transactions (user's own or all for admins)
export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const purchaseType = searchParams.get("purchase_type");
    const userId = searchParams.get("user_id");
    
    // Check if user is admin
    const isAdmin = await checkIsAdmin(supabase, user.id);
    
    let query = supabase
      .from("payment_transactions")
      .select(`
        *,
        payment_method:payment_methods(name, type, icon_url),
        user:users!payment_transactions_user_id_fkey(id, name, email),
        reviewer:users!payment_transactions_reviewed_by_fkey(id, name, email)
      `)
      .order("created_at", { ascending: false });
    
    // Non-admins can only see their own transactions
    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    } else if (userId) {
      // Admin filtering by specific user
      query = query.eq("user_id", userId);
    }
    
    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }
    
    // Filter by purchase type if provided
    if (purchaseType) {
      query = query.eq("purchase_type", purchaseType);
    }
    
    const { data: transactions, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      transactions: transactions || [],
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
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
