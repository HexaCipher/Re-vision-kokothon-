"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, ArrowRight, RotateCcw, Home, TrendingUp, TrendingDown, Minus, History, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Question } from "@/types";
import { PageTransition, FadeIn, ScaleIn } from "@/components/ui/PageTransition";
import { AppLogo } from "@/components/ui/AppLogo";

interface AttemptHistory {
  score: number;
  totalQuestions: number;
  completedAt: string;
  percentage: number;
}

interface QuizResultsClientProps {
  quiz: {
    id: string;
    title: string;
    subject: string;
    questions: Question[];
  };
  attempt: {
    score: number;
    totalQuestions: number;
    answers: Record<string, string>;
    completedAt: string;
  };
}

export default function QuizResultsClient({
  quiz,
  attempt,
}: QuizResultsClientProps) {
  const router = useRouter();
  const [displayScore, setDisplayScore] = useState(0);
  const [attemptHistory, setAttemptHistory] = useState<AttemptHistory[]>([]);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);

  // Calculate wrong questions for spaced repetition
  const wrongQuestions = quiz.questions.filter(
    (q) =>
      (attempt.answers[q.id] ?? "").toLowerCase().trim() !==
      q.correctAnswer.toLowerCase().trim()
  );

  useEffect(() => {
    try {
      const historyKey = `quiz-history-${quiz.id}`;
      const existingHistory: AttemptHistory[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      const currentAttemptExists = existingHistory.some(
        h => h.completedAt === attempt.completedAt && h.score === attempt.score
      );
      
      if (!currentAttemptExists) {
        if (existingHistory.length > 0) {
          const best = Math.max(...existingHistory.map(h => h.percentage));
          setPreviousBest(best);
        }
        
        const newAttempt: AttemptHistory = {
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          completedAt: attempt.completedAt,
          percentage,
        };
        
        const updatedHistory = [newAttempt, ...existingHistory].slice(0, 10);
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
        setAttemptHistory(updatedHistory);
      } else {
        setAttemptHistory(existingHistory);
        const otherAttempts = existingHistory.filter(h => h.completedAt !== attempt.completedAt);
        if (otherAttempts.length > 0) {
          setPreviousBest(Math.max(...otherAttempts.map(h => h.percentage)));
        }
      }
    } catch (e) {
      console.error('Error loading attempt history:', e);
    }
  }, [quiz.id, attempt, percentage]);

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const increment = attempt.score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= attempt.score) {
        setDisplayScore(attempt.score);
        clearInterval(timer);
        
        if (percentage >= 70) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [attempt.score, percentage]);

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: "Outstanding!", color: "text-amber-400" };
    if (percentage >= 70) return { text: "Great Job!", color: "text-emerald-400" };
    if (percentage >= 50) return { text: "Good Effort!", color: "text-indigo-400" };
    return { text: "Keep Practicing!", color: "text-violet-400" };
  };

  const getComparisonInfo = () => {
    if (previousBest === null) return null;
    const diff = percentage - previousBest;
    if (diff > 0) {
      return { 
        text: `+${diff}% from previous best!`, 
        icon: TrendingUp, 
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/15 border-emerald-500/25"
      };
    } else if (diff < 0) {
      return { 
        text: `${diff}% from previous best`, 
        icon: TrendingDown, 
        color: "text-red-400",
        bgColor: "bg-red-500/15 border-red-500/25"
      };
    }
    return { 
      text: "Matched your best!", 
      icon: Minus, 
      color: "text-amber-400",
      bgColor: "bg-amber-500/15 border-amber-500/25"
    };
  };

  const performance = getPerformanceMessage();
  const comparison = getComparisonInfo();
  const attemptNumber = attemptHistory.length;

  const handleRetake = () => {
    sessionStorage.removeItem(`attempt-${quiz.id}`);
  };

  const handlePracticeWeak = () => {
    if (wrongQuestions.length === 0) return;
    // Re-index questions for the sub-quiz
    const subQuestions = wrongQuestions.map((q, i) => ({ ...q, id: `q${i + 1}`, orderNumber: i + 1 }));
    const weakQuizId = `local-weak-${quiz.id}`;
    const weakQuiz = {
      id: weakQuizId,
      title: `${quiz.title} — Weak Questions`,
      subject: quiz.subject,
      difficulty: "medium",
      timerMode: "none",
      timeLimit: 10,
      questions: subQuestions,
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem(`quiz-${weakQuizId}`, JSON.stringify(weakQuiz));
    sessionStorage.removeItem(`attempt-${weakQuizId}`);
    router.push(`/quiz/${weakQuizId}/take`);
  };

  return (
    <PageTransition className="min-h-screen" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
      <div 
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, transparent 50%, rgba(99,102,241,0.06) 100%)" }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sm:py-4 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 group">
              <AppLogo size="md" />
            </Link>
        </motion.div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Score Card */}
          <ScaleIn>
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden mb-6 sm:mb-8 p-6 sm:p-12 text-center relative">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10" />
              
              {attemptNumber > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 sm:mb-6"
                >
                  <Badge className="bg-white/5 text-slate-400 border-white/10">
                    <History className="w-3 h-3 mr-1" />
                    Attempt #{attemptNumber}
                  </Badge>
                </motion.div>
              )}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl shadow-indigo-500/20"
              >
                <Trophy className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 ${performance.color}`}
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {performance.text}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-4 sm:mb-6"
              >
                <div className="text-5xl sm:text-8xl font-bold text-white mb-1 sm:mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                  {displayScore}/{attempt.totalQuestions}
                </div>
                <div className="text-xl sm:text-3xl text-slate-400">
                  {percentage}% Correct
                </div>
              </motion.div>

              {comparison && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border ${comparison.bgColor} mb-4 sm:mb-6`}
                >
                  <comparison.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${comparison.color}`} />
                  <span className={`text-sm sm:text-base font-medium ${comparison.color}`}>{comparison.text}</span>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/25 text-sm sm:text-lg px-3 sm:px-5 py-1.5 sm:py-2 font-medium">
                  {quiz.subject}
                </Badge>
              </motion.div>
            </div>
          </ScaleIn>

          {/* Stats */}
          <FadeIn delay={0.3} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/15 rounded-xl sm:rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Correct Answers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>{attempt.score}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500/15 rounded-xl sm:rounded-2xl flex items-center justify-center border border-red-500/20">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Incorrect Answers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
                    {attempt.totalQuestions - attempt.score}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-500/15 rounded-xl sm:rounded-2xl flex items-center justify-center border border-indigo-500/20">
                  {previousBest !== null ? (
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
                  ) : (
                    <Target className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    {previousBest !== null ? "Best Score" : "Accuracy"}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
                    {previousBest !== null 
                      ? `${Math.max(percentage, previousBest)}%`
                      : `${percentage}%`
                    }
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Actions */}
          <FadeIn delay={0.4} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href={`/quiz/${quiz.id}/review`} className="flex-1">
              <Button className="w-full bg-white text-slate-950 hover:bg-slate-100 text-base sm:text-lg h-12 sm:h-14 rounded-xl font-semibold">
                Review Answers
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </Link>

            <Link href={`/quiz/${quiz.id}/take`} className="flex-1" onClick={handleRetake}>
              <Button variant="outline" className="w-full text-base sm:text-lg h-12 sm:h-14 rounded-xl border-white/10 hover:bg-white/5 hover:border-white/20">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Retake Quiz
              </Button>
            </Link>

            <Link href="/dashboard" className="sm:flex-none">
              <Button variant="outline" className="w-full text-base sm:text-lg h-12 sm:h-14 rounded-xl border-white/10 hover:bg-white/5 hover:border-white/20">
                <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Dashboard
              </Button>
            </Link>
          </FadeIn>

          {/* Practice Weak Questions */}
          {wrongQuestions.length > 0 && (
            <FadeIn delay={0.45} className="mt-3 sm:mt-4">
              <Button
                onClick={handlePracticeWeak}
                className="w-full bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 text-base sm:text-lg h-12 sm:h-14 rounded-xl font-semibold"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Practice Weak Questions ({wrongQuestions.length})
              </Button>
            </FadeIn>
          )}

          {/* Previous Attempts History */}
          {attemptHistory.length > 1 && (
            <FadeIn delay={0.5} className="mt-6 sm:mt-8">
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                  Attempt History
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {attemptHistory.slice(0, 5).map((hist, index) => (
                    <div
                      key={hist.completedAt}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
                        index === 0 
                          ? 'bg-indigo-500/10 border border-indigo-500/20' 
                          : 'bg-white/[0.02] border border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="text-slate-500 text-xs sm:text-sm font-medium">
                          #{attemptHistory.length - index}
                        </span>
                        <span className="text-white font-bold text-sm sm:text-base">
                          {hist.score}/{hist.totalQuestions}
                        </span>
                        <div className="flex gap-1.5">
                          {index === 0 && (
                            <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/25 text-xs">
                              Latest
                            </Badge>
                          )}
                          {hist.percentage === Math.max(...attemptHistory.map(h => h.percentage)) && (
                            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-xs">
                              Best
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className={`font-bold text-sm sm:text-base ${
                          hist.percentage >= 70 ? 'text-emerald-400' : 
                          hist.percentage >= 50 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {hist.percentage}%
                        </span>
                        <span className="text-slate-500 text-xs sm:text-sm hidden xs:inline">
                          {new Date(hist.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Motivational Message */}
          <FadeIn delay={0.6} className="mt-6 sm:mt-8">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 backdrop-blur-xl p-5 sm:p-8 text-center">
              <p className="text-slate-300 text-base sm:text-lg">
                {percentage >= 90
                  ? "You've mastered this material! Keep up the excellent work!"
                  : percentage >= 70
                  ? "Great progress! Review the questions you missed to solidify your understanding."
                  : percentage >= 50
                  ? "You're getting there! Try reviewing your notes and retaking the quiz."
                  : "Don't give up! Learning takes time. Review the material and try again."}
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
}
