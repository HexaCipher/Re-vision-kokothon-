"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import QuizTakingClient from "@/components/quiz/QuizTakingClient";
import { Loader2 } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: any[];
  timerMode?: "none" | "quiz" | "question";
  timeLimit?: number;
}

export default function QuizTakePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quizId = params.id as string;

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    // Check if this is a local quiz
    if (quizId.startsWith("local-")) {
      const storedQuiz = sessionStorage.getItem(`quiz-${quizId}`);
      if (storedQuiz) {
        try {
          const quizData = JSON.parse(storedQuiz);
          setQuiz(quizData);
          setLoading(false);
        } catch (e) {
          setError("Failed to load quiz data");
          setLoading(false);
        }
      } else {
        setError("Quiz not found. Please create a new quiz.");
        setLoading(false);
      }
    } else {
      // Fetch from API/database for non-local quizzes
      fetchQuizFromDB(quizId);
    }
  }, [quizId, user, isLoaded, router]);

  const fetchQuizFromDB = async (id: string) => {
    try {
      const response = await fetch(`/api/quizzes/${id}`);
      if (!response.ok) {
        throw new Error("Quiz not found");
      }
      const data = await response.json();
      setQuiz(data);
    } catch (e) {
      setError("Failed to load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isLoaded) {
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
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Quiz not found"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizTakingClient
      quiz={{
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        questions: quiz.questions,
        timerMode: quiz.timerMode,
        timeLimit: quiz.timeLimit,
      }}
      userId={user?.id || ""}
    />
  );
}
