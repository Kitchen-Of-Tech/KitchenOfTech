import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { sanityFetch } from "@/lib/sanity/client";

export async function POST(request: Request) {
  try {
    const { code, courseId } = await request.json();

    if (!code || !courseId) {
      return NextResponse.json(
        { valid: false, message: "Coupon code and course ID are required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Fetch coupon from database
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({
        valid: false,
        message: "Invalid coupon code",
      });
    }

    // Check expiry and usage limits
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

    if (now < validFrom) {
      return NextResponse.json({
        valid: false,
        message: "This coupon is not yet active",
      });
    }

    if (validUntil && now > validUntil) {
      return NextResponse.json({
        valid: false,
        message: "This coupon has expired",
      });
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({
        valid: false,
        message: "This coupon has reached its maximum usage limit",
      });
    }

    // Check if coupon is applicable to this course
    if (coupon.applicable_courses && coupon.applicable_courses.length > 0) {
      if (!coupon.applicable_courses.includes(courseId)) {
        return NextResponse.json({
          valid: false,
          message: "This coupon is not valid for this course",
        });
      }
    }

    // Fetch course price from Sanity
    const query = `*[_type == "course" && _id == $courseId][0] {
      price,
      currency
    }`;
    
    const course = await sanityFetch({ query, params: { courseId } }) as { price: number; currency: string } | null;

    if (!course) {
      return NextResponse.json({
        valid: false,
        message: "Course not found",
      });
    }

    // Calculate discount
    let discountAmount = 0;
    let finalPrice = course.price;

    if (coupon.discount_type === "percentage") {
      discountAmount = (course.price * coupon.discount_value) / 100;
      finalPrice = Math.max(0, course.price - discountAmount);
    } else if (coupon.discount_type === "fixed") {
      discountAmount = Math.min(coupon.discount_value, course.price);
      finalPrice = Math.max(0, course.price - discountAmount);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      finalPrice: Math.round(finalPrice * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      message: `Coupon applied! You save $${Math.round(discountAmount * 100) / 100}`,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
