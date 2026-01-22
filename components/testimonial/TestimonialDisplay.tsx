"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, Quote } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Testimonial } from "@/types/auth";

interface TestimonialDisplayProps {
  limit?: number;
  showAll?: boolean;
}

export default function TestimonialDisplay({ limit, showAll = false }: TestimonialDisplayProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = useCallback(async () => {
    try {
      let url = "/api/testimonials";
      if (limit) {
        url += `?limit=${limit}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <Quote className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No testimonials yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${showAll ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
      {testimonials.map((testimonial) => (
        <GlassCard key={testimonial.id} className="p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {renderStars(testimonial.rating)}
                <span className="text-sm text-gray-400">
                  {testimonial.rating}.0
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white">
                {testimonial.name}
              </h3>
              {testimonial.position && testimonial.company && (
                <p className="text-sm text-gray-400">
                  {testimonial.position} at {testimonial.company}
                </p>
              )}
              {testimonial.position && !testimonial.company && (
                <p className="text-sm text-gray-400">{testimonial.position}</p>
              )}
              {!testimonial.position && testimonial.company && (
                <p className="text-sm text-gray-400">{testimonial.company}</p>
              )}
            </div>
            <Quote className="w-8 h-8 text-cyan-500/20 flex-shrink-0" />
          </div>

          <blockquote className="flex-1 text-gray-300 leading-relaxed mb-4">
            &ldquo;{testimonial.message}&rdquo;
          </blockquote>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs text-gray-500">
              {formatDate(testimonial.created_at)}
            </span>
            {testimonial.is_verified && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                Verified
              </span>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
