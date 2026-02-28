"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Brain, Clock, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  type: "mcq" | "true_false" | "fill_blank";
  options?: string[];
  correctAnswer: string;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
}

export default function SharedQuizTakePage() {
  const params = useParams();
  const router = useRouter();
  const shareCode = params.code as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestId, setGuestId] = useState("");

  useEffect(() => {
    // Get guest info
    const storedGuestId = sessionStorage.getItem("guestId");
    const storedGuestName = sessionStorage.getItem("guestName");
    
    if (!storedGuestId || !storedGuestName) {
      router.push(`/quiz/share/${shareCode}`);
      return;
    }

    setGuestId(storedGuestId);
    setGuestName(storedGuestName);

    // Get quiz data
    const storedQuiz = sessionStorage.getItem(`shared-quiz-${shareCode}`);
    if (storedQuiz) {
      const quizData = JSON.parse(storedQuiz);
      // Fetch full quiz with questions
      fetchFullQuiz(quizData.id);
    } else {
      fetchQuizByCode();
    }
  }, [shareCode]);

  const fetchFullQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/shared/${shareCode}`);
      const data = await response.json();
      if (response.ok) {
        setQuiz(data);
      }
    } catch (err) {
      console.error("Failed to fetch quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizByCode = async () => {
    try {
      const response = await fetch(`/api/shared/${shareCode}`);
      const data = await response.json();
      if (response.ok) {
        setQuiz(data);
      } else {
        router.push(`/quiz/share/${shareCode}`);
      }
    } catch (err) {
      router.push(`/quiz/share/${shareCode}`);
    } finally {
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    if (!quiz) return;
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast.error("Please select an answer before continuing");
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!answers[currentQuestion.id]) {
      toast.error("Please answer the current question before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate score
      let score = 0;
      quiz.questions.forEach((question) => {
        if (answers[question.id]?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
          score++;
        }
      });

      // Save attempt to database
      try {
        await fetch("/api/shared/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: quiz.id,
            guestId,
            guestName,
            score,
            totalQuestions: quiz.questions.length,
            answers,
          }),
        });
      } catch (err) {
        console.error("Failed to save attempt:", err);
      }

      // Store results in sessionStorage
      const resultData = {
        score,
        totalQuestions: quiz.questions.length,
        answers,
        guestName,
        timeElapsed,
        completedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(`shared-result-${shareCode}`, JSON.stringify(resultData));

      router.push(`/quiz/share/${shareCode}/results`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">{quiz.title}</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {quiz.subject}
                  </Badge>
                  <span className="text-sm text-slate-400">Playing as {guestName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 bg-slate-900/50 border-slate-800/50 backdrop-blur">
                {/* Question */}
                <div className="mb-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-purple-400">
                        {currentQuestionIndex + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white leading-relaxed">
                        {currentQuestion.question}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-4 mb-8">
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
                          transition={{ delay: index * 0.1 }}
                        >
                          <Label
                            htmlFor={`option-${index}`}
                            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              answers[currentQuestion.id] === option
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-slate-700 hover:border-slate-600"
                            }`}
                          >
                            <RadioGroupItem
                              value={option}
                              id={`option-${index}`}
                              className="text-purple-500"
                            />
                            <span className="text-lg text-white flex-1">{option}</span>
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
                          transition={{ delay: index * 0.1 }}
                        >
                          <Label
                            htmlFor={`option-${index}`}
                            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              answers[currentQuestion.id] === option
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-slate-700 hover:border-slate-600"
                            }`}
                          >
                            <RadioGroupItem
                              value={option}
                              id={`option-${index}`}
                              className="text-purple-500"
                            />
                            <span className="text-lg text-white flex-1">{option}</span>
                          </Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQuestion.type === "fill_blank" && (
                    <div>
                      <Input
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        placeholder="Type your answer here..."
                        className="text-lg p-6 bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : isLastQuestion ? (
                      "Submit Quiz"
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Question Indicators */}
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? "bg-purple-600 text-white"
                        : answers[quiz.questions[index].id]
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
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
    </div>
  );
}
