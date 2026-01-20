"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, Award, Clock, TrendingUp, PlayCircle,
  CheckCircle, Calendar, Target, BarChart3, Trophy
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Certificate } from "@/types/education";

interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  last_accessed_at: string;
  progress: number;
  completed_at: string | null;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface StudentDashboardClientProps {
  enrollments: Enrollment[];
  certificates: Certificate[];
  user: User;
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  thumbnail?: { asset: { url: string } };
  instructor?: { name: string };
  category?: string;
}

export function StudentDashboardClient({ 
  enrollments, 
  certificates,
  user
}: StudentDashboardClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Record<string, CourseData>>({});

  useEffect(() => {
    // Fetch course details from Sanity
    const fetchCourses = async () => {
      try {
        const courseIds = enrollments.map(e => e.course_id);
        if (courseIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Note: In production, create an API endpoint to fetch courses by IDs
        // For now, we'll use placeholder data
        const mockCourses: Record<string, CourseData> = {};
        courseIds.forEach(id => {
          mockCourses[id] = {
            id,
            title: "Course Title",
            slug: "course-slug",
            category: "Development",
          };
        });
        
        setCourses(mockCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    if (enrollments.length > 0) {
      fetchCourses();
    }
  }, [enrollments]);

  const inProgressCourses = enrollments.filter(e => !e.completed_at && e.progress > 0);
  const completedCourses = enrollments.filter(e => e.completed_at);
  const notStartedCourses = enrollments.filter(e => !e.completed_at && e.progress === 0);

  const totalTimeSpent = enrollments.length * 45; // Mock calculation
  const averageProgress = enrollments.length > 0
    ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-white/60 text-lg">
          Continue your learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {enrollments.length}
          </div>
          <div className="text-white/60 text-sm">Enrolled Courses</div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {completedCourses.length}
          </div>
          <div className="text-white/60 text-sm">Completed Courses</div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {certificates.length}
          </div>
          <div className="text-white/60 text-sm">Certificates Earned</div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalTimeSpent}h
          </div>
          <div className="text-white/60 text-sm">Time Spent Learning</div>
        </GlassCard>
      </div>

      {/* Progress Overview */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="lg:col-span-2 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Learning Progress
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/80">Overall Progress</span>
                <span className="text-primary font-semibold">
                  {Math.round(averageProgress)}%
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                  style={{ width: `${averageProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-white mb-1">
                  {inProgressCourses.length}
                </div>
                <div className="text-white/60 text-xs">In Progress</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {completedCourses.length}
                </div>
                <div className="text-white/60 text-xs">Completed</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-white/60 mb-1">
                  {notStartedCourses.length}
                </div>
                <div className="text-white/60 text-xs">Not Started</div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            This Week
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <PlayCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">5 lessons</div>
                <div className="text-white/60 text-xs">Completed</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">2 quizzes</div>
                <div className="text-white/60 text-xs">Passed</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">12.5 hours</div>
                <div className="text-white/60 text-xs">Study Time</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Continue Learning */}
      {inProgressCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Continue Learning</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressCourses.slice(0, 3).map((enrollment) => {
              const course = courses[enrollment.course_id];
              return (
                <GlassCard key={enrollment.id} className="overflow-hidden hover:border-primary/50 transition-all">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white/60" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/20 px-2 py-1 rounded">
                        {course?.category || "Course"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {course?.title || "Loading..."}
                    </h3>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Progress</span>
                        <span className="text-primary font-semibold">
                          {Math.round(enrollment.progress)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/education/learn/${course?.slug || enrollment.course_id}`)}
                      className="w-full px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-colors"
                    >
                      Continue Learning
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Your Certificates
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <GlassCard 
                key={cert.id} 
                className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 hover:border-yellow-500/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold mb-1">
                      {cert.course_name || "Certificate"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Calendar className="w-3 h-3" />
                      {new Date(cert.issue_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-white/60 mb-4 font-mono">
                  ID: {cert.certificate_id}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`/api/education/certificate/pdf?certificateId=${cert.certificate_id}`, "_blank")}
                    className="flex-1 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => router.push(`/education/verify-certificate/${cert.certificate_id}`)}
                    className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* All Courses */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">All Courses</h2>
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const course = courses[enrollment.course_id];
            const isCompleted = !!enrollment.completed_at;

            return (
              <GlassCard key={enrollment.id} className="p-6 hover:border-primary/50 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-8 h-8 text-white/60" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {course?.title || "Loading..."}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {course?.instructor?.name || "Instructor"}
                        </p>
                      </div>
                      {isCompleted && (
                        <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6 mb-3">
                      <div className="flex-1 max-w-md">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/60">Progress</span>
                          <span className="text-primary font-semibold">
                            {Math.round(enrollment.progress)}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-sm text-white/60">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/education/learn/${course?.slug || enrollment.course_id}`)}
                      className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {enrollment.progress === 0 ? "Start Learning" : "Continue"}
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {enrollments.length === 0 && (
        <GlassCard className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Courses Yet</h3>
          <p className="text-white/60 mb-6">
            Start your learning journey by enrolling in a course
          </p>
          <button
            onClick={() => router.push("/education")}
            className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium transition-colors"
          >
            Browse Courses
          </button>
        </GlassCard>
      )}
    </div>
  );
}
