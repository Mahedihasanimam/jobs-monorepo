import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <p className="text-xs tracking-wide text-slateblue font-mono uppercase mb-1.5">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl md:text-[28px] text-ink font-semibold">
          {title}
        </h2>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="hidden sm:inline-block text-sm text-primary font-semibold hover:text-primary-dark underline underline-offset-4 whitespace-nowrap"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
