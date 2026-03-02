"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * OfflineBanner
 *
 * Renders a slim banner at the top of the viewport when the browser reports
 * no network connectivity. Disappears automatically when connectivity returns.
 *
 * Uses navigator.onLine + the browser's online/offline events.
 * Renders nothing during SSR or when online.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Set initial state — navigator.onLine is only reliable client-side
    setIsOffline(!navigator.onLine);

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      if (wasOffline) {
        setShowReconnected(true);
        // Hide the "reconnected" toast after 3 seconds
        setTimeout(() => setShowReconnected(false), 3000);
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [wasOffline]);

  if (!isOffline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
        style={{
          background: "rgba(16, 185, 129, 0.15)",
          borderBottom: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          backdropFilter: "blur(8px)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Back online
      </div>
    );
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
      style={{
        background: "rgba(10, 15, 30, 0.92)",
        borderBottom: "1px solid rgba(0, 229, 255, 0.15)",
        color: "#94a3b8",
        backdropFilter: "blur(8px)",
      }}
    >
      <WifiOff className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#00E5FF" }} />
      <span>
        You&apos;re offline —{" "}
        <span className="text-slate-300">previously loaded quizzes are still available</span>
      </span>
    </div>
  );
}
