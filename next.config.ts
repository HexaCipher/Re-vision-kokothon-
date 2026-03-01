import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure external packages work properly in API routes
  serverExternalPackages: ['@google/generative-ai', 'pdf-parse', 'mammoth'],
  
  // Experimental settings
  experimental: {
    // Allow external fetch in server components
  },
};

export default nextConfig;
