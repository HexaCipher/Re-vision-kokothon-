"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegistrar
 *
 * Registers /sw.js once the app mounts on the client.
 * Renders nothing — purely a side-effect component.
 * Place this in the root layout so it runs on every page.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            // New SW installed and waiting — it will activate on next page load
            // (skipWaiting is called in sw.js so it activates immediately)
          });
        });
      } catch (err) {
        // SW registration failed — app still works normally, just without offline support
        if (process.env.NODE_ENV === "development") {
          console.warn("[SW] Registration failed:", err);
        }
      }
    };

    // Defer registration until after page load to not compete with critical resources
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
