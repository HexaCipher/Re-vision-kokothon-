import { NextRequest, NextResponse } from "next/server";
import { Supadata } from "@supadata/js";

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
// Innertube client config (ANDROID returns caption URLs without exp=xpe)
// ---------------------------------------------------------------------------
const INNERTUBE_CLIENTS = [
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
] as const;

// ---------------------------------------------------------------------------
// Supadata fallback client (works from datacenter IPs)
// ---------------------------------------------------------------------------
const SUPADATA_API_KEY = process.env.SUPADATA_API_KEY;
const supadata = SUPADATA_API_KEY
  ? new Supadata({ apiKey: SUPADATA_API_KEY })
  : null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract a YouTube video ID from any common URL format */
function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be")
      return u.pathname.slice(1).split("?")[0] || null;
    if (u.pathname.startsWith("/shorts/"))
      return u.pathname.split("/shorts/")[1].split("?")[0] || null;
    if (u.pathname.startsWith("/live/"))
      return u.pathname.split("/live/")[1].split("?")[0] || null;
    if (u.pathname.startsWith("/v/"))
      return u.pathname.split("/v/")[1].split("?")[0] || null;
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

/** Clean raw transcript text: strip noise, normalize whitespace, truncate */
function cleanTranscript(raw: string): {
  transcript: string;
  wasTruncated: boolean;
} {
  let transcript = raw
    .replace(NOISE_RE, "")
    .replace(MUSIC_LINE_RE, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const wasTruncated = transcript.length > TRANSCRIPT_CHAR_LIMIT;
  if (wasTruncated) {
    transcript = transcript.slice(0, TRANSCRIPT_CHAR_LIMIT);
  }

  return { transcript, wasTruncated };
}

// ---------------------------------------------------------------------------
// Strategy 1: Innertube API (works from residential IPs)
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

async function fetchViaInnertube(
  videoId: string
): Promise<{ segments: string[]; method: string } | null> {
  for (const client of INNERTUBE_CLIENTS) {
    try {
      console.log(`[innertube] Trying ${client.label}`);

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
          body: JSON.stringify({ context: client.context, videoId }),
        }
      );

      if (!res.ok) {
        console.warn(`[innertube] ${client.label}: HTTP ${res.status}`);
        continue;
      }

      const data: InnertubePlayerResponse = await res.json();
      const status = data.playabilityStatus?.status;

      if (status && status !== "OK") {
        const reason = data.playabilityStatus?.reason || status;
        if (reason.toLowerCase().includes("private")) throw new Error("PRIVATE");
        if (reason.toLowerCase().includes("unavailable")) throw new Error("UNAVAILABLE");
        console.warn(`[innertube] ${client.label}: ${reason}`);
        continue;
      }

      const tracks =
        data.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (!tracks || tracks.length === 0) {
        console.warn(`[innertube] ${client.label}: no caption tracks`);
        continue;
      }

      // Prefer manual English → auto English → first
      const track =
        tracks.find((t) => t.languageCode === "en" && t.kind !== "asr") ||
        tracks.find((t) => t.languageCode === "en") ||
        tracks[0];

      // Fetch caption XML
      let captionUrl = track.baseUrl;
      if (!captionUrl.includes("fmt=")) {
        captionUrl += (captionUrl.includes("?") ? "&" : "?") + "fmt=srv3";
      }

      const xmlRes = await fetch(captionUrl, {
        cache: "no-store",
        headers: {
          "User-Agent": client.userAgent,
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (!xmlRes.ok) {
        console.warn(`[innertube] Caption XML: HTTP ${xmlRes.status}`);
        continue;
      }

      const xml = await xmlRes.text();
      if (!xml || xml.length === 0) {
        console.warn(`[innertube] Caption XML empty (exp=xpe issue)`);
        continue;
      }

      // Parse segments from XML
      const segments: string[] = [];
      const re = /<(?:p|text)[^>]*>([\s\S]*?)<\/(?:p|text)>/g;
      let match;
      while ((match = re.exec(xml)) !== null) {
        const text = match[1]
          .replace(/<[^>]+>/g, "")
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

      if (segments.length === 0) {
        // Fallback: strip all XML tags
        const plain = xml
          .replace(/<[^>]+>/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
        if (plain.length > 50) segments.push(plain);
      }

      if (segments.length > 0) {
        console.log(
          `[innertube] ${client.label}: got ${segments.length} segments`
        );
        return { segments, method: `innertube-${client.label}` };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "PRIVATE" || msg === "UNAVAILABLE") throw err;
      console.warn(`[innertube] ${client.label}: ${msg}`);
    }
  }

  return null; // All clients failed — fall through to Supadata
}

// ---------------------------------------------------------------------------
// Strategy 2: Supadata API (works from datacenter IPs)
// ---------------------------------------------------------------------------

async function fetchViaSupadata(
  videoId: string
): Promise<{ text: string; method: string } | null> {
  if (!supadata) {
    console.warn("[supadata] No SUPADATA_API_KEY configured");
    return null;
  }

  try {
    console.log("[supadata] Fetching transcript...");

    const result = await supadata.transcript({
      url: `https://www.youtube.com/watch?v=${videoId}`,
      lang: "en",
      text: true,
    });

    // Handle async job case (shouldn't happen for YouTube but handle gracefully)
    if ("jobId" in result) {
      console.warn("[supadata] Got async job ID, not supported in this flow");
      return null;
    }

    const content = result.content;
    if (!content) {
      console.warn("[supadata] Empty transcript content");
      return null;
    }

    let text: string;
    if (typeof content === "string") {
      text = content;
    } else {
      // Array of TranscriptChunk
      text = content.map((c) => c.text).join(" ");
    }

    if (text.length < 50) {
      console.warn(`[supadata] Transcript too short: ${text.length} chars`);
      return null;
    }

    console.log(`[supadata] Got ${text.length} chars`);
    return { text, method: "supadata" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[supadata] Error: ${msg}`);
    return null;
  }
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

    // Fetch title in parallel with transcript strategies
    const titlePromise = fetchVideoTitle(videoId);

    // -----------------------------------------------------------------------
    // Strategy 1: Innertube (fast, no API key, works from residential IPs)
    // -----------------------------------------------------------------------
    let rawText: string | null = null;
    let method = "unknown";

    try {
      const innertubeResult = await fetchViaInnertube(videoId);
      if (innertubeResult) {
        rawText = innertubeResult.segments.join(" ");
        method = innertubeResult.method;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Re-throw known application errors
      if (msg === "PRIVATE" || msg === "UNAVAILABLE") throw err;
      console.warn(`[fetch-transcript] Innertube failed: ${msg}`);
    }

    // -----------------------------------------------------------------------
    // Strategy 2: Supadata fallback (works from datacenter IPs)
    // -----------------------------------------------------------------------
    if (!rawText) {
      console.log("[fetch-transcript] Innertube failed, trying Supadata...");
      const supadataResult = await fetchViaSupadata(videoId);
      if (supadataResult) {
        rawText = supadataResult.text;
        method = supadataResult.method;
      }
    }

    // -----------------------------------------------------------------------
    // No transcript from either strategy
    // -----------------------------------------------------------------------
    if (!rawText || rawText.length < 50) {
      const hasSupadata = !!SUPADATA_API_KEY;
      return NextResponse.json(
        {
          error: hasSupadata
            ? "Could not retrieve transcript. The video may have no captions, or both services failed."
            : "Could not retrieve transcript from this server environment. Try pasting the video's transcript text directly.",
          detail: `innertube=failed, supadata=${hasSupadata ? "failed" : "not-configured"}`,
        },
        { status: 422 }
      );
    }

    // -----------------------------------------------------------------------
    // Clean, truncate, and return
    // -----------------------------------------------------------------------
    const { transcript, wasTruncated } = cleanTranscript(rawText);
    const title = await titlePromise;

    if (transcript.length < 50) {
      return NextResponse.json(
        { error: "Transcript is too short to generate a quiz from." },
        { status: 422 }
      );
    }

    console.log(
      `[fetch-transcript] Success via ${method}: ${transcript.length} chars, truncated=${wasTruncated}`
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
