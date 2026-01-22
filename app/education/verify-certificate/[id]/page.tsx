import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { CertificateVerificationClient } from "@/components/education/CertificateVerificationClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Verify Certificate - ${id} | KitchenOfTech`,
    description: "Verify the authenticity of this certificate",
  };
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { id: certificateId } = await params;

  // Fetch certificate data
  const supabase = createAdminClient();
  
  const { data: certificate, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("certificate_id", certificateId)
    .single();

  if (error || !certificate) {
    notFound();
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", certificate.user_id)
    .single();

  // Get enrollment for course details
  const { data: _enrollment } = await supabase
    .from("course_enrollments")
    .select("course_id")
    .eq("id", certificate.enrollment_id)
    .single();

  // Note: In production, you'd fetch course name from Sanity using enrollment.course_id
  const courseName = "Course Name"; // TODO: Fetch from Sanity using enrollment?.course_id

  const certificateData = {
    ...certificate,
    student_name: profile?.full_name || certificate.student_name,
    course_name: courseName,
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <CertificateVerificationClient certificate={certificateData} />
    </div>
  );
}
