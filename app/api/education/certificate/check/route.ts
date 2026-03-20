import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

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

    // Check eligibility using database RPC function (single source of truth)
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

    const result = eligibilityData?.[0] || {};

    return NextResponse.json({
      hasCertificate: false,
      eligible: result.eligible || false,
      message: result.message || "Complete all requirements to earn your certificate",
      requirements: {
        videosCompleted: result.videos_completed || false,
        quizzesPassed: result.quizzes_passed || false,
        assignmentsCompleted: result.assignments_completed || false,
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
