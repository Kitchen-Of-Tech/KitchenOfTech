"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Award, CheckCircle, Calendar, User, FileText,
  ExternalLink, Download, Shield, AlertCircle
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import QRCode from "qrcode";
import type { Certificate } from "@/types/education";

interface CertificateVerificationClientProps {
  certificate: Certificate & {
    course_name?: string;
  };
}

export function CertificateVerificationClient({ 
  certificate 
}: CertificateVerificationClientProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    // Generate QR code for verification URL
    const verificationUrl = `${window.location.origin}/education/verify-certificate/${certificate.certificate_id}`;
    
    QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: "#7c3aed",
        light: "#ffffff",
      },
    })
      .then(setQrCodeUrl)
      .catch(console.error);
  }, [certificate.certificate_id]);

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
          <Shield className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Certificate Verified</h1>
        <p className="text-white/60 text-lg">
          This certificate is authentic and has been verified by KitchenOfTech
        </p>
      </div>

      {/* Verification Status */}
      <GlassCard className="p-6 mb-8 bg-green-500/10 border-green-500/30">
        <div className="flex items-center gap-4">
          <CheckCircle className="w-12 h-12 text-green-400 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">
              Valid Certificate
            </h2>
            <p className="text-white/80">
              This certificate has been issued by KitchenOfTech and is valid.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Certificate Details */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Left Column - Details */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Certificate Details
            </h3>

            <div className="space-y-4">
              <div>
                <div className="text-white/60 text-sm mb-1">Certificate ID</div>
                <div className="text-white font-mono text-sm bg-white/5 px-3 py-2 rounded-lg">
                  {certificate.certificate_id}
                </div>
              </div>

              <div>
                <div className="text-white/60 text-sm mb-1">Student Name</div>
                <div className="text-white font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  {certificate.student_name}
                </div>
              </div>

              <div>
                <div className="text-white/60 text-sm mb-1">Course</div>
                <div className="text-white font-medium">
                  {certificate.course_name || "Course Name"}
                </div>
              </div>

              {certificate.credential_code && (
                <div>
                  <div className="text-white/60 text-sm mb-1">Credential Code</div>
                  <div className="text-white font-medium font-mono">
                    {certificate.credential_code}
                  </div>
                </div>
              )}

              {certificate.level && (
                <div>
                  <div className="text-white/60 text-sm mb-1">Level</div>
                  <div className="text-white font-medium">
                    {certificate.level}
                  </div>
                </div>
              )}

              <div>
                <div className="text-white/60 text-sm mb-1">Issue Date</div>
                <div className="text-white font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {new Date(certificate.issue_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              {certificate.valid_until && (
                <div>
                  <div className="text-white/60 text-sm mb-1">Valid Until</div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(certificate.valid_until).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              )}

              {certificate.grade !== undefined && certificate.grade !== null && (
                <div>
                  <div className="text-white/60 text-sm mb-1">Grade</div>
                  <div className="text-white font-medium">
                    {typeof certificate.grade === 'number' ? certificate.grade.toFixed(2) : certificate.grade}/100
                  </div>
                </div>
              )}

              {certificate.institution && (
                <div>
                  <div className="text-white/60 text-sm mb-1">Institution</div>
                  <div className="text-white font-medium">
                    {certificate.institution}
                  </div>
                </div>
              )}

              {certificate.instructor_notes && (
                <div>
                  <div className="text-white/60 text-sm mb-1">Instructor Notes</div>
                  <div className="text-white font-medium">
                    {certificate.instructor_notes}
                  </div>
                </div>
              )}

              {certificate.instructor_name && (
                <div>
                  <div className="text-white/60 text-sm mb-1">Instructor</div>
                  <div className="text-white font-medium">
                    {certificate.instructor_name}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Achievements
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white text-sm">
                  Completed all course materials
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white text-sm">
                  Passed all quizzes (80%+ score)
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white text-sm">
                  Submitted all assignments
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column - QR Code & Actions */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              Verification QR Code
            </h3>
            
            {qrCodeUrl ? (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl mb-4">
                  <Image 
                    src={qrCodeUrl} 
                    alt="Certificate QR Code" 
                    width={192}
                    height={192}
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-white/60 text-sm text-center">
                  Scan this QR code to verify certificate authenticity
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-white/40">Generating QR code...</div>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
            
            <div className="space-y-3">
              <a
                href={`/api/education/certificate/pdf?certificateId=${certificate.certificate_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Certificate PDF
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Verification link copied to clipboard!");
                }}
                className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Copy Verification Link
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-blue-500/10 border-blue-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">
                  About Certificate Verification
                </h4>
                <p className="text-blue-200 text-xs">
                  This page serves as proof that the certificate holder has successfully 
                  completed the course requirements and earned this credential from KitchenOfTech.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Footer Info */}
      <GlassCard className="p-6 text-center">
        <p className="text-white/60 text-sm">
          This certificate verification page is publicly accessible and can be shared with 
          employers, institutions, or anyone who needs to verify the authenticity of this credential.
        </p>
        <p className="text-white/40 text-xs mt-2">
          Issued by KitchenOfTech &copy; {new Date().getFullYear()}
        </p>
      </GlassCard>
    </div>
  );
}
