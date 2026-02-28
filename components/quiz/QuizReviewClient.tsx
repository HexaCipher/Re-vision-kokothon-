"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, XCircle, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Question } from "@/types";

interface QuizReviewClientProps {
  quiz: {
    id: string;
    title: string;
    subject: string;
    questions: Question[];
  };
  userAnswers: Record<string, string>;
}

export default function QuizReviewClient({
  quiz,
  userAnswers,
}: QuizReviewClientProps) {
  const isCorrect = (question: Question) => {
    const userAnswer = userAnswers[question.id]?.toLowerCase().trim();
    const correctAnswer = question.correctAnswer.toLowerCase().trim();
    return userAnswer === correctAnswer;
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
              <span className="text-xl font-bold text-white">Re-vision</span>
            </Link>

            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-700">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Answer Review</h1>
            <div className="flex items-center gap-4">
              <p className="text-slate-400 text-lg">{quiz.title}</p>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {quiz.subject}
              </Badge>
            </div>
          </motion.div>

          {/* Questions */}
          <div className="space-y-6">
            {quiz.questions.map((question, index) => {
              const correct = isCorrect(question);
              const userAnswer = userAnswers[question.id];

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`p-6 backdrop-blur ${
                      correct
                        ? "bg-green-900/10 border-green-500/30"
                        : "bg-red-900/10 border-red-500/30"
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          correct ? "bg-green-500/20" : "bg-red-500/20"
                        }`}
                      >
                        {correct ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-slate-400">
                            Question {index + 1}
                          </span>
                          <Badge
                            className={
                              correct
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                            }
                          >
                            {correct ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">
                          {question.question}
                        </h3>
                      </div>
                    </div>

                    {/* Answers */}
                    <div className="space-y-3 ml-16">
                      {/* User's Answer */}
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Your Answer:</p>
                        <div
                          className={`p-3 rounded-lg ${
                            correct
                              ? "bg-green-500/10 border border-green-500/30"
                              : "bg-red-500/10 border border-red-500/30"
                          }`}
                        >
                          <p
                            className={`font-medium ${
                              correct ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {userAnswer || "No answer provided"}
                          </p>
                        </div>
                      </div>

                      {/* Correct Answer (if wrong) */}
                      {!correct && (
                        <div>
                          <p className="text-sm text-slate-400 mb-1">
                            Correct Answer:
                          </p>
                          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                            <p className="font-medium text-green-400">
                              {question.correctAnswer}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {question.explanation && (
                        <div>
                          <p className="text-sm text-slate-400 mb-1">
                            Explanation:
                          </p>
                          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                            <p className="text-slate-300">{question.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 mt-8"
          >
            <Link href={`/quiz/${quiz.id}/take`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Retry Quiz
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full border-slate-700">
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
