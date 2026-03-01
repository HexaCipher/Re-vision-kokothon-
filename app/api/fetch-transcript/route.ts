import { NextRequest, NextResponse } from "next/server";

// Vercel serverless config — default 10s is too short for 3 sequential YouTube fetches
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const TRANSCRIPT_CHAR_LIMIT = 50_000;

// Noise tokens auto-generated captions insert — strip them
const NOISE_RE =
  /\[(?:music|applause|laughter|inaudible|crosstalk|silence|sound|noise|cheering|clapping)[^\]]*\]/gi;
// Also strip ♪ music note lines common in music videos
const MUSIC_LINE_RE = /♪[^♪]*♪/g;

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

// ──────────────────────────────────────────────────────────────────────────────
// Transcript fetching via YouTube innertube ANDROID client
// The standard web caption URLs (with exp=xpe) no longer return content from
// server-side fetches. The ANDROID innertube client returns working caption URLs.
// ──────────────────────────────────────────────────────────────────────────────

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

/** Use the ANDROID innertube client to get caption track URLs that work */
async function fetchCaptionTracks(
  videoId: string
): Promise<CaptionTrack[]> {
  // First fetch the YouTube page to get the current innertube API key
  const pageRes = await fetch(
    `https://www.youtube.com/watch?v=${videoId}`,
    {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    }
  );

  if (!pageRes.ok) {
    console.error("[fetch-transcript] YouTube page fetch failed:", pageRes.status);
    throw new Error(`YouTube page request failed: ${pageRes.status}`);
  }

  const html = await pageRes.text();

  const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":\s*"([^"]+)"/);
  const apiKey = apiKeyMatch
    ? apiKeyMatch[1]
    : "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

  // Call the innertube /player endpoint with the ANDROID client
  // This returns caption URLs without the `exp=xpe` parameter,
  // which is required for the XML transcript endpoint to return content.
  const playerRes = await fetch(
    `https://www.youtube.com/youtubei/v1/player?key=${apiKey}&prettyPrint=false`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "20.10.38",
            hl: "en",
          },
        },
        videoId,
      }),
    }
  );

  if (!playerRes.ok) {
    throw new Error(`Innertube player request failed: ${playerRes.status}`);
  }

  const data: InnertubePlayerResponse = await playerRes.json();

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
    throw new Error(`Video not playable: ${reason}`);
  }

  const tracks =
    data.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!tracks || tracks.length === 0) {
    throw new Error("NO_CAPTIONS");
  }

  return tracks;
}

/** Fetch transcript XML from a caption track URL and parse into text segments */
async function fetchTranscriptXml(
  track: CaptionTrack
): Promise<string[]> {
  const res = await fetch(track.baseUrl, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    },
  });

  if (!res.ok) {
    console.error("[fetch-transcript] Transcript XML failed:", res.status);
    throw new Error(`Transcript XML request failed: ${res.status}`);
  }

  const xml = await res.text();
  if (!xml || xml.length === 0) {
    throw new Error("EMPTY_TRANSCRIPT");
  }

  // Parse <p t="..." d="...">text</p> or <text start="..." dur="...">text</text>
  const segments: string[] = [];
  const re = /<(?:p|text)[^>]*>([\s\S]*?)<\/(?:p|text)>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    let text = match[1]
      .replace(/<[^>]+>/g, "") // strip inner HTML tags
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (text) segments.push(text);
  }

  return segments;
}

// ──────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url: string = (body.url ?? "").trim();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
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

    // Build clean transcript — join segments, strip noise, normalise whitespace
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
        { error: "Transcript is too short to generate a quiz from." },
        { status: 422 }
      );
    }

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
        { error: "Captions are disabled or unavailable for this video." },
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
        { error: "Could not retrieve transcript content for this video." },
        { status: 422 }
      );
    }

    // Log full error details for Vercel function logs
    console.error("[fetch-transcript] Error:", msg);
    if (stack) console.error("[fetch-transcript] Stack:", stack);

    return NextResponse.json(
      {
        error:
          "Failed to fetch transcript. The video may be private, age-restricted, or have no captions.",
      },
      { status: 500 }
    );
  }
}
