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
      .select("id, course_id, progress")
      .eq("id", enrollmentId)
      .single();

    if (enrollmentError) {
      console.error("Error fetching enrollment:", enrollmentError);
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
