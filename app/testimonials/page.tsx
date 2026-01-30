"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Quote, Filter, Building2, Calendar, Loader2, User } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientButton } from "@/components/ui/GradientButton";
import { urlFor } from "@/lib/sanity/client";
import Image from "next/image";
import Link from "next/link";

interface SanityTestimonial {
  _id: string;
  clientName: string;
  email: string;
  clientCompany?: string;
  position?: string;
  clientImage?: {
    _type: string;
    asset: {
      _ref: string;
      _type: string;
    };
  };
  rating: number;
  testimonial: string;
  projectType?: string;
  status: string;
  featured?: boolean;
  verifiedBadge?: boolean;
  submittedAt: string;
  approvedAt?: string;
}

const projectTypes = [
  "All Projects",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Cloud Services",
  "AI Solutions",
  "Digital Marketing",
  "Branding",
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<SanityTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All Projects");

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await fetch("/api/testimonials?status=approved");
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials || []);
      } else {
        console.error("Failed to fetch testimonials: HTTP", response.status);
        setTestimonials([]);
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const filteredTestimonials = selectedFilter === "All Projects"
    ? testimonials
    : testimonials.filter((t) => t.projectType === selectedFilter);

  const featuredTestimonials = filteredTestimonials.filter((t) => t.featured);
  const regularTestimonials = filteredTestimonials.filter((t) => !t.featured);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          
          <div className="container-custom relative z-10">
            <ScrollReveal animation="fade-up">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="text-white">Client </span>
                  <span className="text-gradient">Testimonials</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70">
                  Hear from clients who trusted us to bring their vision to life
                </p>
              </div>
            </ScrollReveal>

            {/* Filter */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="mt-12 max-w-4xl mx-auto">
                <GlassCard className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Filter className="w-5 h-5 text-white/50 shrink-0" />
                    {projectTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedFilter(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                          selectedFilter === type
                            ? "bg-primary text-white border-primary shadow-glow-sm"
                            : "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-primary/50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <section className="py-20">
            <div className="container-custom">
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-white/60">Loading testimonials...</p>
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && filteredTestimonials.length === 0 && (
          <section className="py-20">
            <div className="container-custom">
              <GlassCard className="p-12 text-center">
                <Quote className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-xl text-white/60 mb-2">No testimonials found</p>
                <p className="text-white/40">
                  {selectedFilter !== "All Projects" 
                    ? `No testimonials in the "${selectedFilter}" category yet.`
                    : "Be the first to share your experience!"}
                </p>
              </GlassCard>
            </div>
          </section>
        )}

        {/* Featured Testimonials */}
        {!loading && featuredTestimonials.length > 0 && (
          <section className="py-12 md:py-20">
            <div className="container-custom">
              <ScrollReveal animation="fade-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12">
                  Featured Reviews
                </h2>
              </ScrollReveal>

              <div className="space-y-8">
                {featuredTestimonials.map((testimonial, index) => (
                  <ScrollReveal key={testimonial._id} animation="fade-up" delay={index * 100}>
                    <GlassCard hover className="group p-6 md:p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Client Info */}
                        <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left">
                          {testimonial.clientImage ? (
                            <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
                              <Image
                                src={urlFor(testimonial.clientImage).width(96).height(96).url()}
                                alt={testimonial.clientName}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                              <User className="w-12 h-12 text-primary/50" />
                            </div>
                          )}
                          <h3 className="text-xl font-bold text-white mb-1">
                            {testimonial.clientName}
                          </h3>
                          {testimonial.position && (
                            <p className="text-primary text-sm font-medium mb-2">
                              {testimonial.position}
                            </p>
                          )}
                          {testimonial.clientCompany && (
                            <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                              <Building2 className="w-4 h-4" />
                              <span>{testimonial.clientCompany}</span>
                            </div>
                          )}
                          {testimonial.approvedAt && (
                            <div className="flex items-center gap-2 text-white/50 text-xs">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(testimonial.approvedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Testimonial Content */}
                        <div className="lg:col-span-9">
                          <div className="flex items-start gap-4 mb-4">
                            <Quote className="w-10 h-10 text-primary shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                {renderStars(testimonial.rating)}
                                {testimonial.projectType && (
                                  <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                                    {testimonial.projectType}
                                  </span>
                                )}
                              </div>
                              <p className="text-lg text-white/80 leading-relaxed">
                                {testimonial.testimonial}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Testimonials Grid */}
        {!loading && regularTestimonials.length > 0 && (
          <section className="py-12 md:py-20">
            <div className="container-custom">
              <ScrollReveal animation="fade-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12">
                  More Client Reviews
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularTestimonials.map((testimonial, index) => (
                  <ScrollReveal key={testimonial._id} animation="fade-up" delay={index * 100}>
                    <GlassCard hover className="group p-6 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {testimonial.clientImage ? (
                          <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
                            <Image
                              src={urlFor(testimonial.clientImage).width(64).height(64).url()}
                              alt={testimonial.clientName}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                            <User className="w-8 h-8 text-primary/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-1 truncate">
                            {testimonial.clientName}
                          </h3>
                          {testimonial.position && (
                            <p className="text-primary text-sm font-medium mb-2 truncate">
                              {testimonial.position}
                            </p>
                          )}
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>

                      {/* Company */}
                      {testimonial.clientCompany && (
                        <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                          <Building2 className="w-4 h-4" />
                          <span className="truncate">{testimonial.clientCompany}</span>
                        </div>
                      )}

                      {/* Testimonial */}
                      <div className="flex-1 mb-4">
                        <Quote className="w-8 h-8 text-primary/50 mb-2" />
                        <p className="text-white/70 text-sm leading-relaxed">
                          {testimonial.testimonial}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        {testimonial.projectType && (
                          <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                            {testimonial.projectType}
                          </span>
                        )}
                        {testimonial.approvedAt && (
                          <div className="flex items-center gap-1 text-white/50 text-xs">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(testimonial.approvedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Stats Section */}
        {!loading && testimonials.length > 0 && (
          <section className="py-20 md:py-32">
            <div className="container-custom">
              <ScrollReveal animation="fade-up">
                <GlassCard gradient className="p-8 md:p-16">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Client Satisfaction
                    </h2>
                    <p className="text-lg text-white/70">
                      Numbers that speak for themselves
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                      { label: "Happy Clients", value: `${testimonials.length}+` },
                      { 
                        label: "5-Star Reviews", 
                        value: `${Math.round((testimonials.filter(t => t.rating === 5).length / testimonials.length) * 100)}%` 
                      },
                      { 
                        label: "Avg Rating", 
                        value: `${(testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)}★` 
                      },
                      { label: "Projects Delivered", value: `${testimonials.length * 5}+` },
                    ].map((stat, index) => (
                      <ScrollReveal key={stat.label} animation="fade-up" delay={index * 100}>
                        <div className="text-center">
                          <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                            {stat.value}
                          </div>
                          <div className="text-white/70 text-sm md:text-base">
                            {stat.label}
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container-custom">
            <ScrollReveal animation="scale-in">
              <GlassCard className="p-8 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Join Our Success Stories?
                </h2>
                <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                  Let&apos;s create something amazing together and add your testimonial to our wall of success
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/meeting">
                    <GradientButton variant="primary" size="lg">
                      Start Your Project
                    </GradientButton>
                  </Link>
                  <Link href="/portfolio">
                    <GradientButton variant="outline" size="lg">
                      View Our Work
                    </GradientButton>
                  </Link>
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
