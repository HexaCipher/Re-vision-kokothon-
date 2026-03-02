"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * BeforeInstallPromptEvent
 *
 * The browser's `beforeinstallprompt` event, fired when the app meets PWA
 * installability criteria. We capture it and defer showing the install prompt.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

/**
 * useInstallPrompt
 *
 * Hook to handle PWA install prompt logic:
 * - Listens for `beforeinstallprompt` event (Chrome, Edge, Android)
 * - Provides `canInstall` boolean and `install()` / `dismiss()` methods
 * - Persists dismissal to localStorage so the prompt doesn't reappear
 *
 * Note: iOS Safari doesn't fire `beforeinstallprompt` — users must manually
 * use "Add to Home Screen" from the share sheet. This hook only works on
 * Chromium-based browsers.
 */
export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  const DISMISSED_KEY = "pwa-install-dismissed";

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user previously dismissed the prompt
    const wasDismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    if (wasDismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      // App was installed — hide the prompt
      deferredPromptRef.current = null;
      setCanInstall(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;

    if (outcome === "accepted") {
      deferredPromptRef.current = null;
      setCanInstall(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, "true");
    deferredPromptRef.current = null;
    setCanInstall(false);
  }, []);

  return { canInstall, install, dismiss };
}
