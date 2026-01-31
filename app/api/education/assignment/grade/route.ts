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
    const { submissionId, gradePercentage, feedback } = body as {
      submissionId: string;
      gradePercentage: number;
      feedback?: string;
    };

    if (!submissionId || gradePercentage === undefined) {
      return NextResponse.json(
        { error: "submissionId and gradePercentage are required" },
        { status: 400 }
      );
    }

    if (gradePercentage < 0 || gradePercentage > 100) {
      return NextResponse.json(
        { error: "gradePercentage must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Get submission
    const { data: submission, error: submissionError } = await supabase
      .from("assignment_submissions")
      .select("*, course_enrollments(course_id, user_id)")
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // TODO: Verify user is instructor for this course
    // For now, any authenticated user can grade (for demo purposes)
    // In production, check if user is the course instructor

    // Update submission with grade
    const { data: updatedSubmission, error: updateError } = await supabase
      .from("assignment_submissions")
      .update({
        status: "graded",
        grade_percentage: gradePercentage,
        instructor_feedback: feedback || null,
        graded_at: new Date().toISOString(),
        graded_by: user.id,
      })
      .eq("id", submissionId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating submission:", updateError);
      return NextResponse.json(
        { error: "Failed to update submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      message: gradePercentage >= 70 
        ? "Assignment passed!" 
        : "Assignment needs improvement. Student must resubmit.",
    });
  } catch (error) {
    console.error("Grade assignment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get submissions for instructor review
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status") || "submitted"; // submitted, graded, all

    // TODO: Verify user is instructor for the course
    // For now, return all submissions for demo purposes

    let query = supabase
      .from("assignment_submissions")
      .select(`
        *,
        course_enrollments (
          course_id,
          user_id,
          profiles (
            full_name,
            avatar_url
          )
        )
      `)
      .order("submitted_at", { ascending: false });

    if (courseId) {
      query = query.eq("course_enrollments.course_id", courseId);
    }

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: submissions, error: submissionsError } = await query;

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissions: submissions || [],
    });
  } catch (error) {
    console.error("Get submissions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
