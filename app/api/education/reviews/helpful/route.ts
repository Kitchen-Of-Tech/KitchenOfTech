import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: "reviewId is required" },
        { status: 400 }
      );
    }

    // Increment helpful count
    // First get current count
    const { data: currentReview } = await supabase
      .from("course_reviews")
      .select("helpful_count")
      .eq("id", reviewId)
      .single();

    const newCount = (currentReview?.helpful_count || 0) + 1;

    // Update with new count
    const { data: updatedReview, error: incrementError } = await supabase
      .from("course_reviews")
      .update({ helpful_count: newCount })
      .eq("id", reviewId)
      .select()
      .single();

    if (incrementError) {
      console.error("Error updating helpful count:", incrementError);
      return NextResponse.json(
        { error: "Failed to update helpful count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    console.error("Helpful vote API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
