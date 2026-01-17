"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// Demo testimonials
const demoTestimonials = [
  {
    id: 1,
    clientName: "Sarah Johnson",
    clientCompany: "TechVision Inc.",
    rating: 5,
    testimonial:
      "Kitchen of Tech transformed our digital presence completely. Their expertise in web development and design is unmatched. We saw a 300% increase in user engagement!",
    projectType: "Web Development",
  },
  {
    id: 2,
    clientName: "Michael Chen",
    clientCompany: "InnovateX",
    rating: 5,
    testimonial:
      "Outstanding service from start to finish. The team delivered our mobile app ahead of schedule and exceeded all expectations. Highly recommended!",
    projectType: "Mobile App Development",
  },
  {
    id: 3,
    clientName: "Emily Rodriguez",
    clientCompany: "DesignHub",
    rating: 5,
    testimonial:
      "The UI/UX design they created for our platform is absolutely stunning. Our users love it, and we've seen significant improvement in conversion rates.",
    projectType: "UI/UX Design",
  },
  {
    id: 4,
    clientName: "David Thompson",
    clientCompany: "MarketGrow",
    rating: 5,
    testimonial:
      "Their digital marketing strategies helped us reach our target audience effectively. ROI increased by 250% in just 3 months!",
    projectType: "Digital Marketing",
  },
  {
    id: 5,
    clientName: "Lisa Wang",
    clientCompany: "CloudTech Solutions",
    rating: 5,
    testimonial:
      "Professional, responsive, and incredibly talented. They built our cloud infrastructure with precision and care. Best decision we made!",
    projectType: "Cloud Services",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % demoTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + demoTestimonials.length) % demoTestimonials.length
    );
  };

  const currentTestimonial = demoTestimonials[currentIndex];

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
              Don't just take our word for it - hear what our clients have to say
            </p>
          </div>
        </ScrollReveal>

        {/* Testimonial Card */}
        <ScrollReveal animation="scale-in" delay={200}>
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8 md:p-12 relative">
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-20">
                <Quote className="w-16 h-16 text-primary" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 italic">
                "{currentTestimonial.testimonial}"
              </blockquote>

              {/* Client Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl">
                  {currentTestimonial.clientName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">
                    {currentTestimonial.clientName}
                  </h4>
                  <p className="text-white/60 text-sm">
                    {currentTestimonial.clientCompany}
                  </p>
                  <p className="text-primary text-xs mt-1">
                    {currentTestimonial.projectType}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 rounded-full glass-hover flex items-center justify-center text-white hover:text-primary transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="flex gap-2">
                  {demoTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? "bg-primary w-8"
                          : "bg-white/30 hover:bg-white/50"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 rounded-full glass-hover flex items-center justify-center text-white hover:text-primary transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
