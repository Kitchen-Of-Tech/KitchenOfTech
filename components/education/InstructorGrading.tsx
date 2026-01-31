"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle, XCircle, Clock, ExternalLink, 
  MessageSquare, AlertCircle
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";

interface Submission {
  id: string;
  assignment_id: string;
  submission_url: string;
  submitted_at: string;
  status: string;
  grade_percentage: number | null;
  instructor_feedback: string | null;
  graded_at: string | null;
  course_enrollments: {
    course_id: string;
    user_id: string;
    profiles: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

interface InstructorGradingProps {
  courseId: string;
}

export function InstructorGrading({ courseId }: InstructorGradingProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [filter, setFilter] = useState<"submitted" | "graded" | "all">("submitted");

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/education/assignment/grade?courseId=${courseId}&status=${filter}`
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, filter]);

  const handleGrade = async () => {
    if (!selectedSubmission || !gradeValue) return;

    const grade = parseInt(gradeValue);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      alert("Please enter a valid grade between 0 and 100");
      return;
    }

    setIsGrading(true);

    try {
      const response = await fetch("/api/education/assignment/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          gradePercentage: grade,
          feedback: feedback.trim() || undefined,
        }),
      });

      if (response.ok) {
        alert(
          grade >= 70
            ? "Assignment graded successfully! Student passed."
            : "Assignment graded. Student needs to improve and resubmit."
        );
        setSelectedSubmission(null);
        setGradeValue("");
        setFeedback("");
        fetchSubmissions();
      } else {
        throw new Error("Failed to grade assignment");
      }
    } catch (error) {
      console.error("Error grading assignment:", error);
      alert("Failed to grade assignment. Please try again.");
    } finally {
      setIsGrading(false);
    }
  };

  const pendingCount = submissions.filter(s => s.status === "submitted").length;
  const gradedCount = submissions.filter(s => s.status === "graded").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Assignment Grading</h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("submitted")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "submitted"
                ? "bg-primary text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("graded")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "graded"
                ? "bg-primary text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Graded ({gradedCount})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-white/60">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading submissions...
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Clock className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No submissions found</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <GlassCard
              key={submission.id}
              className="p-6 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">
                      {submission.course_enrollments.profiles.full_name}
                    </h3>
                    {submission.status === "graded" ? (
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          (submission.grade_percentage || 0) >= 70
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {(submission.grade_percentage || 0) >= 70 ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {submission.grade_percentage}%
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </div>
                    )}
                  </div>

                  <p className="text-white/60 text-sm mb-3">
                    Submitted {new Date(submission.submitted_at).toLocaleString()}
                  </p>

                  <a
                    href={submission.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Facebook Post
                  </a>

                  {submission.instructor_feedback && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-white">
                          Instructor Feedback
                        </span>
                      </div>
                      <p className="text-white/80 text-sm">
                        {submission.instructor_feedback}
                      </p>
                    </div>
                  )}
                </div>

                {submission.status === "submitted" && (
                  <button
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setGradeValue("");
                      setFeedback("");
                    }}
                    className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Grade
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-white mb-4">
              Grade Assignment
            </h3>

            <div className="mb-4">
              <p className="text-white/80 mb-2">
                <strong>Student:</strong>{" "}
                {selectedSubmission.course_enrollments.profiles.full_name}
              </p>
              <a
                href={selectedSubmission.submission_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                View Submission
              </a>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white mb-2 font-medium">
                  Grade (0-100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                  placeholder="Enter grade (70% minimum to pass)"
                />
                <p className="text-white/60 text-xs mt-1">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Minimum 70% required to pass
                </p>
              </div>

              <div>
                <label className="block text-white mb-2 font-medium">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
                  placeholder="Provide feedback to the student..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <GradientButton
                onClick={handleGrade}
                disabled={isGrading || !gradeValue}
                className="flex-1"
              >
                {isGrading ? "Grading..." : "Submit Grade"}
              </GradientButton>
              <button
                onClick={() => setSelectedSubmission(null)}
                disabled={isGrading}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
