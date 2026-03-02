"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, Medal, Crown, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/ui/PageTransition";

interface LeaderboardEntry {
  rank: number;
  guest_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
  is_guest: boolean;
}

interface SharedLeaderboardProps {
  shareCode: string;
  /** Highlight this name as "you" */
  currentGuestName?: string;
}

export function SharedLeaderboard({ shareCode, currentGuestName }: SharedLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/shared/${shareCode}/leaderboard`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load leaderboard");
      setEntries(data.leaderboard ?? []);
      setTotal(data.total ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [shareCode]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-amber-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-slate-300" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="text-slate-500 text-sm font-medium w-4 text-center">{rank}</span>;
  };

  const getRankBg = (rank: number, isYou: boolean) => {
    if (isYou) return "bg-indigo-500/10 border border-indigo-500/30";
    if (rank === 1) return "bg-amber-500/10 border border-amber-500/20";
    if (rank === 2) return "bg-slate-400/10 border border-slate-400/20";
    if (rank === 3) return "bg-amber-700/10 border border-amber-700/20";
    return "bg-white/[0.02] border border-white/5";
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-emerald-400";
    if (percentage >= 60) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <FadeIn delay={0.3}>
      <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 sm:p-7 mt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            Leaderboard
            {total > 0 && (
              <span className="text-slate-500 font-normal text-sm ml-1">
                ({total} {total === 1 ? "attempt" : "attempts"})
              </span>
            )}
          </h2>
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5"
            aria-label="Refresh leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 sm:h-14 rounded-xl bg-white/[0.03] animate-pulse"
                style={{ opacity: 1 - i * 0.2 }}
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-slate-500 text-sm text-center py-4">{error}</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">No attempts yet — be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {entries.map((entry) => {
                const isYou =
                  !!currentGuestName &&
                  entry.guest_name.toLowerCase() === currentGuestName.toLowerCase();
                return (
                  <motion.div
                    key={`${entry.rank}-${entry.guest_name}-${entry.completed_at}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl ${getRankBg(entry.rank, isYou)}`}
                  >
                    {/* Rank */}
                    <div className="w-5 flex-shrink-0 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium text-sm sm:text-base truncate block ${isYou ? "text-indigo-300" : "text-white"}`}>
                        {entry.guest_name}
                        {isYou && (
                          <span className="ml-1.5 text-xs text-indigo-400 font-normal">(you)</span>
                        )}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <span className="text-slate-500 text-xs sm:text-sm hidden sm:inline">
                        {entry.score}/{entry.total_questions}
                      </span>
                      <span className={`font-bold text-sm sm:text-base ${getScoreColor(entry.percentage)}`}>
                        {entry.percentage}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
