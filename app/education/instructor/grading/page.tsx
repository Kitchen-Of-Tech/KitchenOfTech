import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { InstructorGrading } from "@/components/education/InstructorGrading";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: "Grade Assignments | KitchenOfTech Education",
  description: "Review and grade student assignment submissions",
};

export default async function InstructorGradingPage({
  searchParams,
}: {
  searchParams: { courseId?: string };
}) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/auth/login?redirect=/education/instructor/grading");
  }

  // Check if user is an instructor or admin
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || (profile.role !== 'instructor' && profile.role !== 'admin')) {
    redirect("/login?error=unauthorized");
  }
  
  const courseId = searchParams.courseId || "";

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Assignment Grading
          </h1>
          <p className="text-white/60 text-lg">
            Review and grade student assignment submissions
          </p>
        </div>

        <InstructorGrading courseId={courseId} />
      </div>
    </div>
  );
}
