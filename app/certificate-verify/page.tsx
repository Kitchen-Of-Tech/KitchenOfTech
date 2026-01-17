"use client";

import { useState } from "react";
import { Search, Award, CheckCircle, XCircle, Calendar, User, BookOpen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientButton } from "@/components/ui/GradientButton";

// Demo certificates database
const demoCertificates = [
  {
    certificateId: "KOT-2024-WD-001",
    studentName: "John Doe",
    courseName: "Advanced Web Development with React & Next.js",
    issueDate: "2024-01-15",
    validUntil: "2026-01-15",
    grade: "A+",
    instructor: "Sarah Chen",
    skills: ["React", "Next.js", "TypeScript", "Node.js"],
  },
  {
    certificateId: "KOT-2024-AI-002",
    studentName: "Jane Smith",
    courseName: "Machine Learning & AI Fundamentals",
    issueDate: "2024-01-10",
    validUntil: "2026-01-10",
    grade: "A",
    instructor: "David Park",
    skills: ["Python", "TensorFlow", "Machine Learning", "Data Science"],
  },
  {
    certificateId: "KOT-2024-UI-003",
    studentName: "Michael Brown",
    courseName: "UI/UX Design Mastery",
    issueDate: "2024-01-05",
    validUntil: "2026-01-05",
    grade: "A+",
    instructor: "Michael Rodriguez",
    skills: ["Figma", "UI Design", "UX Research", "Prototyping"],
  },
];

interface CertificateData {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  validUntil: string;
  grade: string;
  instructor: string;
  skills: string[];
}

export default function CertificateVerifyPage() {
  const [certificateId, setCertificateId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setVerificationStatus("idle");
    setCertificateData(null);

    // Simulate API call
    setTimeout(() => {
      const foundCertificate = demoCertificates.find(
        (cert) => cert.certificateId.toLowerCase() === certificateId.toLowerCase().trim()
      );

      if (foundCertificate) {
        setVerificationStatus("valid");
        setCertificateData(foundCertificate);
      } else {
        setVerificationStatus("invalid");
      }
      setIsLoading(false);
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-transparent to-transparent" />
          
          <div className="container-custom relative z-10">
            <ScrollReveal animation="fade-up">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <Award className="w-16 h-16 text-primary mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="text-white">Certificate </span>
                  <span className="text-gradient">Verification</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70">
                  Verify the authenticity of Kitchen of Tech certificates instantly
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Verification Form */}
        <section className="py-12 md:py-20">
          <div className="container-custom max-w-3xl">
            <ScrollReveal animation="fade-up">
              <GlassCard className="p-8 md:p-12">
                <form onSubmit={handleVerify} className="space-y-6">
                  <div>
                    <label htmlFor="certificateId" className="block text-white font-medium mb-3">
                      Certificate ID
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type="text"
                        id="certificateId"
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value)}
                        placeholder="Enter certificate ID (e.g., KOT-2024-WD-001)"
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    <p className="mt-2 text-sm text-white/50">
                      Certificate ID can be found on your certificate document
                    </p>
                  </div>

                  <GradientButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify Certificate"}
                  </GradientButton>
                </form>

                {/* Verification Result */}
                {verificationStatus === "valid" && certificateData && (
                  <div className="mt-8 animate-fade-up">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-400">Certificate Verified</h3>
                        <p className="text-white/70 text-sm">This certificate is authentic and valid</p>
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white/50 text-sm">
                            <User className="w-4 h-4" />
                            <span>Student Name</span>
                          </div>
                          <p className="text-white font-semibold">{certificateData.studentName}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white/50 text-sm">
                            <Award className="w-4 h-4" />
                            <span>Certificate ID</span>
                          </div>
                          <p className="text-white font-semibold font-mono">{certificateData.certificateId}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white/50 text-sm">
                            <BookOpen className="w-4 h-4" />
                            <span>Course Name</span>
                          </div>
                          <p className="text-white font-semibold">{certificateData.courseName}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white/50 text-sm">
                            <User className="w-4 h-4" />
                            <span>Instructor</span>
                          </div>
                          <p className="text-white font-semibold">{certificateData.instructor}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white/50 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>Issue Date</span>
                          </div>
                          <p className="text-white font-semibold">{formatDate(certificateData.issueDate)}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white/50 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>Valid Until</span>
                          </div>
                          <p className="text-white font-semibold">{formatDate(certificateData.validUntil)}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white/50 text-sm">
                            <Award className="w-4 h-4" />
                            <span>Grade</span>
                          </div>
                          <p className="text-white font-semibold">{certificateData.grade}</p>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-white/50 text-sm mb-3">Skills Covered</p>
                        <div className="flex flex-wrap gap-2">
                          {certificateData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {verificationStatus === "invalid" && (
                  <div className="mt-8 animate-fade-up">
                    <div className="flex items-center gap-3 p-6 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                        <XCircle className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-400 mb-1">Certificate Not Found</h3>
                        <p className="text-white/70 text-sm">
                          The certificate ID you entered could not be verified. Please check the ID and try again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            </ScrollReveal>

            {/* Sample Certificates */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="mt-12">
                <h3 className="text-xl font-bold text-white mb-6 text-center">
                  Try Sample Certificate IDs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {demoCertificates.map((cert) => (
                    <button
                      key={cert.certificateId}
                      onClick={() => setCertificateId(cert.certificateId)}
                      className="p-4 glass-hover rounded-xl text-left group"
                    >
                      <p className="text-primary font-mono text-sm mb-2 group-hover:text-primary-light transition-colors">
                        {cert.certificateId}
                      </p>
                      <p className="text-white/70 text-xs">{cert.courseName}</p>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-20 md:py-32">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScrollReveal animation="fade-up">
                <GlassCard className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Instant Verification</h3>
                  <p className="text-white/60 text-sm">
                    Verify certificates in seconds with our real-time verification system
                  </p>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={100}>
                <GlassCard className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">100% Authentic</h3>
                  <p className="text-white/60 text-sm">
                    All certificates are blockchain-verified for authenticity
                  </p>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={200}>
                <GlassCard className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Lifetime Access</h3>
                  <p className="text-white/60 text-sm">
                    Certificate records are maintained permanently in our database
                  </p>
                </GlassCard>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
