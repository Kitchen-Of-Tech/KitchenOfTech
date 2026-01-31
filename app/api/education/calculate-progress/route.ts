import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Calculate and update overall course progress
 * Triggers certificate generation if course is 100% complete
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId } = body;

    if (!enrollmentId) {
      return NextResponse.json({ error: "Enrollment ID required" }, { status: 400 });
    }

    // Get enrollment details
    const { data: enrollment, error: enrollError } = await supabase
      .from("course_enrollments")
      .select("id, user_id, course_id, certificate_issued")
      .eq("id", enrollmentId)
      .eq("user_id", user.id)
      .single();

    if (enrollError || !enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // Calculate progress
    const adminClient = createAdminClient();
    
    // Get all lessons for the course from lesson_progress
    const { data: allProgress, error: progressError } = await adminClient
      .from("lesson_progress")
      .select("completed")
      .eq("enrollment_id", enrollmentId);

    if (progressError) {
      console.error("Error fetching lesson progress:", progressError);
      return NextResponse.json({ error: "Failed to calculate progress" }, { status: 500 });
    }

    // Calculate overall progress
    const totalLessons = allProgress?.length || 0;
    const completedLessons = allProgress?.filter(p => p.completed).length || 0;
    const overallProgress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    // Update enrollment progress
    await adminClient
      .from("course_enrollments")
      .update({ progress: overallProgress })
      .eq("id", enrollmentId);

    // Check if course is 100% complete and certificate not yet issued
    if (overallProgress === 100 && !enrollment.certificate_issued) {
      // Check full eligibility (lessons + quizzes + assignments)
      const { data: eligibilityData, error: eligibilityError } = await adminClient
        .rpc("check_certificate_eligibility", {
          p_enrollment_id: enrollmentId,
        });

      if (!eligibilityError && eligibilityData?.eligible) {
        // Trigger certificate generation
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/education/certificate/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ enrollmentId }),
        }).catch(err => console.error("Error triggering certificate:", err));
      }
    }

    return NextResponse.json({
      success: true,
      progress: overallProgress,
      completed_lessons: completedLessons,
      total_lessons: totalLessons,
      certificate_eligible: overallProgress === 100,
    });
  } catch (error) {
    console.error("Calculate progress error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
