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
    const { 
      enrollmentId, 
      quizId, 
      answers,
      score,
      passed,
      attemptNumber,
      timeSpent
    } = body;

    // Validate required fields
    if (!enrollmentId || !quizId || !answers || score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify enrollment belongs to user
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("course_enrollments")
      .select("id, user_id")
      .eq("id", enrollmentId)
      .eq("user_id", user.id)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Save quiz attempt
    const { data: attempt, error: insertError } = await supabase
      .from("quiz_attempts")
      .insert({
        enrollment_id: enrollmentId,
        quiz_id: quizId,
        answers: answers,
        score: score,
        passed: passed,
        attempt_number: attemptNumber,
        time_spent: timeSpent || 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving quiz attempt:", insertError);
      return NextResponse.json(
        { error: "Failed to save quiz attempt" },
        { status: 500 }
      );
    }

    // Get updated enrollment progress (trigger handles this automatically)
    const { data: updatedEnrollment, error: fetchError } = await supabase
      .from("course_enrollments")
      .select("id, progress")
      .eq("id", enrollmentId)
      .single();

    if (fetchError) {
      console.error("Error fetching updated enrollment:", fetchError);
    }

    return NextResponse.json({
      success: true,
      attempt: attempt,
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error("Quiz submit API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
