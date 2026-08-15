import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getExamNotices } from "@/lib/data";
import { formatBanglaDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "পরীক্ষার নোটিশ — প্রবেশপত্র, ফলাফল ও সময়সূচি",
  description:
    "সরকারি চাকরির নিয়োগ পরীক্ষার প্রবেশপত্র, ফলাফল ও পরীক্ষার সময়সূচি সংক্রান্ত সর্বশেষ নোটিশ একত্রে দেখুন।",
  alternates: { canonical: "/exam-notices" },
};

const TYPE_LABEL: Record<string, string> = {
  "admit-card": "প্রবেশপত্র",
  result: "ফলাফল",
  schedule: "সময়সূচি",
};

export default async function ExamNoticesPage() {
  const notices = await getExamNotices();

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "হোম", href: "/" }, { label: "পরীক্ষার নোটিশ", href: "/exam-notices" }]} />
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mt-3 mb-2">
        পরীক্ষার নোটিশ
      </h1>
      <p className="text-ink/65 max-w-2xl mb-8">
        প্রবেশপত্র ডাউনলোড, লিখিত ও মৌখিক পরীক্ষার সময়সূচি এবং ফলাফল সংক্রান্ত সর্বশেষ নোটিশ।
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {notices.map((n) => (
          <Link
            key={n.slug}
            href={`/exam-notices/${n.slug}`}
            className="block bg-white border border-hairline rounded-card p-5 shadow-card hover:shadow-cardHover hover:border-primary/40 transition-all"
          >
            <span className="text-xs font-mono uppercase tracking-wide text-slateblue">
              {TYPE_LABEL[n.type]}
            </span>
            <h2 className="font-display font-semibold text-lg text-ink mt-1 mb-1.5 leading-snug">
              {n.title}
            </h2>
            <p className="text-sm text-ink/60">{n.organization}</p>
            <p className="text-xs text-ink/50 mt-2 font-mono">{formatBanglaDate(n.publishDate)}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
