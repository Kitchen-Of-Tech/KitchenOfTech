"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle, XCircle, AlertCircle, RotateCcw, 
  ArrowRight, ArrowLeft, Trophy, Clock, Target
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Quiz, QuizAttempt } from "@/types/education";

interface QuizInterfaceProps {
  quiz: Quiz;
  enrollmentId: string;
  previousAttempts: QuizAttempt[];
  onComplete: () => void;
}

interface Answer {
  questionId: string;
  selectedOptions: string[];
}

export function QuizInterface({ 
  quiz, 
  enrollmentId, 
  previousAttempts,
  onComplete 
}: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
  } | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const questionId = currentQuestion._key || `q-${currentQuestionIndex}`;
  const currentAnswer = answers.find(a => a.questionId === questionId);
  const attemptNumber = previousAttempts.length + 1;
  const bestAttempt = previousAttempts.length > 0 
    ? previousAttempts.reduce((best, attempt) => 
        attempt.score > best.score ? attempt : best
      )
    : null;

  // Timer
  useEffect(() => {
    if (!showResults) {
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showResults]);

  const handleAnswerSelect = (optionIndex: number) => {
    const questionId = currentQuestion._key || `q-${currentQuestionIndex}`;
    const optionValue = String(optionIndex);

    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      
      const isMultipleChoice = currentQuestion.type === "multiple" || currentQuestion.questionType === "multiple";
      
      if (isMultipleChoice) {
        // Multiple selections allowed
        if (existing) {
          const hasOption = existing.selectedOptions.includes(optionValue);
          return prev.map(a => 
            a.questionId === questionId
              ? {
                  ...a,
                  selectedOptions: hasOption
                    ? a.selectedOptions.filter(o => o !== optionValue)
                    : [...a.selectedOptions, optionValue]
                }
              : a
          );
        }
        return [...prev, { questionId, selectedOptions: [optionValue] }];
      } else {
        // Single selection (MCQ, True/False)
        if (existing) {
          return prev.map(a => 
            a.questionId === questionId
              ? { ...a, selectedOptions: [optionValue] }
              : a
          );
        }
        return [...prev, { questionId, selectedOptions: [optionValue] }];
      }
    });
  };

  const isAnswered = (questionIndex: number): boolean => {
    const question = quiz.questions[questionIndex];
    const qId = question._key || `q-${questionIndex}`;
    const answer = answers.find(a => a.questionId === qId);
    return !!answer && answer.selectedOptions.length > 0;
  };

  const canGoNext = () => {
    return currentQuestionIndex < quiz.questions.length - 1;
  };

  const canGoPrevious = () => {
    return currentQuestionIndex > 0;
  };

  const handleNext = () => {
    if (canGoNext()) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious()) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    let correctCount = 0;

    quiz.questions.forEach((question, index) => {
      const qId = question._key || `q-${index}`;
      const answer = answers.find(a => a.questionId === qId);
      if (!answer) return;

      const correctIndices = (question.correctAnswers || []).map(String);
      const selectedIndices = answer.selectedOptions.sort();
      const correctSorted = correctIndices.sort();

      if (JSON.stringify(selectedIndices) === JSON.stringify(correctSorted)) {
        correctCount++;
      }
    });

    const score = (correctCount / quiz.questions.length) * 100;
    const passed = score >= (quiz.passingScore || 80);

    return {
      score,
      passed,
      correctAnswers: correctCount,
      totalQuestions: quiz.questions.length,
    };
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = quiz.questions.filter((_, index) => !isAnswered(index)).length;
    
    if (unansweredCount > 0) {
      alert(`Please answer all questions. ${unansweredCount} question(s) remaining.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const results = calculateResults();
      
      // Save attempt to database
      const response = await fetch("/api/education/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          quizId: quiz._id,
          answers: answers.map(a => ({
            question_id: a.questionId,
            selected_options: a.selectedOptions,
          })),
          score: results.score,
          passed: results.passed,
          attemptNumber,
          timeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      setQuizResults(results);
      setShowResults(true);
      
      if (results.passed) {
        onComplete();
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setQuizResults(null);
    setTimeSpent(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCorrectAnswer = (questionIndex: number) => {
    const question = quiz.questions[questionIndex];
    if (!question.options || !question.correctAnswers) return "N/A";
    return question.correctAnswers.map((i: number) => question.options![i]).join(", ");
  };

  const isCorrect = (questionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const qId = question._key || `q-${questionIndex}`;
    const answer = answers.find(a => a.questionId === qId);
    if (!answer || !question.correctAnswers) return false;

    const correctIndices = question.correctAnswers.map(String).sort();
    const selectedIndices = answer.selectedOptions.sort();
    return JSON.stringify(selectedIndices) === JSON.stringify(correctIndices);
  };

  if (showResults && quizResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <GlassCard className="p-8">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
              quizResults.passed 
                ? "bg-green-500/20 text-green-400" 
                : "bg-red-500/20 text-red-400"
            }`}>
              {quizResults.passed ? (
                <Trophy className="w-12 h-12" />
              ) : (
                <XCircle className="w-12 h-12" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {quizResults.passed ? "Congratulations!" : "Not Quite There"}
            </h2>
            <p className="text-white/60 text-lg">
              {quizResults.passed 
                ? "You've passed the quiz!" 
                : `You need ${quiz.passingScore || 80}% to pass. Keep trying!`}
            </p>
          </div>

          {/* Score Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {quizResults.score.toFixed(0)}%
              </div>
              <div className="text-white/60 text-sm">Your Score</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {quizResults.correctAnswers}/{quizResults.totalQuestions}
              </div>
              <div className="text-white/60 text-sm">Correct Answers</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {formatTime(timeSpent)}
              </div>
              <div className="text-white/60 text-sm">Time Taken</div>
            </div>
          </div>

          {/* Previous Attempts */}
          {previousAttempts.length > 0 && (
            <div className="mb-8 p-4 bg-white/5 rounded-xl">
              <h3 className="text-white font-semibold mb-2">Attempt History</h3>
              <div className="space-y-2">
                {previousAttempts.map((attempt, index) => (
                  <div key={attempt.id} className="flex justify-between text-sm">
                    <span className="text-white/60">Attempt {index + 1}</span>
                    <span className={attempt.passed ? "text-green-400" : "text-red-400"}>
                      {attempt.score.toFixed(0)}% {attempt.passed && "✓"}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-white/10">
                  <span className="text-white">This Attempt</span>
                  <span className={quizResults.passed ? "text-green-400" : "text-red-400"}>
                    {quizResults.score.toFixed(0)}% {quizResults.passed && "✓"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Review Answers */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Review Your Answers</h3>
            <div className="space-y-4">
              {quiz.questions.map((question, index) => {
                const correct = isCorrect(index);
                const qId = question._key || `q-${index}`;
                const userAnswer = answers.find(a => a.questionId === qId);

                return (
                  <div key={qId} className={`p-4 rounded-xl border ${
                    correct 
                      ? "bg-green-500/10 border-green-500/30" 
                      : "bg-red-500/10 border-red-500/30"
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      {correct ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <div className="text-white font-medium mb-2">
                          {index + 1}. {question.question}
                        </div>
                        {!correct && question.options && (
                          <div className="space-y-1 text-sm">
                            <div className="text-red-400">
                              Your answer: {userAnswer?.selectedOptions.map(i => 
                                question.options![parseInt(i)]
                              ).join(", ")}
                            </div>
                            <div className="text-green-400">
                              Correct answer: {getCorrectAnswer(index)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            {!quizResults.passed && (
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
            )}
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
            >
              {quizResults.passed ? "Continue Course" : "Back to Course"}
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <GlassCard className="p-8">
        {/* Quiz Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{quiz.title}</h2>
              {quiz.description && (
                <p className="text-white/60">{quiz.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>

          {/* Quiz Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-white/60">
              <Target className="w-4 h-4" />
              <span>Pass: {quiz.passingScore || 80}%</span>
            </div>
            <div className="text-white/60">
              Questions: {quiz.questions.length}
            </div>
            <div className="text-white/60">
              Attempt: #{attemptNumber}
            </div>
            {bestAttempt && (
              <div className="text-primary">
                Best: {bestAttempt.score.toFixed(0)}%
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{answers.length} answered</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="mb-6">
            <div className="text-sm text-primary font-medium mb-2">
              {(currentQuestion.type === "multiple" || currentQuestion.questionType === "multiple")
                ? "Multiple Choice (Select all that apply)" 
                : (currentQuestion.type === "boolean" || currentQuestion.questionType === "boolean")
                ? "True or False"
                : "Single Choice"}
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options && currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer?.selectedOptions.includes(String(index));
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-white/30"
                    }`}>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-white">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Question Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentQuestionIndex
                    ? "bg-primary w-8"
                    : isAnswered(index)
                    ? "bg-green-400"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white/10 hover:bg-white/20 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || answers.length !== quiz.questions.length}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
              <CheckCircle className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Warning for unanswered questions */}
        {currentQuestionIndex === quiz.questions.length - 1 && answers.length < quiz.questions.length && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-400">
              You have {quiz.questions.length - answers.length} unanswered question(s). 
              Please answer all questions before submitting.
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
