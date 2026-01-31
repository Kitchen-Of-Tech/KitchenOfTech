import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, rating, reviewText, reviewId } = body;

    // Validate required fields
    if (!courseId || !rating || !reviewText) {
      return NextResponse.json(
        { error: "Course ID, rating, and review text are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (reviewText.trim().length < 10) {
      return NextResponse.json(
        { error: "Review must be at least 10 characters long" },
        { status: 400 }
      );
    }

    // Check if user has completed the course
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("course_enrollments")
      .select("id, completed_at")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: "You must be enrolled in this course to leave a review" },
        { status: 403 }
      );
    }

    if (!enrollment.completed_at) {
      return NextResponse.json(
        { error: "You must complete the course before leaving a review" },
        { status: 403 }
      );
    }

    // If reviewId provided, update existing review
    if (reviewId) {
      const { data: updatedReview, error: updateError } = await supabase
        .from("course_reviews")
        .update({
          rating,
          review_text: reviewText,
        })
        .eq("id", reviewId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating review:", updateError);
        return NextResponse.json(
          { error: "Failed to update review" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        review: updatedReview,
        message: "Review updated successfully",
      });
    }

    // Create new review
    const { data: newReview, error: insertError } = await supabase
      .from("course_reviews")
      .insert({
        user_id: user.id,
        course_id: courseId,
        rating,
        review_text: reviewText,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating review:", insertError);
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review: newReview,
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.error("Review submission API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const sortBy = searchParams.get("sortBy") || "recent";

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Build query based on sort option
    let query = supabase
      .from("course_reviews")
      .select(`
        id,
        user_id,
        rating,
        review_text,
        helpful_count,
        created_at,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq("course_id", courseId);

    // Apply sorting
    if (sortBy === "helpful") {
      query = query.order("helpful_count", { ascending: false });
    } else if (sortBy === "rating") {
      query = query.order("rating", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: reviews, error: reviewsError } = await query;

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reviews: reviews || [],
    });
  } catch (error) {
    console.error("Fetch reviews API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
