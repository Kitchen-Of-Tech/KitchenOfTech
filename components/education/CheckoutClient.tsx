"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle, Tag, CreditCard, Building2, Smartphone, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import type { Course } from "@/types/education";

interface CheckoutClientProps {
  course: Course;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  initialCoupon?: string;
}

interface PaymentMethod {
  id: string;
  provider: string;
  account_number: string;
  account_name: string;
  is_active: boolean;
}

interface Coupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
}

export default function CheckoutClient({ course, initialCoupon }: CheckoutClientProps) {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState(initialCoupon || course.defaultCoupon || "");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(course.price);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState({
    accountNumber: "",
    transactionId: "",
    purpose: "",
  });

  // Fetch available payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  useEffect(() => {
    const init = async () => {
      await fetchPaymentMethods();
      // Auto-apply coupon if provided
      if (initialCoupon || course.defaultCoupon) {
        await applyCoupon();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payment/methods");
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.methods.filter((m: PaymentMethod) => m.is_active));
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsValidating(true);
    setError("");
    
    try {
      const response = await fetch("/api/education/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, courseId: course._id }),
      });

      const data = await response.json();
      
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        setDiscount(data.discountAmount);
        setFinalPrice(data.finalPrice);
      } else {
        setError(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
        setDiscount(0);
        setFinalPrice(course.price);
      }
    } catch (err) {
      setError("Error validating coupon");
      console.error("Coupon validation error:", err);
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscount(0);
    setFinalPrice(course.price);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (finalPrice === 0) {
      // Free enrollment
      enrollDirectly();
      return;
    }

    // Validate payment details
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    if (!paymentDetails.accountNumber || !paymentDetails.transactionId) {
      setError("Please fill in all payment details");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Submit payment
      const paymentResponse = await fetch("/api/payment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method_id: paymentMethod,
          amount: finalPrice,
          purpose: `Course: ${course.title}`,
          purchase_type: "course",
          course_id: course._id,
          customer_account_number: paymentDetails.accountNumber,
          transaction_id: paymentDetails.transactionId,
          additional_info: {
            course_title: course.title,
            course_slug: course.slug.current,
            coupon_code: appliedCoupon?.code,
          },
        }),
      });

      const paymentData = await paymentResponse.json();

      if (paymentData.success) {
        // Create pending enrollment
        const enrollResponse = await fetch("/api/education/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course._id,
            couponCode: appliedCoupon?.code,
            paymentTransactionId: paymentData.transaction.id,
            status: "pending",
          }),
        });

        const enrollData = await enrollResponse.json();

        if (enrollData.success) {
          // Redirect to success page
          router.push(`/education/enrollment/success?enrollmentId=${enrollData.enrollment.id}`);
        } else {
          throw new Error(enrollData.message || "Enrollment failed");
        }
      } else {
        throw new Error(paymentData.message || "Payment submission failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  const enrollDirectly = async () => {
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/education/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course._id,
          couponCode: appliedCoupon?.code || course.defaultCoupon,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/education/learn/${course.slug.current}`);
      } else {
        throw new Error(data.message || "Enrollment failed");
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during enrollment");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);

  return (
    <div className="container-custom">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Complete Your Enrollment
          </h1>
          <p className="text-white/70 text-lg">
            You&apos;re one step away from starting your learning journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Course Summary & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Summary */}
            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-4">Course Summary</h2>
              <div className="flex gap-4">
                {course.thumbnail?.asset?.url && (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={course.thumbnail.asset.url}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {course.title}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2">
                    {course.description}
                  </p>
                  {course.instructor && (
                    <p className="text-primary text-sm mt-2">
                      By {course.instructor.name}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Coupon Code */}
            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Tag className="w-6 h-6 text-primary" />
                Apply Coupon Code
              </h2>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                  <button
                    onClick={removeCoupon}
                    className="px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={applyCoupon}
                    disabled={isValidating || !couponCode.trim()}
                    className="px-6 py-3 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isValidating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Apply
                  </button>
                )}
              </div>

              {appliedCoupon && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-400 font-medium">
                      Coupon &quot;{appliedCoupon.code}&quot; applied successfully!
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      {appliedCoupon.discount_type === 'percentage' 
                        ? `${appliedCoupon.discount_value}% discount` 
                        : `$${appliedCoupon.discount_value} off`}
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Payment Method (only if not free) */}
            {finalPrice > 0 && (
              <GlassCard>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-primary" />
                  Select Payment Method
                </h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {method.provider === 'bkash' && <Smartphone className="w-8 h-8 text-pink-500" />}
                        {method.provider === 'nagad' && <Smartphone className="w-8 h-8 text-orange-500" />}
                        {method.provider === 'rocket' && <Smartphone className="w-8 h-8 text-purple-500" />}
                        {method.provider === 'bank' && <Building2 className="w-8 h-8 text-blue-500" />}
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-white capitalize">
                            {method.provider}
                          </p>
                          <p className="text-sm text-white/60">
                            {method.account_name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedMethod && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-400 font-medium mb-2">Payment Instructions:</p>
                      <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
                        <li>Send {course.currency} {finalPrice.toFixed(2)} to: <span className="font-mono text-white">{selectedMethod.account_number}</span></li>
                        <li>Account Name: {selectedMethod.account_name}</li>
                        <li>Copy the transaction ID</li>
                        <li>Enter details below</li>
                      </ol>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Your Account Number *</label>
                      <input
                        type="text"
                        value={paymentDetails.accountNumber}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="Enter your account number"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Transaction ID *</label>
                      <input
                        type="text"
                        value={paymentDetails.transactionId}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, transactionId: e.target.value }))}
                        placeholder="Enter transaction ID"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                )}
              </GlassCard>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <GlassCard className="sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white/80">
                  <span>Course Price</span>
                  <span>{course.currency} {course.price.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>- {course.currency} {discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-2xl font-bold text-white">
                    <span>Total</span>
                    <span>{course.currency} {finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <GradientButton
                  type="submit"
                  disabled={isProcessing || (finalPrice > 0 && !paymentMethod)}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : finalPrice === 0 ? (
                    'Enroll for Free'
                  ) : (
                    'Complete Payment'
                  )}
                </GradientButton>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium text-sm mb-1">
                      Secure Checkout
                    </p>
                    <p className="text-white/60 text-xs">
                      Your payment information is secure. All transactions are encrypted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <p className="text-white/60 text-xs">
                  By completing this purchase, you agree to our Terms of Service and acknowledge our Privacy Policy.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
