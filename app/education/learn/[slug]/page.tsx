import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import CoursePlayer from "@/components/education/CoursePlayer";
import { sanityFetch } from "@/lib/sanity/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Course } from "@/types/education";

interface LearnPageProps {
  params: Promise<{ slug: string }>;
}

async function getCourseWithEnrollment(slug: string, userId: string) {
  // Get course from Sanity
  const query = `*[_type == "course" && slug.current == $slug && status == "published"][0] {
    _id,
    title,
    slug,
    description,
    "thumbnail": thumbnail.asset->url,
    instructor->{
      _id,
      name,
      "profileImage": profileImage.asset->url
    },
    modules[]->{
      _id,
      title,
      description,
      order,
      lessons[]->{
        _id,
        title,
        slug,
        description,
        videoUrl,
        videoId,
        duration,
        order,
        isFree,
        transcript,
        resources,
        notes
      },
      quiz->{
        _id,
        title,
        description,
        passingScore,
        timeLimit,
        maxAttempts,
        showCorrectAnswers,
        randomizeQuestions,
        questions
      },
      assignment->{
        _id,
        title,
        description,
        instructions,
        facebookGroupUrl,
        dueDate,
        resources,
        maxScore,
        autoComplete
      }
    }
  }`;

  const course = await sanityFetch({ query, params: { slug } }) as Course | null;

  if (!course) {
    return null;
  }

  // Get enrollment and progress
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", course._id)
    .single();

  if (!enrollment) {
    return null;
  }

  // Get lesson progress
  const { data: lessonProgress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("enrollment_id", enrollment.id);

  // Get quiz attempts
  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("enrollment_id", enrollment.id);

  // Get assignment submissions
  const { data: assignments } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("enrollment_id", enrollment.id);

  return {
    course,
    enrollment,
    lessonProgress: lessonProgress || [],
    quizAttempts: quizAttempts || [],
    assignments: assignments || [],
  };
}

export async function generateMetadata({ params }: LearnPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const query = `*[_type == "course" && slug.current == $slug][0] { title }`;
  const course = await sanityFetch({ query, params: { slug } }) as { title: string } | null;

  return {
    title: course ? `Learn: ${course.title}` : "Course Not Found",
  };
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { slug } = await params;

  // Check authentication
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/education/learn/${slug}`);
  }

  const data = await getCourseWithEnrollment(slug, user.id);

  if (!data) {
    notFound();
  }

  return (
    <>
      <main className="min-h-screen bg-dark">
        <CoursePlayer
          course={data.course}
          enrollment={data.enrollment}
          lessonProgress={data.lessonProgress}
          quizAttempts={data.quizAttempts}
          assignments={data.assignments}
        />
      </main>
      <Footer />
    </>
  );
}
