"use client";

import { useState } from "react";
import { 
  Award, Download, ExternalLink, CheckCircle, 
  XCircle, Loader2, Trophy, Calendar, User,
  FileText
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Certificate } from "@/types/education";

interface CertificateCardProps {
  enrollmentId: string;
  courseName: string;
  instructorName?: string;
}

export function CertificateCard({ 
  enrollmentId, 
  courseName,
  instructorName 
}: CertificateCardProps) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [requirements, setRequirements] = useState<{
    videosCompleted: boolean;
    quizzesPassed: boolean;
    assignmentsCompleted: boolean;
  } | null>(null);
  const [progress, setProgress] = useState<{
    completedLessons: number;
    totalLessons: number;
    totalQuizzes: number;
    passedQuizzes: number;
    totalAssignments: number;
    completedAssignments: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const checkCertificateStatus = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/education/certificate/check?enrollmentId=${enrollmentId}`);
      
      if (!response.ok) {
        throw new Error("Failed to check certificate status");
      }

      const data = await response.json();

      if (data.hasCertificate) {
        setCertificate(data.certificate);
      } else {
        setIsEligible(data.eligible);
        setRequirements(data.requirements);
        setProgress(data.progress);
      }
    } catch (error) {
      console.error("Error checking certificate:", error);
      setError("Failed to check certificate status");
    } finally {
      setIsLoading(false);
    }
  };

  const generateCertificate = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/education/certificate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requirements) {
          setIsEligible(false);
          setRequirements(data.requirements);
          throw new Error(data.message || "Not eligible for certificate");
        }
        throw new Error(data.error || "Failed to generate certificate");
      }

      setCertificate(data.certificate);
    } catch (error) {
      console.error("Error generating certificate:", error);
      setError(error instanceof Error ? error.message : "Failed to generate certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificate) return;
    
    // Open certificate PDF in new tab
    window.open(`/api/education/certificate/pdf?certificateId=${certificate.certificate_id}`, "_blank");
  };

  const verifyCertificate = () => {
    if (!certificate) return;
    window.open(`/education/verify-certificate/${certificate.certificate_id}`, "_blank");
  };

  // Initial state - show button to check
  if (!certificate && !requirements && !isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">Certificate of Completion</h3>
            <p className="text-white/60 text-sm">
              Complete all requirements to earn your certificate
            </p>
          </div>
          <button
            onClick={checkCertificateStatus}
            className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-colors"
          >
            Check Status
          </button>
        </div>
      </GlassCard>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center gap-3 text-white/60">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Checking certificate status...</span>
        </div>
      </GlassCard>
    );
  }

  // Certificate exists - show certificate details
  if (certificate) {
    return (
      <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Certificate Earned! 🎉</h3>
                <p className="text-white/80 text-sm">
                  Congratulations on completing {courseName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <FileText className="w-4 h-4" />
                <span>ID: {certificate.certificate_id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Calendar className="w-4 h-4" />
                <span>
                  Issued: {new Date(certificate.issue_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <User className="w-4 h-4" />
                <span>{certificate.student_name}</span>
              </div>
              {instructorName && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <User className="w-4 h-4" />
                  <span>Instructor: {instructorName}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadCertificate}
                className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={verifyCertificate}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Verify Certificate
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Show eligibility status and requirements
  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isEligible 
            ? "bg-green-500/20" 
            : "bg-yellow-500/20"
        }`}>
          <Award className={`w-6 h-6 ${
            isEligible ? "text-green-400" : "text-yellow-400"
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">Certificate Status</h3>
          {isEligible ? (
            <p className="text-green-400 text-sm mb-4">
              ✓ You&apos;re eligible for a certificate! Click below to generate it.
            </p>
          ) : (
            <p className="text-yellow-400 text-sm mb-4">
              Complete all requirements below to earn your certificate
            </p>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-3 mb-6">
        <h4 className="text-white font-medium text-sm mb-3">Requirements:</h4>
        
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          requirements?.videosCompleted 
            ? "bg-green-500/10 border border-green-500/30" 
            : "bg-white/5 border border-white/10"
        }`}>
          {requirements?.videosCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-white/40 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="text-white text-sm">Complete all video lessons</div>
            {progress && (
              <div className="text-xs text-white/60 mt-1">
                {progress.completedLessons}/{progress.totalLessons} lessons completed
              </div>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          requirements?.quizzesPassed 
            ? "bg-green-500/10 border border-green-500/30" 
            : "bg-white/5 border border-white/10"
        }`}>
          {requirements?.quizzesPassed ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-white/40 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="text-white text-sm">Pass all quizzes (80% minimum)</div>
            {progress && (
              <div className="text-xs text-white/60 mt-1">
                {progress.passedQuizzes}/{progress.totalQuizzes} quizzes passed
              </div>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          requirements?.assignmentsCompleted 
            ? "bg-green-500/10 border border-green-500/30" 
            : "bg-white/5 border border-white/10"
        }`}>
          {requirements?.assignmentsCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-white/40 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="text-white text-sm">Submit all assignments</div>
            {progress && (
              <div className="text-xs text-white/60 mt-1">
                {progress.completedAssignments}/{progress.totalAssignments} assignments completed
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        {isEligible && (
          <button
            onClick={generateCertificate}
            disabled={isGenerating}
            className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                Generate Certificate
              </>
            )}
          </button>
        )}
        <button
          onClick={checkCertificateStatus}
          disabled={isLoading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
        >
          Refresh Status
        </button>
      </div>
    </GlassCard>
  );
}
