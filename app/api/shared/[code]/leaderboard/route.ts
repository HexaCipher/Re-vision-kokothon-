import { NextRequest, NextResponse } from "next/server";
import { getQuizByShareCode } from "@/lib/db";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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

    // Look up the quiz by share code
    const quiz = await getQuizByShareCode(shareCode);
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Fetch all attempts for this quiz
    const attemptsCollection = collection(db, "attempts");
    const q = query(attemptsCollection, where("quiz_id", "==", quiz.id));
    const snapshot = await getDocs(q);

    interface LeaderboardEntry {
      rank: number;
      guest_name: string;
      score: number;
      total_questions: number;
      percentage: number;
      completed_at: string;
      is_guest: boolean;
    }

    const entries: Omit<LeaderboardEntry, "rank">[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const score: number = data.score ?? 0;
      const total: number = data.total_questions ?? 1;
      return {
        guest_name: data.guest_name || "Anonymous",
        score,
        total_questions: total,
        percentage: Math.round((score / total) * 100),
        completed_at: data.completed_at?.toDate?.()?.toISOString() || data.completed_at || "",
        is_guest: data.is_guest ?? false,
      };
    });

    // Sort: highest percentage first, then earliest completion time (tie-break)
    entries.sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
    });

    // Take top 10 and assign ranks
    const leaderboard: LeaderboardEntry[] = entries.slice(0, 10).map((entry, i) => ({
      rank: i + 1,
      ...entry,
    }));

    return NextResponse.json({ leaderboard, total: entries.length });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
