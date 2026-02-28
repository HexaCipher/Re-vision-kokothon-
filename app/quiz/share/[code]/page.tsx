"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Users, BookOpen, Play } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Card className="p-8 bg-slate-900/50 border-slate-800/50 backdrop-blur max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Quiz Not Found</h1>
          <p className="text-slate-400 mb-6">
            {error || "This quiz link may have expired or doesn't exist."}
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              Go to Homepage
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

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
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 bg-slate-900/50 border-slate-800/50 backdrop-blur">
              {/* Quiz Info */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <Badge className="mb-3 bg-purple-500/20 text-purple-400 border-purple-500/30">
                  Shared Quiz
                </Badge>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {quiz.title}
                </h1>
                <div className="flex items-center justify-center gap-4 text-slate-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {quiz.subject}
                  </span>
                  <span>{quiz.questionCount} questions</span>
                </div>
              </div>

              {/* Guest Name Input */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="guestName" className="text-slate-300">
                    Enter your name to start
                  </Label>
                  <Input
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your name"
                    className="mt-2 bg-slate-800/50 border-slate-700 text-white"
                    onKeyDown={(e) => e.key === "Enter" && handleStart()}
                  />
                </div>

                <Button
                  onClick={handleStart}
                  disabled={isStarting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
              <p className="text-center text-sm text-slate-500 mt-6">
                Your results will be shared with the quiz creator
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
