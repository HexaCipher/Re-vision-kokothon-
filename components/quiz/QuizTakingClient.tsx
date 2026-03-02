"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock, ChevronRight, ChevronLeft, AlertTriangle, Lightbulb, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Question } from "@/types";
import { toast } from "sonner";
import Link from "next/link";
import { PageTransition } from "@/components/ui/PageTransition";
import { AppIcon } from "@/components/ui/AppLogo";

interface QuizTakingClientProps {
  quiz: {
    id: string;
    title: string;
    subject: string;
    questions: Question[];
    timerMode?: "none" | "quiz" | "question";
    timeLimit?: number;
  };
  userId: string;
}

export default function QuizTakingClient({ quiz, userId }: QuizTakingClientProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const timerMode = quiz.timerMode || "none";
  const timeLimit = quiz.timeLimit || 10;
  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (timerMode === "quiz") return timeLimit * 60;
    if (timerMode === "question") return timeLimit;
    return 0;
  });
  const hasAutoSubmittedRef = useRef(false);

  // Prevent accidental navigation away during quiz
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmitting) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitting]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const getWarningThreshold = () => {
    if (timerMode === "quiz") return 60;
    if (timerMode === "question") return Math.min(10, timeLimit * 0.3);
    return 0;
  };
  const warningThreshold = getWarningThreshold();
  const isTimeWarning = timerMode !== "none" && timeRemaining <= warningThreshold && timeRemaining > 0;
  const isTimeUp = timerMode !== "none" && timeRemaining <= 0;

  useEffect(() => {
    if (timerMode !== "none") return;
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerMode]);

  useEffect(() => {
    if (timerMode === "none" || isSubmitting) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerMode, isSubmitting]);

  useEffect(() => {
    if (timerMode === "question") {
      setTimeRemaining(timeLimit);
    }
  }, [currentQuestionIndex, timerMode, timeLimit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
    // Reset explanation when the user changes their selection
    setShowExplanation(false);
  };

  const handleForceSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let score = 0;
      quiz.questions.forEach((question) => {
        if (answers[question.id]?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
          score++;
        }
      });

      const attemptData = {
        score,
        totalQuestions: quiz.questions.length,
        answers,
        completedAt: new Date().toISOString(),
      };

      sessionStorage.setItem(`attempt-${quiz.id}`, JSON.stringify(attemptData));

      if (quiz.id.startsWith('local-')) {
        router.push(`/quiz/${quiz.id}/results`);
        return;
      }

      try {
        const response = await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: quiz.id,
            userId,
            score,
            totalQuestions: quiz.questions.length,
            answers,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          router.push(`/quiz/${quiz.id}/results?attemptId=${data.attemptId}`);
          return;
        }
      } catch (dbError) {
        console.error("Failed to save to database:", dbError);
      }

      router.push(`/quiz/${quiz.id}/results`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      const attemptData = {
        score: quiz.questions.filter(q => 
          answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
        ).length,
        totalQuestions: quiz.questions.length,
        answers,
        completedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(`attempt-${quiz.id}`, JSON.stringify(attemptData));
      router.push(`/quiz/${quiz.id}/results`);
    }
  }, [isSubmitting, quiz, answers, router, userId]);

  const handleQuestionTimeUp = useCallback(() => {
    if (isLastQuestion) {
      handleForceSubmit();
    } else {
      toast.error("Time's up! Moving to the next question.");
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [isLastQuestion, handleForceSubmit]);

  useEffect(() => {
    if (isTimeUp && !isSubmitting && !hasAutoSubmittedRef.current) {
      if (timerMode === "quiz") {
        hasAutoSubmittedRef.current = true;
        toast.error("Time's up! Submitting your quiz...");
        handleForceSubmit();
      } else if (timerMode === "question") {
        handleQuestionTimeUp();
      }
    }
  }, [isTimeUp, timerMode, isSubmitting, handleQuestionTimeUp, handleForceSubmit]);

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast.error("Please select an answer before continuing");
      return;
    }

    const isWrong =
      answers[currentQuestion.id].toLowerCase().trim() !==
      currentQuestion.correctAnswer.toLowerCase().trim();

    // First time hitting Next on a wrong answer: show the hint, don't advance yet
    if (isWrong && currentQuestion.explanation && !showExplanation) {
      setShowExplanation(true);
      return;
    }

    if (isLastQuestion) {
      handleForceSubmit();
    } else {
      setShowExplanation(false);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setShowExplanation(false);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <PageTransition className="min-h-screen" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
      <div 
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 50%, rgba(139,92,246,0.06) 100%)" }}
      />

      {/* Header */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sm:py-4 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1"
        >
          <Link href="/dashboard" className="flex items-center gap-3 group flex-shrink-0">
              <AppIcon size="md" />
            </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-lg font-bold text-white truncate">{quiz.title}</h1>
            <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/25 font-medium text-xs">
              {quiz.subject}
            </Badge>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
        >
          {timerMode === "none" ? (
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 bg-white/5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/10">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-mono text-sm sm:text-lg font-medium">{formatTime(timeElapsed)}</span>
            </div>
          ) : (
            <motion.div
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border transition-colors ${
                isTimeWarning
                  ? "bg-red-500/15 border-red-500/30 text-red-400"
                  : "bg-white/5 border-white/10 text-slate-300"
              }`}
              animate={isTimeWarning ? { scale: [1, 1.02, 1] } : {}}
              transition={{ repeat: isTimeWarning ? Infinity : 0, duration: 1 }}
            >
              {isTimeWarning && <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
              <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${isTimeWarning ? "text-red-400" : ""}`} />
              <span className={`font-mono text-sm sm:text-lg font-bold ${isTimeWarning ? "text-red-400" : ""}`}>
                {formatCountdown(timeRemaining)}
              </span>
              {timerMode === "question" && (
                <span className="text-xs text-slate-500 ml-1 hidden sm:inline">/ question</span>
              )}
            </motion.div>
          )}
        </motion.div>
      </nav>

      {/* Progress Bar */}
      <div className="fixed top-[57px] sm:top-[65px] lg:top-[73px] inset-x-0 z-40 px-4 sm:px-6 lg:px-10 py-2 sm:py-3 bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between text-xs sm:text-sm text-slate-400 mb-1.5 sm:mb-2">
            <span className="font-medium">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-32 lg:pt-40 pb-8 sm:pb-12">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                {timerMode === "question" && (
                  <div className="px-4 sm:px-8 pt-4 sm:pt-6">
                    <div className="h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full transition-colors ${
                          isTimeWarning ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-violet-500"
                        }`}
                        initial={{ width: "100%" }}
                        animate={{ width: `${(timeRemaining / timeLimit) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className={`text-xs mt-1.5 sm:mt-2 text-right ${isTimeWarning ? "text-red-400" : "text-slate-500"}`}>
                      {timeRemaining} seconds remaining
                    </p>
                  </div>
                )}

                <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
                  <div className="flex items-start gap-3 sm:gap-5 mb-6 sm:mb-8">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-500/15 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                      <span className="text-lg sm:text-2xl font-bold text-indigo-400" style={{ fontFamily: "var(--font-playfair)" }}>
                        {currentQuestionIndex + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
                        {currentQuestion.question}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {currentQuestion.type === "mcq" && currentQuestion.options && (
                      <RadioGroup
                        value={answers[currentQuestion.id] || ""}
                        onValueChange={handleAnswerChange}
                      >
                        {currentQuestion.options.map((option, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                          >
                            <Label
                              htmlFor={`option-${index}`}
                              className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                answers[currentQuestion.id] === option
                                  ? "border-indigo-500/50 bg-indigo-500/10"
                                  : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                              }`}
                            >
                              <RadioGroupItem
                                value={option}
                                id={`option-${index}`}
                                className="text-indigo-500 border-white/20 flex-shrink-0"
                              />
                              <span className="text-base sm:text-lg text-white flex-1">{option}</span>
                            </Label>
                          </motion.div>
                        ))}
                      </RadioGroup>
                    )}

                    {currentQuestion.type === "true_false" && (
                      <RadioGroup
                        value={answers[currentQuestion.id] || ""}
                        onValueChange={handleAnswerChange}
                      >
                        {["True", "False"].map((option, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                          >
                            <Label
                              htmlFor={`option-${index}`}
                              className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                answers[currentQuestion.id] === option
                                  ? "border-indigo-500/50 bg-indigo-500/10"
                                  : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                              }`}
                            >
                              <RadioGroupItem
                                value={option}
                                id={`option-${index}`}
                                className="text-indigo-500 border-white/20 flex-shrink-0"
                              />
                              <span className="text-base sm:text-lg text-white flex-1">{option}</span>
                            </Label>
                          </motion.div>
                        ))}
                      </RadioGroup>
                    )}

                    {currentQuestion.type === "fill_blank" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Input
                          value={answers[currentQuestion.id] || ""}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          placeholder="Type your answer here..."
                          className="text-base sm:text-lg p-4 sm:p-6 bg-white/[0.02] border-white/10 text-white rounded-xl sm:rounded-2xl placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Inline explanation on wrong answer */}
                <AnimatePresence>
                  {showExplanation && currentQuestion.explanation && (
                    <motion.div
                      key="explanation"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mx-4 sm:mx-8 mb-4 sm:mb-6 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-amber-500/25 bg-amber-500/8">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-amber-400 mb-1">Not quite — here&apos;s a hint</p>
                            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{currentQuestion.explanation}</p>
                          </div>
                          <button
                            onClick={() => setShowExplanation(false)}
                            className="p-1 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-white/5 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="w-full sm:flex-1 h-12 sm:h-14 rounded-xl border-white/10 hover:bg-white/5 hover:border-white/20 text-sm sm:text-base font-medium order-2 sm:order-1"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 h-12 sm:h-14 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-sm sm:text-base font-semibold order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : isLastQuestion ? (
                      showExplanation ? "Submit Anyway" : "Submit Quiz"
                    ) : (
                      <>
                        {showExplanation ? "Continue Anyway" : "Next"}
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-6 sm:mt-8 justify-center px-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => { setShowExplanation(false); setCurrentQuestionIndex(index); }}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      index === currentQuestionIndex
                        ? "bg-white text-slate-950"
                        : answers[quiz.questions[index].id]
                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                        : "bg-white/5 text-slate-500 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
