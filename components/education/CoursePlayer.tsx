"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ChevronLeft, ChevronRight, ChevronDown, CheckCircle, 
  Circle, Play, FileText, BookOpen, Download,
  Menu, X, Clock, Award, BarChart
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { PortableText } from "@portabletext/react";
import { QuizInterface } from "./QuizInterface";
import { AssignmentInterface } from "./AssignmentInterface";
import type { 
  Course, 
  CourseEnrollment, 
  LessonProgress, 
  QuizAttempt, 
  AssignmentSubmission,
  Lesson,
  Module,
  Quiz,
  Assignment
} from "@/types/education";

interface CoursePlayerProps {
  course: Course;
  enrollment: CourseEnrollment;
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  assignments: AssignmentSubmission[];
}

type ContentMode = "lesson" | "quiz" | "assignment";

export default function CoursePlayer({
  course,
  enrollment,
  lessonProgress,
  quizAttempts,
  assignments,
}: CoursePlayerProps) {
  const [contentMode, setContentMode] = useState<ContentMode>("lesson");
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "resources">("overview");
  const [videoProgress, setVideoProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Helper function to find lesson by ID
  const findLessonById = useCallback((lessonId: string) => {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find(l => l._id === lessonId);
      if (lesson) {
        return { lesson, module: mod };
      }
    }
    return null;
  }, [course.modules]);

  // Initialize with first incomplete lesson or first lesson
  useEffect(() => {
    if (course.modules.length > 0) {
      // Find last accessed lesson or first lesson
      if (enrollment.last_accessed_lesson) {
        const lesson = findLessonById(enrollment.last_accessed_lesson);
        if (lesson) {
          setCurrentLesson(lesson.lesson);
          setCurrentModule(lesson.module);
          return;
        }
      }

      // Otherwise start with first lesson
      const firstModule = course.modules[0];
      const firstLesson = firstModule.lessons[0];
      setCurrentLesson(firstLesson);
      setCurrentModule(firstModule);
    }
  }, [course, enrollment, findLessonById]);

  // Load lesson progress
  useEffect(() => {
    if (currentLesson) {
      const progress = lessonProgress.find(p => p.lesson_id === currentLesson._id);
      if (progress) {
        setVideoProgress(progress.video_progress);
        setIsCompleted(progress.completed);
        setTimeSpent(progress.time_spent);
      } else {
        setVideoProgress(0);
        setIsCompleted(false);
        setTimeSpent(0);
      }
    }
  }, [currentLesson, lessonProgress]);

  // Time tracking
  useEffect(() => {
    if (currentLesson) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [currentLesson]);

  // Save progress periodically
  useEffect(() => {
    if (!currentLesson) return;

    const saveProgress = async () => {
      try {
        await fetch("/api/education/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollmentId: enrollment.id,
            lessonId: currentLesson._id,
            videoProgress,
            timeSpent,
            completed: isCompleted,
          }),
        });
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    };

    const interval = setInterval(saveProgress, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [currentLesson, enrollment.id, videoProgress, timeSpent, isCompleted]);

  const handleMarkComplete = async () => {
    if (!currentLesson) return;

    setIsCompleted(true);
    setVideoProgress(100);

    try {
      await fetch("/api/education/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
          lessonId: currentLesson._id,
          videoProgress: 100,
          timeSpent,
          completed: true,
        }),
      });

      // Auto-advance to next lesson
      setTimeout(() => {
        handleNextLesson();
      }, 1000);
    } catch (error) {
      console.error("Error marking complete:", error);
    }
  };

  const handlePreviousLesson = () => {
    if (!currentModule || !currentLesson) return;

    const currentModuleIndex = course.modules.findIndex(m => m._id === currentModule._id);
    const currentLessonIndex = currentModule.lessons.findIndex(l => l._id === currentLesson._id);

    if (currentLessonIndex > 0) {
      // Previous lesson in same module
      setCurrentLesson(currentModule.lessons[currentLessonIndex - 1]);
    } else if (currentModuleIndex > 0) {
      // Last lesson of previous module
      const prevModule = course.modules[currentModuleIndex - 1];
      setCurrentModule(prevModule);
      setCurrentLesson(prevModule.lessons[prevModule.lessons.length - 1]);
    }
  };

  const handleNextLesson = () => {
    if (!currentModule || !currentLesson) return;

    const currentModuleIndex = course.modules.findIndex(m => m._id === currentModule._id);
    const currentLessonIndex = currentModule.lessons.findIndex(l => l._id === currentLesson._id);

    if (currentLessonIndex < currentModule.lessons.length - 1) {
      // Next lesson in same module
      setCurrentLesson(currentModule.lessons[currentLessonIndex + 1]);
    } else if (currentModuleIndex < course.modules.length - 1) {
      // First lesson of next module
      const nextModule = course.modules[currentModuleIndex + 1];
      setCurrentModule(nextModule);
      setCurrentLesson(nextModule.lessons[0]);
    }
  };

  const hasPrevious = () => {
    if (!currentModule || !currentLesson) return false;
    const moduleIndex = course.modules.findIndex(m => m._id === currentModule._id);
    const lessonIndex = currentModule.lessons.findIndex(l => l._id === currentLesson._id);
    return moduleIndex > 0 || lessonIndex > 0;
  };

  const hasNext = () => {
    if (!currentModule || !currentLesson) return false;
    const moduleIndex = course.modules.findIndex(m => m._id === currentModule._id);
    const lessonIndex = currentModule.lessons.findIndex(l => l._id === currentLesson._id);
    return (
      lessonIndex < currentModule.lessons.length - 1 ||
      moduleIndex < course.modules.length - 1
    );
  };

  const handleQuizComplete = () => {
    setContentMode("lesson");
    // Optionally advance to next lesson or module
  };

  const handleAssignmentComplete = () => {
    setContentMode("lesson");
    // Refresh page to show updated submission
    window.location.reload();
  };

  // Render quiz interface if in quiz mode
  if (contentMode === "quiz" && currentQuiz) {
    const moduleQuizAttempts = quizAttempts.filter(a => a.quiz_id === currentQuiz._id);
    return (
      <div className="pt-20">
        <QuizInterface
          quiz={currentQuiz}
          enrollmentId={enrollment.id}
          previousAttempts={moduleQuizAttempts}
          onComplete={handleQuizComplete}
        />
      </div>
    );
  }

  // Render assignment interface if in assignment mode
  if (contentMode === "assignment" && currentAssignment) {
    const existingSubmission = assignments.find(a => a.assignment_id === currentAssignment._id);
    return (
      <div className="pt-20">
        <AssignmentInterface
          assignment={currentAssignment}
          enrollmentId={enrollment.id}
          existingSubmission={existingSubmission}
          onComplete={handleAssignmentComplete}
        />
      </div>
    );
  }

  if (!currentLesson || !currentModule) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Loading course...</div>
      </div>
    );
  }

  const videoId = currentLesson.videoUrl?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];

  return (
    <div className="flex h-screen pt-20">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all ${showSidebar ? "mr-96" : "mr-0"}`}>
        {/* Video Player */}
        <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
          {videoId ? (
            <iframe
              ref={videoRef}
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`}
              title={currentLesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/70">No video available</div>
            </div>
          )}

          {/* Progress Indicator */}
          {videoProgress > 0 && videoProgress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Video Controls Bar */}
        <div className="bg-dark-light border-b border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreviousLesson}
                disabled={!hasPrevious()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              <div>
                <h2 className="text-xl font-bold text-white">{currentLesson.title}</h2>
                <p className="text-sm text-white/60">
                  Module {currentModule.order}: {currentModule.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isCompleted && (
                <GradientButton
                  variant="primary"
                  onClick={handleMarkComplete}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Complete
                </GradientButton>
              )}

              {isCompleted && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  Completed
                </div>
              )}

              <button
                onClick={handleNextLesson}
                disabled={!hasNext()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors lg:hidden"
              >
                {showSidebar ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(timeSpent / 60)} min watched</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              <span>{Math.round(enrollment.progress)}% complete</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>{lessonProgress.filter(p => p.completed).length} / {course.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-dark-light border-b border-white/10">
          <div className="flex gap-6 px-4">
            {(["overview", "notes", "resources"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-medium transition-colors relative ${
                  activeTab === tab
                    ? "text-primary"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="max-w-4xl">
              <h3 className="text-2xl font-bold text-white mb-4">About this lesson</h3>
              {currentLesson.description && (
                <p className="text-white/80 mb-6">{currentLesson.description}</p>
              )}

              {currentLesson.notes && (
                <div className="prose prose-invert max-w-none">
                  <PortableText value={currentLesson.notes} />
                </div>
              )}

              {currentLesson.transcript && (
                <div className="mt-8">
                  <h4 className="text-xl font-semibold text-white mb-4">Transcript</h4>
                  <div className="p-4 bg-white/5 rounded-lg text-white/70 text-sm whitespace-pre-wrap">
                    {currentLesson.transcript}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="max-w-4xl">
              <h3 className="text-2xl font-bold text-white mb-4">My Notes</h3>
              <textarea
                placeholder="Take notes while watching..."
                className="w-full h-96 p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-primary/50"
              />
              <GradientButton variant="primary" className="mt-4">
                Save Notes
              </GradientButton>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="max-w-4xl">
              <h3 className="text-2xl font-bold text-white mb-4">Downloadable Resources</h3>
              {currentLesson.resources && currentLesson.resources.length > 0 ? (
                <div className="space-y-3">
                  {currentLesson.resources.map((resource, index) => (
                    <GlassCard key={index} className="p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <div className="text-white font-medium">{resource.title}</div>
                          {resource.description && (
                            <div className="text-sm text-white/60">{resource.description}</div>
                          )}
                        </div>
                      </div>
                      <a
                        href={resource.url || resource.file?.asset?.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <p className="text-white/60">No resources available for this lesson.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed right-0 top-20 bottom-0 w-96 bg-dark border-l border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Course Content</h3>
            <div className="mt-2 text-sm text-white/60">
              {Math.round(enrollment.progress)}% Complete
            </div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                style={{ width: `${enrollment.progress}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {course.modules.map((module) => (
              <CourseModule
                key={module._id}
                module={module}
                currentLesson={currentLesson}
                lessonProgress={lessonProgress}
                quizAttempts={quizAttempts}
                assignments={assignments}
                onSelectLesson={(lesson) => {
                  setContentMode("lesson");
                  setCurrentLesson(lesson);
                  setCurrentModule(module);
                }}
                onSelectQuiz={(quiz, mod) => {
                  setContentMode("quiz");
                  setCurrentQuiz(quiz);
                  setCurrentModule(mod);
                }}
                onSelectAssignment={(assignment, mod) => {
                  setContentMode("assignment");
                  setCurrentAssignment(assignment);
                  setCurrentModule(mod);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Course Module Component
interface CourseModuleProps {
  module: Module;
  currentLesson: Lesson;
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  assignments: AssignmentSubmission[];
  onSelectLesson: (lesson: Lesson) => void;
  onSelectQuiz: (quiz: Quiz, module: Module) => void;
  onSelectAssignment: (assignment: Assignment, module: Module) => void;
}

function CourseModule({
  module,
  currentLesson,
  lessonProgress,
  quizAttempts,
  assignments,
  onSelectLesson,
  onSelectQuiz,
  onSelectAssignment,
}: CourseModuleProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const moduleProgress =
    (module.lessons.filter(l => isLessonCompleted(l._id)).length / module.lessons.length) * 100;

  const hasQuizPassed = module.quiz
    ? quizAttempts.some(a => a.quiz_id === module.quiz!._id && a.passed)
    : true;

  const hasAssignmentSubmitted = module.assignment
    ? assignments.some(a => a.assignment_id === module.assignment!._id)
    : true;

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-sm font-bold">{module.order}</span>
          </div>
          <div className="text-left">
            <div className="text-white font-medium">{module.title}</div>
            <div className="text-xs text-white/60">
              {module.lessons.length} lessons • {Math.round(moduleProgress)}% complete
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-white/60 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="pb-2">
          {/* Lessons */}
          {module.lessons.map((lesson) => {
            const isActive = currentLesson._id === lesson._id;
            const isCompleted = isLessonCompleted(lesson._id);

            return (
              <button
                key={lesson._id}
                onClick={() => onSelectLesson(lesson)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                  isActive ? "bg-primary/10 border-l-2 border-primary" : ""
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-white/40 flex-shrink-0" />
                )}
                <Play className="w-4 h-4 text-white/60 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className={`text-sm ${isActive ? "text-primary font-medium" : "text-white/90"}`}>
                    {lesson.title}
                  </div>
                  <div className="text-xs text-white/60">{lesson.duration} min</div>
                </div>
              </button>
            );
          })}

          {/* Quiz */}
          {module.quiz && (
            <button
              onClick={() => onSelectQuiz(module.quiz!, module)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-l-2 ${
                hasQuizPassed ? "border-green-400" : "border-white/20"
              }`}
            >
              {hasQuizPassed ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-white/40 flex-shrink-0" />
              )}
              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="text-sm text-white/90">{module.quiz.title}</div>
                <div className="text-xs text-white/60">
                  {module.quiz.questions.length} questions
                </div>
              </div>
            </button>
          )}

          {/* Assignment */}
          {module.assignment && (
            <button
              onClick={() => onSelectAssignment(module.assignment!, module)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-l-2 ${
                hasAssignmentSubmitted ? "border-green-400" : "border-white/20"
              }`}
            >
              {hasAssignmentSubmitted ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-white/40 flex-shrink-0" />
              )}
              <BookOpen className="w-4 h-4 text-secondary flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="text-sm text-white/90">{module.assignment.title}</div>
                <div className="text-xs text-white/60">Assignment</div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
