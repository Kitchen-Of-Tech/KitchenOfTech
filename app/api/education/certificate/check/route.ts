import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get("enrollmentId");

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "Enrollment ID is required" },
        { status: 400 }
      );
    }

    // Check if certificate exists
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .eq("user_id", user.id)
      .single();

    if (certError && certError.code !== "PGRST116") {
      console.error("Error fetching certificate:", certError);
      return NextResponse.json(
        { error: "Failed to fetch certificate" },
        { status: 500 }
      );
    }

    if (certificate) {
      return NextResponse.json({
        hasCertificate: true,
        certificate: certificate,
      });
    }

    // Check eligibility
    const { error: enrollmentError } = await supabase
      .from("course_enrollments")
      .select(`
        id,
        course_id,
        progress,
        completed_at
      `)
      .eq("id", enrollmentId)
      .eq("user_id", user.id)
      .single();

    if (enrollmentError) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Get lesson progress
    const { data: lessonProgress } = await supabase
      .from("lesson_progress")
      .select("completed")
      .eq("enrollment_id", enrollmentId);

    const totalLessons = lessonProgress?.length || 0;
    const completedLessons = lessonProgress?.filter(l => l.completed).length || 0;
    const videosCompleted = totalLessons > 0 && completedLessons === totalLessons;

    // Get quiz attempts
    const { data: quizAttempts } = await supabase
      .from("quiz_attempts")
      .select("quiz_id, passed")
      .eq("enrollment_id", enrollmentId);

    // Group by quiz_id and check if at least one attempt passed
    const quizzesPassed = quizAttempts?.reduce((acc: Record<string, boolean>, attempt) => {
      if (!acc[attempt.quiz_id]) {
        acc[attempt.quiz_id] = attempt.passed;
      } else {
        acc[attempt.quiz_id] = acc[attempt.quiz_id] || attempt.passed;
      }
      return acc;
    }, {});

    const allQuizzesPassed = quizzesPassed 
      ? Object.values(quizzesPassed).every(passed => passed)
      : true; // If no quizzes, consider as passed

    // Get assignments
    const { data: assignments } = await supabase
      .from("assignment_submissions")
      .select("completed")
      .eq("enrollment_id", enrollmentId);

    const allAssignmentsCompleted = assignments?.every(a => a.completed) ?? true;

    const isEligible = videosCompleted && allQuizzesPassed && allAssignmentsCompleted;

    return NextResponse.json({
      hasCertificate: false,
      eligible: isEligible,
      requirements: {
        videosCompleted,
        quizzesPassed: allQuizzesPassed,
        assignmentsCompleted: allAssignmentsCompleted,
      },
      progress: {
        completedLessons,
        totalLessons,
        totalQuizzes: quizzesPassed ? Object.keys(quizzesPassed).length : 0,
        passedQuizzes: quizzesPassed ? Object.values(quizzesPassed).filter(p => p).length : 0,
        totalAssignments: assignments?.length || 0,
        completedAssignments: assignments?.filter(a => a.completed).length || 0,
      },
    });
  } catch (error) {
    console.error("Certificate check API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
