/**
 * Re-vision Service Worker (Serwist/Workbox-powered)
 *
 * Strategies:
 *   - StaleWhileRevalidate for static assets (_next/static, fonts, images)
 *   - NetworkFirst for HTML pages (always try fresh, fallback to cache)
 *   - NetworkFirst for quiz API data (offline access to previously loaded quizzes)
 *   - Never cache POST routes or AI generation endpoints
 *
 * The precache manifest (__SW_MANIFEST) is injected by @serwist/next at build time.
 */

/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  StaleWhileRevalidate,
  NetworkFirst,
  NetworkOnly,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // ── StaleWhileRevalidate for versioned static assets ────────────────────
    // These have content hashes in the URL so it's safe to serve stale and revalidate
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new StaleWhileRevalidate({
        cacheName: "static-js-css",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },

    // ── StaleWhileRevalidate for fonts ──────────────────────────────────────
    {
      matcher: ({ url }) => /\.(?:woff2?|ttf|otf|eot)$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: "static-fonts",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
        ],
      }),
    },

    // ── StaleWhileRevalidate for images ─────────────────────────────────────
    {
      matcher: ({ url }) => /\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: "static-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },

    // ── NetworkFirst for quiz data API (offline viewing of loaded quizzes) ──
    {
      matcher: ({ url }) => /\/api\/quizzes\/[^/]+$/.test(url.pathname),
      handler: new NetworkFirst({
        cacheName: "api-quiz-data",
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          }),
        ],
      }),
    },

    // ── NetworkFirst for attempts API ───────────────────────────────────────
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/attempts"),
      handler: new NetworkFirst({
        cacheName: "api-attempts",
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          }),
        ],
      }),
    },

    // ── NetworkFirst for shared quiz data ───────────────────────────────────
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/shared/"),
      handler: new NetworkFirst({
        cacheName: "api-shared",
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          }),
        ],
      }),
    },

    // ── Never cache these (AI generation, transcript fetching, uploads) ─────
    // These require live network and should never return stale data
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/generate-quiz"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/fetch-transcript"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/upload"),
      handler: new NetworkOnly(),
    },

    // ── Default cache rules from @serwist/next ──────────────────────────────
    // Handles pages, RSC payloads, and other Next.js internals
    ...defaultCache,
  ],
});

serwist.addEventListeners();
