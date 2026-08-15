/**
 * SealBadge — the site's signature visual device.
 * An original circular-seal motif (concentric rings + checkmark) used to
 * mark verified official sources, watermark the hero, and anchor category
 * cards. It deliberately does NOT reproduce the national emblem — it is an
 * original mark evoking an official circular/stamp aesthetic.
 */
export function SealBadge({
  size = 40,
  tone = "green",
  className = "",
}: {
  size?: number;
  tone?: "green" | "gold" | "paper";
  className?: string;
}) {
  const colors = {
    green: { ring: "#0B4A38", inner: "#0E6349", mark: "#FBFBF8" },
    gold: { ring: "#B8862E", inner: "#D9B368", mark: "#142019" },
    paper: { ring: "#FBFBF8", inner: "#FBFBF8", mark: "#0B4A38" },
  }[tone];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="31" stroke={colors.ring} strokeWidth="1.4" />
      <circle cx="32" cy="32" r="26" stroke={colors.ring} strokeWidth="1" strokeDasharray="1.5 3.4" />
      <circle cx="32" cy="32" r="21" fill={colors.inner} />
      <path
        d="M23 32.5L29 38.5L41.5 25.5"
        stroke={colors.mark}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
