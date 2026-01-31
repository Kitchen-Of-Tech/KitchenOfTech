"use client";

import { useState } from "react";
import { Star, ThumbsUp, User, Calendar, MoreVertical } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  helpful_count: number;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

interface CourseReviewsListProps {
  courseId: string;
  currentUserId?: string;
}

export function CourseReviewsList({ courseId, currentUserId }: CourseReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">("recent");
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/education/reviews?courseId=${courseId}&sortBy=${sortBy}`
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchReviews();
  });

  const handleHelpful = async (reviewId: string) => {
    if (helpfulReviews.has(reviewId)) {
      return; // Already marked as helpful
    }

    try {
      const response = await fetch("/api/education/reviews/helpful", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });

      if (response.ok) {
        setHelpfulReviews(prev => new Set([...prev, reviewId]));
        setReviews(prev =>
          prev.map(review =>
            review.id === reviewId
              ? { ...review, helpful_count: review.helpful_count + 1 }
              : review
          )
        );
      }
    } catch (error) {
      console.error("Error marking review as helpful:", error);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
      : 0,
  }));

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-white/60">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading reviews...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <GlassCard className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-white/30"
                  }`}
                />
              ))}
            </div>
            <p className="text-white/60 text-sm">
              Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-white/80 text-sm">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-white/60 text-sm w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          Student Reviews ({reviews.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSortBy("recent");
              fetchReviews();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "recent"
                ? "bg-primary text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Most Recent
          </button>
          <button
            onClick={() => {
              setSortBy("helpful");
              fetchReviews();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "helpful"
                ? "bg-primary text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Most Helpful
          </button>
          <button
            onClick={() => {
              setSortBy("rating");
              fetchReviews();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "rating"
                ? "bg-primary text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Highest Rating
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Star className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No reviews yet. Be the first to review this course!</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <GlassCard key={review.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  {review.profiles.avatar_url ? (
                    <img
                      src={review.profiles.avatar_url}
                      alt={review.profiles.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-primary" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold">
                        {review.profiles.full_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-white/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-white/60 text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    {currentUserId === review.user_id && (
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-white/60" />
                      </button>
                    )}
                  </div>

                  <p className="text-white/80 leading-relaxed mb-4">
                    {review.review_text}
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleHelpful(review.id)}
                      disabled={helpfulReviews.has(review.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        helpfulReviews.has(review.id)
                          ? "bg-primary/20 text-primary cursor-not-allowed"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful_count})
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
