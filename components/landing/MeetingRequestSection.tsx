"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Mail, User, Building, MessageSquare, Send } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { submitMeetingRequest } from "@/lib/supabase/client";

const meetingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  preferred_date: z.string().optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

export function MeetingRequestSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
  });

  const onSubmit = async (data: MeetingFormData) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await submitMeetingRequest(data);
      setSubmitStatus("success");
      reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="text-white">Let's </span>
              <span className="text-gradient">Connect</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Ready to transform your digital presence? Schedule a meeting with our team
            </p>
          </div>
        </ScrollReveal>

        {/* Form */}
        <ScrollReveal animation="scale-in" delay={200}>
          <div className="max-w-3xl mx-auto">
            <GlassCard className="p-6 md:p-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="flex items-center gap-2 text-white font-medium">
                      <User className="w-4 h-4 text-primary" />
                      Full Name *
                    </label>
                    <input
                      {...register("name")}
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center gap-2 text-white font-medium">
                      <Mail className="w-4 h-4 text-primary" />
                      Email Address *
                    </label>
                    <input
                      {...register("email")}
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Field */}
                  <div className="space-y-2">
                    <label htmlFor="company" className="flex items-center gap-2 text-white font-medium">
                      <Building className="w-4 h-4 text-primary" />
                      Company
                    </label>
                    <input
                      {...register("company")}
                      id="company"
                      type="text"
                      placeholder="Your Company"
                      className="w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  {/* Preferred Date Field */}
                  <div className="space-y-2">
                    <label htmlFor="preferred_date" className="flex items-center gap-2 text-white font-medium">
                      <Calendar className="w-4 h-4 text-primary" />
                      Preferred Date
                    </label>
                    <input
                      {...register("preferred_date")}
                      id="preferred_date"
                      type="date"
                      className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <label htmlFor="message" className="flex items-center gap-2 text-white font-medium">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Message *
                  </label>
                  <textarea
                    {...register("message")}
                    id="message"
                    rows={5}
                    placeholder="Tell us about your project..."
                    className="w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  />
                  {errors.message && (
                    <p className="text-red-400 text-sm">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <GradientButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Schedule Meeting
                      </>
                    )}
                  </GradientButton>
                </div>

                {/* Status Messages */}
                {submitStatus === "success" && (
                  <div className="p-4 glass rounded-xl border border-green-500/50 bg-green-500/10">
                    <p className="text-green-400 text-center font-medium">
                      ✓ Thank you! We'll get back to you soon.
                    </p>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="p-4 glass rounded-xl border border-red-500/50 bg-red-500/10">
                    <p className="text-red-400 text-center font-medium">
                      ✗ Something went wrong. Please try again.
                    </p>
                  </div>
                )}
              </form>
            </GlassCard>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
