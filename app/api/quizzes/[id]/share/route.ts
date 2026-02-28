import { NextRequest, NextResponse } from "next/server";
import { getOrCreateShareCode } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    // Generate or get existing share code
    const shareCode = await getOrCreateShareCode(quizId);

    return NextResponse.json({
      success: true,
      shareCode,
      shareUrl: `/quiz/share/${shareCode}`,
    });
  } catch (error: any) {
    console.error("Error generating share link:", error);
    
    if (error.message === "Quiz not found") {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate share link" },
      { status: 500 }
    );
  }
}
