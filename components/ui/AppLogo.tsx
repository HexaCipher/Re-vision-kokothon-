/**
 * AppLogo — Re-vision brand mark
 *
 * Icon: open book with a spark/lightning bolt — clean, sharp, dark-background style.
 *       Rendered on a deep navy tile with cyan accent strokes.
 *
 * Wordmark: Space Grotesk Bold
 *   "Re" in electric cyan #00E5FF
 *   "-"  glowing separator
 *   "vision" in clean white #F8FAFC
 */

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const SIZES = {
  sm: { box: "w-8 h-8",            svg: 32, text: "text-base",        gap: "gap-2"         },
  md: { box: "w-9 h-9 sm:w-10 sm:h-10", svg: 40, text: "text-lg sm:text-xl", gap: "gap-2 sm:gap-2.5" },
  lg: { box: "w-14 h-14",          svg: 56, text: "text-2xl sm:text-3xl", gap: "gap-3"      },
};

export function AppLogo({ size = "md", showName = true, className = "" }: AppLogoProps) {
  const s = SIZES[size];
  return (
    <span className={`flex items-center ${s.gap} ${className}`}>
      <span className={`${s.box} flex items-center justify-center flex-shrink-0`}>
        <BookSparkIcon size={s.svg} />
      </span>
      {showName && (
        <span
          className={`${s.text} font-bold tracking-tight leading-none select-none`}
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', 'Inter', system-ui, sans-serif" }}
        >
          <span style={{ color: "#00E5FF" }}>Re</span>
          <span style={{ color: "#00E5FF", opacity: 0.6, fontWeight: 400 }}>-</span>
          <span style={{ color: "#F8FAFC" }}>vision</span>
        </span>
      )}
    </span>
  );
}

export function AppIcon({ size = "md", className = "" }: Omit<AppLogoProps, "showName">) {
  const s = SIZES[size];
  return (
    <span className={`${s.box} flex items-center justify-center flex-shrink-0 ${className}`}>
      <BookSparkIcon size={s.svg} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Open book with a lightning spark — crisp on dark backgrounds        */
/* ------------------------------------------------------------------ */

function BookSparkIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Dark navy background tile */}
      <rect width="48" height="48" rx="11" fill="#0A0F1E" />
      <rect x="0.5" y="0.5" width="47" height="47" rx="10.5" stroke="#00E5FF" strokeOpacity="0.15" />

      {/* Left page of open book */}
      <path
        d="M24 34C24 34 13 30.5 13 22V15C17 15 21 16.5 24 19"
        stroke="#00E5FF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right page of open book */}
      <path
        d="M24 34C24 34 35 30.5 35 22V15C31 15 27 16.5 24 19"
        stroke="#F8FAFC"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.85"
      />
      {/* Spine */}
      <line
        x1="24" y1="19" x2="24" y2="34"
        stroke="#00E5FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      {/* Lightning bolt spark above book */}
      <path
        d="M26 7L21.5 13.5H25L20.5 20"
        stroke="#00E5FF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Square icon for favicon / OG image export                           */
/* ------------------------------------------------------------------ */

export function RevisionSquareIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="11" fill="#0A0F1E" />
      <rect x="0.5" y="0.5" width="47" height="47" rx="10.5" stroke="#00E5FF" strokeOpacity="0.15" />

      <path
        d="M24 34C24 34 13 30.5 13 22V15C17 15 21 16.5 24 19"
        stroke="#00E5FF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 34C24 34 35 30.5 35 22V15C31 15 27 16.5 24 19"
        stroke="#F8FAFC"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.85"
      />
      <line
        x1="24" y1="19" x2="24" y2="34"
        stroke="#00E5FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      <path
        d="M26 7L21.5 13.5H25L20.5 20"
        stroke="#00E5FF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
