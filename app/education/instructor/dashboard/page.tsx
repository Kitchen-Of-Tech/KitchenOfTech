import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import InstructorDashboardClient from "@/components/education/InstructorDashboardClient";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: "Instructor Dashboard | KitchenOfTech Education",
  description: "Manage your courses, students, and assignments",
};

export default async function InstructorDashboardPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/auth/login?redirect=/education/instructor/dashboard");
  }

  // Check if user has instructor profile
  const { data: instructorProfile, error: instructorError } = await supabase
    .from("instructors")
    .select("id, user_id, status")
    .eq("user_id", user.id)
    .single();

  if (instructorError || !instructorProfile || instructorProfile.status !== "active") {
    redirect("/education?error=not-instructor");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <InstructorDashboardClient
      instructorId={instructorProfile.id}
      user={{
        id: user.id,
        email: user.email || "",
        name: profile?.full_name || user.email || "Instructor",
        avatar: profile?.avatar_url,
      }}
    />
  );
}
