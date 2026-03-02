import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const nextConfig: NextConfig = {
  // Ensure external packages work properly in API routes
  serverExternalPackages: ['@google/generative-ai', 'mammoth'],

  // Silence Turbopack warning in dev (we use webpack for builds due to serwist)
  turbopack: {},

  // Experimental settings
  experimental: {
    // Allow external fetch in server components
  },

  // Serve sw.js and manifest.json with correct headers
  // sw.js must be served from the root scope with no-cache so updates propagate
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

// Wrap with Serwist for PWA service worker generation
// Disabled in development to avoid Turbopack conflicts
export default withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
})(nextConfig);
