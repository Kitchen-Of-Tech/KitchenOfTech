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
      assignmentId, 
      submissionUrl,
      autoComplete 
    } = body;

    // Validate required fields
    if (!enrollmentId || !assignmentId || !submissionUrl) {
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

    // Check if submission already exists
    const { data: existingSubmission, error: fetchError } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .eq("assignment_id", assignmentId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching submission:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch submission" },
        { status: 500 }
      );
    }

    let submissionData;

    if (existingSubmission) {
      // Update existing submission
      const { data, error: updateError } = await supabase
        .from("assignment_submissions")
        .update({
          submission_url: submissionUrl,
          completed: autoComplete || existingSubmission.completed,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existingSubmission.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating submission:", updateError);
        return NextResponse.json(
          { error: "Failed to update submission" },
          { status: 500 }
        );
      }

      submissionData = data;
    } else {
      // Create new submission
      const { data, error: insertError } = await supabase
        .from("assignment_submissions")
        .insert({
          enrollment_id: enrollmentId,
          assignment_id: assignmentId,
          submission_url: submissionUrl,
          completed: autoComplete || false,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating submission:", insertError);
        return NextResponse.json(
          { error: "Failed to create submission" },
          { status: 500 }
        );
      }

      submissionData = data;
    }

    // Get updated enrollment progress (trigger handles this automatically)
    const { data: updatedEnrollment, error: enrollmentFetchError } = await supabase
      .from("course_enrollments")
      .select("id, progress")
      .eq("id", enrollmentId)
      .single();

    if (enrollmentFetchError) {
      console.error("Error fetching updated enrollment:", enrollmentFetchError);
    }

    return NextResponse.json({
      success: true,
      submission: submissionData,
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error("Assignment submit API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
