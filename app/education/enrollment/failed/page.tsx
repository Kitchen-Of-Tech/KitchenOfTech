import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Enrollment Failed - KitchenOfTech",
  description: "Course enrollment was not successful",
};

export default async function EnrollmentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; courseId?: string }>;
}) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login?redirect=/education");
  }

  const { reason, courseId } = await searchParams;

  const errorReasons: Record<string, string> = {
    payment_failed: "Payment verification failed. Please check your transaction details and try again.",
    already_enrolled: "You are already enrolled in this course. Check your dashboard.",
    invalid_coupon: "The coupon code you entered is invalid or has expired.",
    insufficient_payment: "The payment amount is insufficient for this course.",
    default: "An error occurred during enrollment. Please try again or contact support.",
  };

  const errorMessage = reason ? errorReasons[reason] || errorReasons.default : errorReasons.default;

  return (
    <div className="min-h-screen py-20">
      <div className="container-custom max-w-4xl mx-auto">
        <GlassCard className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Enrollment Failed
          </h1>

          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            {errorMessage}
          </p>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-red-400 mb-3">Common Issues:</h3>
            <ul className="text-white/70 text-left space-y-2 list-disc list-inside">
              <li>Incorrect transaction ID or account number</li>
              <li>Payment not yet processed by payment provider</li>
              <li>Coupon code expired or reached usage limit</li>
              <li>Network connection interrupted during payment</li>
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-blue-400 mb-3">What to do next:</h3>
            <ol className="text-white/70 text-left space-y-2 list-decimal list-inside">
              <li>Double-check your payment transaction details</li>
              <li>Wait a few minutes and try again if payment is processing</li>
              <li>Contact your payment provider to confirm the transaction</li>
              <li>Reach out to our support team if the issue persists</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {courseId && (
              <Link href={`/education/checkout?courseId=${courseId}`}>
                <GradientButton>
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </GradientButton>
              </Link>
            )}
            
            <Link href="/education">
              <GradientButton variant="secondary">
                <ArrowLeft className="w-5 h-5" />
                Back to Courses
              </GradientButton>
            </Link>

            <Link href="/support">
              <GradientButton variant="outline">
                <HelpCircle className="w-5 h-5" />
                Get Help
              </GradientButton>
            </Link>
          </div>
        </GlassCard>

        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            Payment already made? <Link href="/support" className="text-primary hover:underline">Contact us</Link> with your transaction ID
          </p>
        </div>
      </div>
    </div>
  );
}
