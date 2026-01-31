import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("course_enrollments")
      .select("id, course_id, progress, completed_at, enrolled_at")
      .eq("user_id", user.id);

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError);
      return NextResponse.json(
        { error: "Failed to fetch enrollments" },
        { status: 500 }
      );
    }

    // Get lesson progress for all enrollments
    const enrollmentIds = enrollments?.map((e) => e.id) || [];
    let totalTimeSpent = 0;
    let totalLessonsCompleted = 0;

    if (enrollmentIds.length > 0) {
      const { data: lessonProgress, error: progressError } = await supabase
        .from("lesson_progress")
        .select("time_spent, completed")
        .in("enrollment_id", enrollmentIds);

      if (!progressError && lessonProgress) {
        totalTimeSpent = lessonProgress.reduce(
          (sum, p) => sum + (p.time_spent || 0),
          0
        );
        totalLessonsCompleted = lessonProgress.filter((p) => p.completed).length;
      }
    }

    // Calculate current week stats (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: weekProgress, error: weekError } = await supabase
      .from("lesson_progress")
      .select("time_spent, completed, updated_at")
      .in("enrollment_id", enrollmentIds)
      .gte("updated_at", weekAgo.toISOString());

    let weekTimeSpent = 0;
    let weekLessonsCompleted = 0;

    if (!weekError && weekProgress) {
      weekTimeSpent = weekProgress.reduce(
        (sum, p) => sum + (p.time_spent || 0),
        0
      );
      weekLessonsCompleted = weekProgress.filter((p) => p.completed).length;
    }

    // Get quiz attempts for the week
    const { data: weekQuizzes } = await supabase
      .from("quiz_attempts")
      .select("score, passed")
      .in("enrollment_id", enrollmentIds)
      .gte("attempted_at", weekAgo.toISOString());

    const weekQuizzesPassed = weekQuizzes?.filter((q) => q.passed).length || 0;

    // Calculate learning streak (consecutive days with activity)
    const { data: allProgress, error: streakError } = await supabase
      .from("lesson_progress")
      .select("updated_at")
      .in("enrollment_id", enrollmentIds)
      .order("updated_at", { ascending: false })
      .limit(365); // Check last year for streak

    let currentStreak = 0;
    if (!streakError && allProgress && allProgress.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activityDates = new Set(
        allProgress.map((p) => {
          const date = new Date(p.updated_at);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
      );

      // Check for streak starting from yesterday (today might not be complete)
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);

      while (activityDates.has(checkDate.getTime())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // If there's activity today, include it in the streak
      if (activityDates.has(today.getTime())) {
        currentStreak++;
      }
    }

    // Get certificates count
    const { data: certificates } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", user.id);

    const certificatesEarned = certificates?.length || 0;

    // Calculate stats
    const completedCourses = enrollments?.filter((e) => e.completed_at).length || 0;
    const inProgressCourses =
      enrollments?.filter((e) => !e.completed_at && e.progress > 0).length || 0;
    const notStartedCourses =
      enrollments?.filter((e) => !e.completed_at && e.progress === 0).length || 0;

    const averageProgress =
      enrollments && enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
          enrollments.length
        : 0;

    return NextResponse.json({
      overview: {
        totalCourses: enrollments?.length || 0,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        certificatesEarned,
        totalTimeSpent: Math.round(totalTimeSpent / 3600), // Convert to hours
        totalLessonsCompleted,
        averageProgress: Math.round(averageProgress),
        currentStreak,
      },
      thisWeek: {
        timeSpent: Math.round(weekTimeSpent / 3600), // Convert to hours
        lessonsCompleted: weekLessonsCompleted,
        quizzesPassed: weekQuizzesPassed,
      },
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
