/**
 * AppLogo — Re-vision brand mark
 *
 * Icon: Bold "R" letter in white on a deep navy tile.
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
        <RLetterIcon size={s.svg} />
      </span>
      {showName && (
        <span
          className={`${s.text} font-bold tracking-tight leading-none select-none`}
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', 'Inter', system-ui, sans-serif" }}
        >
          <span style={{ color: "#FFFFFF" }}>Re</span>
          <span style={{ color: "#FFFFFF", opacity: 0.4, fontWeight: 400 }}>-</span>
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
      <RLetterIcon size={s.svg} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Bold white "R" — clean, modern, crisp on dark backgrounds           */
/* ------------------------------------------------------------------ */

function RLetterIcon({ size }: { size: number }) {
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
      <rect width="48" height="48" rx="12" fill="#0A0F1E" />
      <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#ffffff" strokeOpacity="0.1" />
      
      {/* Bold white "R" letter */}
      <text
        x="24"
        y="35"
        textAnchor="middle"
        fontFamily="'Space Grotesk', 'Inter', system-ui, sans-serif"
        fontWeight="700"
        fontSize="32"
        fill="#FFFFFF"
      >
        R
      </text>
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
      <rect width="48" height="48" rx="12" fill="#0A0F1E" />
      <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#ffffff" strokeOpacity="0.1" />
      
      {/* Bold white "R" letter */}
      <text
        x="24"
        y="35"
        textAnchor="middle"
        fontFamily="'Space Grotesk', 'Inter', system-ui, sans-serif"
        fontWeight="700"
        fontSize="32"
        fill="#FFFFFF"
      >
        R
      </text>
    </svg>
  );
}
