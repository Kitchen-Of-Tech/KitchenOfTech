"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import ApprovedTestimonials from "@/components/testimonials/ApprovedTestimonials";

export function TestimonialsSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-transparent to-transparent" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="text-white">Client </span>
              <span className="text-gradient-secondary">Testimonials</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Don&apos;t just take our word for it - hear what our clients have to say
            </p>
          </div>
        </ScrollReveal>

        {/* Testimonials Carousel */}
        <ScrollReveal animation="scale-in" delay={200}>
          <div className="max-w-4xl mx-auto">
            <ApprovedTestimonials variant="carousel" limit={10} showNavigation={true} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
