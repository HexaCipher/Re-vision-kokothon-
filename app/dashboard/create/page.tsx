"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Sparkles, Loader2, Zap, Flame, Trophy, Clock, Timer, TimerOff, X, CheckCircle, FileUp, Youtube, Link2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { PageTransition, FadeIn } from "@/components/ui/PageTransition";
import { Navbar } from "@/components/ui/Navbar";
import { AppIcon } from "@/components/ui/AppLogo";
import { QuizLoader } from "@/components/ui/QuizLoader";

export default function CreateQuizPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [inputType, setInputType] = useState<"text" | "pdf" | "youtube">("text");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // PDF upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfMetadata, setPdfMetadata] = useState<{ pages?: number; characters: number; fileName: string; fileType?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isFetchingTranscript, setIsFetchingTranscript] = useState(false);
  const [transcriptMeta, setTranscriptMeta] = useState<{
    videoId: string;
    title: string;
    characters: number;
    wasTruncated: boolean;
  } | null>(null);

  // Supported file types
  const SUPPORTED_EXTENSIONS = ".pdf,.docx,.txt";

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    content: "",
    questionCount: 10,
    questionTypes: ["mcq"] as string[],
    difficulty: "medium" as "easy" | "medium" | "hard",
    timerMode: "none" as "none" | "quiz" | "question",
    timeLimit: 10, // minutes for quiz mode, seconds for question mode
  });

  // Handle document file selection and upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a PDF, DOCX, or TXT file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setPdfFile(file);
    setIsUploadingPdf(true);
    setPdfMetadata(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload/document", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process document");
      }

      // Update form content with extracted text
      setFormData((prev) => ({ ...prev, content: data.text }));
      setPdfMetadata(data.metadata);
      
      const pageInfo = data.metadata.pages ? ` from ${data.metadata.pages} page(s)` : "";
      toast.success(`Extracted ${data.metadata.characters.toLocaleString()} characters${pageInfo}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to process document");
      setPdfFile(null);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setPdfMetadata(null);
    setFormData((prev) => ({ ...prev, content: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFetchTranscript = async () => {
    if (!youtubeUrl.trim()) return;
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)/;
    if (!ytRegex.test(youtubeUrl.trim())) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }
    setIsFetchingTranscript(true);
    setTranscriptMeta(null);
    setFormData((prev) => ({ ...prev, content: "" }));
    try {
      const res = await fetch("/api/fetch-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch transcript");
      setFormData((prev) => ({ ...prev, content: data.transcript }));
      setTranscriptMeta({ videoId: data.videoId, title: data.title, characters: data.characters, wasTruncated: data.wasTruncated });
      if (data.wasTruncated) toast.warning("Transcript was truncated to 50,000 characters");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch transcript");
    } finally {
      setIsFetchingTranscript(false);
    }
  };

  const handleClearYoutube = () => {
    setYoutubeUrl("");
    setTranscriptMeta(null);
    setFormData((prev) => ({ ...prev, content: "" }));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!formData.content.trim()) {
        toast.error(inputType === "pdf" ? "Please upload a document" : inputType === "youtube" ? "Please fetch a video transcript" : "Please enter your notes");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.title.trim()) {
        toast.error("Please enter a quiz title");
        return;
      }
      if (!formData.subject.trim()) {
        toast.error("Please select a subject");
        return;
      }
      handleGenerateQuiz();
    }
  };

  const handleGenerateQuiz = async () => {
    if (!user) {
      toast.error("Please sign in to generate a quiz");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: formData.title,
          subject: formData.subject,
          content: formData.content,
          questionCount: formData.questionCount,
          questionTypes: formData.questionTypes,
          difficulty: formData.difficulty,
          sourceType: inputType,
          timerMode: formData.timerMode,
          timeLimit: formData.timeLimit,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429 && data.code === "RATE_LIMIT") {
          const retryAfter = data.retryAfter || 60;
          toast.error(
            `Rate limit reached. Please wait ${retryAfter}s and try again.`,
            { duration: Math.min(retryAfter * 1000, 15000) }
          );
          setIsGenerating(false);
          return;
        }
        throw new Error(data.error || "Failed to generate quiz");
      }

      toast.success("Quiz generated successfully!");
      
      // Store quiz data in sessionStorage for the take page (includes timer settings)
      const quizData = {
        id: data.quizId,
        title: formData.title,
        subject: formData.subject,
        difficulty: formData.difficulty,
        timerMode: formData.timerMode,
        timeLimit: formData.timeLimit,
        questions: data.questions,
        createdAt: new Date().toISOString(),
      };
      sessionStorage.setItem(`quiz-${data.quizId}`, JSON.stringify(quizData));
      
      router.push(`/quiz/${data.quizId}/take`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to generate quiz");
      setIsGenerating(false);
    }
  };

  const userData = user ? {
    name: user.fullName || user.firstName || "User",
    email: user.primaryEmailAddress?.emailAddress || "",
    imageUrl: user.imageUrl,
  } : undefined;

  if (isGenerating) {
    return <QuizLoader />;
  }

  return (
    <PageTransition className="min-h-screen bg-[#0a0a0a]">
      {/* Background gradient */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 50%, rgba(16,185,129,0.04) 100%)"
        }}
      />

      {/* Navbar */}
      <Navbar user={userData} showBackButton backHref="/dashboard" backLabel="Back to Dashboard" />

      {/* Main Content - responsive padding */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Header - responsive sizing */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <FadeIn>
              <div className="flex justify-center mb-4 sm:mb-6">
                <AppIcon size="lg" />
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3">
                Create New Quiz
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-slate-400 text-base sm:text-lg">
                Step {step} of 3
              </p>
            </FadeIn>
          </div>

          {/* Progress Bar - responsive */}
          <FadeIn delay={0.3} className="mb-6 sm:mb-8 md:mb-10">
            <div className="flex gap-2 sm:gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i <= step
                      ? "bg-white"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </FadeIn>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 sm:p-6 md:p-8">
                  <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                    Choose Input Method
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <button
                      onClick={() => setInputType("text")}
                      className={`p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 transition-all text-left ${
                        inputType === "text"
                          ? "border-white bg-white/5"
                          : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                      }`}
                    >
                      <FileText
                        className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 ${
                          inputType === "text" ? "text-white" : "text-slate-400"
                        }`}
                      />
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                        Paste Text
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        Copy and paste your notes directly
                      </p>
                    </button>

                    <button
                      onClick={() => setInputType("pdf")}
                      className={`p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 transition-all text-left ${
                        inputType === "pdf"
                          ? "border-white bg-white/5"
                          : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                      }`}
                    >
                      <Upload
                        className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 ${
                          inputType === "pdf" ? "text-white" : "text-slate-400"
                        }`}
                      />
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                        Upload Document
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        PDF, DOCX, or TXT files supported
                      </p>
                    </button>

                    <button
                      onClick={() => setInputType("youtube")}
                      className={`p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 transition-all text-left ${
                        inputType === "youtube"
                          ? "border-red-500/60 bg-red-500/5"
                          : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                      }`}
                    >
                      <Youtube
                        className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 ${
                          inputType === "youtube" ? "text-red-400" : "text-slate-400"
                        }`}
                      />
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                        YouTube Video
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        Paste a video URL
                      </p>
                    </button>
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full mt-6 sm:mt-8 bg-white text-slate-950 hover:bg-slate-100 h-12 sm:h-14 rounded-xl font-semibold text-sm sm:text-base"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 sm:p-6 md:p-8">
                  <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                    {inputType === "pdf" ? "Upload Your Document" : inputType === "youtube" ? "YouTube Video" : "Enter Your Notes"}
                  </h2>

                  {inputType === "text" ? (
                    // Text Input Mode
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <Label htmlFor="content" className="text-slate-300 font-medium text-sm sm:text-base">
                          Paste your study notes here
                        </Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) =>
                            setFormData({ ...formData, content: e.target.value })
                          }
                          placeholder="Paste your notes, lecture content, or any text you want to learn from..."
                          className="mt-2 sm:mt-3 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] bg-white/[0.02] border-white/10 text-white placeholder:text-slate-500 focus:border-white/30 rounded-xl resize-none text-sm sm:text-base"
                        />
                        <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3">
                          {formData.content.length.toLocaleString()} characters
                        </p>
                      </div>
                    </div>
                  ) : inputType === "youtube" ? (
                    // YouTube Mode
                    <div className="space-y-3 sm:space-y-4">
                      {isFetchingTranscript ? (
                        // Loading state
                        <div className="border-2 border-red-500/20 rounded-xl sm:rounded-2xl p-8 sm:p-10 text-center bg-red-500/5">
                          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-red-400 animate-spin" />
                          <p className="text-base sm:text-lg font-medium text-white mb-1">Fetching transcript...</p>
                          <p className="text-xs sm:text-sm text-slate-400">Extracting captions from the video</p>
                        </div>
                      ) : transcriptMeta ? (
                        // Success state
                        <div className="border-2 border-emerald-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 bg-emerald-500/5 space-y-3 sm:space-y-4">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <img
                              src={`https://img.youtube.com/vi/${transcriptMeta.videoId}/hqdefault.jpg`}
                              alt={transcriptMeta.title}
                              className="w-20 sm:w-28 rounded-lg object-cover flex-shrink-0 aspect-video"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium text-white text-sm sm:text-base line-clamp-2">{transcriptMeta.title}</p>
                                  <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                                    <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-xs">YouTube</Badge>
                                    <span>{transcriptMeta.characters.toLocaleString()} chars</span>
                                    {transcriptMeta.wasTruncated && <span className="text-amber-400">· truncated to 50k</span>}
                                  </p>
                                </div>
                                <button onClick={handleClearYoutube} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0">
                                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label className="text-slate-400 text-xs sm:text-sm">Transcript Preview</Label>
                            <div className="mt-2 p-3 sm:p-4 bg-white/[0.02] rounded-lg sm:rounded-xl max-h-[150px] sm:max-h-[200px] overflow-y-auto border border-white/5">
                              <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap">
                                {formData.content.slice(0, 800)}{formData.content.length > 800 && "..."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Idle state — URL input
                        <div className="space-y-3 sm:space-y-4">
                          <Label className="text-slate-300 font-medium text-sm sm:text-base">YouTube video URL</Label>
                          <div className="flex gap-2 sm:gap-3">
                            <div className="relative flex-1">
                              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 pointer-events-none" />
                              <Input
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleFetchTranscript()}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-slate-500 focus:border-white/30 h-11 sm:h-12 rounded-xl text-sm sm:text-base"
                              />
                            </div>
                            <Button
                              onClick={handleFetchTranscript}
                              disabled={!youtubeUrl.trim()}
                              className="bg-white text-slate-950 hover:bg-slate-100 h-11 sm:h-12 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base flex-shrink-0"
                            >
                              Fetch
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500">Works with any public YouTube video that has captions or subtitles</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Document Upload Mode
                    <div className="space-y-3 sm:space-y-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept={SUPPORTED_EXTENSIONS}
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {!pdfFile ? (
                        // Upload dropzone
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-white/10 rounded-xl sm:rounded-2xl p-8 sm:p-10 md:p-12 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
                        >
                          <FileUp className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 mx-auto mb-3 sm:mb-4 text-slate-500" />
                          <p className="text-base sm:text-lg font-medium text-white mb-1 sm:mb-2">
                            Click to upload your document
                          </p>
                          <p className="text-xs sm:text-sm text-slate-400 mb-1">
                            PDF, DOCX, or TXT files
                          </p>
                          <p className="text-xs text-slate-500">
                            Maximum file size: 10MB
                          </p>
                        </div>
                      ) : isUploadingPdf ? (
                        // Uploading state
                        <div className="border-2 border-indigo-500/30 rounded-xl sm:rounded-2xl p-8 sm:p-10 md:p-12 text-center bg-indigo-500/5">
                          <Loader2 className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 mx-auto mb-3 sm:mb-4 text-indigo-400 animate-spin" />
                          <p className="text-base sm:text-lg font-medium text-white mb-1 sm:mb-2">
                            Processing your document...
                          </p>
                          <p className="text-xs sm:text-sm text-slate-400 truncate px-4">
                            Extracting text from {pdfFile.name}
                          </p>
                        </div>
                      ) : pdfMetadata ? (
                        // Success state
                        <div className="border-2 border-emerald-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 bg-emerald-500/5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-white text-sm sm:text-base truncate">{pdfMetadata.fileName}</p>
                                <p className="text-xs sm:text-sm text-slate-400 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                                  {pdfMetadata.fileType && (
                                    <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/25 text-xs">
                                      {pdfMetadata.fileType}
                                    </Badge>
                                  )}
                                  <span className="truncate">{pdfMetadata.pages && `${pdfMetadata.pages} page(s) · `}{pdfMetadata.characters.toLocaleString()} chars</span>
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveFile}
                              className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                            </button>
                          </div>

                          {/* Preview of extracted text */}
                          <div className="mt-3 sm:mt-4">
                            <Label className="text-slate-400 text-xs sm:text-sm">Extracted Text Preview</Label>
                            <div className="mt-2 p-3 sm:p-4 bg-white/[0.02] rounded-lg sm:rounded-xl max-h-[150px] sm:max-h-[200px] overflow-y-auto border border-white/5">
                              <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap">
                                {formData.content.slice(0, 1000)}
                                {formData.content.length > 1000 && "..."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Error state - file selected but no metadata
                        <div className="border-2 border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 bg-red-500/5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                              </div>
                              <div>
                                <p className="font-medium text-white text-sm sm:text-base">Failed to process document</p>
                                <p className="text-xs sm:text-sm text-slate-400">
                                  Please try a different file
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveFile}
                              className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <Button
                      onClick={() => { handleClearYoutube(); setStep(1); }}
                      variant="outline"
                      className="flex-1 h-12 sm:h-14 rounded-xl font-semibold border-white/10 bg-transparent text-white hover:bg-white/5 text-sm sm:text-base"
                      disabled={isUploadingPdf || isFetchingTranscript}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={isUploadingPdf || isFetchingTranscript || !formData.content.trim()}
                      className="flex-1 bg-white text-slate-950 hover:bg-slate-100 h-12 sm:h-14 rounded-xl font-semibold text-sm sm:text-base disabled:opacity-50"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 sm:p-6 md:p-8">
                  <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                    Configure Your Quiz
                  </h2>

                  <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    <div>
                      <Label htmlFor="title" className="text-slate-300 font-medium text-sm sm:text-base">
                        Quiz Title
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g., Chapter 5: Data Structures"
                        className="mt-2 sm:mt-3 bg-white/[0.02] border-white/10 text-white placeholder:text-slate-500 focus:border-white/30 h-11 sm:h-12 rounded-xl text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-slate-300 font-medium text-sm sm:text-base">
                        Subject
                      </Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) =>
                          setFormData({ ...formData, subject: value })
                        }
                      >
                        <SelectTrigger className="mt-2 sm:mt-3 bg-white/[0.02] border-white/10 text-white h-11 sm:h-12 rounded-xl text-sm sm:text-base">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/95 border-white/10 backdrop-blur-xl">
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Literature">Literature</SelectItem>
                          <SelectItem value="Economics">Economics</SelectItem>
                          <SelectItem value="Law">Law</SelectItem>
                          <SelectItem value="Medicine">Medicine</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="questionCount" className="text-slate-300 font-medium text-sm sm:text-base">
                        Number of Questions
                      </Label>
                      <Select
                        value={formData.questionCount.toString()}
                        onValueChange={(value) =>
                          setFormData({ ...formData, questionCount: parseInt(value) })
                        }
                      >
                        <SelectTrigger className="mt-2 sm:mt-3 bg-white/[0.02] border-white/10 text-white h-11 sm:h-12 rounded-xl text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/95 border-white/10 backdrop-blur-xl">
                          <SelectItem value="5">5 questions</SelectItem>
                          <SelectItem value="10">10 questions</SelectItem>
                          <SelectItem value="15">15 questions</SelectItem>
                          <SelectItem value="20">20 questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-300 font-medium mb-3 sm:mb-4 block text-sm sm:text-base">
                        Difficulty Level
                      </Label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, difficulty: "easy" })}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all ${
                            formData.difficulty === "easy"
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                          }`}
                        >
                          <Zap className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 ${
                            formData.difficulty === "easy" ? "text-emerald-400" : "text-slate-400"
                          }`} />
                          <p className={`text-xs sm:text-sm font-semibold ${
                            formData.difficulty === "easy" ? "text-emerald-400" : "text-slate-300"
                          }`}>Easy</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">Basic recall</p>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, difficulty: "medium" })}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all ${
                            formData.difficulty === "medium"
                              ? "border-amber-500 bg-amber-500/10"
                              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                          }`}
                        >
                          <Flame className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 ${
                            formData.difficulty === "medium" ? "text-amber-400" : "text-slate-400"
                          }`} />
                          <p className={`text-xs sm:text-sm font-semibold ${
                            formData.difficulty === "medium" ? "text-amber-400" : "text-slate-300"
                          }`}>Medium</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">Understanding</p>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, difficulty: "hard" })}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all ${
                            formData.difficulty === "hard"
                              ? "border-red-500 bg-red-500/10"
                              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                          }`}
                        >
                          <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 ${
                            formData.difficulty === "hard" ? "text-red-400" : "text-slate-400"
                          }`} />
                          <p className={`text-xs sm:text-sm font-semibold ${
                            formData.difficulty === "hard" ? "text-red-400" : "text-slate-300"
                          }`}>Hard</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">Application</p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-300 font-medium mb-2 sm:mb-3 block text-sm sm:text-base">
                        Question Type
                      </Label>
                      <Select
                        value={formData.questionTypes[0]}
                        onValueChange={(value) =>
                          setFormData({ ...formData, questionTypes: [value] })
                        }
                      >
                        <SelectTrigger className="bg-white/[0.02] border-white/10 text-white h-11 sm:h-12 rounded-xl text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/95 border-white/10 backdrop-blur-xl">
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="fill_blank">Fill in the Blanks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Timer Settings */}
                    <div>
                      <Label className="text-slate-300 font-medium mb-3 sm:mb-4 block text-sm sm:text-base">
                        Timer Settings
                      </Label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, timerMode: "none" })}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all ${
                            formData.timerMode === "none"
                              ? "border-white bg-white/5"
                              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                          }`}
                        >
                          <TimerOff className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 ${
                            formData.timerMode === "none" ? "text-white" : "text-slate-400"
                          }`} />
                          <p className={`text-xs sm:text-sm font-semibold ${
                            formData.timerMode === "none" ? "text-white" : "text-slate-400"
                          }`}>No Timer</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">Relaxed</p>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, timerMode: "quiz", timeLimit: 10 })}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all ${
                            formData.timerMode === "quiz"
                              ? "border-indigo-500 bg-indigo-500/10"
                              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                          }`}
                        >
                          <Clock className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 ${
                            formData.timerMode === "quiz" ? "text-indigo-400" : "text-slate-400"
                          }`} />
                          <p className={`text-xs sm:text-sm font-semibold ${
                            formData.timerMode === "quiz" ? "text-indigo-400" : "text-slate-300"
                          }`}>Per Quiz</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">Total time</p>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, timerMode: "question", timeLimit: 30 })}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all ${
                            formData.timerMode === "question"
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                          }`}
                        >
                          <Timer className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 ${
                            formData.timerMode === "question" ? "text-orange-400" : "text-slate-400"
                          }`} />
                          <p className={`text-xs sm:text-sm font-semibold ${
                            formData.timerMode === "question" ? "text-orange-400" : "text-slate-300"
                          }`}>Per Q</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">Time each</p>
                        </button>
                      </div>

                      {/* Time Limit Selector */}
                      <AnimatePresence>
                        {formData.timerMode !== "none" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 sm:mt-4 overflow-hidden"
                          >
                            <Label className="text-slate-400 text-xs sm:text-sm mb-2 sm:mb-3 block">
                              {formData.timerMode === "quiz" ? "Total Quiz Time" : "Time Per Question"}
                            </Label>
                            <Select
                              value={formData.timeLimit.toString()}
                              onValueChange={(value) =>
                                setFormData({ ...formData, timeLimit: parseInt(value) })
                              }
                            >
                              <SelectTrigger className="bg-white/[0.02] border-white/10 text-white h-11 sm:h-12 rounded-xl text-sm sm:text-base">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900/95 border-white/10 backdrop-blur-xl">
                                {formData.timerMode === "quiz" ? (
                                  <>
                                    <SelectItem value="5">5 minutes</SelectItem>
                                    <SelectItem value="10">10 minutes</SelectItem>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="20">20 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem value="15">15 seconds</SelectItem>
                                    <SelectItem value="30">30 seconds</SelectItem>
                                    <SelectItem value="45">45 seconds</SelectItem>
                                    <SelectItem value="60">60 seconds</SelectItem>
                                    <SelectItem value="90">90 seconds</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1 h-12 sm:h-14 rounded-xl font-semibold border-white/10 bg-transparent text-white hover:bg-white/5 text-sm sm:text-base"
                      disabled={isGenerating}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={isGenerating}
                      className="flex-1 bg-white text-slate-950 hover:bg-slate-100 h-12 sm:h-14 rounded-xl font-semibold text-sm sm:text-base disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          <span className="hidden sm:inline">Generating...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Generate Quiz</span>
                          <span className="sm:hidden">Generate</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mt-8"
              >
                <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl p-8 text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-8 h-8 text-indigo-400" />
                    </motion.div>
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-white mb-2">
                    AI is Reading Your Notes...
                  </h3>
                  <p className="text-slate-400">
                    Generating personalized questions. This takes about 10 seconds.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
