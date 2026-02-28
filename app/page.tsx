"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Zap, Brain, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Re-vision
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link href="/sign-in">
              <Button variant="outline" className="border-purple-500/50 hover:bg-purple-500/10">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Transform Your Notes
                </span>
                <br />
                <span className="text-white">Into Interactive Quizzes</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto"
            >
              Stop re-reading. Start recalling. Upload your study notes and get AI-generated quizzes in seconds. Master any subject through active learning.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6 group">
                  Get Started Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="border-purple-500/50 hover:bg-purple-500/10 text-lg px-8 py-6">
                  See How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-16 flex flex-wrap justify-center gap-12"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">10s</div>
                <div className="text-sm text-slate-400">Quiz Generation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">AI-Powered</div>
                <div className="text-sm text-slate-400">Smart Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">Any Subject</div>
                <div className="text-sm text-slate-400">Universal Support</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-slate-950/50 backdrop-blur">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Re-vision?</h2>
            <p className="text-slate-400 text-lg">Transform passive reading into active learning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-slate-900/20 border border-purple-500/20 backdrop-blur"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-slate-400">
                Upload your notes and get a complete quiz in under 10 seconds. No manual question creation needed.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-slate-900/20 border border-blue-500/20 backdrop-blur"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered</h3>
              <p className="text-slate-400">
                Advanced AI understands your notes and generates relevant, challenging questions that test real understanding.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-slate-900/20 border border-purple-500/20 backdrop-blur"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Active Recall</h3>
              <p className="text-slate-400">
                Studies show active recall improves retention by 50%. Stop re-reading, start remembering.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">From notes to mastery in 4 simple steps</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                step: "01",
                title: "Upload Your Notes",
                description: "Paste text or upload a PDF of your study notes. Any subject, any length.",
                icon: BookOpen,
              },
              {
                step: "02",
                title: "AI Generates Quiz",
                description: "Our AI reads and understands your notes, creating targeted questions in seconds.",
                icon: Brain,
              },
              {
                step: "03",
                title: "Take the Quiz",
                description: "Answer questions one by one with instant feedback. See what you know and what you don't.",
                icon: CheckCircle,
              },
              {
                step: "04",
                title: "Master Your Subject",
                description: "Review mistakes, retake quizzes, and track improvement. Active recall builds lasting knowledge.",
                icon: Zap,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-purple-400 font-mono text-sm mb-2">{item.step}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-lg">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Study Routine?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Join students who are acing their exams with active recall
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-12 py-6 group">
                Start Learning Smarter
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p>&copy; 2025 Re-vision. Built for students who want to learn better.</p>
        </div>
      </footer>
    </div>
  );
}
