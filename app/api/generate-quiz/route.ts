import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { createQuiz } from "@/lib/db";
import { Question, QuestionType } from "@/types";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Content char limit sent to LLM — keeps input tokens reasonable for speed */
const MAX_CONTENT_CHARS = 30_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the error looks like a 429 rate-limit error.
 */
function isRateLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message || "";
  return (
    msg.includes("429") ||
    msg.includes("Too Many Requests") ||
    msg.includes("quota") ||
    msg.includes("rate_limit")
  );
}

/**
 * Parse retry delay (seconds) from error messages.
 * Handles both Gemini ("Please retry in 35.8s") and Groq ("retry-after" header style).
 */
function parseRetryDelay(message: string): number | null {
  const match = message.match(/retry in ([\d.]+)s/i);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Extract the first JSON array (or object containing one) from an LLM response.
 * Handles markdown fences, <think> preambles, bare JSON arrays, and
 * Groq-style { "questions": [...] } wrappers.
 */
function extractJsonArray(text: string): string | null {
  const stripped = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Try markdown code fence first
  const fenceMatch = stripped.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    const inner = fenceMatch[1].trim();
    if (inner.startsWith("[") || inner.startsWith("{")) return inner;
  }

  // Try bare JSON — array or object
  const jsonStart = stripped.search(/[\[{]/);
  if (jsonStart === -1) return null;
  return stripped.slice(jsonStart);
}

/**
 * Given a raw correctAnswer string (could be "B", "B) Some text", or the full
 * option text) and the options array, resolve to the full matching option.
 */
function resolveCorrectAnswer(raw: string, options?: string[]): string {
  if (!options || options.length === 0) return raw.trim();
  const trimmed = raw.trim();

  const exactMatch = options.find(
    (o) => o.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (exactMatch) return exactMatch.trim();

  const letterMatch = trimmed.match(/^([A-Da-d])[).:\s]*/);
  if (letterMatch) {
    const letter = letterMatch[1].toUpperCase();
    const matched = options.find(
      (o) =>
        o.trim().toUpperCase().startsWith(letter + ")") ||
        o.trim().toUpperCase().startsWith(letter + ".") ||
        o.trim().toUpperCase().startsWith(letter + " ") ||
        o.trim().toUpperCase() === letter
    );
    if (matched) return matched.trim();
  }

  return trimmed;
}

/**
 * Parse + normalise raw LLM output into Question[].
 * Throws a descriptive Error if parsing fails.
 */
function parseAndNormalise(
  rawText: string,
  questionType: string
): Question[] {
  const jsonString = extractJsonArray(rawText);
  if (!jsonString) {
    throw new Error("AI returned an unexpected format. Please try again.");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("AI returned malformed JSON. Please try again.");
  }

  // Groq with response_format may wrap in { questions: [...] }
  if (!Array.isArray(parsed) && parsed?.questions && Array.isArray(parsed.questions)) {
    parsed = parsed.questions;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI did not return any questions. Please try again.");
  }

  const validTypes: QuestionType[] = ["mcq", "true_false", "fill_blank"];

  const questions: Question[] = parsed.map((q: any, index: number) => {
    // For mixed mode, each question carries its own `type` field.
    // Fall back to the requested questionType for single-type quizzes.
    let resolvedType: QuestionType;
    if (questionType === "mixed" && validTypes.includes(q.type as QuestionType)) {
      resolvedType = q.type as QuestionType;
    } else {
      resolvedType = (questionType === "mixed" ? "mcq" : questionType) as QuestionType;
    }

    // Normalise options: accept standard array OR Groq's A/B/C/D key format
    let options: string[] | undefined;
    if (Array.isArray(q.options) && q.options.length > 0) {
      options = q.options.map((o: unknown) => String(o).trim());
    } else if (q.A && q.B && q.C && q.D) {
      // Groq sometimes returns { A: "...", B: "...", C: "...", D: "..." }
      options = [String(q.A).trim(), String(q.B).trim(), String(q.C).trim(), String(q.D).trim()];
      // Map letter answer to full text if needed
      if (!q.correctAnswer && q.answer) q.correctAnswer = q.answer;
    }

    const explanation = q.explanation ? String(q.explanation).trim() : null;
    const correctAnswer = resolveCorrectAnswer(
      String(q.correctAnswer ?? ""),
      options
    );

    // Build question object without any undefined values (Firestore rejects undefined)
    const questionObj: Record<string, unknown> = {
      id: `q${index + 1}`,
      question: String(q.question ?? "").trim(),
      type: resolvedType,
      correctAnswer,
      orderNumber: index + 1,
    };
    if (options !== undefined) questionObj.options = options;
    if (explanation) questionObj.explanation = explanation;

    return questionObj as unknown as Question;
  });

  for (const q of questions) {
    if (!q.question || !q.correctAnswer) {
      throw new Error("AI returned incomplete question data. Please try again.");
    }
  }

  return questions;
}

// ---------------------------------------------------------------------------
// LLM Providers
// ---------------------------------------------------------------------------

/**
 * Try generating quiz questions via Google Gemini.
 * Returns the raw text response, or throws on error.
 */
async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Generate quiz questions via Groq (Llama 3.3 70B).
 * Used as automatic fallback when Gemini is rate-limited.
 */
async function generateWithGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          'You are an expert quiz generator. Return ONLY valid JSON in the format: {"questions": [...]}. Every question MUST have "question" and "correctAnswer" fields. For mixed quizzes every question MUST also have a "type" field set to exactly "mcq", "true_false", or "fill_blank". No markdown, no extra text.',
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 4096,
  });

  return completion.choices[0]?.message?.content || "";
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const {
      userId,
      title,
      subject,
      content,
      questionCount,
      questionTypes,
      difficulty,
      sourceType,
      timerMode,
      timeLimit,
    } = body as {
      userId: string;
      title: string;
      subject: string;
      content: string;
      questionCount: number;
      questionTypes: string[];
      difficulty: string;
      sourceType?: string;
      timerMode?: string;
      timeLimit?: number;
    };

    if (!userId || !title || !subject || !content || !questionCount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const isMixed = Array.isArray(questionTypes) && questionTypes.length > 1;
    const questionType = isMixed ? "mixed" : ((questionTypes as string[])[0] || "mcq");
    const difficultyLevel = difficulty || "medium";

    // Truncate content for faster LLM processing
    const trimmedContent =
      content.length > MAX_CONTENT_CHARS
        ? content.slice(0, MAX_CONTENT_CHARS)
        : content;

    const resolvedSourceType = (sourceType as string) || "text";
    const prompt = generatePrompt(
      trimmedContent,
      Number(questionCount),
      questionType,
      difficultyLevel,
      resolvedSourceType
    );

    // --- Try Gemini first, fall back to Groq on rate limit ---
    let rawText: string | undefined;
    let usedProvider: "gemini" | "groq" = "gemini";
    let finalError: unknown = null;

    // Attempt 1: Gemini
    try {
      rawText = await generateWithGemini(prompt);
    } catch (geminiErr: unknown) {
      if (isRateLimitError(geminiErr)) {
        // Gemini rate-limited — try Groq as fallback
        console.log("[generate-quiz] Gemini rate-limited, falling back to Groq");
        try {
          rawText = await generateWithGroq(prompt);
          usedProvider = "groq";
        } catch (groqErr: unknown) {
          // Both providers failed
          finalError = groqErr;
        }
      } else {
        // Non-rate-limit Gemini error — still try Groq
        console.log("[generate-quiz] Gemini error, attempting Groq fallback:", geminiErr);
        try {
          rawText = await generateWithGroq(prompt);
          usedProvider = "groq";
        } catch (groqErr: unknown) {
          finalError = groqErr;
        }
      }
    }

    // If both providers failed, return error
    if (!rawText) {
      if (finalError && isRateLimitError(finalError)) {
        const errMsg =
          finalError instanceof Error ? finalError.message : "";
        const retrySec = parseRetryDelay(errMsg);
        return NextResponse.json(
          {
            error:
              "Both AI providers are rate-limited. Please wait a moment and try again.",
            code: "RATE_LIMIT",
            retryAfter: retrySec ? Math.ceil(retrySec) : 60,
          },
          { status: 429 }
        );
      }

      // Log the actual error server-side for debugging
      console.error("[generate-quiz] All providers failed:", finalError);

      // Return a user-friendly message (don't leak API key / auth errors)
      return NextResponse.json(
        { error: "Failed to generate quiz. Please try again in a moment." },
        { status: 500 }
      );
    }

    // --- Parse + normalise questions ---
    let questions: Question[];
    try {
      questions = parseAndNormalise(rawText, questionType);
    } catch (parseErr: unknown) {
      return NextResponse.json(
        {
          error:
            parseErr instanceof Error
              ? parseErr.message
              : "Failed to parse AI response",
        },
        { status: 500 }
      );
    }

    // --- Save to Firestore ---
    try {
      const validSourceTypes = ["text", "pdf", "youtube"] as const;
      const resolvedSourceType = validSourceTypes.includes(sourceType as any)
        ? (sourceType as "text" | "pdf" | "youtube")
        : "text";

      const quiz = await createQuiz({
        userId: String(userId),
        title: String(title),
        subject: String(subject),
        sourceType: resolvedSourceType,
        sourceContent: trimmedContent,
        questions,
        difficulty: (difficultyLevel as "easy" | "medium" | "hard") || "medium",
        timerMode: (timerMode as "none" | "quiz" | "question") || "none",
        timeLimit: timeLimit ?? 10,
      });

      return NextResponse.json({
        quizId: quiz.id,
        questions,
        provider: usedProvider,
      });
    } catch (dbError: unknown) {
      console.error("[generate-quiz] Firestore save failed:", dbError);
      const dbMsg =
        dbError instanceof Error ? dbError.message : String(dbError);
      return NextResponse.json(
        {
          error: "Failed to save quiz to database. Please try again.",
          detail: dbMsg,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function generatePrompt(
  content: string,
  questionCount: number,
  questionType: string,
  difficulty: string,
  sourceType: string = "text"
): string {
  const difficultyInstructions: Record<string, string> = {
    easy: `DIFFICULTY: EASY
- Focus on basic recall and simple facts directly stated in the notes
- Questions should test recognition and memory
- Use straightforward language`,
    medium: `DIFFICULTY: MEDIUM
- Test understanding and comprehension of concepts
- Mix of recall and application questions
- Require students to understand the material, not just memorise`,
    hard: `DIFFICULTY: HARD
- Focus on application, analysis, and critical thinking
- Include questions that require synthesising multiple concepts
- Test deep understanding — appropriate for exam preparation`,
  };

  const difficultyPrompt =
    difficultyInstructions[difficulty] ?? difficultyInstructions.medium;

  // YouTube-specific filtering instructions
  const youtubeFilterInstructions =
    sourceType === "youtube"
      ? `
CRITICAL — YOUTUBE TRANSCRIPT FILTERING:
This content is a raw YouTube video transcript. It likely contains non-educational filler that you MUST IGNORE when creating questions. Do NOT generate questions about:
- Greetings, introductions, or sign-offs ("Hey guys", "Welcome back", "Thanks for watching")
- Channel promotions, subscriber requests, or sponsor mentions ("Hit that like button", "Subscribe", "This video is sponsored by")
- Personal anecdotes, jokes, or off-topic tangents from the presenter
- Filler words and verbal tics ("um", "uh", "so", "like", "you know", "basically")
- Timestamps, chapter markers, or navigation cues ("In this section", "Let's jump to")
- Comments about the video production itself ("As you can see on screen", "I'll put a link below")

ONLY generate questions from the CORE EDUCATIONAL CONTENT:
- Definitions, concepts, and terminology
- Facts, data, statistics, and figures
- Formulas, equations, and procedures
- Examples, case studies, and explanations
- Cause-and-effect relationships
- Comparisons and contrasts between concepts

If the transcript is mostly non-educational (e.g., a vlog or entertainment video), generate questions ONLY from whatever educational substance exists — even if sparse.
`
      : "";

  const basePrompt = `You are an expert quiz generator. Analyse the following study notes and generate exactly ${questionCount} high-quality questions that test understanding of the key concepts.
${youtubeFilterInstructions}
${difficultyPrompt}

Study Notes:
${content}

IMPORTANT: Return ONLY a valid JSON array — no markdown fences, no extra text, no comments.`;

  if (questionType === "mcq") {
    return `${basePrompt}

Generate ${questionCount} multiple-choice questions. Each question MUST have exactly 4 options.
The "correctAnswer" field MUST be the EXACT full text of the correct option (copy it verbatim from the "options" array).

[
  {
    "question": "What is...?",
    "options": ["First option text", "Second option text", "Third option text", "Fourth option text"],
    "correctAnswer": "Second option text",
    "explanation": "This is correct because..."
  }
]`;
  }

  if (questionType === "true_false") {
    return `${basePrompt}

Generate ${questionCount} true/false questions.
The "correctAnswer" field MUST be exactly "True" or "False".

[
  {
    "question": "Statement to evaluate...",
    "correctAnswer": "True",
    "explanation": "This is true because..."
  }
]`;
  }

  if (questionType === "fill_blank") {
    return `${basePrompt}

Generate ${questionCount} fill-in-the-blank questions. Use ___ to mark the blank.
The "correctAnswer" field should be the word or short phrase that fills the blank.

[
  {
    "question": "The ___ is responsible for...",
    "correctAnswer": "mitochondria",
    "explanation": "The correct answer is..."
  }
]`;
  }

  if (questionType === "mixed") {
    const mcqCount = Math.ceil(questionCount / 3);
    const tfCount = Math.floor(questionCount / 3);
    const fbCount = questionCount - mcqCount - tfCount;
    return `${basePrompt}

Generate exactly ${questionCount} questions in MIXED format:
- ${mcqCount} multiple-choice questions (type: "mcq") — each with exactly 4 options
- ${tfCount} true/false questions (type: "true_false") — correctAnswer must be exactly "True" or "False"
- ${fbCount} fill-in-the-blank questions (type: "fill_blank") — use ___ for the blank; correctAnswer is the missing word/phrase

IMPORTANT: Every object MUST include a "type" field set to exactly "mcq", "true_false", or "fill_blank".
The "correctAnswer" for MCQ MUST be the EXACT full text of the correct option (copy it verbatim from the "options" array).

Return a SINGLE flat JSON array mixing all types together:
[
  {
    "type": "mcq",
    "question": "What is...?",
    "options": ["First option", "Second option", "Third option", "Fourth option"],
    "correctAnswer": "Second option",
    "explanation": "Because..."
  },
  {
    "type": "true_false",
    "question": "Statement to evaluate...",
    "correctAnswer": "True",
    "explanation": "This is true because..."
  },
  {
    "type": "fill_blank",
    "question": "The ___ is responsible for...",
    "correctAnswer": "mitochondria",
    "explanation": "The correct answer is..."
  }
]`;
  }

  return basePrompt;
}
