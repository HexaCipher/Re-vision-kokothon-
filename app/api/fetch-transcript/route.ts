import { NextRequest, NextResponse } from "next/server";

// Vercel serverless config
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const TRANSCRIPT_CHAR_LIMIT = 50_000;

// Noise tokens auto-generated captions insert — strip them
const NOISE_RE =
  /\[(?:music|applause|laughter|inaudible|crosstalk|silence|sound|noise|cheering|clapping)[^\]]*\]/gi;
const MUSIC_LINE_RE = /♪[^♪]*♪/g;

// ---------------------------------------------------------------------------
// Well-known innertube API keys — these are public, embedded in YouTube's JS.
// Using them directly avoids scraping the YouTube page (which fails on
// datacenter IPs like Vercel because YouTube returns consent/bot pages).
// ---------------------------------------------------------------------------
const INNERTUBE_CLIENTS = [
  {
    label: "WEB",
    apiKey: "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
    context: {
      client: {
        clientName: "WEB",
        clientVersion: "2.20241126.01.00",
        hl: "en",
        gl: "US",
      },
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  },
  {
    label: "ANDROID",
    apiKey: "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
    context: {
      client: {
        clientName: "ANDROID",
        clientVersion: "20.10.38",
        androidSdkVersion: 34,
        hl: "en",
        gl: "US",
      },
    },
    userAgent:
      "com.google.android.youtube/20.10.38 (Linux; U; Android 14; en_US)",
  },
  {
    label: "IOS",
    apiKey: "AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUAc",
    context: {
      client: {
        clientName: "IOS",
        clientVersion: "20.10.4",
        deviceMake: "Apple",
        deviceModel: "iPhone16,2",
        hl: "en",
        gl: "US",
      },
    },
    userAgent:
      "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_2_1 like Mac OS X; en_US)",
  },
] as const;

/** Extract a YouTube video ID from any common URL format */
function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be")
      return u.pathname.slice(1).split("?")[0] || null;
    if (u.pathname.startsWith("/shorts/"))
      return u.pathname.split("/shorts/")[1].split("?")[0] || null;
    const v = u.searchParams.get("v");
    if (v) return v;
    if (u.pathname.startsWith("/embed/"))
      return u.pathname.split("/embed/")[1].split("?")[0] || null;
  } catch {
    // not a valid URL
  }
  return null;
}

/** Fetch video title via oEmbed — fast, no API key, ~50ms */
async function fetchVideoTitle(videoId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { cache: "no-store" }
    );
    if (!res.ok) return videoId;
    const data = await res.json();
    return (data.title as string) || videoId;
  } catch {
    return videoId;
  }
}

// ---------------------------------------------------------------------------
// Transcript fetching via YouTube innertube API
// ---------------------------------------------------------------------------

interface CaptionTrack {
  baseUrl: string;
  name?: { simpleText?: string; runs?: { text: string }[] };
  languageCode: string;
  kind?: string;
}

interface InnertubePlayerResponse {
  playabilityStatus?: { status: string; reason?: string };
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrack[];
    };
  };
}

/**
 * Try each innertube client until one returns caption tracks.
 * On Vercel (datacenter IPs), YouTube may block certain clients —
 * cycling through WEB → ANDROID → IOS maximises our chance of success.
 */
async function fetchCaptionTracks(
  videoId: string
): Promise<CaptionTrack[]> {
  const errors: string[] = [];

  for (const client of INNERTUBE_CLIENTS) {
    try {
      console.log(
        `[fetch-transcript] Trying innertube client: ${client.label}`
      );

      const res = await fetch(
        `https://www.youtube.com/youtubei/v1/player?key=${client.apiKey}&prettyPrint=false`,
        {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": client.userAgent,
            "Accept-Language": "en-US,en;q=0.9",
            Origin: "https://www.youtube.com",
            Referer: "https://www.youtube.com/",
          },
          body: JSON.stringify({
            context: client.context,
            videoId,
          }),
        }
      );

      if (!res.ok) {
        const errMsg = `${client.label} player returned ${res.status}`;
        console.warn(`[fetch-transcript] ${errMsg}`);
        errors.push(errMsg);
        continue;
      }

      const data: InnertubePlayerResponse = await res.json();

      // Check playability
      const status = data.playabilityStatus?.status;
      if (status && status !== "OK") {
        const reason = data.playabilityStatus?.reason || status;
        if (reason.toLowerCase().includes("private")) {
          throw new Error("PRIVATE");
        }
        if (reason.toLowerCase().includes("unavailable")) {
          throw new Error("UNAVAILABLE");
        }
        // For LOGIN_REQUIRED or other errors, try next client
        const errMsg = `${client.label}: ${reason}`;
        console.warn(`[fetch-transcript] ${errMsg}`);
        errors.push(errMsg);
        continue;
      }

      const tracks =
        data.captions?.playerCaptionsTracklistRenderer?.captionTracks;

      if (!tracks || tracks.length === 0) {
        const errMsg = `${client.label}: no caption tracks in response`;
        console.warn(`[fetch-transcript] ${errMsg}`);
        errors.push(errMsg);
        continue;
      }

      console.log(
        `[fetch-transcript] ${client.label} returned ${tracks.length} caption track(s)`
      );
      return tracks;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Re-throw known application errors (PRIVATE, UNAVAILABLE)
      if (msg === "PRIVATE" || msg === "UNAVAILABLE") throw err;
      const errMsg = `${client.label}: ${msg}`;
      console.warn(`[fetch-transcript] ${errMsg}`);
      errors.push(errMsg);
    }
  }

  // All clients failed — determine the best error
  const allErrors = errors.join("; ");
  console.error(
    `[fetch-transcript] All innertube clients failed: ${allErrors}`
  );

  if (allErrors.includes("no caption tracks")) {
    throw new Error("NO_CAPTIONS");
  }
  throw new Error(`All innertube clients failed: ${allErrors}`);
}

/** Fetch transcript XML from a caption track URL and parse into text segments */
async function fetchTranscriptXml(
  track: CaptionTrack
): Promise<string[]> {
  // Some caption URLs from innertube may not include fmt=srv3.
  // Append it to ensure we get XML format.
  let captionUrl = track.baseUrl;
  if (!captionUrl.includes("fmt=")) {
    captionUrl += (captionUrl.includes("?") ? "&" : "?") + "fmt=srv3";
  }

  console.log(
    `[fetch-transcript] Fetching caption XML, lang=${track.languageCode}, kind=${track.kind || "manual"}`
  );

  const res = await fetch(captionUrl, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    console.error(
      `[fetch-transcript] Caption XML fetch failed: ${res.status}`
    );
    throw new Error(`Transcript XML request failed: ${res.status}`);
  }

  const xml = await res.text();

  if (!xml || xml.length === 0) {
    console.error("[fetch-transcript] Caption XML response was empty");
    throw new Error("EMPTY_TRANSCRIPT");
  }

  console.log(
    `[fetch-transcript] Got ${xml.length} bytes of caption XML`
  );

  // Parse <p t="..." d="...">text</p> or <text start="..." dur="...">text</text>
  // Also handle <s> segments inside <p> tags
  const segments: string[] = [];
  const re = /<(?:p|text)[^>]*>([\s\S]*?)<\/(?:p|text)>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    let text = match[1]
      .replace(/<[^>]+>/g, "") // strip inner HTML tags (<s>, etc.)
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\n/g, " ")
      .trim();
    if (text) segments.push(text);
  }

  // If regex didn't match (unusual format), try a simpler approach
  if (segments.length === 0) {
    console.warn(
      "[fetch-transcript] Primary regex found no segments, trying fallback parser"
    );
    // Strip all XML tags and just get the text content
    const plainText = xml
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (plainText.length > 50) {
      segments.push(plainText);
    }
  }

  return segments;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url: string = (body.url ?? "").trim();

    if (!url) {
      return NextResponse.json(
        { error: "No URL provided" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        {
          error:
            "Invalid YouTube URL. Use a youtube.com/watch, youtu.be, or Shorts link.",
        },
        { status: 400 }
      );
    }

    console.log(`[fetch-transcript] Processing video: ${videoId}`);

    // Run caption track fetch and title fetch in parallel for speed
    const [tracks, title] = await Promise.all([
      fetchCaptionTracks(videoId),
      fetchVideoTitle(videoId),
    ]);

    // Prefer manual English → auto-generated English → first available track
    const track =
      tracks.find((t) => t.languageCode === "en" && t.kind !== "asr") ||
      tracks.find((t) => t.languageCode === "en") ||
      tracks[0];

    const segments = await fetchTranscriptXml(track);

    if (segments.length === 0) {
      return NextResponse.json(
        {
          error:
            "No captions found for this video. Make sure the video has subtitles enabled.",
        },
        { status: 422 }
      );
    }

    // Build clean transcript
    let transcript = segments
      .join(" ")
      .replace(NOISE_RE, "")
      .replace(MUSIC_LINE_RE, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    const wasTruncated = transcript.length > TRANSCRIPT_CHAR_LIMIT;
    if (wasTruncated) {
      transcript = transcript.slice(0, TRANSCRIPT_CHAR_LIMIT);
    }

    if (transcript.length < 50) {
      return NextResponse.json(
        {
          error: "Transcript is too short to generate a quiz from.",
        },
        { status: 422 }
      );
    }

    console.log(
      `[fetch-transcript] Success: ${transcript.length} chars, truncated=${wasTruncated}`
    );

    return NextResponse.json({
      transcript,
      videoId,
      title,
      characters: transcript.length,
      wasTruncated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;

    if (msg === "NO_CAPTIONS") {
      return NextResponse.json(
        {
          error:
            "Captions are disabled or unavailable for this video.",
        },
        { status: 422 }
      );
    }
    if (msg === "PRIVATE") {
      return NextResponse.json(
        { error: "This video is private." },
        { status: 422 }
      );
    }
    if (msg === "UNAVAILABLE") {
      return NextResponse.json(
        { error: "This video is unavailable." },
        { status: 422 }
      );
    }
    if (msg === "EMPTY_TRANSCRIPT") {
      return NextResponse.json(
        {
          error:
            "Could not retrieve transcript content for this video.",
        },
        { status: 422 }
      );
    }

    // Log full error details for Vercel function logs
    console.error("[fetch-transcript] Unhandled error:", msg);
    if (stack) console.error("[fetch-transcript] Stack:", stack);

    return NextResponse.json(
      {
        error:
          "Failed to fetch transcript. The video may be private, age-restricted, or have no captions.",
        detail: msg,
      },
      { status: 500 }
    );
  }
}
