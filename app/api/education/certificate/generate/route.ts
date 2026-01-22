import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

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
    const { enrollmentId } = body;

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "Enrollment ID is required" },
        { status: 400 }
      );
    }

    // Verify enrollment belongs to user
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("course_enrollments")
      .select("id, user_id, course_id, progress")
      .eq("id", enrollmentId)
      .eq("user_id", user.id)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Check if certificate already exists
    const { data: existingCert, error: certCheckError } = await supabase
      .from("certificates")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .single();

    if (!certCheckError && existingCert) {
      return NextResponse.json({
        success: true,
        certificate: existingCert,
        message: "Certificate already exists",
      });
    }

    // Use admin client to call the eligibility check function
    const adminClient = createAdminClient();
    const { data: eligibilityData, error: eligibilityError } = await adminClient
      .rpc("check_certificate_eligibility", {
        p_enrollment_id: enrollmentId,
      });

    if (eligibilityError) {
      console.error("Error checking eligibility:", eligibilityError);
      return NextResponse.json(
        { error: "Failed to check eligibility" },
        { status: 500 }
      );
    }

    if (!eligibilityData?.eligible) {
      return NextResponse.json(
        {
          eligible: false,
          message: "You haven't met the requirements for certificate",
          requirements: {
            videos_completed: eligibilityData?.videos_completed || false,
            quizzes_passed: eligibilityData?.quizzes_passed || false,
            assignments_completed: eligibilityData?.assignments_completed || false,
          },
        },
        { status: 400 }
      );
    }

    // Generate unique certificate ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certificateId = `KOT-${new Date().getFullYear()}-${random}-${timestamp.toString().slice(-4)}`;

    // Get user profile for full name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const studentName = profile?.full_name || user.email?.split("@")[0] || "Student";

    // Create certificate record
    const { data: certificate, error: insertError } = await supabase
      .from("certificates")
      .insert({
        enrollment_id: enrollmentId,
        user_id: user.id,
        course_id: enrollment.course_id,
        certificate_id: certificateId,
        student_name: studentName,
        issue_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating certificate:", insertError);
      return NextResponse.json(
        { error: "Failed to create certificate" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate: certificate,
      message: "Certificate generated successfully",
    });
  } catch (error) {
    console.error("Certificate generation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
