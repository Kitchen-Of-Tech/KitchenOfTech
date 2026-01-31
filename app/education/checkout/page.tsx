import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { sanityFetch } from "@/lib/sanity/client";
import CheckoutClient from "@/components/education/CheckoutClient";
import type { Course } from "@/types/education";

export const metadata: Metadata = {
  title: "Checkout | KitchenOfTech Education",
  description: "Complete your course enrollment",
};

interface CheckoutPageProps {
  searchParams: Promise<{ courseId?: string; coupon?: string }>;
}

async function getCourse(courseId: string): Promise<Course | null> {
  const query = `*[_type == "course" && _id == $courseId && status == "published"][0] {
    _id,
    title,
    slug,
    description,
    "thumbnail": thumbnail.asset->url,
    price,
    compareAtPrice,
    currency,
    isFree,
    defaultCoupon,
    instructor->{
      _id,
      name,
      "profileImage": profileImage.asset->url
    }
  }`;

  try {
    const course = await sanityFetch({ query, params: { courseId } });
    return course as Course | null;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const { courseId, coupon } = params;

  if (!courseId) {
    redirect("/education");
  }

  // Check authentication
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/education/checkout?courseId=${courseId}${coupon ? `&coupon=${coupon}` : ''}`);
  }

  // Get course details
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

  // Check if already enrolled
  const { data: existingEnrollment } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existingEnrollment) {
    redirect(`/education/learn/${course.slug.current}`);
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen pt-20 pb-12 bg-dark">
      <CheckoutClient
        course={course}
        user={{
          id: user.id,
          name: profile?.full_name || user.email?.split("@")[0] || "Student",
          email: profile?.email || user.email || "",
          phone: profile?.phone || "",
        }}
        initialCoupon={coupon}
      />
    </div>
  );
}
