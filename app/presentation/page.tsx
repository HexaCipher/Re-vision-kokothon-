"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Home, Maximize2, Minimize2,
  Sparkles, Youtube, FileText, RefreshCw, Share2, UserCheck, 
  Timer, WifiOff, TrendingUp, Check, X, Users, Zap, Target,
  BookOpen, Brain, Rocket, Trophy, ExternalLink,
  Lightbulb, Globe, Bell, Camera, MessageSquare, School,
  CreditCard, Gift, Building, GraduationCap, DollarSign, Heart,
  Mic, Languages, Image as ImageIcon, CalendarClock, BrainCircuit, Gamepad2,
  Database, Server, Cloud, ArrowRight, Laptop, Tablet, Smartphone, FileJson, Layers, Cpu, Code
} from "lucide-react";
import Link from "next/link";
import { AppLogo } from "@/components/ui/AppLogo";

// ─── Quietude Logo SVG ───────────────────────────────────────────────────────
function QuietudeLogo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={className}>
      <defs>
        <linearGradient id="quietude-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#c26838' }} />
          <stop offset="100%" style={{ stopColor: '#a85a32' }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#quietude-bg-gradient)" />
      <text 
        x="16" 
        y="23" 
        fontFamily="Georgia, serif" 
        fontSize="22" 
        fontWeight="500"
        fill="#ffffff" 
        textAnchor="middle"
        fontStyle="italic"
      >Q</text>
    </svg>
  );
}

import Image from "next/image";

// ─── Team Data ───────────────────────────────────────────────────────────────
const teamMembers = [
  { name: "Manish Yadav", role: "Team Leader & UI Design", initial: "M", color: "violet", image: "/images/members/manish_yadav.jpeg" },
  { name: "Rajput Aman Singh", role: "Backend & Full Stack", initial: "A", color: "indigo", image: "/images/members/rajput_aman_singh.jpeg" },
  { name: "Bhumika Mehra", role: "Market Research", initial: "B", color: "emerald", image: "/images/members/bhumika_mehra.jpeg" },
  { name: "Deepanita", role: "PPT & Presentation", initial: "D", color: "amber", image: "/images/members/deepanita.jpeg" },
];

// ─── Competitor Data ─────────────────────────────────────────────────────────
const competitors = [
  { name: "Re-vision", icon: null, color: null, textColor: null, isUs: true },
  { name: "Quietude", icon: "Q", color: "bg-orange-500", textColor: "text-white", customLogo: "quietude" },
  { name: "Quizlet", logo: "/images/logos/quizlet.png", color: "bg-white", textColor: "text-blue-600" },
  { name: "Anki", logo: "/images/logos/anki.png", color: "bg-white", textColor: "text-cyan-500" },
  { name: "Notion", logo: "/images/logos/Notion.png", color: "bg-white", textColor: "text-slate-800" },
  { name: "Kahoot", logo: "/images/logos/kahoot.png", color: "bg-white", textColor: "text-purple-600" },
];

const comparisonFeatures = [
  { name: "AI Quiz from Content", icon: Sparkles, scores: [true, true, false, false, false, false] },
  { name: "YouTube → Quiz", icon: Youtube, scores: [true, false, false, false, false, false] },
  { name: "PDF/Document Upload", icon: FileText, scores: [true, false, false, false, false, false] },
  { name: "Dual-AI Failover", icon: RefreshCw, scores: [true, false, false, false, false, false] },
  { name: "Quiz Sharing", icon: Share2, scores: [true, false, true, false, true, true] },
  { name: "Guest Access (No Signup)", icon: UserCheck, scores: [true, false, false, false, false, false] },
  { name: "Multiple Timer Modes", icon: Timer, scores: [true, false, false, true, false, true] },
  { name: "Offline PWA", icon: WifiOff, scores: [true, true, false, true, true, false] },
  { name: "Score History", icon: TrendingUp, scores: [true, false, true, true, false, true] },
];

// ─── Tech Stack ──────────────────────────────────────────────────────────────
const frontendStack = [
  { name: "Next.js 16", color: "bg-white/10" },
  { name: "React 19", color: "bg-cyan-500/20" },
  { name: "TypeScript", color: "bg-blue-500/20" },
  { name: "Tailwind v4", color: "bg-cyan-400/20" },
  { name: "Framer Motion", color: "bg-pink-500/20" },
  { name: "shadcn/ui", color: "bg-violet-500/20" },
  { name: "Lucide Icons", color: "bg-slate-500/20" },
  { name: "PWA/Serwist", color: "bg-emerald-500/20" },
];

const backendStack = [
  { name: "Next.js API", color: "bg-white/10" },
  { name: "Firebase", color: "bg-amber-500/20" },
  { name: "Clerk Auth", color: "bg-violet-500/20" },
  { name: "Gemini 2.0", color: "bg-blue-400/20" },
  { name: "Groq Llama", color: "bg-orange-500/20" },
  { name: "unpdf/mammoth", color: "bg-red-500/20" },
  { name: "Innertube API", color: "bg-red-400/20" },
  { name: "Vercel", color: "bg-slate-500/20" },
];

// ─── Project Stats ───────────────────────────────────────────────────────────
const projectStats = [
  { value: "13", label: "Routes" },
  { value: "10", label: "API Endpoints" },
  { value: "30+", label: "UI Components" },
  { value: "3", label: "AI Pipelines" },
  { value: "0", label: "YouTube API Keys", note: "Custom Innertube" },
];

// ─── Slide Components ────────────────────────────────────────────────────────

function TitleSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <AppLogo size="lg" />
      </motion.div>
      
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        A New Vision for <span className="text-violet-400">Revision</span>
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-xl sm:text-2xl text-slate-400 mb-12 max-w-3xl"
      >
        AI-powered quiz generation from your notes, PDFs, and YouTube videos
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex items-center gap-3 text-violet-400 font-semibold text-lg">
          <Users className="w-5 h-5" />
          <span>JUGAAD CODERS</span>
        </div>
        <p className="text-slate-500">Built at KOKOTHON</p>
      </motion.div>
    </div>
  );
}

function TeamSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="text-violet-400 font-semibold tracking-widest uppercase mb-3">Meet The Team</p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          JUGAAD CODERS
        </h2>
      </motion.div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-5xl w-full">
        {teamMembers.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 sm:p-8 flex flex-col items-center text-center"
          >
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-4 border-2 relative
              ${member.color === 'violet' ? 'border-violet-500/50' : ''}
              ${member.color === 'indigo' ? 'border-indigo-500/50' : ''}
              ${member.color === 'emerald' ? 'border-emerald-500/50' : ''}
              ${member.color === 'amber' ? 'border-amber-500/50' : ''}
            `}>
              <Image 
                src={member.image} 
                alt={member.name}
                fill
                className="object-cover"
                style={
                  member.name === "Deepanita" || member.name === "Bhumika Mehra"
                    ? { transform: "scale(1.2)", objectPosition: "center center" }
                    : undefined
                }
              />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{member.name}</h3>
            <p className="text-sm text-slate-400">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProblemSlide() {
  const problems = [
    { icon: BookOpen, title: "Passive Studying Fails", desc: "80% of students rely on re-reading notes — research shows active recall improves retention by 50%+" },
    { icon: Youtube, title: "YouTube is One-Way", desc: "Millions learn from YouTube but zero built-in self-testing — you watch, forget, repeat" },
    { icon: Zap, title: "Existing Tools Are Limited", desc: "Flashcard apps require manual input, quiz generators only accept text, most hit rate limits" },
  ];
  
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="text-red-400 font-semibold tracking-widest uppercase mb-3">The Problem</p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Students Study <span className="text-red-400">Wrong</span>
        </h2>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {problems.map((problem, i) => {
          const Icon = problem.icon;
          return (
            <motion.div
              key={problem.title}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 sm:p-8"
            >
              <Icon className="w-10 h-10 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{problem.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{problem.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SolutionSlide() {
  const solutions = [
    { icon: FileText, title: "Any Content", desc: "Paste text, upload PDF/DOCX, or paste YouTube URL" },
    { icon: Brain, title: "AI Generation", desc: "Gemini + Groq dual-AI creates quizzes in seconds" },
    { icon: Rocket, title: "Instant Learning", desc: "Take quiz, get feedback, track progress" },
  ];
  
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="text-emerald-400 font-semibold tracking-widest uppercase mb-3">The Solution</p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Paste. Generate. <span className="text-emerald-400">Master.</span>
        </h2>
      </motion.div>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-8 max-w-5xl w-full">
        {solutions.map((solution, i) => {
          const Icon = solution.icon;
          return (
            <motion.div
              key={solution.title}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <Icon className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{solution.title}</h3>
              <p className="text-slate-400 text-sm max-w-[200px]">{solution.desc}</p>
              
              {i < solutions.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="hidden md:block absolute"
                  style={{ left: `${33 * (i + 1)}%`, transform: 'translateX(-50%)' }}
                >
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <Zap className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">Under 10 seconds generation time</span>
        </div>
      </motion.div>
    </div>
  );
}

function ComparisonSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 sm:px-8 overflow-hidden">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <p className="text-indigo-400 font-semibold tracking-widest uppercase mb-3">Market Research</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          What Makes Us <span className="text-indigo-400">Different</span>
        </h2>
      </motion.div>
      
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden w-full max-w-6xl overflow-x-auto"
      >
        {/* Table header */}
        <div className="grid grid-cols-[minmax(120px,1.2fr)_repeat(6,minmax(60px,1fr))] gap-1 sm:gap-2 p-3 sm:p-4 bg-white/[0.03] border-b border-white/5 min-w-[550px]">
          <div />
          {competitors.map((comp: any) => (
            <div key={comp.name} className="flex flex-col items-center gap-1">
              {comp.isUs ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#0A0F1E] border border-white/20 flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm" style={{ fontFamily: "var(--font-space-grotesk)" }}>R</span>
                </div>
              ) : comp.logo ? (
                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center p-1">
                  <Image src={comp.logo} alt={comp.name} width={40} height={40} className="w-full h-full object-contain" />
                 </div>
              ) : comp.customLogo === "quietude" ? (
                <QuietudeLogo className="w-8 h-8 sm:w-10 sm:h-10" />
              ) : (
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${comp.color} flex items-center justify-center`}>
                  <span className={`${comp.textColor} font-bold text-xs sm:text-sm`}>{comp.icon}</span>
                </div>
              )}
              <span className={`text-[10px] sm:text-xs text-center ${comp.isUs ? 'text-white font-medium' : 'text-slate-400'}`}>{comp.name}</span>
            </div>
          ))}
        </div>

        {/* Feature rows */}
        <div className="min-w-[550px]">
          {comparisonFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                className={`grid grid-cols-[minmax(120px,1.2fr)_repeat(6,minmax(60px,1fr))] gap-1 sm:gap-2 p-2 sm:p-3 items-center ${i % 2 === 0 ? 'bg-white/[0.01]' : ''} border-b border-white/5 last:border-b-0`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-slate-300 leading-tight">{feature.name}</span>
                </div>
                {feature.scores.map((hasFeature, j) => (
                  <div key={j} className="flex justify-center">
                    {hasFeature ? (
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${j === 5 ? 'bg-emerald-500/30' : 'bg-emerald-500/20'}`}>
                        <Check className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${j === 5 ? 'text-emerald-300' : 'text-emerald-400'}`} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400/60" />
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            );
          })}
        </div>

        {/* Total row */}
        <div className="grid grid-cols-[minmax(120px,1.2fr)_repeat(6,minmax(60px,1fr))] gap-1 sm:gap-2 p-3 sm:p-4 bg-white/[0.03] border-t border-white/10 min-w-[550px]">
          <div>
            <span className="text-xs sm:text-sm font-semibold text-slate-300">Total</span>
          </div>
          {competitors.map((comp, i) => {
            const score = comparisonFeatures.filter(f => f.scores[i]).length;
            const total = comparisonFeatures.length;
            const isUs = comp.isUs;
            return (
              <div key={comp.name} className="flex justify-center">
                <span className={`text-sm sm:text-lg font-bold ${isUs ? 'text-emerald-400' : score >= 3 ? 'text-slate-300' : 'text-slate-500'}`}>
                  {score}/{total} {isUs && '🏆'}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function TechStackSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <p className="text-cyan-400 font-semibold tracking-widest uppercase mb-3">Technology</p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Built With <span className="text-cyan-400">Modern Stack</span>
        </h2>
      </motion.div>
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Frontend Stack */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] p-6"
        >
          <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Frontend
          </h3>
          <div className="flex flex-wrap gap-2">
            {frontendStack.map((tech, i) => (
              <motion.span
                key={tech.name}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                className={`${tech.color} border border-white/10 px-3 py-1.5 rounded-full text-xs sm:text-sm text-slate-200 font-medium`}
              >
                {tech.name}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Backend Stack */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.03] p-6"
        >
          <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Backend & Services
          </h3>
          <div className="flex flex-wrap gap-2">
            {backendStack.map((tech, i) => (
              <motion.span
                key={tech.name}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                className={`${tech.color} border border-white/10 px-3 py-1.5 rounded-full text-xs sm:text-sm text-slate-200 font-medium`}
              >
                {tech.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8 text-center text-slate-400"
      >
        <p className="text-lg">Production-grade • Type-safe • Scalable</p>
      </motion.div>
    </div>
  );
}

function StatsSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="text-amber-400 font-semibold tracking-widest uppercase mb-3">By The Numbers</p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          What We Built in <span className="text-amber-400">48 Hours</span>
        </h2>
      </motion.div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-5xl w-full">
        {projectStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 sm:p-8 text-center"
          >
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2">
              {stat.value}
            </div>
            <div className="text-sm sm:text-base text-slate-400">{stat.label}</div>
            {stat.note && <div className="text-xs text-emerald-400/70 mt-1">{stat.note}</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ArchitectureSlide() {
  const steps = [
    { 
      id: "input",
      title: "1. User Input", 
      icon: Laptop,
      items: ["Paste Text", "PDF Upload", "YouTube URL"],
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    { 
      id: "process",
      title: "2. Processing", 
      icon: Layers,
      items: ["unpdf / mammoth", "Innertube API", "Text Extraction"],
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    { 
      id: "ai",
      title: "3. AI Pipeline", 
      icon: BrainCircuit,
      items: ["Gemini 2.0 Flash (Primary)", "Groq Llama 3 (Fallback)", "JSON Validation"],
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20"
    },
    { 
      id: "store",
      title: "4. Storage & Sync", 
      icon: Database,
      items: ["Session Storage (Instant)", "Firebase (Persist)", "PWA Cache"],
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 w-full">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <p className="text-blue-400 font-semibold tracking-widest uppercase mb-3">System Design</p>
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          How It <span className="text-blue-400">Works</span>
        </h2>
      </motion.div>

      <div className="w-full max-w-6xl relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-emerald-500/20 -translate-y-1/2 hidden lg:block" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className={`relative rounded-2xl border ${step.border} ${step.bg} backdrop-blur-xl p-6 flex flex-col items-center text-center z-10 group hover:scale-105 transition-transform duration-300`}
              >
                <div className={`w-16 h-16 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className={`w-8 h-8 ${step.color}`} />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-4">{step.title}</h3>
                
                <div className="space-y-2 w-full">
                  {step.items.map((item, j) => (
                    <div key={j} className="text-xs sm:text-sm text-slate-300 bg-black/20 rounded-lg py-2 px-3 border border-white/5">
                      {item}
                    </div>
                  ))}
                </div>

                {/* Mobile Arrows */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 text-slate-600">
                    <ArrowRight className="w-5 h-5 rotate-90" />
                  </div>
                )}
                
                {/* Desktop Arrows */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-slate-600 translate-x-1/2 z-20">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DemoSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="text-pink-400 font-semibold tracking-widest uppercase mb-3">See It In Action</p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Live <span className="text-pink-400">Demo</span>
        </h2>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 sm:p-12 text-center max-w-2xl"
      >
        <div className="mb-8">
          <AppLogo size="lg" />
        </div>
        
        <p className="text-xl text-slate-400 mb-8">
          Transform your notes into interactive quizzes
        </p>
        
        <a
          href="https://re-vision-eosin.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white text-slate-950 hover:bg-slate-100 font-bold text-lg px-8 py-4 rounded-xl transition-colors"
        >
          Open Re-vision
          <ExternalLink className="w-5 h-5" />
        </a>
      </motion.div>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 text-slate-500"
      >
        re-vision-eosin.vercel.app
      </motion.p>
    </div>
  );
}

function FlowSlide() {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    { title: "User Uploads Content", description: "PDF, Text, or YouTube Link" },
    { title: "Preprocessing", description: "Content extraction & cleaning" },
    { title: "AI Analysis", description: "Contextual understanding" },
    { title: "Question Generation", description: "MCQs, True/False, Fill-ups" },
    { title: "Quiz Ready", description: "Instant playback & offline sync" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 bg-gradient-to-br from-black to-slate-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-12"
      >
        <p className="text-emerald-400 font-semibold tracking-widest uppercase text-sm mb-2">Simulated Flow</p>
        <h2 className="text-3xl sm:text-5xl font-bold text-white">
          <span className="text-emerald-400">Live</span> Processing Pipeline
        </h2>
      </motion.div>

      <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 hidden md:block rounded-full" />
        
        {/* Animated Progress Bar */}
        <motion.div 
          className="absolute top-1/2 left-0 h-1 bg-emerald-500 origin-left hidden md:block rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: (activeStage + 1) / stages.length }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {stages.map((stage, index) => {
          const isActive = index === activeStage;
          const isCompleted = index < activeStage;
          
          return (
            <div key={index} className="relative z-10 flex flex-col items-center group">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isActive || isCompleted ? "#10b981" : "#1e293b",
                  borderColor: isActive ? "#34d399" : "#334155",
                }}
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors duration-500 shadow-xl"
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <span className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-400"}`}>
                    {index + 1}
                  </span>
                )}
              </motion.div>
              
              <div className="mt-4 text-center max-w-[150px]">
                <h3 className={`text-sm font-bold transition-colors duration-300 ${isActive ? "text-white scale-105" : "text-slate-500"}`}>
                  {stage.title}
                </h3>
                <p className={`text-xs mt-1 transition-opacity duration-300 ${isActive ? "opacity-100 text-emerald-300" : "opacity-0"}`}>
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FutureScopeSlide() {
  const features = [
    { 
      icon: CalendarClock, 
      title: "Spaced Repetition", 
      desc: "Tracks weak questions and resurfaces them at 1, 3, 7-day intervals based on the forgetting curve — fully automatic, no manual flashcard setup.",
      color: "violet"
    },
    { 
      icon: Mic, 
      title: "Voice Notes to Quiz", 
      desc: "Record yourself speaking your notes — AI transcribes and generates a quiz from spoken content. Perfect for students who prefer verbal revision.",
      color: "violet"
    },
    { 
      icon: Zap, 
      title: "Multiplayer Quiz Battle", 
      desc: "Challenge a friend on the same topic in real time. First to answer correctly wins the point — makes studying competitive and fun.",
      color: "violet"
    },
    { 
      icon: Camera, 
      title: "Handwritten Notes Scanner", 
      desc: "Snap a photo of handwritten notes — OCR extracts the text, quiz gets generated. No need for digital notes at all.",
      color: "violet"
    },
    { 
      icon: School, 
      title: "Teacher Dashboard", 
      desc: "Teachers upload lecture notes, generate a quiz, share with the whole class. Track every student's score and export results as CSV.",
      color: "violet"
    },
    { 
      icon: FileText, 
      title: "Exam Simulator Mode", 
      desc: "Input your exam pattern — 30 MCQs, 2 hours, negative marking. Re-vision generates a full mock exam from your notes that mirrors the real format.",
      color: "violet"
    },
    { 
      icon: Globe, 
      title: "Article URL to Quiz", 
      desc: "Paste any blog, news article, or research paper URL — instant quiz from web content without copy-pasting.",
      color: "violet"
    },
    { 
      icon: Brain, 
      title: "Notes to Mind Map", 
      desc: "Upload notes and get a visual mind map instead of a quiz — great for understanding structure and connections between topics.",
      color: "violet"
    },
    { 
      icon: MessageSquare, 
      title: "AI Doubt Solver", 
      desc: "Ask 'explain this' during a quiz — AI teaches the concept without giving away the answer, keeping the learning active.",
      color: "violet"
    },
    { 
      icon: Users, 
      title: "Study Rooms", 
      desc: "A group uploads notes together, generates a shared quiz, and competes on a live leaderboard — collaborative studying.",
      color: "violet"
    },
    { 
      icon: TrendingUp, 
      title: "Weekly Progress Report", 
      desc: "AI-generated weekly report: your strengths, weak areas, and recommended topics to focus on before your next exam.",
      color: "violet"
    },
    { 
      icon: Layers, 
      title: "Anki Flashcard Export", 
      desc: "Generate Anki-style flashcards from your notes and export them directly to Anki format — bridging Re-vision with existing workflows.",
      color: "violet"
    },
  ];
  
  return (
    <div className="flex flex-col h-full px-4 sm:px-8 py-6 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6 flex-shrink-0"
      >
        <p className="text-purple-400 font-semibold tracking-widest uppercase mb-2 text-sm">The Roadmap</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Future <span className="text-purple-400">Scope</span>
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Features we are planning to build — turning Re-vision into a complete AI learning ecosystem
        </p>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 flex-1">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
              className="rounded-xl border border-purple-500/15 bg-purple-500/[0.04] backdrop-blur-xl p-4 flex flex-col gap-2 hover:border-purple-500/30 hover:bg-purple-500/[0.07] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom strip */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-4 flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-slate-300">Q2 2026 — First batch</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-300">10K users target</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-300">Mobile apps in Q3 2026</span>
        </div>
      </motion.div>
    </div>
  );
}

function MonetizationSlide() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      tagline: "Just getting started",
      icon: Gift,
      accent: "slate",
      features: [
        { text: "5 quiz generations / month", included: true },
        { text: "Unlimited quiz attempts", included: true },
        { text: "Text input only", included: true },
        { text: "Basic score tracking", included: true },
        { text: "PWA offline access", included: true },
        { text: "YouTube & PDF input", included: false },
        { text: "Quiz sharing", included: false },
        { text: "Score history & analytics", included: false },
      ],
    },
    {
      name: "Plus",
      price: "₹199",
      period: "/ month",
      tagline: "Most popular among students",
      icon: Zap,
      accent: "violet",
      popular: true,
      features: [
        { text: "30 quiz generations / month", included: true },
        { text: "Unlimited quiz attempts", included: true },
        { text: "All input types incl. PDF", included: true },
        { text: "Quiz sharing with friends", included: true },
        { text: "Score history & analytics", included: true },
        { text: "Multiple timer modes", included: true },
        { text: "Spaced repetition reminders", included: false },
        { text: "Priority AI generation", included: false },
      ],
    },
    {
      name: "Pro",
      price: "₹399",
      period: "/ month",
      tagline: "For serious learners",
      icon: Rocket,
      accent: "emerald",
      features: [
        { text: "Unlimited quiz generations", included: true },
        { text: "Unlimited quiz attempts", included: true },
        { text: "All input types incl. PDF", included: true },
        { text: "Quiz sharing with friends", included: true },
        { text: "Full analytics dashboard", included: true },
        { text: "Multiple timer modes", included: true },
        { text: "Spaced repetition reminders", included: true },
        { text: "Priority AI generation", included: true },
      ],
    },
  ];

  const accentMap: Record<string, { border: string; bg: string; text: string; check: string; badge: string }> = {
    slate:  { border: "border-white/10",       bg: "bg-white/[0.02]",        text: "text-slate-300",  check: "text-slate-400",  badge: "" },
    violet: { border: "border-violet-500/50",   bg: "bg-violet-500/[0.07]",   text: "text-violet-300", check: "text-violet-400", badge: "bg-violet-500 text-white" },
    emerald:{ border: "border-emerald-500/30",  bg: "bg-emerald-500/[0.05]",  text: "text-emerald-300",check: "text-emerald-400",badge: "" },
  };

  return (
    <div className="flex flex-col h-full px-4 sm:px-10 py-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="text-center mb-6 flex-shrink-0"
      >
        <p className="text-emerald-400 font-semibold tracking-widest uppercase mb-2 text-sm">Business Model</p>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Simple, <span className="text-emerald-400">Student-Friendly</span> Pricing
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Start free, upgrade when you need more — no hidden fees, no credit card required
        </p>
      </motion.div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 flex-1">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          const a = accentMap[plan.accent];
          return (
            <motion.div
              key={plan.name}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.12 }}
              className={`relative rounded-2xl border ${a.border} ${a.bg} backdrop-blur-xl p-6 flex flex-col`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${a.badge}`}>
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${a.border} ${a.bg}`}>
                  <Icon className={`w-5 h-5 ${a.text}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white leading-none">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.tagline}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-5">
                <span className={`text-4xl font-extrabold ${a.text}`}>{plan.price}</span>
                <span className="text-base text-slate-500">{plan.period}</span>
              </div>

              {/* Divider */}
              <div className={`h-px w-full mb-4 ${plan.accent === 'violet' ? 'bg-violet-500/30' : 'bg-white/[0.06]'}`} />

              {/* Features */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5">
                    {f.included ? (
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${a.check}`} />
                    ) : (
                      <X className="w-3.5 h-3.5 flex-shrink-0 text-slate-700" />
                    )}
                    <span className={`text-sm ${f.included ? 'text-slate-300' : 'text-slate-600'}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Footer perks */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="flex flex-wrap justify-center gap-2.5 mt-5 flex-shrink-0"
      >
        {[
          { icon: Heart,         text: "No ads ever",                  color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20" },
          { icon: CreditCard,    text: "Pay via UPI",                  color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20" },
          { icon: Users,         text: "Refer 3 friends → 1 month free", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
          { icon: GraduationCap, text: "50% off with .edu email",      color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium text-slate-300 ${item.bg}`}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${item.color}`} />
              <span>{item.text}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

function ClosingSlide() {
  return (
    <div className="flex flex-col h-full px-6 sm:px-16 py-8">
      {/* Top: Thank You */}
      <div className="flex flex-col items-center justify-center flex-1 text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <AppLogo size="lg" />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-3 leading-tight"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Thank You!
        </motion.h2>

        {/* Sub-line */}
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="text-slate-400 text-lg sm:text-xl max-w-xl mb-6"
        >
          Re-vision "A New Vision for Revision".
        </motion.p>

        {/* Team badge */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 font-semibold text-base mb-8"
        >
          <Trophy className="w-5 h-5" />
          <span>JUGAAD CODERS</span>
        </motion.div>
      </div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mb-7 flex-shrink-0"
      />

      {/* Bottom: Q&A */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex-shrink-0 text-center pb-2"
      >
        <p className="text-emerald-400 font-semibold tracking-widest uppercase text-xs mb-3">
          Questions &amp; Answers
        </p>
        <h3
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          We&apos;d love to hear{" "}
          <span className="text-emerald-400">your thoughts</span>
        </h3>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Ask us anything about the product, the tech, the team, or the journey.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Main Presentation Component ─────────────────────────────────────────────

const slides = [
  { id: 1, component: TitleSlide, title: "Title" },
  { id: 2, component: TeamSlide, title: "Team" },
  { id: 3, component: ProblemSlide, title: "Problem" },
  { id: 4, component: SolutionSlide, title: "Solution" },
  { id: 5, component: ComparisonSlide, title: "Comparison" },
  { id: 6, component: ArchitectureSlide, title: "Architecture" },
  { id: 7, component: FlowSlide, title: "Flow Simulation" },
  { id: 8, component: TechStackSlide, title: "Tech Stack" },
  { id: 9, component: StatsSlide, title: "Stats" },
  { id: 10, component: DemoSlide, title: "Demo" },
  { id: 11, component: FutureScopeSlide, title: "Future Scope" },
  { id: 12, component: MonetizationSlide, title: "Monetization" },
  { id: 13, component: ClosingSlide, title: "Closing" },
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, []);
  
  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);
  
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, toggleFullscreen]);
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  
  const CurrentSlideComponent = slides[currentSlide].component;
  
  return (
    <div 
      className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden flex flex-col"
      style={{ 
        background: "linear-gradient(135deg, #0a0a0f 0%, #0f1117 40%, #111827 70%, #0c1020 100%)",
        fontFamily: "var(--font-inter), sans-serif"
      }}
    >
      {/* Top navigation bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 bg-black/40 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <Home className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">Back to Home</span>
        </Link>
        
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-medium text-white">{currentSlide + 1}</span>
          <span>/</span>
          <span>{slides.length}</span>
        </div>
        
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          <span className="hidden sm:inline text-sm">{isFullscreen ? "Exit" : "Fullscreen"}</span>
        </button>
      </div>
      
      {/* Slide content */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <CurrentSlideComponent />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        {/* Previous button */}
        <button
          onClick={goToPrev}
          disabled={currentSlide === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            currentSlide === 0
              ? "text-slate-600 cursor-not-allowed"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        
        {/* Slide indicators */}
        <div className="flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide
                  ? "bg-white w-6"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              title={slide.title}
            />
          ))}
        </div>
        
        {/* Next button */}
        <button
          onClick={goToNext}
          disabled={currentSlide === slides.length - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            currentSlide === slides.length - 1
              ? "text-slate-600 cursor-not-allowed"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Keyboard hints */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-slate-600">
        <span>← → Navigate</span>
        <span>F Fullscreen</span>
        <span>Space Next</span>
      </div>
    </div>
  );
}
