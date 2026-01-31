import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";

const COURSE_QUERY = `*[_type == "course" && _id in $ids] {
  _id,
  title,
  slug,
  description,
  thumbnail,
  price,
  discount,
  category,
  level,
  duration,
  instructor-> {
    name,
    bio,
    avatar
  },
  modules[] {
    _key,
    title,
    description,
    lessons[] {
      _key,
      _id,
      title,
      type,
      duration
    }
  }
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseIds } = body;

    if (!courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json(
        { error: "courseIds array is required" },
        { status: 400 }
      );
    }

    if (courseIds.length === 0) {
      return NextResponse.json({ courses: [] });
    }

    // Fetch courses from Sanity
    const courses = await client.fetch(COURSE_QUERY, {
      ids: courseIds,
    });

    interface SanityLesson {
      duration?: number;
    }

    interface SanityModule {
      lessons?: SanityLesson[];
    }

    interface SanityCourse {
      modules?: SanityModule[];
      price: number;
      discount?: number;
      [key: string]: unknown;
    }

    // Transform courses to include computed values
    const transformedCourses = (courses as SanityCourse[]).map((course) => {
      const totalLessons = course.modules?.reduce(
        (sum, module) => sum + (module.lessons?.length || 0),
        0
      ) || 0;

      const totalDuration = course.modules?.reduce(
        (sum, module) =>
          sum +
          (module.lessons?.reduce(
            (lessonSum, lesson) => lessonSum + (lesson.duration || 0),
            0
          ) || 0),
        0
      ) || 0;

      return {
        ...course,
        totalLessons,
        totalDuration,
        finalPrice: course.discount
          ? course.price - (course.price * course.discount) / 100
          : course.price,
      };
    });

    return NextResponse.json({ courses: transformedCourses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
