import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendCertificateEmail } from "@/lib/email/notifications";

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
      lessonId, 
      videoProgress, 
      timeSpent, 
      completed 
    } = body;

    // Validate required fields
    if (!enrollmentId || !lessonId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if progress record exists
    const { data: existingProgress, error: fetchError } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .eq("lesson_id", lessonId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching progress:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch progress" },
        { status: 500 }
      );
    }

    let progressData;

    if (existingProgress) {
      // Update existing progress
      const { data, error: updateError } = await supabase
        .from("lesson_progress")
        .update({
          video_progress: videoProgress ?? existingProgress.video_progress,
          time_spent: timeSpent ?? existingProgress.time_spent,
          completed: completed ?? existingProgress.completed,
          last_accessed_at: new Date().toISOString(),
        })
        .eq("id", existingProgress.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating progress:", updateError);
        return NextResponse.json(
          { error: "Failed to update progress" },
          { status: 500 }
        );
      }

      progressData = data;
    } else {
      // Create new progress record
      const { data, error: insertError } = await supabase
        .from("lesson_progress")
        .insert({
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          video_progress: videoProgress ?? 0,
          time_spent: timeSpent ?? 0,
          completed: completed ?? false,
          last_accessed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating progress:", insertError);
        return NextResponse.json(
          { error: "Failed to create progress" },
          { status: 500 }
        );
      }

      progressData = data;
    }

    // Get updated enrollment data with overall progress
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("course_enrollments")
      .select("id, course_id, progress, certificate_issued, user_id")
      .eq("id", enrollmentId)
      .single();

    if (enrollmentError) {
      console.error("Error fetching enrollment:", enrollmentError);
    }

    // Check if course is complete and auto-generate certificate
    if (enrollment && !enrollment.certificate_issued && completed) {
      await checkAndGenerateCertificate(enrollment.id, enrollment.user_id, enrollment.course_id);
    }

    return NextResponse.json({
      success: true,
      progress: progressData,
      enrollment: enrollment,
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Check if course is complete and auto-generate certificate
 */
async function checkAndGenerateCertificate(
  enrollmentId: string,
  userId: string,
  courseId: string
) {
  try {
    const adminClient = createAdminClient();
    
    // Check if certificate already exists
    const { data: existingCert } = await adminClient
      .from("certificates")
      .select("id")
      .eq("enrollment_id", enrollmentId)
      .single();

    if (existingCert) {
      return; // Certificate already generated
    }

    // Check eligibility using the database function
    const { data: eligibilityData, error: eligibilityError } = await adminClient
      .rpc("check_certificate_eligibility", {
        p_enrollment_id: enrollmentId,
      });

    if (eligibilityError || !eligibilityData?.eligible) {
      return; // Not eligible yet
    }

    // Generate unique certificate ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certificateId = `KOT-${new Date().getFullYear()}-${random}-${timestamp.toString().slice(-4)}`;

    // Get user profile
    const { data: profile } = await adminClient
      .from("users")
      .select("name, email")
      .eq("id", userId)
      .single();

    const studentName = profile?.name || profile?.email?.split("@")[0] || "Student";

    // Calculate final score (average of quiz scores)
    const { data: quizAttempts } = await adminClient
      .from("quiz_attempts")
      .select("score")
      .eq("enrollment_id", enrollmentId)
      .eq("passed", true);

    const finalScore = quizAttempts && quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length)
      : 100;

    // Get course skills (would need to fetch from Sanity in production)
    const skills = ["Web Development", "Problem Solving", "Project Management"];

    // Create certificate
    const { data: certificate, error: certError } = await adminClient
      .from("certificates")
      .insert({
        enrollment_id: enrollmentId,
        user_id: userId,
        course_id: courseId,
        certificate_id: certificateId,
        student_name: studentName,
        issued_at: new Date().toISOString(),
        final_score: finalScore,
        skills: skills,
      })
      .select()
      .single();

    if (certError) {
      console.error("Error creating certificate:", certError);
      return;
    }

    // Update enrollment with certificate flag
    await adminClient
      .from("course_enrollments")
      .update({
        certificate_issued: true,
        certificate_id: certificateId,
        completed_at: new Date().toISOString(),
      })
      .eq("id", enrollmentId);

    console.log(`✅ Certificate ${certificateId} auto-generated for enrollment ${enrollmentId}`);

    // Send certificate email
    if (profile?.email) {
      const certificateUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/education/certificate/pdf/${certificate.id}`;
      
      await sendCertificateEmail({
        userName: studentName,
        userEmail: profile.email,
        courseName: "Your Course", // TODO: Fetch from Sanity
        certificateUrl,
        certificateId,
      });
    }
  } catch (error) {
    console.error("Error in auto-certificate generation:", error);
    // Don't throw - this is a background process
  }
}
