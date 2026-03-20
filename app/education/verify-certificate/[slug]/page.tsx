import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { CertificateVerificationClient } from "@/components/education/CertificateVerificationClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  return {
    title: `Verify Certificate - ${slug} | KitchenOfTech`,
    description: "Verify the authenticity of this certificate",
  };
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { slug: certificateId } = await params;

  // Fetch certificate data
  const supabase = createAdminClient();
  
  const { data: certificate, error } = await supabase
    .from("certificates")
    .select("id, certificate_id, student_name, course_name, issue_date, user_id, enrollment_id, course_id")
    .eq("certificate_id", certificateId)
    .single();

  if (error || !certificate) {
    notFound();
  }

  // Get user profile for additional info
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", certificate.user_id)
    .single();

  const certificateData = {
    ...certificate,
    student_name: profile?.full_name || certificate.student_name,
    course_name: certificate.course_name || "Course",
  } as typeof certificate & { course_name: string };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <CertificateVerificationClient certificate={certificateData} />
    </div>
  );
}
