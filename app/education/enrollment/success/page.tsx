import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { CheckCircle, ArrowRight, Download, BookOpen } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Enrollment Successful - KitchenOfTech",
  description: "Your course enrollment was successful",
};

export default async function EnrollmentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ enrollmentId?: string }>;
}) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login?redirect=/education");
  }

  const { enrollmentId } = await searchParams;

  if (!enrollmentId) {
    redirect("/education");
  }

  // Get enrollment details
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("course_id, status, payment_amount, payment_transaction_id")
    .eq("id", enrollmentId)
    .single();

  if (!enrollment) {
    redirect("/education");
  }

  // Get course from Sanity (you'll need to implement this)
  // For now, using course_id directly
  const isPending = enrollment.status === "pending";

  return (
    <div className="min-h-screen py-20">
      <div className="container-custom max-w-4xl mx-auto">
        <GlassCard className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {isPending ? "Payment Submitted!" : "Enrollment Successful!"}
          </h1>

          {isPending ? (
            <>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                Your payment has been submitted and is being verified. You&apos;ll receive access to the course once the payment is approved (usually within 24 hours).
              </p>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">What happens next?</h3>
                <ol className="text-white/70 text-left space-y-2 list-decimal list-inside">
                  <li>Our team will verify your payment</li>
                  <li>You&apos;ll receive an email confirmation once approved</li>
                  <li>Your course will be activated in your dashboard</li>
                  <li>Start learning immediately after activation!</li>
                </ol>
              </div>

              {enrollment.payment_transaction_id && (
                <div className="mb-8">
                  <p className="text-white/60 text-sm mb-3">Transaction ID:</p>
                  <code className="px-4 py-2 bg-white/5 border border-white/10 rounded text-primary font-mono">
                    {enrollment.payment_transaction_id}
                  </code>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                Congratulations! You&apos;ve successfully enrolled in the course. Start learning right away!
              </p>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-green-400 mb-3">You now have access to:</h3>
                <ul className="text-white/70 text-left space-y-2 list-disc list-inside">
                  <li>All course videos and lessons</li>
                  <li>Downloadable resources</li>
                  <li>Quizzes and assignments</li>
                  <li>Certificate upon completion</li>
                  <li>Instructor support and Q&A</li>
                </ul>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isPending && (
              <Link href={`/education/learn/${enrollment.course_id}`}>
                <GradientButton>
                  <BookOpen className="w-5 h-5" />
                  Start Learning
                  <ArrowRight className="w-5 h-5" />
                </GradientButton>
              </Link>
            )}
            
            <Link href="/education/dashboard">
              <GradientButton variant={isPending ? "primary" : "secondary"}>
                Go to Dashboard
              </GradientButton>
            </Link>

            {enrollment.payment_transaction_id && (
              <Link href={`/api/payment/receipt/${enrollment.payment_transaction_id}`} target="_blank">
                <GradientButton variant="outline">
                  <Download className="w-5 h-5" />
                  Download Receipt
                </GradientButton>
              </Link>
            )}
          </div>
        </GlassCard>

        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            Need help? <Link href="/support" className="text-primary hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
