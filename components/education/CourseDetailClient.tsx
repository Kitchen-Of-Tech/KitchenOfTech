"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Play, Star, Clock, BookOpen, Users, Award, CheckCircle, 
  ChevronDown, ChevronRight, FileText, Video, Target, 
  Globe, BarChart, Share2, Heart, Download,
  Lock, Unlock, Gift
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PortableText } from "@portabletext/react";
import { CourseReviews } from "./CourseReviews";
import type { Course, Module } from "@/types/education";

interface CourseDetailClientProps {
  course: Course;
}

export default function CourseDetailClient({ course }: CourseDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "instructor" | "reviews">("overview");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(course.price);
  const [discount, setDiscount] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | undefined>();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is enrolled
  useEffect(() => {
    checkEnrollment();
  }, []);

  const checkEnrollment = async () => {
    try {
      const response = await fetch(`/api/education/enrollments?courseId=${course._id}`);
      if (response.ok) {
        const data = await response.json();
        setIsEnrolled(data.isEnrolled);
        if (data.isEnrolled && data.enrollment) {
          setEnrollmentId(data.enrollment.id);
          setIsCompleted(!!data.enrollment.completed_at);
        }
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsValidating(true);
    try {
      const response = await fetch("/api/education/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, courseId: course._id }),
      });

      const data = await response.json();
      if (data.valid) {
        setDiscountedPrice(data.finalPrice);
        setDiscount(data.discountAmount);
      } else {
        alert(data.message || "Invalid coupon code");
      }
    } catch (error) {
      alert("Error validating coupon");
    } finally {
      setIsValidating(false);
    }
  };

  const handleEnroll = async () => {
    if (discountedPrice === 0) {
      // Free course or 100% discount
      enrollInCourse();
    } else {
      // Redirect to payment
      window.location.href = `/education/checkout?courseId=${course._id}&coupon=${couponCode}`;
    }
  };

  const enrollInCourse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/education/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          courseId: course._id,
          couponCode: couponCode || course.defaultCoupon,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsEnrolled(true);
        window.location.href = `/education/learn/${course.slug.current}`;
      } else {
        alert(data.message || "Enrollment failed");
      }
    } catch (error) {
      alert("Error enrolling in course");
    } finally {
      setIsLoading(false);
    }
  };

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalDuration = course.modules.reduce((sum, m) => 
    sum + m.lessons.reduce((s, l) => s + l.duration, 0), 0
  );
  const hasDiscount = course.compareAtPrice && course.compareAtPrice > course.price;

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Course Info */}
            <div className="lg:col-span-2">
              <ScrollReveal animation="fade-up">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                  <Link href="/education" className="hover:text-primary transition-colors">
                    Courses
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-white/90">{course.title}</span>
                </div>

                {/* Category & Level */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
                    {course.category.replace("-", " ").toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-white/90 text-sm font-medium rounded-full">
                    {course.level.toUpperCase()}
                  </span>
                  {course.isFree && (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                      FREE
                    </span>
                  )}
                  {course.featured && (
                    <span className="px-3 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full">
                      ⭐ FEATURED
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  {course.title}
                </h1>

                {/* Subtitle */}
                {course.subtitle && (
                  <p className="text-xl text-white/70 mb-6">{course.subtitle}</p>
                )}

                {/* Description */}
                <p className="text-lg text-white/80 mb-6">{course.description}</p>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  {course.averageRating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(course.averageRating!)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-white/20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-semibold">
                        {course.averageRating.toFixed(1)}
                      </span>
                      <span className="text-white/60">
                        ({course.totalReviews} reviews)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-white/70">
                    <Users className="w-5 h-5" />
                    <span>{course.totalEnrollments || 0} students</span>
                  </div>

                  <div className="flex items-center gap-2 text-white/70">
                    <Clock className="w-5 h-5" />
                    <span>{Math.round(totalDuration / 60)} hours</span>
                  </div>

                  <div className="flex items-center gap-2 text-white/70">
                    <BookOpen className="w-5 h-5" />
                    <span>{totalLessons} lessons</span>
                  </div>

                  <div className="flex items-center gap-2 text-white/70">
                    <Globe className="w-5 h-5" />
                    <span>{course.language}</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  {course.instructor.profileImage && (
                    <Image
                      src={course.instructor.profileImage}
                      alt={course.instructor.name}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <div className="text-sm text-white/60 mb-1">Instructor</div>
                    <div className="text-lg font-semibold text-white">
                      {course.instructor.name}
                    </div>
                    {course.instructor.expertise && (
                      <div className="flex gap-2 mt-1">
                        {course.instructor.expertise.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="text-xs px-2 py-1 bg-primary/20 text-primary rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Enrollment Card */}
            <div className="lg:col-span-1">
              <ScrollReveal animation="fade-up" delay={100}>
                <div className="sticky top-24">
                  <GlassCard className="overflow-hidden">
                    {/* Course Thumbnail/Video */}
                    <div className="relative aspect-video">
                      {course.promoVideo ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYouTubeId(course.promoVideo)}`}
                          title="Course Preview"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <Image
                          src={course.thumbnail.asset.url}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="p-6">
                      {/* Price */}
                      <div className="mb-6">
                        {course.isFree || discountedPrice === 0 ? (
                          <div className="text-4xl font-bold text-green-400">FREE</div>
                        ) : (
                          <div className="flex items-baseline gap-3">
                            <div className="text-4xl font-bold text-primary">
                              ${discountedPrice}
                            </div>
                            {(hasDiscount || discount > 0) && (
                              <div className="text-xl text-white/50 line-through">
                                ${course.compareAtPrice || course.price}
                              </div>
                            )}
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="mt-2 text-sm text-green-400">
                            You save ${discount} ({Math.round((discount / course.price) * 100)}% off)
                          </div>
                        )}
                      </div>

                      {/* Coupon Input */}
                      {!course.isFree && !showCouponInput && discount === 0 && (
                        <button
                          onClick={() => setShowCouponInput(true)}
                          className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                        >
                          <Gift className="w-5 h-5" />
                          Have a coupon code?
                        </button>
                      )}

                      {showCouponInput && (
                        <div className="mb-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-primary/50"
                            />
                            <button
                              onClick={handleApplyCoupon}
                              disabled={isValidating}
                              className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isValidating ? "..." : "Apply"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Enroll Button */}
                      {isEnrolled ? (
                        <Link href={`/education/learn/${course.slug.current}`}>
                          <GradientButton variant="primary" size="lg" className="w-full mb-4">
                            <Play className="w-5 h-5 mr-2" />
                            Continue Learning
                          </GradientButton>
                        </Link>
                      ) : (
                        <GradientButton
                          variant="primary"
                          size="lg"
                          className="w-full mb-4"
                          onClick={handleEnroll}
                          disabled={isLoading}
                        >
                          {isLoading ? "Enrolling..." : discountedPrice === 0 ? "Enroll for Free" : "Enroll Now"}
                        </GradientButton>
                      )}

                      {/* Course Includes */}
                      <div className="space-y-3 mb-6">
                        <div className="text-sm font-semibold text-white/90 mb-3">
                          This course includes:
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/70">
                          <Video className="w-5 h-5 text-primary" />
                          <span>{Math.round(totalDuration / 60)} hours on-demand video</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/70">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <span>{totalLessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/70">
                          <Download className="w-5 h-5 text-primary" />
                          <span>Downloadable resources</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/70">
                          <Award className="w-5 h-5 text-primary" />
                          <span>Certificate of completion</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/70">
                          <Clock className="w-5 h-5 text-primary" />
                          <span>Lifetime access</span>
                        </div>
                      </div>

                      {/* Share Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors flex items-center justify-center gap-2">
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm">Share</span>
                        </button>
                        <button className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors flex items-center justify-center gap-2">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">Wishlist</span>
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="container-custom">
        <div className="border-b border-white/10 mb-8">
          <div className="flex gap-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "curriculum", label: "Curriculum" },
              { id: "instructor", label: "Instructor" },
              { id: "reviews", label: "Reviews" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-2 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <OverviewTab course={course} />
            )}
            {activeTab === "curriculum" && (
              <CurriculumTab 
                modules={course.modules} 
                expandedModules={expandedModules}
                toggleModule={toggleModule}
                isEnrolled={isEnrolled}
              />
            )}
            {activeTab === "instructor" && (
              <InstructorTab instructor={course.instructor} />
            )}
            {activeTab === "reviews" && (
              <CourseReviews 
                courseId={course._id} 
                userEnrollmentId={enrollmentId}
                isCompleted={isCompleted}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CourseInfoSidebar course={course} />
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper function to extract YouTube ID
function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : "";
}

// Overview Tab Component
function OverviewTab({ course }: { course: Course }) {
  return (
    <div className="space-y-8">
      {/* What You'll Learn */}
      <ScrollReveal animation="fade-up">
        <GlassCard className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            What You&apos;ll Learn
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {course.learningOutcomes.map((outcome, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-white/80">{outcome}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </ScrollReveal>

      {/* Course Description */}
      <ScrollReveal animation="fade-up" delay={100}>
        <GlassCard className="p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Course Description</h3>
          <div className="prose prose-invert max-w-none">
            <PortableText value={course.fullDescription} />
          </div>
        </GlassCard>
      </ScrollReveal>

      {/* Requirements */}
      {course.requirements && course.requirements.length > 0 && (
        <ScrollReveal animation="fade-up" delay={200}>
          <GlassCard className="p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Requirements</h3>
            <ul className="space-y-3">
              {course.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3 text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </ScrollReveal>
      )}

      {/* Target Audience */}
      {course.targetAudience && course.targetAudience.length > 0 && (
        <ScrollReveal animation="fade-up" delay={300}>
          <GlassCard className="p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Who This Course Is For</h3>
            <ul className="space-y-3">
              {course.targetAudience.map((audience, index) => (
                <li key={index} className="flex items-start gap-3 text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{audience}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </ScrollReveal>
      )}
    </div>
  );
}

// Curriculum Tab Component
function CurriculumTab({ 
  modules, 
  expandedModules, 
  toggleModule,
  isEnrolled 
}: { 
  modules: Module[]; 
  expandedModules: Set<string>; 
  toggleModule: (id: string) => void;
  isEnrolled: boolean;
}) {
  return (
    <div className="space-y-4">
      {modules.map((module, index) => {
        const isExpanded = expandedModules.has(module._id);
        const moduleDuration = module.lessons.reduce((sum, l) => sum + l.duration, 0);

        return (
          <ScrollReveal key={module._id} animation="fade-up" delay={index * 50}>
            <GlassCard className="overflow-hidden">
              <button
                onClick={() => toggleModule(module._id)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">{module.order}</span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {module.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{module.lessons.length} lessons</span>
                      <span>{Math.round(moduleDuration)} min</span>
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-white/60" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-white/60" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-white/10">
                  {/* Lessons */}
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson._id}
                      className="p-4 border-b border-white/5 last:border-b-0 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Play className="w-4 h-4 text-primary" />
                        <div>
                          <div className="text-white/90">{lesson.title}</div>
                          <div className="text-sm text-white/60">
                            {lesson.duration} min
                          </div>
                        </div>
                      </div>
                      {lesson.isFree ? (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                          <Unlock className="w-3 h-3 inline mr-1" />
                          Preview
                        </span>
                      ) : !isEnrolled ? (
                        <Lock className="w-4 h-4 text-white/40" />
                      ) : null}
                    </div>
                  ))}

                  {/* Quiz */}
                  {module.quiz && (
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-primary/5">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-primary" />
                        <div>
                          <div className="text-white/90">{module.quiz.title}</div>
                          <div className="text-sm text-white/60">
                            {module.quiz.questions.length} questions • {module.quiz.passingScore}% to pass
                          </div>
                        </div>
                      </div>
                      {!isEnrolled && <Lock className="w-4 h-4 text-white/40" />}
                    </div>
                  )}

                  {/* Assignment */}
                  {module.assignment && (
                    <div className="p-4 flex items-center justify-between bg-secondary/5">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-secondary" />
                        <div>
                          <div className="text-white/90">{module.assignment.title}</div>
                          <div className="text-sm text-white/60">
                            Assignment • Max Score: {module.assignment.maxScore}
                          </div>
                        </div>
                      </div>
                      {!isEnrolled && <Lock className="w-4 h-4 text-white/40" />}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </ScrollReveal>
        );
      })}
    </div>
  );
}

// Instructor Tab Component
function InstructorTab({ instructor }: { instructor: Course["instructor"] }) {
  return (
    <ScrollReveal animation="fade-up">
      <GlassCard className="p-8">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {instructor.profileImage && (
            <Image
              src={instructor.profileImage}
              alt={instructor.name}
              width={120}
              height={120}
              className="rounded-full"
            />
          )}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{instructor.name}</h3>
            {instructor.bio && (
              <p className="text-white/70 mb-4">{instructor.bio}</p>
            )}
            {instructor.expertise && (
              <div className="flex flex-wrap gap-2">
                {instructor.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {instructor.socialLinks && (
          <div className="flex gap-4 pt-6 border-t border-white/10">
            {instructor.socialLinks.linkedin && (
              <a
                href={instructor.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-primary transition-colors"
              >
                LinkedIn
              </a>
            )}
            {instructor.socialLinks.twitter && (
              <a
                href={instructor.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-primary transition-colors"
              >
                Twitter
              </a>
            )}
            {instructor.socialLinks.github && (
              <a
                href={instructor.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-primary transition-colors"
              >
                GitHub
              </a>
            )}
          </div>
        )}
      </GlassCard>
    </ScrollReveal>
  );
}

// Course Info Sidebar
function CourseInfoSidebar({ course }: { course: Course }) {
  return (
    <div className="space-y-6">
      {/* Skills You'll Gain */}
      {course.skills && course.skills.length > 0 && (
        <ScrollReveal animation="fade-up">
          <GlassCard className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Skills You&apos;ll Gain</h4>
            <div className="flex flex-wrap gap-2">
              {course.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 text-sm rounded-lg transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </GlassCard>
        </ScrollReveal>
      )}

      {/* Course Stats */}
      <ScrollReveal animation="fade-up" delay={100}>
        <GlassCard className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Course Details</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Level</span>
              <span className="text-white font-medium">{course.level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Language</span>
              <span className="text-white font-medium">{course.language}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Students</span>
              <span className="text-white font-medium">{course.totalEnrollments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Category</span>
              <span className="text-white font-medium">
                {course.category.replace("-", " ")}
              </span>
            </div>
          </div>
        </GlassCard>
      </ScrollReveal>
    </div>
  );
}
