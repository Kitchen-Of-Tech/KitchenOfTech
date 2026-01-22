import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import CourseDetailClient from "@/components/education/CourseDetailClient";
import { sanityFetch } from "@/lib/sanity/client";
import type { Course } from "@/types/education";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

async function getCourse(slug: string): Promise<Course | null> {
  const query = `*[_type == "course" && slug.current == $slug && status == "published"][0] {
    _id,
    title,
    slug,
    subtitle,
    description,
    fullDescription,
    "thumbnail": thumbnail.asset->url,
    promoVideo,
    category,
    level,
    language,
    instructor->{
      _id,
      name,
      bio,
      "profileImage": profileImage.asset->url,
      expertise,
      socialLinks
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
        resources
      },
      quiz->{
        _id,
        title,
        description,
        passingScore,
        timeLimit,
        maxAttempts,
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
    },
    learningOutcomes,
    requirements,
    targetAudience,
    skills,
    price,
    compareAtPrice,
    currency,
    defaultCoupon,
    isFree,
    featured,
    publishedAt,
    seoTitle,
    seoDescription,
    seoKeywords,
    totalDuration,
    totalLessons,
    totalEnrollments,
    averageRating,
    totalReviews
  }`;

  try {
    const course = await sanityFetch({ query, params: { slug } });
    return course as Course | null;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: course.seoTitle || `${course.title} - Kitchen of Tech`,
    description: course.seoDescription || course.description,
    keywords: course.seoKeywords?.join(", "),
    openGraph: {
      title: course.title,
      description: course.description,
      images: [course.thumbnail.asset.url],
      type: "website",
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark pt-20">
        <CourseDetailClient course={course} />
      </main>
      <Footer />
    </>
  );
}
