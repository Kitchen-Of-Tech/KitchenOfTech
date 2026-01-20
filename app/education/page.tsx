import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import CourseCatalog from "@/components/education/CourseCatalog";
import { sanityFetch } from "@/lib/sanity/client";

export const metadata: Metadata = {
  title: "Education - Learn with Kitchen of Tech",
  description: "Explore our comprehensive courses in web development, design, AI, and more. Learn from industry experts and earn certificates.",
};

async function getCourses() {
  const query = `*[_type == "course" && status == "published"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    description,
    "thumbnail": thumbnail.asset->url,
    category,
    level,
    price,
    compareAtPrice,
    currency,
    isFree,
    featured,
    totalDuration,
    totalLessons,
    totalEnrollments,
    averageRating,
    totalReviews,
    instructor->{
      _id,
      name,
      "profileImage": profileImage.asset->url
    },
    skills,
    publishedAt
  }`;

  try {
    const courses = await sanityFetch({ query });
    return courses || [];
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export default async function EducationPage() {
  const courses = await getCourses();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark pt-20">
        <CourseCatalog courses={courses} />
      </main>
      <Footer />
    </>
  );
}
