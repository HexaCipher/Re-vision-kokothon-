"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Trash2,
  Play,
  LogOut,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ShareModal from "@/components/quiz/ShareModal";

interface Quiz {
  id: string;
  title: string;
  subject: string;
  created_at?: string;
  createdAt?: string;
  questions: any;
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
  const { signOut } = useClerk();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Re-vision
              </span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.imageUrl} alt={user.name} />
                    <AvatarFallback className="bg-purple-600">
                      {user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Welcome back, {user.name}! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg"
          >
            Ready to master your subjects?
          </motion.p>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/20 border-purple-500/20 backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Quizzes</p>
                <p className="text-3xl font-bold text-white">{stats.totalQuizzes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-slate-900/20 border-blue-500/20 backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Attempts</p>
                <p className="text-3xl font-bold text-white">{stats.totalAttempts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/20 border-purple-500/20 backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Best Score</p>
                <p className="text-3xl font-bold text-white">{stats.bestScore}%</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quizzes Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Your Quizzes</h2>
          <Link href="/dashboard/create">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        {allQuizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-12 text-center bg-gradient-to-br from-slate-900/50 to-purple-900/20 border-slate-800/50 backdrop-blur">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No quizzes yet!
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Upload your first notes to generate an AI-powered quiz and start mastering your subject.
              </p>
              <Link href="/dashboard/create">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Quiz
                </Button>
              </Link>
            </Card>
          </motion.div>
        ) : (
          /* Quiz Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="p-6 bg-gradient-to-br from-slate-900/80 to-purple-900/20 border-slate-800/50 backdrop-blur hover:border-purple-500/50 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {quiz.subject}
                    </Badge>
                    <div className="flex gap-1">
                      {/* Share button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        onClick={() => handleShareQuiz(quiz)}
                        title="Share quiz"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        disabled={isDeleting === quiz.id}
                        title="Delete quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {quiz.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                    <Calendar className="w-4 h-4" />
                    {new Date(quiz.created_at || quiz.createdAt || Date.now()).toLocaleDateString()}
                  </div>

                  <div className="text-sm text-slate-400 mb-6">
                    {Array.isArray(quiz.questions) ? quiz.questions.length : 0} questions
                  </div>

                  <Link href={`/quiz/${quiz.id}/take`}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start Quiz
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
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
    </div>
  );
}
