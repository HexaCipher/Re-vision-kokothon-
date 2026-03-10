# RE-VISION: Transform Your Notes Into Mastery
## Hackathon Presentation

---

## SLIDE 1 — TITLE

**RE-VISION**
*"A New Vision for Revision."*

- **Team:** JUGAAD CODERS
- **Team Leader:** Manish Yadav
- **Members:** Rajput Aman Singh, Bhumika Mehra, Deepanita

- **Built at:** KOKOTHON
- **Live:** [https://re-vision-eosin.vercel.app](https://re-vision-eosin.vercel.app)

### Talking Points:
- **One-liner:** "Re-vision is an AI-powered Progressive Web App that converts your notes, documents, or YouTube lectures into interactive quizzes in under 10 seconds — installable on any device, works offline."
- Mention the problem space immediately: students waste time re-reading instead of actively recalling.

---

## SLIDE 2 — THE PROBLEM

*"Students study wrong. And they know it."*

### 1. PASSIVE STUDYING FAILS
- 80% of students rely on re-reading notes
- Research shows active recall improves retention by 50%+
- But creating practice quizzes manually is tedious and time-consuming

### 2. YOUTUBE LECTURES ARE ONE-WAY
- Millions of students learn from YouTube
- Zero built-in self-testing — you watch, forget, repeat
- No easy way to turn a 40-minute lecture into a quiz

### 3. EXISTING TOOLS ARE LIMITED
- Flashcard apps require manual input
- Quiz generators only accept text, not documents or video
- Most hit API rate limits and just... break
- None work offline or feel like a native app

### Talking Points:
- "How many of you have re-read your notes 5 times before an exam and still felt unprepared? That's the problem we're solving."
- Cite the science: active recall beats passive review every time. Karpicke & Blunt, 2011 — Science journal.

---

## SLIDE 3 — THE SOLUTION

*"Paste. Generate. Master. Anywhere."*

### THREE INPUT METHODS:

```text
  +------------------+    +------------------+    +------------------+
  |   Paste Text     |    |  Upload Document |    |  YouTube URL     |
  |                  |    |                  |    |                  |
  |  Any subject,    |    |  PDF, DOCX, TXT  |    |  Paste any video |
  |  any length      |    |  up to 10 MB     |    |  link with       |
  |                  |    |                  |    |  captions        |
  +------------------+    +------------------+    +------------------+
           |                       |                       |
           +----------+------------+-----------+-----------+
                      |                        |
                      v                        v
              AI Quiz Generation          10 seconds
              (5-20 questions)            (not minutes)
                      |
                      v
              Take Quiz -> Get Score -> Track Progress -> Share
                      |
                      v
              Install as PWA -> Study Offline -> Anywhere
```

### Talking Points:
- "You paste a YouTube video URL, we extract the transcript, and hand you a quiz — all without you typing a single question."
- The 10-second claim is real — demo it live.
- The PWA angle: "You can install this on your phone right now and study on the bus with no internet."

---

## SLIDE 4 — LIVE DEMO FLOW

*"Let me show you."*

### RECOMMENDED DEMO SEQUENCE (3-4 minutes):

**Step 1: YOUTUBE FLOW (the wow factor)**
- Go to Create Quiz page
- Select "YouTube Video" input type
- Paste a popular educational video URL
- Show: thumbnail loads, title appears, transcript is fetched
- Show: character count, transcript preview, truncation indicator
- Point out: "No YouTube API key. No third-party service. We built this."

**Step 2: CONFIGURE**
- Pick subject, difficulty (Medium), question count (10)
- Select MCQ + True/False question types
- Enable per-question timer (30 seconds)
- Hit "Generate Quiz"

**Step 3: TAKE THE QUIZ**
- Show the QuizLoader animation (notes -> AI brain -> quiz)
- Answer 3-4 questions to show the timer, progress bar, options UI
- Navigate directly to questions using the dot navigator

**Step 4: RESULTS**
- Show score with animated counter
- Show confetti celebration (if score >= 70%)
- Show "Best Score" comparison with previous attempts

**Step 5: SHARE**
- Click share button -> show the 8-character code
- Open in incognito/new browser -> paste the share code
- Show guest flow: enter name -> take quiz -> see results
- "Recipients don't need an account."

**Step 6: PWA INSTALL (bonus wow)**
- Show the install banner at the bottom of the screen
- Click "Install App" -> device prompts to add to home screen
- "This is a full Progressive Web App — works offline, installs like a native app, no App Store needed."

**BACKUP:** If YouTube is slow on stage, have a text-paste quiz pre-loaded in another tab as fallback.

### Talking Points:
- Keep the demo snappy. Don't read every question aloud.
- The YouTube flow is your differentiator — lead with it.
- If rate-limited on stage, show the Groq fallback in action: "Watch — it automatically switches to our backup AI provider."

---

## SLIDE 5 — KEY FEATURES

*"Everything a student needs. Nothing they don't."*

**INPUT METHODS**
- Paste text
- Upload PDF/DOCX/TXT
- YouTube video URL

**QUESTION TYPES**
- Multiple Choice
- True / False
- Fill in the Blank

**CONFIGURATION**
- Easy / Medium / Hard
- 5 / 10 / 15 / 20 questions
- 11 subject categories

**TIMER MODES**
- No timer (relaxed)
- Per-quiz countdown
- Per-question countdown
- Configurable durations

**QUIZ SHARING**
- One-click share code generation
- 8-character unique codes
- Guest access (no signup required)
- Guest leaderboard per shared quiz

**TRACKING & HISTORY**
- Attempt history per quiz
- Score vs personal best
- Dashboard with stats
- Quiz management (delete)

**PWA (Progressive Web App)**
- Install on Android, iOS, Desktop
- Works fully offline (cached assets)
- Dismissible install banner
- Offline indicator banner
- Native app feel, no App Store

**SMART UX**
- Navigation guard during quiz
- Rate limit handling
- Session-first data strategy
- Confetti on scores >= 70%
- Question dot navigator

**DESIGN**
- Permanently dark charcoal UI
- Smooth Framer Motion animations
- Responsive — mobile to 4K
- Space Grotesk + Playfair Display
- "R" vector logo — no font dep.

### BY THE NUMBERS:
- 13 application routes
- 10 API endpoints
- 30+ UI components
- 3 AI-powered pipelines (text, document, YouTube)
- 0 third-party YouTube API keys required
- 1 installable PWA

### Talking Points:
- Don't read all features — pick 3-4 that wow the judges.
- Emphasize: "Guest sharing without signup" — great for classrooms.
- The "0 API keys for YouTube" line is a mic-drop moment.
- The PWA is a production-quality differentiator most hackathon projects don't bother implementing.

---

## SLIDE 6 — SYSTEM ARCHITECTURE

*"One codebase. Production patterns."*

```text
  ┌─────────────────────────────────────────────────────────────────────┐
  │                         CLIENT (Browser / PWA)                      │
  │                                                                      │
  │   Next.js 16 App Router (React 19 + TypeScript)                     │
  │   Tailwind CSS v4  |  Framer Motion v12  |  shadcn/ui               │
  │                                                                      │
  │   ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
  │   │  Landing     │  │  Dashboard   │  │  Quiz Flow              │  │
  │   │  page.tsx    │  │  + Create    │  │  /take  /results        │  │
  │   │  (anchor nav)│  │  (3 inputs)  │  │  /review  /share        │  │
  │   └──────────────┘  └──────────────┘  └─────────────────────────┘  │
  │                                                                      │
  │   Service Worker (serwist)   |   sessionStorage + localStorage      │
  └──────────────────┬──────────────────────────────────────────────────┘
                     │  HTTPS (Next.js API Routes — Serverless on Vercel)
  ┌──────────────────▼──────────────────────────────────────────────────┐
  │                         API LAYER                                    │
  │                                                                      │
  │  /api/generate-quiz    /api/fetch-transcript    /api/upload/document │
  │  /api/quizzes/[id]     /api/attempts            /api/shared/[code]   │
  └───┬────────────────────────────┬───────────────────────┬────────────┘
      │                            │                       │
  ┌───▼────────────┐  ┌────────────▼──────────┐  ┌────────▼───────────┐
  │  AI PIPELINE   │  │  TRANSCRIPT PIPELINE  │  │  DATA LAYER        │
  │                │  │                       │  │                    │
  │  1. Gemini     │  │  1. YouTube Innertube │  │  Firebase          │
  │     2.0 Flash  │  │     ANDROID client    │  │  Firestore         │
  │     (primary)  │  │     (no API key)      │  │                    │
  │                │  │                       │  │  Collections:      │
  │  2. Groq       │  │  2. Supadata API      │  │  - quizzes         │
  │     Llama 3.3  │  │     (Vercel fallback) │  │  - attempts        │
  │     70B        │  │                       │  │                    │
  │  (auto-fallbk) │  │  + unpdf / mammoth    │  │  Clerk Auth        │
  │                │  │    (PDF / DOCX)       │  │  (JWT sessions)    │
  └────────────────┘  └───────────────────────┘  └────────────────────┘

  DATA FLOW — QUIZ GENERATION:

  User Input
      │
      ├─ Text paste      ──────────────────────────────────────────┐
      ├─ PDF/DOCX/TXT    → unpdf / mammoth → extracted text ───────┤
      └─ YouTube URL     → Innertube / Supadata → transcript ──────┤
                                                                    │
                                                            Content (≤30K chars)
                                                                    │
                                                       ┌────────────▼──────────┐
                                                       │   /api/generate-quiz  │
                                                       │                       │
                                                       │  try: Gemini 2.0 Flash│
                                                       │  catch: Groq fallback │
                                                       └────────────┬──────────┘
                                                                    │
                                                            Quiz JSON (validated)
                                                                    │
                                              ┌─────────────────────▼──────────┐
                                              │  sessionStorage (instant)       │
                                              │  + Firestore (persistent)       │
                                              └────────────────────────────────┘
```

**SESSION-FIRST DATA STRATEGY:**
- Quiz data → sessionStorage immediately on generation
- Firebase is the persistence layer — app works even if DB save fails
- Result: instant page transitions, zero loading spinners between quiz → results → review

**PWA CACHING STRATEGY (serwist service worker):**
- StaleWhileRevalidate: /_next/static/*, fonts, images
- NetworkFirst:         /api/quizzes/* (offline viewing)
- NetworkOnly:          /api/generate-quiz, /api/fetch-transcript

### Talking Points:
- Walk through the architecture top-to-bottom in 60 seconds.
- Focus on the two fallback chains: Gemini→Groq and Innertube→Supadata
- The session-first strategy is a real architectural decision that makes the app feel snappy — worth calling out.

---

## SLIDE 7 — YOUTUBE INTEGRATION (THE INNOVATION)

*"Every YouTube transcript npm package is broken. So we built our own."*

### THE PROBLEM WITH EXISTING SOLUTIONS:
- `youtube-transcript`, `youtube-caption-extractor`, `youtube-captions-scraper`
- All rely on Web client caption URLs
- YouTube now adds `&exp=xpe` to all Web client caption URLs
- This causes `content-length: 0` responses — completely broken
- We tested all three. None work. (Removed them from dependencies.)

### OUR SOLUTION — ANDROID INNERTUBE CLIENT:
1. Fetch YouTube page HTML
2. Extract `INNERTUBE_API_KEY` from the page source
3. POST to `/youtubei/v1/player` with ANDROID client context (clientName: "ANDROID", clientVersion: "20.10.38")
4. Receive captionTracks with working baseUrl (no exp=xpe)
5. Fetch XML captions -> parse `<p t="..." d="...">` elements
6. Clean noise tokens ([music], [applause], etc.)
7. Truncate to 50,000 characters

### VERCEL FALLBACK — Supadata API:
- Innertube works on residential IPs (local dev)
- Vercel runs on datacenter IPs — YouTube blocks them
- Supadata is auto-engaged when innertube returns empty
- Free tier: 100 transcripts/month — plenty for demo

### WHY THIS IS IMPRESSIVE:
- Zero external dependencies for primary transcript fetching
- No YouTube Data API key needed (saves cost + avoids quota limits)
- Works on any video with captions (manual or auto-generated)
- Prefers manual English > auto-English > first available track
- Production-ready: error handling, timeout config, Vercel-optimized

### FREE METADATA (no API key):
- Video thumbnail: `youtube.com/vi/{id}/hqdefault.jpg` (direct URL)
- Video title: YouTube oEmbed endpoint (free, unlimited)

### Talking Points:
- "We discovered that every single npm package for YouTube transcripts is broken as of 2025. YouTube changed their internal API. We reverse-engineered the Android client's approach to get working caption URLs."
- This is a genuine technical innovation.
- If a judge asks "why not use the YouTube Data API?" — answer: "It requires OAuth setup, has daily quota limits, and costs money at scale. Our approach is free and unlimited."

---

## SLIDE 8 — DUAL-LLM FALLBACK ARCHITECTURE

*"Two AI brains. Zero downtime."*

### PRIMARY: Google Gemini 2.0 Flash
- `responseMimeType: "application/json"` (forces clean JSON, no markdown)
- `thinkingBudget: 0` (skip chain-of-thought for speed)
- Free tier: 20 requests/day

### FALLBACK: Groq Llama 3.3 70B Versatile
- `response_format: { type: "json_object" }`
- Free tier: 1,000 requests/day (50x more than Gemini)
- Activates automatically on ANY Gemini error

```text
  THE FLOW:
  +---------+     Success     +----------+
  | Request | -------------> | Response |
  +---------+                +----------+
       | Gemini fails (rate limit, error, timeout)
       v
  +---------+     Success     +----------+
  |  Groq   | -------------> | Response |
  +---------+                +----------+
       | Both fail
       v
  +------------------+
  | 429 + retry info |
  +------------------+
```

### SMART DETAILS:
- Response includes "provider" field ("gemini" or "groq") for transparency — the client knows which AI served the request
- Content truncated to 30,000 chars before LLM (reduces tokens)
- Shared `parseAndNormalise()` handles both providers' output formats
- User-friendly error messages (never leak API key errors)
- Client shows rate-limit toast with countdown timer

### Talking Points:
- "During development, we burned through Gemini's 20 daily requests in an hour. Instead of upgrading to a paid plan, we engineered an automatic fallback. Users never see an error."
- This is a production pattern used by real companies — we implemented it at hackathon scale.

---

## SLIDE 9 — PWA (PROGRESSIVE WEB APP)

*"A native app experience — without the App Store."*

### WHAT IS A PWA?
A web app that can be installed on any device (Android, iOS, Desktop) and behaves like a native app — with offline support, home screen icon, full-screen mode, and push notifications capability.

### WHAT WE IMPLEMENTED:

**1. SERVICE WORKER (serwist + @serwist/next)**
- StaleWhileRevalidate: static assets, fonts, images (instant loads)
- NetworkFirst: quiz API data (viewable offline after first load)
- NetworkOnly: AI generation (requires internet — no stale AI)

**2. WEB MANIFEST (app/manifest.ts)**
- Dynamic typed manifest served at `/manifest.webmanifest`
- `theme_color: #0a0a0f` (matches dark UI — no white flash)
- Icons, display: "standalone", orientation settings

**3. INSTALL EXPERIENCE**
- Dismissible "Install App" banner (bottom of screen)
- Hooks into browser's `beforeinstallprompt` event
- One tap to install — no App Store, no review process

**4. OFFLINE EXPERIENCE**
- Offline banner detects network loss and shows reconnecting indicator
- Previously viewed quizzes accessible with no connection
- App shell loads instantly from cache

**5. FAVICON (pure SVG vector)**
- Problem: SVG `<text>` with font-family doesn't render on Vercel CDN
- Solution: Pure vector path "R" built from SVG primitives
- Works everywhere: browser tabs, PWA icons, bookmarks

### WHY THIS MATTERS:
- Students study on buses, in libraries, in dead-zones
- Works offline = works everywhere
- No App Store friction = instant adoption
- Most hackathon web apps are NOT installable — we are

### Talking Points:
- Open browser on phone, show install prompt live
- "This is not a mobile-responsive website. This is a PWA. It installs, it caches, it works offline."

---

## SLIDE 10 — UI/UX DESIGN

*"Designed to feel premium. Built to be accessible."*

### VISUAL IDENTITY:
- Permanently dark charcoal aesthetic (crafted gradients, not generic)
- Background: `#0a0a0f` with radial gradient overlays per section
- Cards: rounded-3xl, border-white/10, bg-white/[0.02], backdrop-blur-xl
- Buttons: bg-white text-slate-950 (high-contrast inverted style)
- Brand "R" logo: pure SVG vector, gradient-free, works at any size
- Fonts: Space Grotesk (logo/brand) + Playfair Display (academic serif headings) + Inter + Geist Mono

### LANDING PAGE:
- Sticky navbar with anchor links: Features | How it works | Sign in
- Animated hero with live auto-playing quiz demo widget
- Bento feature grid
- "How it works" vertical timeline with staggered animations
- Animated number counters (10 sec, 50%, "Any")
- Mobile hamburger menu with anchor nav links
- CTA section with results widget demo

### ANIMATIONS (Framer Motion v12):
- Page transitions: fade + slide between all routes
- Bento grid: hover blur/scale with group blur effect on siblings
- Timer countdown animation (question-level progress bar)
- Score counter animation (0 -> final score on results page)
- `canvas-confetti` burst for scores >= 70%
- SpotlightCard: radial gradient follows mouse cursor
- QuizLoader: "Notes -> AI Brain -> Quiz" animation with shimmer

### RESPONSIVE DESIGN:
- Mobile-first with sm/md/lg/xl breakpoints
- Touch-friendly tap targets (h-12 to h-14)
- Quiz widget hidden on mobile (shown md+)

### Talking Points:
- Show the landing page on a big screen — the bento grid and animations are visually impressive.
- "Every color, radius, and animation was intentional. This isn't a Bootstrap template."
- The confetti is a crowd-pleaser — make sure it fires during demo.

---

## SLIDE 11 — TECH STACK SUMMARY

*"Production-grade. Not a prototype."*

**FRONTEND**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion v12
- shadcn/ui + Radix UI
- Lucide React icons
- Sonner (toasts)
- canvas-confetti

**BACKEND (Serverless)**
- Next.js API Routes (Vercel)
- Firebase Firestore (NoSQL)
- Clerk Authentication
- Google Gemini 2.0 Flash
- Groq Llama 3.3 70B
- unpdf + mammoth (doc parsing)
- YouTube Innertube API (custom)
- Supadata (YouTube fallback)

**PWA**
- @serwist/next v9.5.6
- serwist v9.5.6
- app/manifest.ts (typed)
- app/sw.ts (TypeScript SW)
- useInstallPrompt hook
- InstallBanner component
- OfflineBanner component

**DEPLOYMENT**
- Vercel (serverless, edge CDN)
- Auto-deploys on git push
- `maxDuration: 30s` (transcript route)
- `force-dynamic` on YouTube fetches
- Environment variables in dashboard

### AUTH CONVENTION:
- `proxy.ts` (not middleware.ts) — Next.js 16 convention
- Allows `/sw.js`, `/manifest.webmanifest` through without auth
- Guest access for shared quiz routes

### BUILD NOTE:
- `npm run build` uses `--webpack` flag
- Serwist webpack plugin incompatible with Turbopack
- Dev still uses Turbopack for fast HMR

---

## SLIDE 12 — CLOSING & FUTURE

*"Re-vision: Where AI meets active learning."*

### WHAT WE BUILT:
- A complete, production-ready AI study tool
- 3 input methods (text, documents, YouTube)
- Dual-LLM architecture with zero-downtime failover
- Custom YouTube transcript engine (no broken dependencies)
- Full PWA: installable, offline-capable, native feel
- Beautiful, responsive, animated UI
- Quiz sharing without requiring signup
- Anchor navigation landing page with live demo widgets

### IMPACT:
- Any student, any subject, any format
- 10 seconds from raw content to interactive quiz
- Science-backed active recall methodology
- Works offline — study anywhere
- Free to use (leveraging free API tiers intelligently)

### FUTURE ROADMAP:
- Spaced repetition scheduling (re-quiz when you're about to forget)
- Classroom mode (teacher creates, entire class takes, live leaderboard)
- AI-generated explanations on results (not just "correct answer was B")
- Export to Anki/Quizlet format
- Multi-language support (YouTube captions already support it)
- Push notifications ("Time to revise Biology — you haven't tested yourself in 3 days")
- Image/diagram input (photo your handwritten notes)

### LIVE DEMO:
[https://re-vision-eosin.vercel.app](https://re-vision-eosin.vercel.app)

*"Stop re-reading. Start recalling."*

### Talking Points:
- End strong: "We didn't just build a quiz generator. We built a learning platform that meets students where they already are — in their notes, in their PDFs, on YouTube, offline on their phones."
- The future roadmap shows vision beyond the hackathon.
- Close with the tagline: "Stop re-reading. Start recalling."
- Thank the judges.

---

## TIMING GUIDE:
- Slide 1  (Title)              — 30 seconds
- Slide 2  (Problem)            — 1 minute
- Slide 3  (Solution)           — 1 minute
- Slide 4  (Live Demo)          — 3-4 minutes  ← THE BULK OF YOUR TIME
- Slide 5  (Key Features)       — 1 minute
- Slide 6  (System Architecture)— 1.5 minutes
- Slide 7  (YouTube Innovation) — 1.5 minutes
- Slide 8  (Dual-LLM)           — 1 minute
- Slide 9  (PWA)                — 1 minute
- Slide 10 (UI/UX)              — 30 seconds
- Slide 11 (Tech Stack)         — 30 seconds
- Slide 12 (Closing)            — 30 seconds

**TOTAL:** ~13-14 minutes (trim Slides 10-11 if short on time)

## TIPS FOR JUDGES:
- Lead with the YouTube demo — it's your strongest differentiator
- Second strongest: PWA install on stage from a phone
- If asked about scalability: "Groq gives us 1000 req/day free, adding more providers is just another fallback function. Firebase scales automatically."
- If asked about cost: "Everything runs on free tiers — Gemini, Groq, Vercel, Firebase Spark, Clerk free plan, Supadata free tier"
- If asked about AI accuracy: "We use structured JSON output modes to force valid quiz format. Content truncation keeps responses focused. The LLM prompt is carefully engineered per difficulty."
- If asked about offline: "The service worker caches the app shell and recent quiz data. Generation requires internet but taking a cached quiz works with no connection."
- If asked why not use next-pwa: "next-pwa is incompatible with Next.js 16 Turbopack. We migrated to @serwist/next which is the actively maintained successor."
- Have the Vercel function logs open in a background tab
- Have a pre-generated quiz ready as demo backup

## QUICK DIFFERENTIATORS (for Q&A):
1. YouTube → Quiz with zero API keys (custom Innertube implementation)
2. Dual-LLM failover (Gemini → Groq) — users never see a rate limit
3. Full PWA — installable, works offline, no App Store
4. Guest quiz sharing — no signup required for quiz recipients
5. Session-first architecture — instant transitions, resilient to DB failures
6. Pure SVG vector favicon — renders correctly on Vercel CDN (no font dep)


