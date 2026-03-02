"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Trash2,
  Play,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ShareModal from "@/components/quiz/ShareModal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Navbar } from "@/components/ui/Navbar";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem, HoverScale } from "@/components/ui/PageTransition";

interface Quiz {
  id: string;
  title: string;
  subject: string;
  created_at?: string;
  createdAt?: string;
  questions: any;
  difficulty?: string;
}

interface DashboardClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
  };
  quizzes: Quiz[];
  stats: {
    totalQuizzes: number;
    totalAttempts: number;
    bestScore: number;
  };
}

export default function DashboardClient({
  user,
  quizzes: serverQuizzes,
  stats: serverStats,
}: DashboardClientProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>(serverQuizzes);
  const [stats, setStats] = useState(serverStats);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedQuizForShare, setSelectedQuizForShare] = useState<Quiz | null>(null);

  const handleShareQuiz = (quiz: Quiz) => {
    setSelectedQuizForShare(quiz);
    setShareModalOpen(true);
  };

  // Sync with server data when it changes
  useEffect(() => {
    setAllQuizzes(serverQuizzes);
    setStats(serverStats);
  }, [serverQuizzes, serverStats]);

  const handleDeleteQuiz = async (quizId: string) => {
    // First click: show confirmation
    if (deleteConfirmId !== quizId) {
      setDeleteConfirmId(quizId);
      // Auto-clear after 3 seconds
      setTimeout(() => setDeleteConfirmId((prev) => (prev === quizId ? null : prev)), 3000);
      return;
    }

    // Second click: actually delete
    setDeleteConfirmId(null);
    setIsDeleting(quizId);
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete quiz");

      // Remove from state immediately for instant UI update
      setAllQuizzes(prev => prev.filter(q => q.id !== quizId));
      setStats(prev => ({ ...prev, totalQuizzes: Math.max(0, prev.totalQuizzes - 1) }));
      
      // Clear any session/local data for this quiz
      sessionStorage.removeItem(`quiz-${quizId}`);
      sessionStorage.removeItem(`attempt-${quizId}`);
      localStorage.removeItem(`quiz-history-${quizId}`);
      
      toast.success("Quiz deleted successfully");
    } catch (error) {
      toast.error("Failed to delete quiz");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <PageTransition className="min-h-screen" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
      {/* Navigation */}
      <Navbar user={user} />

      {/* Background gradient */}
      <div 
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 50%, rgba(16,185,129,0.04) 100%)" }}
      />

      {/* Main Content - responsive padding and spacing */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12">
        {/* Header - responsive text sizes */}
        <FadeIn className="mb-8 sm:mb-10 md:mb-12">
          <p className="text-sm sm:text-base text-indigo-400 font-semibold tracking-widest uppercase mb-3 sm:mb-4">Dashboard</p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 flex items-center gap-3"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Welcome back, {user.name.split(' ')[0]}
            <svg
              width="40"
              height="40"
              viewBox="0 0 72 72"
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 inline-block"
            >
              <path fill="#FCEA2B" d="M16.5 33.5c-.5-3.5 1-8 5-8 3 0 6 4.5 6 4.5s1-10 6-10c4.5 0 5 6 5 10 0 0 1.5-7 6-7 4 0 5 5.5 5 9.5 0 0 2-5 5.5-5 4 0 5 5 5 8 0 4-1 12-8 19s-14 8-20 8-14-4-18-12-3.5-13.5 2.5-17"/>
              <path fill="#F1B31C" d="M22.5 63.5c-4.5-3-8-7.5-10-12-.5 2.5 0 5 1.5 7.5 3.5 6 10.5 10 16.5 11-3-1.5-5.5-4-8-6.5z"/>
              <path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 33.5c-.5-3.5 1-8 5-8 3 0 6 4.5 6 4.5s1-10 6-10c4.5 0 5 6 5 10 0 0 1.5-7 6-7 4 0 5 5.5 5 9.5 0 0 2-5 5.5-5 4 0 5 5 5 8 0 4-1 12-8 19s-14 8-20 8-14-4-18-12-3.5-13.5 2.5-17"/>
              <path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M27.5 30v15M38.5 30v15M49.5 32.5V45"/>
            </svg>
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Ready to master your subjects?
          </p>
        </FadeIn>

        {/* Stats Cards - responsive grid and card sizes */}
        <FadeIn delay={0.1} className="mb-8 sm:mb-10 md:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <SpotlightCard className="p-4 sm:p-5 md:p-6 bg-white/[0.02] border-indigo-500/20 backdrop-blur-md rounded-xl sm:rounded-2xl">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 bg-indigo-500/15 rounded-xl sm:rounded-2xl flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
                  <Brain className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Total Quizzes</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>{stats.totalQuizzes}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-4 sm:p-5 md:p-6 bg-white/[0.02] border-emerald-500/20 backdrop-blur-md rounded-xl sm:rounded-2xl" spotlightColor="rgba(16, 185, 129, 0.12)">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 bg-emerald-500/15 rounded-xl sm:rounded-2xl flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Total Attempts</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>{stats.totalAttempts}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-4 sm:p-5 md:p-6 bg-white/[0.02] border-amber-500/20 backdrop-blur-md rounded-xl sm:rounded-2xl sm:col-span-2 lg:col-span-1" spotlightColor="rgba(245, 158, 11, 0.12)">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 bg-amber-500/15 rounded-xl sm:rounded-2xl flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Best Score</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>{stats.bestScore}%</p>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </FadeIn>

        {/* Quizzes Section - responsive header */}
        <FadeIn delay={0.2}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Your Quizzes</h2>
            <Link href="/dashboard/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-semibold h-11 sm:h-12 px-5 sm:px-6 rounded-xl text-sm sm:text-base">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Create Quiz
              </Button>
            </Link>
          </div>

          {/* Empty State - responsive padding and text */}
          {allQuizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <SpotlightCard className="p-8 sm:p-10 md:p-12 text-center bg-white/[0.02] border-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl">
                <div className="w-16 h-16 sm:w-18 md:w-20 sm:h-18 md:h-20 bg-indigo-500/15 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 border border-indigo-500/20">
                  <Brain className="w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 text-indigo-400" />
                </div>
                <h3 
                  className="text-2xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  No quizzes yet
                </h3>
                <p className="text-slate-400 mb-6 sm:mb-8 max-w-md mx-auto text-base sm:text-lg">
                  Upload your first notes to generate an AI-powered quiz and start mastering your subject.
                </p>
                <Link href="/dashboard/create" className="inline-block">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14 rounded-xl">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Create Your First Quiz
                  </Button>
                </Link>
              </SpotlightCard>
            </motion.div>
          ) : (
            /* Quiz Grid - responsive columns */
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {allQuizzes.map((quiz) => (
                <StaggerItem key={quiz.id} className="h-full">
                  <HoverScale scale={1.02} className="h-full">
                    <SpotlightCard className="p-4 sm:p-5 md:p-6 h-full backdrop-blur-md bg-white/[0.02] border-white/10 rounded-xl sm:rounded-2xl hover:border-white/20 transition-colors duration-300">
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                          <div className="flex gap-1.5 items-center flex-wrap">
                            <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/25 hover:bg-indigo-500/20 font-medium text-xs sm:text-sm">
                              {quiz.subject}
                            </Badge>
                            {quiz.difficulty && quiz.difficulty !== "medium" && (
                              <Badge className={`font-medium text-xs ${
                                quiz.difficulty === "easy"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                                  : "bg-red-500/15 text-red-400 border-red-500/25"
                              }`}>
                                {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-0.5 sm:gap-1">
                            {/* Share button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg sm:rounded-xl h-8 w-8 sm:h-9 sm:w-9 transition-all duration-200"
                              onClick={() => handleShareQuiz(quiz)}
                              title="Share quiz"
                            >
                              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`rounded-lg sm:rounded-xl h-8 w-8 sm:h-9 sm:w-9 transition-all duration-200 ${
                                deleteConfirmId === quiz.id
                                  ? "text-red-400 bg-red-500/15 hover:bg-red-500/25"
                                  : "text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                              }`}
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              disabled={isDeleting === quiz.id}
                              title={deleteConfirmId === quiz.id ? "Click again to confirm delete" : "Delete quiz"}
                            >
                              {deleteConfirmId === quiz.id ? (
                                <span className="text-[10px] sm:text-xs font-bold">?</span>
                              ) : (
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 line-clamp-2 flex-grow">
                          {quiz.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-1.5 sm:mb-2">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {new Date(quiz.created_at || quiz.createdAt || Date.now()).toLocaleDateString()}
                        </div>

                        <div className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                          {Array.isArray(quiz.questions) ? quiz.questions.length : 0} questions
                        </div>

                        <Link href={`/quiz/${quiz.id}/take`} className="mt-auto">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <Button className="w-full bg-white text-slate-950 hover:bg-slate-100 font-semibold h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base">
                              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                              Start Quiz
                            </Button>
                          </motion.div>
                        </Link>
                      </div>
                    </SpotlightCard>
                  </HoverScale>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </FadeIn>
      </div>

      {/* Share Modal */}
      {selectedQuizForShare && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedQuizForShare(null);
          }}
          quizId={selectedQuizForShare.id}
          quizTitle={selectedQuizForShare.title}
        />
      )}
    </PageTransition>
  );
}
