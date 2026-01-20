// =====================================================
// EDUCATION PLATFORM TYPES
// =====================================================

export interface Instructor {
  _id: string;
  _type: "instructor";
  name: string;
  slug: { current: string };
  email: string;
  bio?: string;
  profileImage?: {
    asset: {
      _ref: string;
      url: string;
    };
  };
  expertise?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  isActive: boolean;
  // Stats from Supabase
  rating?: number;
  totalStudents?: number;
  totalCourses?: number;
}

export interface QuizQuestion {
  question: string;
  questionType: "single" | "multiple" | "boolean";
  options?: string[];
  correctAnswer: string[];
  explanation?: string;
  points: number;
}

export interface Quiz {
  _id: string;
  _type: "quiz";
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  maxAttempts: number;
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  questions: QuizQuestion[];
}

export interface AssignmentResource {
  title: string;
  url: string;
  type: "Article" | "Video" | "Tool" | "Template" | "Other";
}

export interface Assignment {
  _id: string;
  _type: "assignment";
  title: string;
  description: any[]; // Portable Text
  instructions?: string;
  facebookGroupUrl: string;
  dueDate?: string;
  resources?: AssignmentResource[];
  maxScore: number;
  autoComplete: boolean;
}

export interface LessonResource {
  title: string;
  file?: {
    asset: {
      _ref: string;
      url: string;
    };
  };
  url?: string;
  description?: string;
}

export interface Lesson {
  _id: string;
  _type: "lesson";
  title: string;
  slug: { current: string };
  description?: string;
  videoUrl: string;
  videoId?: string;
  duration: number;
  order: number;
  isFree: boolean;
  transcript?: string;
  resources?: LessonResource[];
  notes?: any[]; // Portable Text
}

export interface Module {
  _id: string;
  _type: "module";
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  quiz?: Quiz;
  assignment?: Assignment;
}

export interface Course {
  _id: string;
  _type: "course";
  title: string;
  slug: { current: string };
  subtitle?: string;
  description: string;
  fullDescription: any[]; // Portable Text
  thumbnail: {
    asset: {
      _ref: string;
      url: string;
    };
  };
  promoVideo?: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced" | "all-levels";
  language: string;
  instructor: Instructor;
  modules: Module[];
  learningOutcomes: string[];
  requirements?: string[];
  targetAudience?: string[];
  skills?: string[];
  price: number;
  compareAtPrice?: number;
  currency: string;
  defaultCoupon?: string;
  isFree: boolean;
  status: "draft" | "published" | "archived";
  featured: boolean;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  totalDuration?: number;
  totalLessons?: number;
  totalEnrollments?: number;
  averageRating?: number;
  totalReviews?: number;
}

// =====================================================
// DATABASE TYPES (Supabase)
// =====================================================

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string;
  progress: number;
  status: "active" | "completed" | "expired" | "suspended";
  payment_amount: number;
  coupon_used?: string;
  last_accessed_lesson?: string;
  certificate_issued: boolean;
  certificate_id?: string;
}

export interface LessonProgress {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  completed: boolean;
  time_spent: number;
  video_progress: number;
  completed_at?: string;
  last_accessed: string;
  notes?: string;
}

export interface QuizAttempt {
  id: string;
  enrollment_id: string;
  quiz_id: string;
  attempt_number: number;
  answers: Record<string, any>;
  score: number;
  passed: boolean;
  time_taken?: number;
  submitted_at: string;
}

export interface AssignmentSubmission {
  id: string;
  enrollment_id: string;
  assignment_id: string;
  submission_url: string;
  submitted_at: string;
  completed: boolean;
  grade?: number;
  feedback?: string;
  graded_at?: string;
  graded_by?: string;
}

export interface CourseReview {
  id: string;
  enrollment_id: string;
  course_id: string;
  user_id: string;
  rating: number;
  review?: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  user_name?: string;
  user_avatar?: string;
}

export interface CourseDiscussion {
  id: string;
  course_id: string;
  lesson_id?: string;
  user_id: string;
  parent_id?: string;
  question: string;
  answer?: string;
  upvotes: number;
  is_instructor_answer: boolean;
  is_best_answer: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  user_name?: string;
  user_avatar?: string;
  replies?: CourseDiscussion[];
}

export interface Certificate {
  id: string;
  certificate_id: string;
  enrollment_id: string;
  user_id: string;
  course_id: string;
  student_name: string;
  issue_date: string;
  course_name?: string;
  instructor_name?: string;
  valid_until?: string;
  final_score?: number;
  skills?: string[];
  certificate_url?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses?: number;
  current_uses: number;
  valid_from: string;
  valid_until?: string;
  applicable_courses?: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InstructorProfile {
  id: string;
  user_id: string;
  bio?: string;
  expertise?: string[];
  rating: number;
  total_students: number;
  total_courses: number;
  social_links?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

// =====================================================
// UI COMPONENT TYPES
// =====================================================

export interface EnrollmentWithCourse extends CourseEnrollment {
  course?: Course;
  lessonProgress?: LessonProgress[];
  certificateData?: Certificate;
}

export interface CourseWithProgress extends Course {
  enrollment?: CourseEnrollment;
  progress?: number;
  isEnrolled: boolean;
  canContinue: boolean;
  nextLesson?: Lesson;
}

export interface ModuleWithProgress extends Module {
  progress: number;
  completed: boolean;
  lessonsCompleted: number;
  totalLessons: number;
  quizPassed?: boolean;
  assignmentSubmitted?: boolean;
}

export interface LessonWithProgress extends Lesson {
  progress?: LessonProgress;
  isCompleted: boolean;
  isAccessible: boolean;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface EnrollCourseRequest {
  courseId: string;
  couponCode?: string;
  paymentIntentId?: string;
}

export interface EnrollCourseResponse {
  success: boolean;
  enrollment?: CourseEnrollment;
  message: string;
  error?: string;
}

export interface ValidateCouponRequest {
  code: string;
  courseId: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  finalPrice: number;
  discountAmount: number;
  message?: string;
}

export interface SubmitQuizRequest {
  enrollmentId: string;
  quizId: string;
  answers: Record<string, any>;
  timeTaken?: number;
}

export interface SubmitQuizResponse {
  success: boolean;
  score: number;
  passed: boolean;
  attempt: QuizAttempt;
  correctAnswers?: Record<string, any>;
}

export interface SubmitAssignmentRequest {
  enrollmentId: string;
  assignmentId: string;
  facebookPostUrl: string;
}

export interface SubmitAssignmentResponse {
  success: boolean;
  submission?: AssignmentSubmission;
  message: string;
}

export interface UpdateProgressRequest {
  enrollmentId: string;
  lessonId: string;
  videoProgress: number;
  timeSpent: number;
  completed: boolean;
  notes?: string;
}

export interface UpdateProgressResponse {
  success: boolean;
  progress?: LessonProgress;
  enrollmentProgress?: number;
}

export interface GenerateCertificateRequest {
  enrollmentId: string;
}

export interface GenerateCertificateResponse {
  success: boolean;
  certificate?: Certificate;
  message: string;
  eligible: boolean;
  requirements?: {
    videosCompleted: boolean;
    quizzesPassed: boolean;
    assignmentsSubmitted: boolean;
  };
}
