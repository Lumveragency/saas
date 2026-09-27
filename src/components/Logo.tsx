import Link from "next/link";

export function Logo({
  href = "/",
  tone = "light",
}: {
  href?: string;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <span
        className={`grid h-7 w-7 place-items-center rounded-md ${
          isDark ? "bg-white text-accent" : "bg-ink text-surface"
        }`}
      >
        {/* Simple concentric mark — an abstract "scan / probability" glyph. */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 2v6l4.2 2.4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={`text-[15px] font-semibold tracking-[-0.01em] ${
          isDark ? "text-white" : "text-ink"
        }`}
      >
        MarketScan
      </span>
    </Link>
  );
}
