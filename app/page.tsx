"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight, Upload, Sparkles, Trophy, Zap,
  CheckCircle2, Circle, BookOpen, Clock, TrendingUp,
  Menu, X, Youtube, Play, Smartphone,
} from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { AppLogo } from "@/components/ui/AppLogo";
import { useRef, useEffect, useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────
const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload your content",
    body: "Paste text, drop a PDF, or paste a YouTube link. Any subject, any length — from lecture videos to entire textbooks.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "AI generates your quiz",
    body: "Gemini analyzes your content and creates targeted, challenging questions that test real understanding in under 10 seconds.",
  },
  {
    icon: Zap,
    number: "03",
    title: "Take the quiz & learn",
    body: "Answer questions with instant feedback. See what you know, identify gaps, and build lasting memory through active recall.",
  },
  {
    icon: Trophy,
    number: "04",
    title: "Track & master",
    body: "Review your results, retake quizzes, and watch your scores climb. Spaced repetition meets AI-powered learning.",
  },
];

const mockQuestions = [
  {
    q: "What is active recall?",
    options: ["Re-reading notes", "Testing yourself on material", "Highlighting text", "Making summaries"],
    correct: 1,
  },
  {
    q: "Which method improves retention most?",
    options: ["Passive reading", "Flashcards", "Active recall testing", "Mind mapping"],
    correct: 2,
  },
  {
    q: "How long does AI quiz generation take?",
    options: ["5 minutes", "1 minute", "30 seconds", "Under 10 seconds"],
    correct: 3,
  },
];

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = value / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Animated quiz widget (hero right) ───────────────────────────────────────
function QuizWidget() {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const current = mockQuestions[qIndex];

  useEffect(() => {
    if (!answered) return;
    const t = setTimeout(() => {
      setQIndex((q) => (q + 1) % mockQuestions.length);
      setSelected(null);
      setAnswered(false);
    }, 2000);
    return () => clearTimeout(t);
  }, [answered]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSelected(current.correct);
      setTimeout(() => {
        setAnswered(true);
        setScore((s) => Math.min(s + 1, mockQuestions.length));
      }, 700);
    }, 1400);
    return () => clearTimeout(t);
  }, [qIndex, current.correct]);

  const progress = ((qIndex + 1) / mockQuestions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 56, y: 16 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
      className="relative w-full max-w-[480px]"
    >
      <div className="absolute inset-0 -z-10 rounded-3xl blur-3xl bg-indigo-500/12 scale-110" />

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl overflow-hidden shadow-2xl">
        {/* Header - responsive padding and text */}
        <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-white/8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold text-white truncate">Biology — Cell Division</p>
              <p className="text-xs sm:text-sm text-slate-500">AI Generated Quiz</p>
            </div>
          </div>
          <span className="text-sm sm:text-base text-slate-500 font-mono bg-white/5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full flex-shrink-0">
            {qIndex + 1}/{mockQuestions.length}
          </span>
        </div>

        <div className="h-1.5 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        {/* Question - responsive padding */}
        <div className="px-4 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-6">
          <motion.p
            key={qIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-base sm:text-lg font-semibold text-white leading-snug mb-4 sm:mb-6"
          >
            {current.q}
          </motion.p>

          <div className="space-y-2 sm:space-y-3">
            {current.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === current.correct;
              const showResult = answered;

              let border = "border-white/8";
              let bg = "bg-white/[0.02]";
              let text = "text-slate-400";

              if (showResult && isCorrect) {
                border = "border-emerald-500/50";
                bg = "bg-emerald-500/10";
                text = "text-emerald-300";
              } else if (showResult && isSelected && !isCorrect) {
                border = "border-red-500/40";
                bg = "bg-red-500/8";
                text = "text-red-300";
              } else if (isSelected && !showResult) {
                border = "border-indigo-400/50";
                bg = "bg-indigo-500/10";
                text = "text-indigo-200";
              }

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 + 0.1, duration: 0.3 }}
                  className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-xl border ${border} ${bg} transition-all duration-300`}
                >
                  {showResult && isCorrect
                    ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                    : <Circle className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-600"}`} />
                  }
                  <span className={`text-sm sm:text-base font-medium ${text} transition-colors duration-300`}>{opt}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer - responsive */}
        <div className="px-4 sm:px-7 py-4 sm:py-5 border-t border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span className="text-sm sm:text-base text-slate-400">
              Score: <span className="text-white font-bold">{score}/{mockQuestions.length}</span>
            </span>
          </div>
          <motion.span
            key={answered ? "correct" : "pending"}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-sm sm:text-base font-semibold ${answered ? "text-emerald-400" : "text-slate-500"}`}
          >
            {answered ? "Correct!" : "Thinking…"}
          </motion.span>
        </div>
      </div>

      {/* Floating badges - hidden on very small screens, adjusted position on mobile */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="hidden sm:flex absolute -top-3 -right-3 md:-top-4 md:-right-4 items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full bg-white/8 border border-white/12 backdrop-blur text-xs md:text-sm text-slate-300 font-medium shadow-xl"
      >
        <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-indigo-300" />
        Generated in 8s
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="hidden sm:flex absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full bg-white/8 border border-white/12 backdrop-blur text-xs md:text-sm text-slate-300 font-medium shadow-xl"
      >
        <Upload className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
        biology_notes.pdf
      </motion.div>
    </motion.div>
  );
}

// ─── Score result widget (CTA right) ─────────────────────────────────────────
function ResultWidget() {
  const [count, setCount] = useState(0);
  const target = 8;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCount(i);
      if (i >= target) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [inView]);

  const subjects = [
    { name: "Biology", score: 92, color: "bg-emerald-500" },
    { name: "History", score: 78, color: "bg-indigo-500" },
    { name: "Chemistry", score: 85, color: "bg-violet-500" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 48 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      className="relative w-full max-w-[440px]"
    >
      <div className="absolute inset-0 -z-10 rounded-3xl blur-3xl bg-emerald-500/10 scale-110" />

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl overflow-hidden shadow-2xl">
        {/* Header - responsive */}
        <div className="px-5 sm:px-8 py-5 sm:py-7 border-b border-white/8">
          <p className="text-sm sm:text-base text-slate-400 mb-2">Quiz complete</p>
          <div className="flex items-end gap-2 sm:gap-3">
            <span className="text-5xl sm:text-7xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
              {count}
            </span>
            <span className="text-2xl sm:text-3xl text-slate-500 mb-1 sm:mb-3">/ 10</span>
          </div>
          <div className="mt-3 sm:mt-4 h-2.5 sm:h-3 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${(target / 10) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            />
          </div>
          <p className="text-sm sm:text-base text-emerald-400 font-semibold mt-2 sm:mt-3">Great work — 80% correct!</p>
        </div>

        {/* Subjects - responsive */}
        <div className="px-5 sm:px-8 py-5 sm:py-6 space-y-4 sm:space-y-5">
          <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-widest font-semibold">Your subjects</p>
          {subjects.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 + 0.3 }}
              className="flex items-center gap-3 sm:gap-5"
            >
              <span className="text-sm sm:text-base text-slate-300 w-20 sm:w-24">{s.name}</span>
              <div className="flex-1 h-2 sm:h-2.5 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${s.color} rounded-full`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.score}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 + 0.6 }}
                />
              </div>
              <span className="text-sm sm:text-base font-bold text-white w-10 sm:w-12 text-right">{s.score}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" } as const,
    transition: { duration: 0.7, ease: "easeOut" as const, delay },
  };
}

function Rule() {
  return <hr className="border-white/6 w-full" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only attach scroll tracking after mount to avoid hydration mismatch
  const { scrollYProgress } = useScroll({ 
    target: mounted ? heroRef : undefined, 
    offset: ["start start", "end start"] 
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  if (!mounted) {
    return (
      <div className="min-h-screen relative overflow-x-hidden" style={{ fontFamily: "var(--font-inter), sans-serif" }} />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ fontFamily: "var(--font-inter), sans-serif" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-5 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <AppLogo size="md" />
        </motion.div>

        {/* Desktop nav */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden sm:flex items-center gap-3 sm:gap-4"
        >
          <a href="#features">
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium h-10 px-4">
              Features
            </Button>
          </a>
          <a href="#how-it-works">
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium h-10 px-4">
              How it works
            </Button>
          </a>
          <Link href="/sign-in">
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 text-sm sm:text-base font-medium h-10 sm:h-11 px-4 sm:px-6">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-white text-slate-950 hover:bg-slate-100 text-sm sm:text-base font-semibold h-10 sm:h-11 px-5 sm:px-7 rounded-xl">
              Get started
            </Button>
          </Link>
        </motion.div>

        {/* Mobile menu button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sm:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[65px] z-40 sm:hidden bg-black/95 backdrop-blur-2xl border-b border-white/5"
          >
            <div className="flex flex-col p-4 gap-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-center text-slate-400 hover:text-white hover:bg-white/5 text-base font-medium h-12">
                  Features
                </Button>
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-center text-slate-400 hover:text-white hover:bg-white/5 text-base font-medium h-12">
                  How it works
                </Button>
              </a>
              <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-center text-slate-400 hover:text-white hover:bg-white/5 text-base font-medium h-12">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-white text-slate-950 hover:bg-slate-100 text-base font-semibold h-12 rounded-xl">
                  Get started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24"
      >
        <div className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, transparent 50%, rgba(16,185,129,0.06) 100%)" }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-20"
        >
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-6 sm:mb-10"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
              AI-powered study tool
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold leading-[1.02] tracking-tight text-white mb-5 sm:mb-8"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              A New Vision
              <br />
              <span className="text-slate-400">for Revision.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-400 font-light max-w-lg mb-8 sm:mb-12 leading-relaxed"
            >
              Upload notes or paste a YouTube link. Get a quiz in 10 seconds.
              Stop re-reading — start recalling.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-5 w-full sm:w-auto"
            >
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-bold text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 rounded-xl sm:rounded-2xl group">
                  Start for free
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto">
                <Button size="lg" variant="ghost" className="w-full sm:w-auto text-slate-400 hover:text-white hover:bg-white/5 text-base sm:text-lg h-12 sm:h-14 px-8 sm:px-10 rounded-xl sm:rounded-2xl">
                  See how it works
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="mt-10 sm:mt-16 flex flex-wrap items-center gap-6 sm:gap-8 lg:gap-12 border-t border-white/8 pt-8 sm:pt-10"
            >
              {[
                { value: "10s", label: "Quiz generation" },
                { value: "50%", label: "Better retention" },
                { value: "∞", label: "Subjects" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stat.value}</span>
                  <span className="text-sm sm:text-base text-slate-500 mt-0.5 sm:mt-1">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* QuizWidget - Hidden on mobile, shown from md breakpoint */}
          <div className="hidden md:flex items-center justify-center lg:justify-end">
            <QuizWidget />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-14 sm:h-20 bg-gradient-to-b from-white/25 to-transparent" />
        </motion.div>
      </section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════════════
          WHY — Bento grid with large feature card
      ════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 py-20 sm:py-24 md:py-32 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "linear-gradient(160deg, rgba(251,191,36,0.06) 0%, transparent 40%, rgba(99,102,241,0.08) 100%)" }}
        />

        {/* Section header */}
        <motion.div {...fadeUpProps(0)} className="text-center mb-12 sm:mb-16 md:mb-20 max-w-4xl mx-auto px-2">
          <p className="text-sm sm:text-base text-indigo-400 font-semibold tracking-widest uppercase mb-4 sm:mb-6">Why Re-vision</p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Study smarter with
            <span className="text-slate-500"> science-backed learning</span>
          </h2>
        </motion.div>

        {/* Bento grid - responsive */}
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 group/bento">
          
          {/* YouTube Feature Card — NEW HIGHLIGHT — spans 2 cols on lg */}
          <motion.div
            {...fadeUpProps(0.05)}
            className="lg:col-span-2 relative rounded-2xl sm:rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-red-500/[0.08] to-transparent p-6 sm:p-8 md:p-10 lg:p-12 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-red-500/40 hover:z-10 group-hover/bento:blur-[2px] hover:!blur-none group-hover/bento:opacity-70 hover:!opacity-100"
          >
            <div className="pointer-events-none absolute top-0 right-0 w-60 sm:w-80 h-60 sm:h-80 bg-red-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 rounded-xl sm:rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <Youtube className="w-6 h-6 sm:w-7 md:w-8 sm:h-7 md:h-8 text-red-400" />
                </div>
                <span className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                  New Feature
                </span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">YouTube to Quiz</h3>
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg mb-6 sm:mb-8">
                Paste any YouTube lecture link. Our AI extracts the transcript, filters out the fluff, 
                and generates a quiz focused on the actual educational content.
              </p>
              
              {/* Mini demo */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/8 max-w-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 ml-0.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base text-white font-medium truncate">youtube.com/watch?v=...</p>
                  <p className="text-xs sm:text-sm text-slate-500">Paste link → Get quiz instantly</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right column: Instant Generation + PWA stacked */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Instant Generation card */}
            <motion.div
              {...fadeUpProps(0.1)}
              className="relative rounded-2xl sm:rounded-[2rem] border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-5 sm:p-6 md:p-8 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/40 hover:z-10 group-hover/bento:blur-[2px] hover:!blur-none group-hover/bento:opacity-70 hover:!opacity-100"
            >
              <div className="pointer-events-none absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-amber-500/10 rounded-full blur-[60px]" />
              
              <div className="relative z-10">
                <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4 sm:mb-6">
                  <Clock className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7 text-amber-400" />
                </div>
                
                <div className="flex items-end gap-2 mb-2 sm:mb-3">
                  <span className="text-4xl sm:text-5xl font-bold text-amber-400" style={{ fontFamily: "var(--font-playfair)" }}>
                    <AnimatedNumber value={10} />
                  </span>
                  <span className="text-lg sm:text-xl text-amber-400/70 mb-1 font-medium">sec</span>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">Instant generation</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  AI creates your quiz before you finish your coffee.
                </p>
              </div>
            </motion.div>

            {/* PWA card */}
            <motion.div
              {...fadeUpProps(0.15)}
              className="relative rounded-2xl sm:rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.08] to-transparent p-5 sm:p-6 md:p-8 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/40 hover:z-10 group-hover/bento:blur-[2px] hover:!blur-none group-hover/bento:opacity-70 hover:!opacity-100"
            >
              <div className="pointer-events-none absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-cyan-500/10 rounded-full blur-[60px]" />
              
              <div className="relative z-10">
                <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 rounded-xl sm:rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-4 sm:mb-6">
                  <Smartphone className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7 text-cyan-400" />
                </div>

                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">PWA</span>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">Works offline</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  Install on any device. Study anywhere — no internet required.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Second row: 3 cards */}
          <motion.div
            {...fadeUpProps(0.2)}
            className="relative rounded-2xl sm:rounded-[2rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.08] to-transparent p-5 sm:p-6 md:p-8 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/40 hover:z-10 group-hover/bento:blur-[2px] hover:!blur-none group-hover/bento:opacity-70 hover:!opacity-100"
          >
            <div className="pointer-events-none absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-indigo-500/10 rounded-full blur-[60px]" />
            
            <div className="relative z-10">
              <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 rounded-xl sm:rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 sm:mb-6">
                <TrendingUp className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7 text-indigo-400" />
              </div>
              
              <div className="flex items-end gap-2 mb-2 sm:mb-3">
                <span className="text-4xl sm:text-5xl font-bold text-indigo-400" style={{ fontFamily: "var(--font-playfair)" }}>
                  <AnimatedNumber value={50} suffix="%" />
                </span>
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">Better retention</h3>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Active recall beats re-reading. Science proves it.
              </p>
            </div>
          </motion.div>

          <motion.div
            {...fadeUpProps(0.3)}
            className="relative rounded-2xl sm:rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-5 sm:p-6 md:p-8 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/40 hover:z-10 group-hover/bento:blur-[2px] hover:!blur-none group-hover/bento:opacity-70 hover:!opacity-100"
          >
            <div className="pointer-events-none absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-emerald-500/10 rounded-full blur-[60px]" />
            
            <div className="relative z-10">
              <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 sm:mb-6">
                <BookOpen className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7 text-emerald-400" />
              </div>
              
              <div className="flex items-end gap-2 mb-2 sm:mb-3">
                <span className="text-4xl sm:text-5xl font-bold text-emerald-400" style={{ fontFamily: "var(--font-playfair)" }}>
                  Any
                </span>
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">Subject supported</h3>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                History, biology, code, law — AI understands it all.
              </p>
            </div>
          </motion.div>

          {/* Powered by AI Card */}
          <motion.div
            {...fadeUpProps(0.35)}
            className="relative rounded-2xl sm:rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.06] via-transparent to-cyan-500/[0.06] p-4 sm:p-5 md:p-6 overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/40 hover:z-10 group-hover/bento:blur-[2px] hover:!blur-none group-hover/bento:opacity-70 hover:!opacity-100"
          >
            <div className="pointer-events-none absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-violet-500/10 rounded-full blur-[60px]" />
            
            <div className="relative z-10 flex flex-col h-full">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 sm:mb-4">Powered by</p>
              
              {/* Side by side logos */}
              <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
                {/* Gemini */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-2 sm:mb-3">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                      <polyline points="2 17 12 22 22 17"/>
                      <polyline points="2 12 12 17 22 12"/>
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-white">Gemini</p>
                  <p className="text-xs text-slate-500">Google AI</p>
                </div>
                
                {/* Groq */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-2 sm:mb-3">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="currentColor">
                      <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/>
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-white">Groq</p>
                  <p className="text-xs text-slate-500">LPU Inference</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════════════
          HOW IT WORKS — Vertical timeline
      ════════════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 py-20 sm:py-24 md:py-32 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "linear-gradient(200deg, rgba(139,92,246,0.08) 0%, transparent 40%, rgba(99,102,241,0.06) 100%)" }}
        />

        {/* Section header */}
        <motion.div {...fadeUpProps(0)} className="text-center mb-14 sm:mb-18 md:mb-24 max-w-4xl mx-auto px-2">
          <p className="text-sm sm:text-base text-violet-400 font-semibold tracking-widest uppercase mb-4 sm:mb-6">How it works</p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Four steps to
            <span className="text-slate-500"> mastering anything</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto w-full relative">
          {/* Center line - hidden on mobile, shown from md */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-indigo-500/50 to-emerald-500/50 -translate-x-1/2 hidden md:block" />

          {/* Mobile left line */}
          <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-indigo-500/50 to-emerald-500/50 md:hidden" />

          <div className="space-y-8 sm:space-y-12 md:space-y-0">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              const colors = [
                { bg: "bg-violet-500/20", border: "border-violet-500/30", text: "text-violet-400", glow: "bg-violet-500/20" },
                { bg: "bg-indigo-500/20", border: "border-indigo-500/30", text: "text-indigo-400", glow: "bg-indigo-500/20" },
                { bg: "bg-sky-500/20", border: "border-sky-500/30", text: "text-sky-400", glow: "bg-sky-500/20" },
                { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-400", glow: "bg-emerald-500/20" },
              ][i];

              return (
                <motion.div
                  key={i}
                  {...fadeUpProps(i * 0.15)}
                  className={`relative flex items-start md:items-center gap-4 sm:gap-6 md:gap-8 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Mobile dot */}
                  <div className="md:hidden absolute left-5 sm:left-6 top-6 -translate-x-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-950 border-2 border-white/20 flex items-center justify-center z-10">
                    <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${colors.bg.replace('/20', '')}`} />
                  </div>

                  {/* Content card */}
                  <div className={`w-full md:w-[calc(50%-3rem)] pl-10 sm:pl-14 md:pl-0 ${isLeft ? "md:text-right" : "md:text-left"}`}>
                    <div className={`relative rounded-2xl sm:rounded-[2rem] border ${colors.border} bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6 md:p-8 lg:p-10 overflow-hidden group hover:border-white/20 transition-colors duration-500`}>
                      {/* Glow */}
                      <div className={`pointer-events-none absolute ${isLeft ? "-right-20 -top-20" : "-left-20 -top-20"} w-32 sm:w-40 h-32 sm:h-40 ${colors.glow} rounded-full blur-[80px] opacity-60`} />
                      
                      <div className={`relative z-10 flex flex-col ${isLeft ? "md:items-end" : "md:items-start"}`}>
                        {/* Number badge */}
                        <div className={`inline-flex items-center gap-3 mb-4 sm:mb-6`}>
                          <span className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${colors.text} opacity-30 font-mono`}>{step.number}</span>
                        </div>
                        
                        {/* Icon */}
                        <div className={`w-12 h-12 sm:w-14 lg:w-16 sm:h-14 lg:h-16 rounded-xl sm:rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4 sm:mb-6`}>
                          <step.icon className={`w-6 h-6 sm:w-7 lg:w-8 sm:h-7 lg:h-8 ${colors.text}`} />
                        </div>
                        
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-4">{step.title}</h3>
                        <p className="text-sm sm:text-base lg:text-lg text-slate-400 leading-relaxed">{step.body}</p>
                      </div>
                    </div>
                  </div>

                  {/* Center dot - desktop only */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-slate-950 border-2 border-white/20 items-center justify-center z-10">
                    <div className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full ${colors.bg.replace('/20', '')}`} />
                  </div>

                  {/* Spacer for the other side - desktop only */}
                  <div className="hidden md:block w-[calc(50%-3rem)]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section id="cta" className="relative min-h-screen flex items-center px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 py-20 sm:py-24 md:py-32 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "linear-gradient(140deg, rgba(16,185,129,0.08) 0%, transparent 50%, rgba(99,102,241,0.06) 100%)" }}
        />

        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center">
          <motion.div {...fadeUpProps(0)} className="flex flex-col items-start">
            <p className="text-sm sm:text-base text-emerald-400 font-semibold tracking-widest uppercase mb-5 sm:mb-8">Get started today</p>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold text-white leading-[1.02] mb-5 sm:mb-8"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Study smarter.
              <br />
              <span className="text-slate-400">Not longer.</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-400 font-light mb-10 sm:mb-14 leading-relaxed max-w-lg">
              Join students who use Re-vision to convert passive notes into active knowledge — and actually remember what they study.
            </p>
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-bold text-base sm:text-lg px-8 sm:px-12 h-14 sm:h-16 rounded-xl sm:rounded-2xl group">
                Create your first quiz — free
                <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* ResultWidget - Hidden on mobile, shown from md */}
          <div className="hidden md:flex items-center justify-center lg:justify-end">
            <ResultWidget />
          </div>
        </div>
      </section>

      <Rule />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm sm:text-base text-slate-500">
        <div className="flex items-center gap-2 sm:gap-3">
          <AppLogo size="sm" />
        </div>
        <span className="text-center sm:text-right">Built for students who want to learn better.</span>
      </footer>
    </div>
  );
}
