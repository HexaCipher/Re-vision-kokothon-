"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Play, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { PageTransition, FadeIn, ScaleIn } from "@/components/ui/PageTransition";
import { QuizLoader } from "@/components/ui/QuizLoader";
import { AppLogo } from "@/components/ui/AppLogo";
import { SharedLeaderboard } from "@/components/quiz/SharedLeaderboard";

interface SharedQuiz {
  id: string;
  title: string;
  subject: string;
  questionCount: number;
}

export default function SharedQuizPage() {
  const params = useParams();
  const router = useRouter();
  const shareCode = params.code as string;
  
  const [quiz, setQuiz] = useState<SharedQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [shareCode]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/shared/${shareCode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Quiz not found");
      }

      setQuiz(data);
    } catch (err: any) {
      setError(err.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (!guestName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsStarting(true);
    
    // Store guest info in sessionStorage
    const guestId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem("guestId", guestId);
    sessionStorage.setItem("guestName", guestName.trim());
    sessionStorage.setItem(`shared-quiz-${shareCode}`, JSON.stringify(quiz));

    router.push(`/quiz/share/${shareCode}/take`);
  };

  if (loading) {
    return <QuizLoader />;
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        <div 
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 50%, rgba(139,92,246,0.06) 100%)" }}
        />
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 sm:p-8 max-w-md text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Quiz Not Found</h1>
          <p className="text-slate-400 mb-6 text-sm sm:text-base">
            {error || "This quiz link may have expired or doesn't exist."}
          </p>
          <Link href="/">
            <Button className="bg-white text-slate-950 hover:bg-slate-100 h-11 sm:h-12 rounded-xl font-semibold px-6">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
      <div 
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 50%, rgba(139,92,246,0.06) 100%)" }}
      />

      {/* Header */}
      <nav className="border-b border-white/5 backdrop-blur-2xl bg-black/40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group w-fit">
              <AppLogo size="md" />
            </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-lg mx-auto">
          <ScaleIn>
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 sm:p-8">
              {/* Quiz Info */}
              <div className="text-center mb-6 sm:mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20"
                >
                  <Users className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400" />
                </motion.div>
                <Badge className="mb-3 bg-indigo-500/15 text-indigo-400 border-indigo-500/25 text-xs sm:text-sm">
                  Shared Quiz
                </Badge>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
                  {quiz.title}
                </h1>
                <div className="flex items-center justify-center gap-3 sm:gap-4 text-slate-400 text-sm sm:text-base flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {quiz.subject}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span>{quiz.questionCount} questions</span>
                </div>
              </div>

              {/* Guest Name Input */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="guestName" className="text-slate-300 text-sm sm:text-base">
                    Enter your name to start
                  </Label>
                  <Input
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your name"
                    className="mt-2 bg-white/[0.02] border-white/10 text-white rounded-xl h-11 sm:h-12 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                    onKeyDown={(e) => e.key === "Enter" && handleStart()}
                  />
                </div>

                <Button
                  onClick={handleStart}
                  disabled={isStarting}
                  className="w-full bg-white text-slate-950 hover:bg-slate-100 h-11 sm:h-12 rounded-xl font-semibold"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </div>

              {/* Info Text */}
              <p className="text-center text-xs sm:text-sm text-slate-500 mt-6">
                Your results will be shared with the quiz creator
              </p>
            </div>
          </ScaleIn>

          {/* Leaderboard */}
          <SharedLeaderboard shareCode={shareCode} currentGuestName={guestName || undefined} />
        </div>
      </div>
    </PageTransition>
  );
}
