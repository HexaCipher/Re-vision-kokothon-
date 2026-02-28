"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Target, ArrowRight, RotateCcw, Home, TrendingUp, TrendingDown, Minus, History } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Question } from "@/types";

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
  const [displayScore, setDisplayScore] = useState(0);
  const [attemptHistory, setAttemptHistory] = useState<AttemptHistory[]>([]);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);

  // Load attempt history from localStorage
  useEffect(() => {
    try {
      const historyKey = `quiz-history-${quiz.id}`;
      const existingHistory: AttemptHistory[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      // Check if this attempt is already saved (to avoid duplicates on refresh)
      const currentAttemptExists = existingHistory.some(
        h => h.completedAt === attempt.completedAt && h.score === attempt.score
      );
      
      if (!currentAttemptExists) {
        // Calculate previous best before adding current attempt
        if (existingHistory.length > 0) {
          const best = Math.max(...existingHistory.map(h => h.percentage));
          setPreviousBest(best);
        }
        
        // Add current attempt to history
        const newAttempt: AttemptHistory = {
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          completedAt: attempt.completedAt,
          percentage,
        };
        
        const updatedHistory = [newAttempt, ...existingHistory].slice(0, 10); // Keep last 10 attempts
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
        setAttemptHistory(updatedHistory);
      } else {
        // Already exists, just set history and previous best
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

  // Animate score count-up
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
        
        // Trigger confetti for good scores
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
    if (percentage >= 90) return { text: "Outstanding!", color: "text-yellow-400" };
    if (percentage >= 70) return { text: "Great Job!", color: "text-green-400" };
    if (percentage >= 50) return { text: "Good Effort!", color: "text-blue-400" };
    return { text: "Keep Practicing!", color: "text-purple-400" };
  };

  const getComparisonInfo = () => {
    if (previousBest === null) return null;
    const diff = percentage - previousBest;
    if (diff > 0) {
      return { 
        text: `+${diff}% from previous best!`, 
        icon: TrendingUp, 
        color: "text-green-400",
        bgColor: "bg-green-500/20"
      };
    } else if (diff < 0) {
      return { 
        text: `${diff}% from previous best`, 
        icon: TrendingDown, 
        color: "text-red-400",
        bgColor: "bg-red-500/20"
      };
    }
    return { 
      text: "Matched your best!", 
      icon: Minus, 
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20"
    };
  };

  const performance = getPerformanceMessage();
  const comparison = getComparisonInfo();
  const attemptNumber = attemptHistory.length;

  const handleRetake = () => {
    // Clear current attempt from sessionStorage before retaking
    sessionStorage.removeItem(`attempt-${quiz.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Re-vision</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-12 text-center bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-purple-500/30 backdrop-blur mb-8">
              {/* Attempt Badge */}
              {attemptNumber > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <Badge className="bg-slate-800/50 text-slate-300 border-slate-700">
                    <History className="w-3 h-3 mr-1" />
                    Attempt #{attemptNumber}
                  </Badge>
                </motion.div>
              )}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-16 h-16 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`text-4xl font-bold mb-2 ${performance.color}`}
              >
                {performance.text}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-4"
              >
                <div className="text-7xl font-bold text-white mb-2">
                  {displayScore}/{attempt.totalQuestions}
                </div>
                <div className="text-3xl text-slate-400">
                  {percentage}% Correct
                </div>
              </motion.div>

              {/* Comparison with previous best */}
              {comparison && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${comparison.bgColor} mb-4`}
                >
                  <comparison.icon className={`w-5 h-5 ${comparison.color}`} />
                  <span className={`font-medium ${comparison.color}`}>{comparison.text}</span>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-lg px-4 py-2">
                  {quiz.subject}
                </Badge>
              </motion.div>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="p-6 bg-slate-900/50 border-slate-800/50 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Correct Answers</p>
                  <p className="text-2xl font-bold text-white">{attempt.score}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-slate-800/50 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Incorrect Answers</p>
                  <p className="text-2xl font-bold text-white">
                    {attempt.totalQuestions - attempt.score}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-slate-800/50 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  {previousBest !== null ? (
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  ) : (
                    <Brain className="w-6 h-6 text-purple-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-400">
                    {previousBest !== null ? "Best Score" : "Accuracy"}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {previousBest !== null 
                      ? `${Math.max(percentage, previousBest)}%`
                      : `${percentage}%`
                    }
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href={`/quiz/${quiz.id}/review`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6">
                Review Answers
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link href={`/quiz/${quiz.id}/take`} className="flex-1" onClick={handleRetake}>
              <Button variant="outline" className="w-full text-lg py-6 border-slate-700 hover:bg-purple-500/10 hover:border-purple-500/50">
                <RotateCcw className="w-5 h-5 mr-2" />
                Retake Quiz
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto text-lg py-6 border-slate-700">
                <Home className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Previous Attempts History */}
          {attemptHistory.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="mt-8"
            >
              <Card className="p-6 bg-slate-900/50 border-slate-800/50 backdrop-blur">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Attempt History
                </h3>
                <div className="space-y-3">
                  {attemptHistory.slice(0, 5).map((hist, index) => (
                    <div
                      key={hist.completedAt}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 
                          ? 'bg-purple-500/10 border border-purple-500/30' 
                          : 'bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">
                          #{attemptHistory.length - index}
                        </span>
                        <span className="text-white font-medium">
                          {hist.score}/{hist.totalQuestions}
                        </span>
                        {index === 0 && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            Latest
                          </Badge>
                        )}
                        {hist.percentage === Math.max(...attemptHistory.map(h => h.percentage)) && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                            Best
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${
                          hist.percentage >= 70 ? 'text-green-400' : 
                          hist.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {hist.percentage}%
                        </span>
                        <span className="text-slate-500 text-sm">
                          {new Date(hist.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Motivational Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mt-8 text-center"
          >
            <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/20 border-purple-500/20 backdrop-blur">
              <p className="text-slate-300 text-lg">
                {percentage >= 90
                  ? "You've mastered this material! Keep up the excellent work!"
                  : percentage >= 70
                  ? "Great progress! Review the questions you missed to solidify your understanding."
                  : percentage >= 50
                  ? "You're getting there! Try reviewing your notes and retaking the quiz."
                  : "Don't give up! Learning takes time. Review the material and try again."}
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
