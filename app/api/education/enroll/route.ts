import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { applyRateLimit, rateLimiters } from '@/lib/ratelimit';
import { sendEnrollmentConfirmation } from '@/lib/email/notifications';

export async function POST(request: NextRequest) {
  // Apply rate limiting (100 requests per minute for general API)
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.api);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to enroll" },
        { status: 401 }
      );
    }

    const { courseId, couponCode, paymentTransactionId, status } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (existingEnrollment) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already enrolled in this course",
        },
        { status: 400 }
      );
    }

    let finalPrice = 0;
    let appliedCoupon = null;

    // Get payment transaction if provided
    if (paymentTransactionId) {
      const { data: transaction } = await supabase
        .from("payment_transactions")
        .select("amount")
        .eq("id", paymentTransactionId)
        .single();

      if (transaction) {
        finalPrice = transaction.amount;
      }
    }

    // Validate coupon if provided
    if (couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon) {
        const now = new Date();
        const validFrom = new Date(coupon.valid_from);
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

        // Check validity
        if (
          now >= validFrom &&
          (!validUntil || now <= validUntil) &&
          (!coupon.max_uses || coupon.current_uses < coupon.max_uses)
        ) {
          appliedCoupon = coupon;

          // Update coupon usage
          await supabase
            .from("coupons")
            .update({ current_uses: coupon.current_uses + 1 } as never)
            .eq("id", coupon.id);
        }
      }
    }

    // Create enrollment
    const enrollmentStatus = paymentTransactionId ? (status || "pending") : "active";
    
    const { data: enrollment, error: enrollError } = await supabase
      .from("course_enrollments")
      .insert({
        user_id: user.id,
        course_id: courseId,
        payment_amount: finalPrice,
        coupon_used: appliedCoupon?.code || null,
        status: enrollmentStatus,
        payment_transaction_id: paymentTransactionId || null,
      } as never)
      .select()
      .single();

    if (enrollError) {
      console.error("Enrollment error:", enrollError);
      return NextResponse.json(
        { success: false, message: "Failed to create enrollment" },
        { status: 500 }
      );
    }

    // Send enrollment confirmation email
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single();
    
    if (userProfile) {
      await sendEnrollmentConfirmation({
        userName: userProfile.name || 'Student',
        userEmail: userProfile.email,
        courseName: 'Your Course', // TODO: Fetch from Sanity using courseId
        courseSlug: courseId,
        enrollmentId: enrollment.id,
        isPending: enrollmentStatus === 'pending',
        transactionId: paymentTransactionId || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in course",
      enrollment,
    });
  } catch (error) {
    console.error("Error enrolling:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
