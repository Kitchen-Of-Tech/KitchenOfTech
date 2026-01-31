import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { StudentDashboardClient } from "@/components/education/StudentDashboardClient";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: "My Dashboard | KitchenOfTech Education",
  description: "Track your learning progress and manage your courses",
};

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/auth/login?redirect=/education/dashboard");
  }

  // Fetch user enrollments with progress
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("course_enrollments")
    .select(`
      id,
      course_id,
      enrolled_at,
      last_accessed_at,
      last_accessed_lesson,
      progress,
      completed_at
    `)
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });

  if (enrollmentsError) {
    console.error("Error fetching enrollments:", enrollmentsError);
  }

  // Fetch certificates
  const { data: certificates, error: certificatesError } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", user.id)
    .order("issue_date", { ascending: false });

  if (certificatesError) {
    console.error("Error fetching certificates:", certificatesError);
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <StudentDashboardClient
        enrollments={enrollments || []}
        certificates={certificates || []}
        user={{
          id: user.id,
          email: user.email || "",
          name: profile?.full_name || user.email?.split("@")[0] || "Student",
          avatar: profile?.avatar_url,
        }}
      />
    </div>
  );
}
