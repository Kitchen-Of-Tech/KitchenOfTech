"use client";

import { useState } from "react";
import { 
  CheckCircle, Upload, ExternalLink, AlertCircle, 
  FileText, Link as LinkIcon
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PortableText } from "@portabletext/react";
import type { Assignment, AssignmentSubmission } from "@/types/education";

interface AssignmentInterfaceProps {
  assignment: Assignment;
  enrollmentId: string;
  existingSubmission?: AssignmentSubmission;
  onComplete: () => void;
}

export function AssignmentInterface({ 
  assignment, 
  enrollmentId, 
  existingSubmission,
  onComplete 
}: AssignmentInterfaceProps) {
  const [postUrl, setPostUrl] = useState(existingSubmission?.submission_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validateFacebookUrl = (url: string): boolean => {
    // Check if it's a valid Facebook URL
    const fbPatterns = [
      /^https?:\/\/(www\.)?facebook\.com\/.+/,
      /^https?:\/\/fb\.com\/.+/,
      /^https?:\/\/(www\.)?facebook\.com\/groups\/.+/,
    ];
    
    return fbPatterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = async () => {
    setError("");

    // Validate URL
    if (!postUrl.trim()) {
      setError("Please enter the Facebook post URL");
      return;
    }

    if (!validateFacebookUrl(postUrl)) {
      setError("Please enter a valid Facebook post URL");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/education/assignment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          assignmentId: assignment._id,
          submissionUrl: postUrl,
          autoComplete: assignment.autoComplete,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit assignment");
      }

      onComplete();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setError(error instanceof Error ? error.message : "Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <GlassCard className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{assignment.title}</h2>
              <p className="text-white/60">Complete this assignment to progress</p>
            </div>
          </div>

          {assignment.description && (
            <div className="prose prose-invert max-w-none">
              <PortableText value={assignment.description} />
            </div>
          )}
        </div>

        {/* Instructions */}
        {assignment.instructions && (
          <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Instructions
            </h3>
            <div className="prose prose-invert max-w-none text-white/80">
              {typeof assignment.instructions === 'string' ? (
                <p>{assignment.instructions}</p>
              ) : (
                <PortableText value={assignment.instructions} />
              )}
            </div>
          </div>
        )}

        {/* Facebook Group Info */}
        {assignment.facebookGroupUrl && (
          <div className="mb-8 p-6 bg-primary/10 rounded-xl border border-primary/30">
            <h3 className="text-lg font-semibold text-white mb-3">Facebook Group</h3>
            <p className="text-white/80 mb-4">
              Post your assignment in the course Facebook group and submit the link below.
            </p>
            <a
              href={assignment.facebookGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Facebook Group
            </a>
          </div>
        )}

        {/* Submission Status */}
        {existingSubmission && (
          <div className={`mb-8 p-6 rounded-xl border ${
            existingSubmission.completed
              ? "bg-green-500/10 border-green-500/30"
              : "bg-blue-500/10 border-blue-500/30"
          }`}>
            <div className="flex items-start gap-3">
              <CheckCircle className={`w-6 h-6 flex-shrink-0 mt-1 ${
                existingSubmission.completed ? "text-green-400" : "text-blue-400"
              }`} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {existingSubmission.completed ? "Assignment Completed" : "Assignment Submitted"}
                </h3>
                <p className="text-white/80 mb-3">
                  {existingSubmission.completed
                    ? "Your assignment has been reviewed and marked as complete."
                    : "Your assignment has been submitted and is pending review."}
                </p>
                <a
                  href={existingSubmission.submission_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  View Your Submission
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Submission Form */}
        {!existingSubmission && (
          <div className="space-y-6">
            <div>
              <label htmlFor="postUrl" className="block text-white font-medium mb-2">
                Facebook Post URL
              </label>
              <div className="relative">
                <input
                  id="postUrl"
                  type="url"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="https://www.facebook.com/groups/..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary transition-colors"
                  disabled={isSubmitting}
                />
                <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              </div>
              <p className="mt-2 text-sm text-white/60">
                Paste the link to your Facebook post where you completed the assignment
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !postUrl.trim()}
              className="w-full px-6 py-4 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5" />
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </button>

            {assignment.autoComplete && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-400 text-sm flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  This assignment will be automatically marked as complete upon submission.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Resubmit Option */}
        {existingSubmission && !existingSubmission.completed && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-white font-semibold mb-4">Update Submission</h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="url"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="https://www.facebook.com/groups/..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary transition-colors"
                  disabled={isSubmitting}
                />
                <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !postUrl.trim() || postUrl === existingSubmission.submission_url}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update Submission"}
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
