"use client";

import { useState } from "react";
import { Star, Send, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";

interface CourseReviewFormProps {
  courseId: string;
  enrollmentId: string;
  existingReview?: {
    id: string;
    rating: number;
    review_text: string;
  } | null;
  onReviewSubmitted?: () => void;
}

export function CourseReviewForm({
  courseId,
  enrollmentId,
  existingReview,
  onReviewSubmitted,
}: CourseReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (reviewText.trim().length < 10) {
      setError("Review must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/education/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          enrollmentId,
          rating,
          reviewText: reviewText.trim(),
          reviewId: existingReview?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      alert(existingReview ? "Review updated successfully!" : "Review submitted successfully!");
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        {existingReview ? "Update Your Review" : "Write a Review"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-white mb-2 font-medium">
            Rating *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= displayRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-white/30"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-white/80">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </span>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-white mb-2 font-medium">
            Your Review *
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
            placeholder="Share your experience with this course. What did you like? What could be improved?"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-white/60 text-xs">
              Minimum 10 characters required
            </p>
            <p className="text-white/60 text-xs">
              {reviewText.length}/1000
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <GradientButton
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {existingReview ? "Update Review" : "Submit Review"}
            </>
          )}
        </GradientButton>

        <p className="text-white/60 text-xs text-center">
          Your review will be visible to all students considering this course
        </p>
      </form>
    </GlassCard>
  );
}
