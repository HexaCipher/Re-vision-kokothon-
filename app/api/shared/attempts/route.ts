import { NextRequest, NextResponse } from "next/server";
import { createGuestAttempt } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, guestId, guestName, score, totalQuestions, answers } = body;

    if (!quizId || !guestId || score === undefined || !totalQuestions || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const attempt = await createGuestAttempt({
      quizId,
      guestId,
      guestName,
      score,
      totalQuestions,
      answers,
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
    });
  } catch (error: any) {
    console.error("Error creating guest attempt:", error);
    return NextResponse.json(
      { error: "Failed to save attempt" },
      { status: 500 }
    );
  }
}
