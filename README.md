# Re-vision

**Transform your study notes into interactive quizzes — powered by AI.**

Re-vision is a full-stack Progressive Web App that lets students upload or paste their notes and instantly generate personalized, exam-style quizzes using Google Gemini. Built for active recall and spaced repetition, it turns passive reading into an engaging learning loop — installable on any device, works offline.

---

## Features

### Core
- **AI Quiz Generation** — paste text, upload a PDF/DOCX/TXT, or drop a YouTube link; AI produces targeted questions in under 10 seconds
- **YouTube Transcript Extraction** — paste any YouTube URL (watch, shorts, live, embed) and the transcript is fetched automatically with video thumbnail and title preview
- **Dual AI Providers** — Gemini 2.0 Flash (primary) with automatic Groq Llama 3.3 70B fallback when rate-limited. Users never see a "rate limited" error
- **Multiple Question Types** — multiple choice, true/false, and fill-in-the-blank
- **Difficulty Levels** — easy, medium, or hard
- **Timer Modes** — no timer, per-quiz countdown, or per-question countdown
- **Instant Feedback** — correct/incorrect with full explanations on the review page
- **Attempt History** — score tracking across retakes with personal best detection
- **Shareable Quizzes** — generate a share code so anyone can take your quiz as a guest (with leaderboard)
- **Dashboard** — manage all your quizzes, view difficulty badges, delete with confirmation
- **Authentication** — secure sign-up/sign-in via Clerk
- **Confetti** — fires on scores 70%+ because students deserve it

### PWA (Progressive Web App)
- **Installable** — add to home screen on Android, iOS, and desktop Chrome/Edge
- **Offline support** — static assets and recently viewed quizzes cached via service worker
- **Install banner** — dismissible in-app prompt to install when `beforeinstallprompt` fires
- **Offline banner** — detects network loss and shows a reconnecting indicator
- **Theme color** — `#0a0a0f` matches the dark UI for a native-app feel
- **Service worker** — built with `@serwist/next` using StaleWhileRevalidate for assets and NetworkFirst for quiz data

### Landing Page
- Animated hero with live quiz widget demo
- Bento feature grid: YouTube-to-quiz, instant generation, PWA offline, AI providers, retention stats, subject breadth
- Vertical timeline "How it works" section
- Anchor navigation — **Features** and **How it works** links in navbar scroll to sections smoothly
- Mobile-responsive hamburger menu with same anchor links
- Animated number counters, Framer Motion scroll transitions
- CTA section with results widget demo

### Presentation Mode (`/presentation`)
- **13-slide PPT-style presentation** for hackathon demos
- Slides: Title, Team, Problem, Solution, Competitor Comparison, Architecture, Flow Simulation, Tech Stack, Stats, Demo, Future Scope, Monetization, Thank You & Q&A
- **Keyboard navigation** — Arrow keys, Space, Enter to navigate; F for fullscreen; Escape to exit
- **Slide indicators** — clickable dots to jump to any slide
- **Fullscreen mode** — immersive presentation experience
- Framer Motion animations on each slide
- Competitor logos with custom Quietude SVG
- 3-tier pricing cards (Free/Plus/Pro) with feature comparison
- 12-feature future roadmap grid

### UI / Brand
- **"R" wordmark logo** — pure SVG vector path, no font dependency, renders correctly on Vercel and in favicons
- **Full white wordmark** — "Re-vision" in clean white, Space Grotesk Bold
- **Favicon** — pure SVG vector "R" built from primitives (no `<text>` font dependency — works everywhere including Vercel CDN)
- **Waving hand** on dashboard welcome message
- Permanently dark design — charcoal background, `bg-white/[0.02]` cards, indigo/violet accent palette

---

## Tech Stack

### Core Framework

| Technology | Role | Why |
|---|---|---|
| **Next.js 16** (App Router) | Full-stack React framework | Server-side rendering, API routes, file-based routing, and middleware. App Router enables streaming, server components, and parallel route loading. |
| **TypeScript** | Type-safe JavaScript | Catches bugs at compile time, provides IntelliSense, and makes the codebase self-documenting. |
| **React 19** | UI library | Latest React with server components, improved hydration, and concurrent features. |

### Styling & UI

| Technology | Role | Why |
|---|---|---|
| **Tailwind CSS v4** | Utility-first CSS | CSS-based config via `@theme inline {}`. Native CSS layers, automatic content detection, smaller bundle. |
| **Shadcn/ui** | Pre-built components | Accessible, customisable components on Radix UI primitives. Copied into project for full control. |
| **Framer Motion v12** | Animation library | Declarative physics-based animations for page transitions, bento card hovers, and scroll reveals. |
| **Lucide React** | Icon library | Consistent, lightweight, tree-shakeable SVG icons. |
| **Space Grotesk + Playfair Display + Inter** | Typography | Space Grotesk for brand/logo, Playfair Display for elegant serif headings, Inter for body text. |

### PWA

| Technology | Role | Why |
|---|---|---|
| **@serwist/next v9.5.6** | Service worker generation | Compatible with Next.js 16. Generates a typed TypeScript service worker with route-level caching strategies. `next-pwa` was removed — incompatible with Turbopack. |
| **serwist v9.5.6** | Service worker runtime | Provides `StaleWhileRevalidate`, `NetworkFirst`, `NetworkOnly` handler classes used in `app/sw.ts`. |
| **app/manifest.ts** | Dynamic web manifest | Next.js 16 typed manifest route. Serves at `/manifest.webmanifest` with correct MIME type. |

### Authentication

| Technology | Role | Why |
|---|---|---|
| **Clerk** | Auth & user management | Drop-in sign-up/sign-in, OAuth, JWT sessions. Zero custom auth code — more secure than rolling our own. |
| **proxy.ts** | Clerk middleware | Next.js 16 convention (`proxy.ts` not `middleware.ts`). Protects routes and allows PWA static files through. |

### Database

| Technology | Role | Why |
|---|---|---|
| **Firebase Firestore** | NoSQL cloud database | Serverless document database. Stores quizzes, attempts, and share codes. Generous free tier (1GB, 50K reads/day). |

### AI / LLM

| Technology | Role | Why |
|---|---|---|
| **Google Gemini 2.0 Flash** | Primary AI model | Fast, accurate, structured JSON output via `responseMimeType: "application/json"`. No output parsing needed. |
| **Groq (Llama 3.3 70B)** | Fallback AI model | Auto-fallback when Gemini rate-limits. Supports up to 6 API keys with intelligent rotation and 60-second cooldown per failed key. |

### Groq Multi-Key Fallback System

For high availability during demos or heavy usage, Re-vision supports up to **6 Groq API keys** with automatic rotation:

- Keys are tried in sequence (`GROQ_API_KEY` → `GROQ_API_KEY_2` → ... → `GROQ_API_KEY_6`)
- When a key fails (rate limit, auth error, etc.), it enters a **60-second cooldown**
- Subsequent requests skip cooldown keys and try the next available one
- On success, the key's cooldown status is cleared
- Empty keys are automatically skipped

This ensures the app stays responsive even if individual Groq accounts hit their rate limits.

### YouTube Transcript Pipeline

| Technology | Role | Why |
|---|---|---|
| **YouTube Innertube API** | Primary transcript fetcher | Direct access to YouTube's internal API (ANDROID client). No API key. Works on residential IPs (local dev). |
| **Supadata** | Fallback transcript fetcher | Works from datacenter IPs (Vercel). Automatically engaged when innertube is blocked. 100 transcripts/month free. |

### File Parsing

| Technology | Role | Why |
|---|---|---|
| **unpdf** | PDF extraction | Lightweight, no native deps. Works in Node.js serverless functions on Vercel. |
| **mammoth** | DOCX extraction | Converts `.docx` to plain text, handles complex Word documents. |

### UX

| Technology | Role | Why |
|---|---|---|
| **Sonner** | Toast notifications | Beautiful, stackable toasts. Minimal API: `toast.success(...)`. |
| **canvas-confetti** | Celebration animation | Fires on 70%+ score. Makes studying feel rewarding. |

### Deployment

| Technology | Role | Why |
|---|---|---|
| **Vercel** | Hosting | Purpose-built for Next.js. Auto-builds, CDN, serverless API routes, env variable management. |

---

## Prerequisites

- Node.js 18 or later
- A [Clerk](https://clerk.com) account (free tier works)
- A [Firebase](https://console.firebase.google.com) project with Firestore enabled
- A [Google AI Studio](https://aistudio.google.com) API key for Gemini
- A [Groq](https://console.groq.com) API key (free — 1,000 req/day)
- A [Supadata](https://supadata.ai) API key (free — 100 transcripts/month, needed for YouTube on Vercel)

---

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd re-vision
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Clerk — https://dashboard.clerk.com → your app → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Firebase — https://console.firebase.google.com → Project settings → Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google Gemini — https://aistudio.google.com/app/apikey
GEMINI_API_KEY=

# Groq (AI fallback) — https://console.groq.com/keys
# Multi-key fallback: add up to 6 keys for high availability during demos
GROQ_API_KEY=
GROQ_API_KEY_2=
GROQ_API_KEY_3=
GROQ_API_KEY_4=
GROQ_API_KEY_5=
GROQ_API_KEY_6=

# Supadata (YouTube transcripts on Vercel) — https://supadata.ai
SUPADATA_API_KEY=
```

### 4. Set up Firebase Firestore

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Firestore Database** (start in production mode)
3. Add Firestore Security Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quizzes/{quizId} {
      allow read: if resource.data.shareCode != null
                  || request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
                            && request.auth.uid == resource.data.userId;
    }
    match /attempts/{attemptId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Copy Firebase config values into `.env.local`

### 5. Set up Clerk

1. Create an application at [clerk.com](https://clerk.com)
2. Copy **Publishable Key** and **Secret Key** into `.env.local`
3. Add `http://localhost:3000` to **Allowed redirect URLs**

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
re-vision/
├── app/
│   ├── api/                     # API route handlers
│   │   ├── generate-quiz/       # Gemini → Groq fallback quiz generation
│   │   ├── fetch-transcript/    # YouTube transcript (innertube → Supadata)
│   │   ├── quizzes/[id]/        # CRUD for individual quizzes
│   │   ├── attempts/            # Attempt recording
│   │   ├── shared/              # Guest share flow + leaderboard
│   │   └── upload/document/     # PDF/DOCX text extraction
│   ├── dashboard/               # Authenticated dashboard + create flow
│   ├── quiz/[id]/               # Take, results, review pages
│   ├── quiz/share/[code]/       # Guest quiz flow
│   ├── sign-in/ & sign-up/      # Clerk auth pages (custom styled)
│   ├── presentation/            # PPT-style hackathon presentation (13 slides)
│   ├── manifest.ts              # Dynamic PWA web manifest
│   ├── sw.ts                    # TypeScript service worker (serwist)
│   └── page.tsx                 # Landing page
├── components/
│   ├── ui/
│   │   ├── AppLogo.tsx          # "R" vector logo + wordmark
│   │   ├── Navbar.tsx           # Authenticated navbar
│   │   ├── InstallBanner.tsx    # PWA install prompt banner
│   │   ├── OfflineBanner.tsx    # Offline/reconnecting indicator
│   │   ├── ServiceWorkerRegistrar.tsx  # Client-side SW registration
│   │   ├── PageTransition.tsx   # Framer Motion page wrapper
│   │   ├── QuizLoader.tsx       # Animated loading screens
│   │   └── ...                  # Shadcn/ui components
│   ├── dashboard/               # Dashboard-specific components
│   └── quiz/                    # Quiz taking, results, review clients
├── hooks/
│   └── useInstallPrompt.ts      # beforeinstallprompt event handler
├── lib/
│   ├── db.ts                    # Firestore helpers
│   └── firebase.ts              # Firebase initialisation
├── types/
│   └── index.ts                 # Shared TypeScript types
├── public/
│   ├── favicon.svg              # Pure vector "R" — no font dependency
│   └── sw.js                    # Auto-generated by serwist at build time
├── next.config.ts               # withSerwist wrapper, turbopack: {}
└── proxy.ts                     # Clerk middleware (Next.js 16 convention)
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build (uses `--webpack` for serwist compatibility) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

> **Note:** `npm run build` uses the `--webpack` flag. Serwist's webpack plugin is incompatible with Turbopack, so production builds explicitly use webpack. Development still uses Turbopack for fast HMR.

---

## Deployment

The recommended platform is [Vercel](https://vercel.com):

1. Push your repository to GitHub
2. Import the project in the Vercel dashboard
3. Add all environment variables from `.env.local` in **Project → Settings → Environment Variables**
4. Deploy — Vercel auto-detects Next.js and configures everything

> **Favicon note:** The favicon is a pure SVG vector path with no `<text>` or font dependencies. It renders correctly on Vercel's CDN without needing any web fonts loaded.

---

## Environment Variables Reference

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk dashboard → API Keys |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase console → Project settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase console → Project settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase console → Project settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase console → Project settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase console → Project settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase console → Project settings |
| `GEMINI_API_KEY` | Google AI Studio → Get API key |
| `GROQ_API_KEY` | Groq Console → API Keys |
| `GROQ_API_KEY_2` through `GROQ_API_KEY_6` | Additional Groq accounts (optional, for multi-key fallback) |
| `SUPADATA_API_KEY` | Supadata dashboard → API key |

---

## License

MIT
