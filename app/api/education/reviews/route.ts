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
    const { courseId, rating, review } = body;

    // Validate required fields
    if (!courseId || !rating) {
      return NextResponse.json(
        { error: "Course ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
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

    // Check if user has already reviewed this course
    const { data: existingReview, error: checkError } = await supabase
      .from("course_reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (!checkError && existingReview) {
      // Update existing review
      const { data: updatedReview, error: updateError } = await supabase
        .from("course_reviews")
        .update({
          rating,
          review,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingReview.id)
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
        review,
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

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Fetch all reviews for the course
    const { data: reviews, error: reviewsError } = await supabase
      .from("course_reviews")
      .select(`
        id,
        user_id,
        rating,
        review,
        created_at,
        updated_at
      `)
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    // Get user profiles for reviewers
    const userIds = reviews?.map(r => r.user_id) || [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    interface ProfileData {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    }
    
    const profileMap = profiles?.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, ProfileData>) || {};

    // Combine reviews with user data
    const reviewsWithUsers = reviews?.map(review => ({
      ...review,
      user_name: profileMap[review.user_id]?.full_name || "Student",
      user_avatar: profileMap[review.user_id]?.avatar_url,
    }));

    // Calculate average rating and stats
    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = {
      5: reviews?.filter(r => r.rating === 5).length || 0,
      4: reviews?.filter(r => r.rating === 4).length || 0,
      3: reviews?.filter(r => r.rating === 3).length || 0,
      2: reviews?.filter(r => r.rating === 2).length || 0,
      1: reviews?.filter(r => r.rating === 1).length || 0,
    };

    return NextResponse.json({
      reviews: reviewsWithUsers,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Fetch reviews API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
