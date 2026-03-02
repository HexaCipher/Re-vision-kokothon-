"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * InstallBanner
 *
 * A slim, dismissible banner prompting users to install the PWA.
 * Only appears when:
 * - The browser fires `beforeinstallprompt` (Chromium-based browsers)
 * - The user hasn't previously dismissed it
 *
 * Matches the OfflineBanner styling for consistency.
 */
export function InstallBanner() {
  const { canInstall, install, dismiss } = useInstallPrompt();

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600/90 to-violet-600/90 backdrop-blur-sm text-white border-b border-white/10"
        >
          <Download className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Install Re-vision for a better experience</span>
          <button
            onClick={install}
            className="flex-shrink-0 px-3 py-1 text-xs font-semibold bg-white text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Install
          </button>
          <button
            onClick={dismiss}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-md transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
