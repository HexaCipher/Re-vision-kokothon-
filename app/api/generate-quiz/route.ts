import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createQuiz } from "@/lib/db";
import { Question, QuestionType } from "@/types";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60s for Gemini to respond (Vercel default is 10s)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the first JSON array from an arbitrary Gemini response string.
 * Handles:
 *  - Responses wrapped in markdown code fences (```json … ```)
 *  - Extra text before/after the JSON array
 *  - Thinking-model <think>…</think> preambles
 */
function extractJsonArray(text: string): string | null {
  // Strip thinking tags that some Gemini models emit
  const stripped = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Try a markdown code fence first
  const fenceMatch = stripped.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    const inner = fenceMatch[1].trim();
    if (inner.startsWith("[")) return inner;
  }

  // Fall back to the first [ … ] block
  const arrayMatch = stripped.match(/\[[\s\S]*\]/);
  return arrayMatch ? arrayMatch[0] : null;
}

/**
 * Given a raw correctAnswer string from Gemini (could be "B", "B)", "B) Some text",
 * or the full option text) and the options array, resolve to the full matching
 * option string so answer comparison always works.
 */
function resolveCorrectAnswer(raw: string, options?: string[]): string {
  if (!options || options.length === 0) return raw.trim();

  const trimmed = raw.trim();

  // If it already exactly matches one of the options, we're done.
  const exactMatch = options.find(
    (o) => o.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (exactMatch) return exactMatch.trim();

  // If it's a single letter like "A", "B", "C", "D" (or "A." / "A)")
  // find the option that starts with that letter.
  const letterMatch = trimmed.match(/^([A-Da-d])[).:\s]*/);
  if (letterMatch) {
    const letter = letterMatch[1].toUpperCase();
    const matched = options.find((o) =>
      o.trim().toUpperCase().startsWith(letter + ")") ||
      o.trim().toUpperCase().startsWith(letter + ".") ||
      o.trim().toUpperCase().startsWith(letter + " ") ||
      o.trim().toUpperCase() === letter
    );
    if (matched) return matched.trim();
  }

  // Last resort — return as-is
  return trimmed;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  console.log("=== QUIZ GENERATION API CALLED ===");

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { userId, title, subject, content, questionCount, questionTypes, difficulty } = body as {
      userId: string;
      title: string;
      subject: string;
      content: string;
      questionCount: number;
      questionTypes: string[];
      difficulty: string;
    };

    if (!userId || !title || !subject || !content || !questionCount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json({ error: "API configuration error" }, { status: 500 });
    }

    console.log("Starting quiz generation, content length:", String(content).length);

    const questionType = (questionTypes as string[])[0] || "mcq";
    const difficultyLevel = difficulty || "medium";

    const prompt = generatePrompt(String(content), Number(questionCount), questionType, difficultyLevel);

    console.log("Calling Gemini API...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        // Disable thinking mode — faster responses, no <think> preambles,
        // avoids Vercel's 10s timeout on long notes
        // @ts-expect-error thinkingConfig is not yet in the TS types but is supported at runtime
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    console.log("Gemini response length:", rawText.length);

    // --- Parse JSON ---
    const jsonString = extractJsonArray(rawText);
    if (!jsonString) {
      console.error("Could not extract JSON array from Gemini response. Raw text snippet:", rawText.slice(0, 500));
      return NextResponse.json({ error: "AI returned an unexpected format. Please try again." }, { status: 500 });
    }

    let parsedQuestions: any[];
    try {
      parsedQuestions = JSON.parse(jsonString);
    } catch (jsonErr) {
      console.error("JSON.parse failed:", jsonErr);
      console.error("JSON string snippet:", jsonString.slice(0, 500));
      return NextResponse.json({ error: "AI returned malformed JSON. Please try again." }, { status: 500 });
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      console.error("Parsed result is not a non-empty array:", parsedQuestions);
      return NextResponse.json({ error: "AI did not return any questions. Please try again." }, { status: 500 });
    }

    // --- Normalise questions ---
    const questions: Question[] = parsedQuestions.map((q: any, index: number) => {
      const options: string[] | undefined =
        Array.isArray(q.options) && q.options.length > 0
          ? q.options.map((o: unknown) => String(o).trim())
          : undefined;

      const correctAnswer = resolveCorrectAnswer(String(q.correctAnswer ?? ""), options);

      return {
        id: `q${index + 1}`,
        question: String(q.question ?? "").trim(),
        type: questionType as QuestionType,
        options,
        correctAnswer,
        explanation: q.explanation ? String(q.explanation).trim() : undefined,
        orderNumber: index + 1,
      };
    });

    // Validate that every question has the minimum required fields
    for (const q of questions) {
      if (!q.question || !q.correctAnswer) {
        console.error("Invalid question object:", q);
        return NextResponse.json(
          { error: "AI returned incomplete question data. Please try again." },
          { status: 500 }
        );
      }
    }

    // --- Save to Firestore ---
    console.log("Saving quiz to Firebase...");
    try {
      const quiz = await createQuiz({
        userId: String(userId),
        title: String(title),
        subject: String(subject),
        sourceType: "text",
        sourceContent: String(content),
        questions,
      });

      console.log("Quiz saved successfully:", quiz.id);
      return NextResponse.json({ quizId: quiz.id, questions });
    } catch (dbError: any) {
      console.error("Firebase save failed:", dbError?.message ?? dbError);
      console.error("Firebase error code:", dbError?.code);
      console.error("Full Firebase error:", JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        { error: "Failed to save quiz to database. Please try again." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error in generate-quiz route:", error?.message ?? error);
    console.error("Stack:", error?.stack);
    return NextResponse.json(
      { error: error?.message || "Failed to generate quiz" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function generatePrompt(
  content: string,
  questionCount: number,
  questionType: string,
  difficulty: string
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

  const difficultyPrompt = difficultyInstructions[difficulty] ?? difficultyInstructions.medium;

  const basePrompt = `You are an expert quiz generator. Analyse the following study notes and generate exactly ${questionCount} high-quality questions that test understanding of the key concepts.

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

  return basePrompt;
}
