"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Users, TrendingUp, Clock, Star,
  CheckCircle, AlertCircle, FileText, MessageSquare,
  Calendar, DollarSign, Eye, Edit, BarChart2
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface InstructorDashboardClientProps {
  instructorId: string;
  user: User;
}

interface CourseStats {
  id: string;
  title: string;
  totalEnrollments: number;
  activeStudents: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
  pendingAssignments: number;
  recentActivity: number;
}

interface PendingAssignment {
  id: string;
  studentName: string;
  courseName: string;
  assignmentTitle: string;
  submittedAt: string;
  postUrl: string;
}

interface RecentActivity {
  id: string;
  type: "enrollment" | "completion" | "review" | "question";
  studentName: string;
  courseName: string;
  timestamp: string;
  details: string;
}

export default function InstructorDashboardClient({
  instructorId,
  user,
}: InstructorDashboardClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Overall stats
  const totalStudents = courses.reduce((sum, course) => sum + course.totalEnrollments, 0);
  const totalRevenue = courses.reduce((sum, course) => sum + course.totalRevenue, 0);
  const averageRating = courses.length > 0
    ? courses.reduce((sum, course) => sum + course.averageRating, 0) / courses.length
    : 0;
  const totalPendingAssignments = courses.reduce(
    (sum, course) => sum + course.pendingAssignments,
    0
  );

  useEffect(() => {
    fetchDashboardData();
  }, [instructorId]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // In production, fetch from your API
      // For now, using mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      setCourses([
        {
          id: "1",
          title: "Complete Web Development Bootcamp",
          totalEnrollments: 1250,
          activeStudents: 856,
          completionRate: 68,
          averageRating: 4.8,
          totalRevenue: 62500,
          pendingAssignments: 23,
          recentActivity: 156,
        },
        {
          id: "2",
          title: "Advanced React & Next.js",
          totalEnrollments: 890,
          activeStudents: 645,
          completionRate: 72,
          averageRating: 4.9,
          totalRevenue: 44500,
          pendingAssignments: 18,
          recentActivity: 124,
        },
        {
          id: "3",
          title: "Python for Data Science",
          totalEnrollments: 1540,
          activeStudents: 1120,
          completionRate: 65,
          averageRating: 4.7,
          totalRevenue: 77000,
          pendingAssignments: 31,
          recentActivity: 203,
        },
      ]);

      setPendingAssignments([
        {
          id: "1",
          studentName: "John Doe",
          courseName: "Complete Web Development",
          assignmentTitle: "Build a Portfolio Website",
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          postUrl: "https://facebook.com/groups/...",
        },
        {
          id: "2",
          studentName: "Jane Smith",
          courseName: "Advanced React",
          assignmentTitle: "E-commerce Dashboard",
          submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          postUrl: "https://facebook.com/groups/...",
        },
        {
          id: "3",
          studentName: "Mike Johnson",
          courseName: "Python for Data Science",
          assignmentTitle: "Data Visualization Project",
          submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          postUrl: "https://facebook.com/groups/...",
        },
      ]);

      setRecentActivity([
        {
          id: "1",
          type: "enrollment",
          studentName: "Sarah Wilson",
          courseName: "Complete Web Development",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          details: "Enrolled in the course",
        },
        {
          id: "2",
          type: "completion",
          studentName: "Tom Brown",
          courseName: "Advanced React",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          details: "Completed the course with 95% score",
        },
        {
          id: "3",
          type: "review",
          studentName: "Emma Davis",
          courseName: "Python for Data Science",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          details: "Left a 5-star review",
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "enrollment":
        return <Users className="w-4 h-4 text-blue-400" />;
      case "completion":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "review":
        return <Star className="w-4 h-4 text-yellow-400" />;
      case "question":
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-20 pb-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-white/60">
              Here&apos;s what&apos;s happening with your courses today
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {courses.length}
              </div>
              <div className="text-white/60 text-sm">Active Courses</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {totalStudents.toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">Total Students</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {averageRating.toFixed(1)}
              </div>
              <div className="text-white/60 text-sm">Average Rating</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                ${totalRevenue.toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">Total Revenue</div>
            </GlassCard>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Courses & Assignments */}
            <div className="lg:col-span-2 space-y-8">
              {/* Your Courses */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Courses</h2>
                  <button
                    onClick={() => router.push("/education/instructor/courses/new")}
                    className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium transition-colors text-sm"
                  >
                    + New Course
                  </button>
                </div>

                <div className="space-y-4">
                  {courses.map((course) => (
                    <GlassCard key={course.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {course.totalEnrollments} students
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {course.averageRating.toFixed(1)}
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-4 h-4 text-orange-400" />
                              {course.pendingAssignments} pending
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/education/instructor/courses/${course.id}/analytics`)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Analytics"
                          >
                            <BarChart2 className="w-5 h-5 text-white/60" />
                          </button>
                          <button
                            onClick={() => router.push(`/education/instructor/courses/${course.id}/edit`)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5 text-white/60" />
                          </button>
                          <button
                            onClick={() => router.push(`/education/${course.id}`)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5 text-white/60" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-white/60 text-xs mb-1">Completion</div>
                          <div className="text-white font-semibold">
                            {course.completionRate}%
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-white/60 text-xs mb-1">Active</div>
                          <div className="text-white font-semibold">
                            {course.activeStudents}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-white/60 text-xs mb-1">Revenue</div>
                          <div className="text-white font-semibold">
                            ${course.totalRevenue.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-white/60 text-xs mb-1">Activity</div>
                          <div className="text-white font-semibold">
                            {course.recentActivity}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>

              {/* Pending Assignments */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Pending Assignments
                    <span className="ml-2 px-2 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-lg">
                      {totalPendingAssignments}
                    </span>
                  </h2>
                  <button
                    onClick={() => router.push("/education/instructor/assignments")}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-4">
                  {pendingAssignments.map((assignment) => (
                    <GlassCard key={assignment.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-5 h-5 text-white/40" />
                            <h3 className="text-white font-semibold">
                              {assignment.assignmentTitle}
                            </h3>
                          </div>
                          <p className="text-white/60 text-sm mb-3">
                            Submitted by <span className="text-white">{assignment.studentName}</span>{" "}
                            in <span className="text-white">{assignment.courseName}</span>
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-white/60">
                              <Clock className="w-4 h-4" />
                              {formatTimeAgo(assignment.submittedAt)}
                            </div>
                            <a
                              href={assignment.postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              View Post →
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // Handle approve
                              alert("Assignment approved!");
                            }}
                            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              // Handle reject
                              alert("Assignment rejected!");
                            }}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Activity & Quick Stats */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 pb-4 border-b border-white/10 last:border-0 last:pb-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium mb-1">
                            {activity.studentName}
                          </p>
                          <p className="text-white/60 text-xs mb-2">
                            {activity.details}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Calendar className="w-3 h-3" />
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                <GlassCard className="p-6">
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push("/education/instructor/courses/new")}
                      className="w-full px-4 py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" />
                      Create New Course
                    </button>
                    <button
                      onClick={() => router.push("/education/instructor/assignments")}
                      className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      Review Assignments
                    </button>
                    <button
                      onClick={() => router.push("/education/instructor/discussions")}
                      className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Answer Questions
                    </button>
                    <button
                      onClick={() => router.push("/education/instructor/analytics")}
                      className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      <BarChart2 className="w-5 h-5" />
                      View Analytics
                    </button>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
