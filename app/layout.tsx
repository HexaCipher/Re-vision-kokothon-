import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistrar } from "@/components/ui/ServiceWorkerRegistrar";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { InstallBanner } from "@/components/ui/InstallBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Re-vision - Transform Your Notes Into Interactive Quizzes",
  description:
    "Upload your study notes and get AI-generated quizzes instantly. Master any subject through active recall.",
  metadataBase: new URL("https://re-vision-eosin.vercel.app"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Re-vision",
  },
  openGraph: {
    title: "Re-vision - Transform Your Notes Into Interactive Quizzes",
    description:
      "Upload your study notes and get AI-generated quizzes instantly. Master any subject through active recall.",
    siteName: "Re-vision",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Re-vision" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Re-vision - AI-Powered Study Quizzes",
    description:
      "Upload your study notes and get AI-generated quizzes instantly.",
    images: ["/og-image.svg"],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#ffffff",
          colorText: "#f1f5f9",
          colorTextSecondary: "#94a3b8",
          colorBackground: "#0c0c14",
          colorInputBackground: "rgba(255,255,255,0.03)",
          colorInputText: "#f1f5f9",
          colorDanger: "#ef4444",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontSize: "0.9375rem",
        },
        elements: {
          // Card container
          card: "bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 rounded-2xl sm:rounded-3xl",
          // Header
          headerTitle: "text-white font-bold text-2xl",
          headerSubtitle: "text-slate-400",
          // Social buttons (Google, GitHub, etc.)
          socialButtonsBlockButton:
            "bg-white/[0.04] border border-white/10 text-slate-200 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 rounded-xl h-11",
          socialButtonsBlockButtonText: "font-medium text-sm",
          // Divider
          dividerLine: "bg-white/10",
          dividerText: "text-slate-500 text-xs",
          // Form fields
          formFieldLabel: "text-slate-300 font-medium text-sm",
          formFieldInput:
            "bg-white/[0.03] border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-11 transition-colors",
          // Primary button (Continue, Sign in, etc.)
          formButtonPrimary:
            "bg-white text-slate-950 hover:bg-slate-100 font-semibold rounded-xl h-12 shadow-none transition-colors duration-200 text-sm",
          // Links
          footerActionLink: "text-indigo-400 hover:text-indigo-300 font-medium",
          // Footer text
          footerActionText: "text-slate-500",
          // Internal card elements
          identityPreview: "bg-white/[0.04] border-white/10 rounded-xl",
          identityPreviewText: "text-slate-300",
          identityPreviewEditButton: "text-indigo-400 hover:text-indigo-300",
          // Alert
          alert: "bg-red-500/10 border-red-500/20 text-red-400 rounded-xl",
          alertText: "text-red-400",
          // OTP input
          otpCodeFieldInput:
            "bg-white/[0.03] border-white/10 text-white rounded-lg focus:border-indigo-500/50",
          // Back button
          formFieldAction: "text-indigo-400 hover:text-indigo-300",
          // User button
          avatarBox: "rounded-xl",
          userButtonPopoverCard: "bg-slate-900/95 border-white/10 backdrop-blur-xl rounded-2xl",
          userButtonPopoverActionButton: "hover:bg-white/5 rounded-xl",
          userButtonPopoverActionButtonText: "text-slate-300",
          userButtonPopoverFooter: "border-white/5",
        },
      }}
    >
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} ${spaceGrotesk.variable} antialiased text-slate-100 min-h-screen relative`}
          style={{
            background: "linear-gradient(135deg, #0a0a0f 0%, #0f1117 40%, #111827 70%, #0c1020 100%)",
          }}
        >
          <InstallBanner />
          <OfflineBanner />
          <div className="relative z-10">
            {children}
          </div>
          <Toaster />
          <ServiceWorkerRegistrar />
        </body>
      </html>
    </ClerkProvider>
  );
}
