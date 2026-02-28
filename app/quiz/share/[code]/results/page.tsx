"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Target, Clock, Home, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";

interface ResultData {
  score: number;
  totalQuestions: number;
  answers: Record<string, string>;
  guestName: string;
  timeElapsed: number;
  completedAt: string;
}

export default function SharedQuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const shareCode = params.code as string;

  const [result, setResult] = useState<ResultData | null>(null);
  const [quizTitle, setQuizTitle] = useState("");

  useEffect(() => {
    // Get results from sessionStorage
    const storedResult = sessionStorage.getItem(`shared-result-${shareCode}`);
    const storedQuiz = sessionStorage.getItem(`shared-quiz-${shareCode}`);

    if (!storedResult) {
      router.push(`/quiz/share/${shareCode}`);
      return;
    }

    const resultData = JSON.parse(storedResult);
    setResult(resultData);

    if (storedQuiz) {
      const quizData = JSON.parse(storedQuiz);
      setQuizTitle(quizData.title);
    }

    // Trigger confetti if score is good
    const percentage = (resultData.score / resultData.totalQuestions) * 100;
    if (percentage >= 70) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 500);
    }
  }, [shareCode, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!result) {
    return null;
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const getGrade = () => {
    if (percentage >= 90) return { grade: "A+", color: "text-green-400", message: "Outstanding!" };
    if (percentage >= 80) return { grade: "A", color: "text-green-400", message: "Excellent!" };
    if (percentage >= 70) return { grade: "B", color: "text-blue-400", message: "Great job!" };
    if (percentage >= 60) return { grade: "C", color: "text-yellow-400", message: "Good effort!" };
    if (percentage >= 50) return { grade: "D", color: "text-orange-400", message: "Keep practicing!" };
    return { grade: "F", color: "text-red-400", message: "Don't give up!" };
  };

  const gradeInfo = getGrade();

  const handleRetake = () => {
    // Clear previous results
    sessionStorage.removeItem(`shared-result-${shareCode}`);
    router.push(`/quiz/share/${shareCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">RE-vision</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 bg-slate-900/50 border-slate-800/50 backdrop-blur text-center">
              {/* Score Circle */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-slate-800"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 553" }}
                    animate={{ strokeDasharray: `${(percentage / 100) * 553} 553` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-5xl font-bold text-white"
                  >
                    {percentage}%
                  </motion.span>
                  <span className={`text-2xl font-bold ${gradeInfo.color}`}>
                    {gradeInfo.grade}
                  </span>
                </div>
              </div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h1 className="text-3xl font-bold text-white mb-2">
                  {gradeInfo.message}
                </h1>
                <p className="text-slate-400 mb-2">
                  Great effort, <span className="text-purple-400 font-medium">{result.guestName}</span>!
                </p>
                {quizTitle && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {quizTitle}
                  </Badge>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="grid grid-cols-3 gap-4 my-8"
              >
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{result.score}/{result.totalQuestions}</p>
                  <p className="text-sm text-slate-400">Correct</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{percentage}%</p>
                  <p className="text-sm text-slate-400">Accuracy</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{formatTime(result.timeElapsed)}</p>
                  <p className="text-sm text-slate-400">Time</p>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex gap-4"
              >
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-8 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20"
              >
                <p className="text-slate-300 mb-2">Want to create your own quizzes?</p>
                <Link href="/sign-up">
                  <Button variant="link" className="text-purple-400 hover:text-purple-300">
                    Sign up for free
                  </Button>
                </Link>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
