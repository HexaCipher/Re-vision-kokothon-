import { NextRequest, NextResponse } from "next/server";
import { getQuizByShareCode } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: shareCode } = await params;

    if (!shareCode) {
      return NextResponse.json(
        { error: "Share code is required" },
        { status: 400 }
      );
    }

    const quiz = await getQuizByShareCode(shareCode);

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found or link has expired" },
        { status: 404 }
      );
    }

    // Return quiz data (without source content for security)
    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      questions: quiz.questions,
      questionCount: quiz.questions.length,
    });
  } catch (error: any) {
    console.error("Error fetching shared quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}
