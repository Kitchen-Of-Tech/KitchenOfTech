import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { nanoid } from 'nanoid';

// GET - Fetch payment links (admin only)
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
    
    // Check if user is CEO or Manager
    const adminClient = await createAdminClient();
    const { data: userData } = await adminClient
      .from("users")
      .select("role:roles(level)")
      .eq("id", user.id)
      .single();
    
    const isAdmin = ((userData?.role as { level: number } | undefined)?.level ?? 999) <= 2;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access only" },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const purpose = searchParams.get("purpose");
    
    let query = adminClient
      .from("payment_links")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (status) {
      query = query.eq("status", status);
    }
    
    if (purpose) {
      query = query.eq("purpose", purpose);
    }
    
    const { data: links, error } = await query;
    
    if (error) throw error;
    
    // Calculate expired links and update them
    const now = new Date().toISOString();
    const expiredLinks = links?.filter(
      link => link.status === 'active' && link.expiry_date && link.expiry_date < now
    ) || [];
    
    if (expiredLinks.length > 0) {
      await adminClient
        .from("payment_links")
        .update({ status: 'expired' })
        .in('id', expiredLinks.map(l => l.id));
      
      // Re-fetch updated data
      const { data: updatedLinks } = await query;
      return NextResponse.json({
        success: true,
        links: updatedLinks || [],
      });
    }
    
    return NextResponse.json({
      success: true,
      links: links || [],
    });
  } catch (error) {
    console.error("Error fetching payment links:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment links" },
      { status: 500 }
    );
  }
}

// POST - Generate new payment link (admin only)
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
    
    // Check if user is CEO or Manager
    const adminClient = await createAdminClient();
    const { data: userData } = await adminClient
      .from("users")
      .select("role:roles(level)")
      .eq("id", user.id)
      .single();
    
    const isAdmin = ((userData?.role as { level: number } | undefined)?.level ?? 999) <= 2;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access only" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      title,
      description,
      amount,
      currency = 'BDT',
      purpose,
      reference_id,
      metadata = {},
      customer_name,
      customer_email,
      customer_phone,
      expiry_date,
      max_uses = 1,
    } = body;
    
    // Validate required fields
    if (!title || !amount || !purpose) {
      return NextResponse.json(
        { error: "Title, amount, and purpose are required" },
        { status: 400 }
      );
    }
    
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }
    
    // Generate unique link_id
    const link_id = `pay-${nanoid(8)}`;
    
    // Create payment link
    const { data: link, error } = await adminClient
      .from("payment_links")
      .insert({
        link_id,
        title,
        description,
        amount,
        currency,
        purpose,
        reference_id,
        metadata,
        customer_name,
        customer_email,
        customer_phone,
        expiry_date: expiry_date ? new Date(expiry_date).toISOString() : null,
        max_uses,
        created_by: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Generate full URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const full_url = `${baseUrl}/pay/${link_id}`;
    
    return NextResponse.json({
      success: true,
      link: {
        ...link,
        full_url,
      },
    });
  } catch (error) {
    console.error("Error creating payment link:", error);
    return NextResponse.json(
      { error: "Failed to create payment link" },
      { status: 500 }
    );
  }
}

// PATCH - Update payment link status (admin only)
export async function PATCH(request: NextRequest) {
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
    
    // Check if user is CEO or Manager
    const adminClient = await createAdminClient();
    const { data: userData } = await adminClient
      .from("users")
      .select("role:roles(level)")
      .eq("id", user.id)
      .single();
    
    const isAdmin = ((userData?.role as { level: number } | undefined)?.level ?? 999) <= 2;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access only" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { link_id, status } = body;
    
    if (!link_id || !status) {
      return NextResponse.json(
        { error: "link_id and status are required" },
        { status: 400 }
      );
    }
    
    const { data: link, error } = await adminClient
      .from("payment_links")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("link_id", link_id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      link,
    });
  } catch (error) {
    console.error("Error updating payment link:", error);
    return NextResponse.json(
      { error: "Failed to update payment link" },
      { status: 500 }
    );
  }
}
