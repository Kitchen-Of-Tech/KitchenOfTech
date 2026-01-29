"use client";

import { useState, useEffect, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';
import { urlFor } from '@/lib/sanity/client';
import Image from 'next/image';

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
  status: string;
  featured?: boolean;
  verifiedBadge?: boolean;
  submittedAt: string;
  approvedAt?: string;
}

interface ApprovedTestimonialsProps {
  limit?: number;
  showNavigation?: boolean;
  variant?: 'carousel' | 'grid';
}

export default function ApprovedTestimonials({ 
  limit, 
  showNavigation = true,
  variant = 'carousel' 
}: ApprovedTestimonialsProps) {
  const [testimonials, setTestimonials] = useState<SanityTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchApprovedTestimonials = useCallback(async () => {
    try {
      const url = `/api/testimonials?status=approved${limit ? `&limit=${limit}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchApprovedTestimonials();
  }, [fetchApprovedTestimonials]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'
            }`}
          />
        ))}
      </div>
    );
  };

  const TestimonialCard = ({ testimonial }: { testimonial: SanityTestimonial }) => (
    <div className="glass rounded-2xl p-8 border border-white/10 h-full flex flex-col">
      {/* Quote Icon */}
      <div className="mb-6">
        <Quote className="w-12 h-12 text-primary/40" />
      </div>

      {/* Rating */}
      <div className="mb-4">
        {renderStars(testimonial.rating)}
      </div>

      {/* Message */}
      <p className="text-white/90 text-lg leading-relaxed mb-6 flex-grow italic">
        &quot;{testimonial.testimonial}&quot;
      </p>

      {/* Author Info with Image */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center gap-4">
          {/* Client Image */}
          {testimonial.clientImage ? (
            <Image
              src={urlFor(testimonial.clientImage).width(64).height(64).url()}
              alt={testimonial.clientName}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-8 h-8 text-primary/50" />
            </div>
          )}
          
          <div className="min-w-0">
            <h4 className="text-white font-semibold text-lg mb-1 truncate">{testimonial.clientName}</h4>
            {(testimonial.position || testimonial.clientCompany) && (
              <p className="text-white/60 text-sm truncate">
                {testimonial.position}
                {testimonial.position && testimonial.clientCompany && ' at '}
                {testimonial.clientCompany}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-white/60 mt-4">Loading testimonials...</p>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 border border-white/10 border-dashed text-center">
        <Star className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <p className="text-white/40 text-lg">No testimonials yet</p>
        <p className="text-white/30 text-sm mt-2">Be the first to share your experience!</p>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial._id} testimonial={testimonial} />
        ))}
      </div>
    );
  }

  // Carousel variant
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial._id} className="w-full flex-shrink-0 px-4 md:px-8">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {showNavigation && testimonials.length > 1 && (
        <>
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center text-white hover:border-primary/50 transition-all hover:scale-110"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center text-white hover:border-primary/50 transition-all hover:scale-110"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary w-8'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
