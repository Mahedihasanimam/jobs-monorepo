import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeading } from "@/components/SectionHeading";
import { JobCard } from "@/components/JobCard";
import { CategoryCard } from "@/components/CategoryCard";
import { TrustSection } from "@/components/TrustSection";
import { FaqAccordion } from "@/components/FaqAccordion";
import { SealBadge } from "@/components/SealBadge";
import {
  getCategories,
  getClosingSoonJobs,
  getExamNotices,
  getJobsByCategory,
  getLatestJobs,
} from "@/lib/data";
import { formatBanglaDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "সরকারি চাকরির সর্বশেষ সার্কুলার ও বিজ্ঞপ্তি",
  description:
    "বাংলাদেশের সরকারি চাকরির সর্বশেষ সার্কুলার, শেষ হচ্ছে শীঘ্রই এমন চাকরি, ক্যাটাগরি অনুযায়ী তালিকা এবং পরীক্ষার নোটিশ একসাথে খুঁজুন — বাংলাদেশ সরকারি চাকরি।",
  alternates: { canonical: "/" },
};

const QUICK_FILTERS = [
  { href: "/latest-jobs", label: "নতুন সার্কুলার" },
  { href: "/closing-soon", label: "শেষ হচ্ছে শীঘ্রই" },
  { href: "/categories/bank", label: "ব্যাংক" },
  { href: "/categories/railway", label: "রেলওয়ে" },
  { href: "/categories/freshers", label: "ফ্রেশার্স" },
  { href: "/exam-notices", label: "প্রবেশপত্র ও ফলাফল" },
];

const FAQS = [
  {
    question: "প্রতিদিন নতুন সরকারি চাকরির বিজ্ঞপ্তি কীভাবে পাব?",
    answer:
      "হোমপেজের 'নতুন সার্কুলার' সেকশন অথবা /latest-jobs পাতায় প্রতিদিন প্রকাশিত সরকারি চাকরির বিজ্ঞপ্তি হালনাগাদ করা হয়। এছাড়া ক্যাটাগরি বা এলাকা অনুযায়ী ফিল্টার করেও খুঁজতে পারেন।",
  },
  {
    question: "শিক্ষাগত যোগ্যতা অনুযায়ী চাকরি কীভাবে খুঁজব?",
    answer:
      "চাকরির তালিকা পাতায় (/jobs) 'শিক্ষাগত যোগ্যতা' ফিল্টার ব্যবহার করে এসএসসি, এইচএসসি, ডিপ্লোমা, স্নাতক বা স্নাতকোত্তর অনুযায়ী চাকরি ফিল্টার করা যায়।",
  },
  {
    question: "কীভাবে বুঝব একটি বিজ্ঞপ্তির আবেদনের শেষ তারিখ কাছাকাছি?",
    answer:
      "প্রতিটি চাকরির কার্ডে শেষ তারিখ স্পষ্টভাবে দেখানো হয়। এছাড়া 'শেষ হচ্ছে শীঘ্রই' পাতায় (/closing-soon) আগামী কয়েক দিনের মধ্যে আবেদনের শেষ তারিখ এমন চাকরিগুলো আলাদাভাবে তালিকাভুক্ত থাকে।",
  },
  {
    question: "এই ওয়েবসাইটে কীভাবে সার্কুলার সংরক্ষণ করব?",
    answer:
      "প্রতিটি চাকরির কার্ড এবং বিস্তারিত পেজে 'সংরক্ষণ করুন' বাটন রয়েছে। এতে পছন্দের সার্কুলারগুলি সংরক্ষিত হয়ে /saved পাতায় সহজে দেখা যাবে।",
  },
];

export default async function HomePage() {
  const [latestJobs, closingSoonJobs, categories, examNotices] = await Promise.all([
    getLatestJobs(6),
    getClosingSoonJobs(6, 30),
    getCategories(),
    getExamNotices(),
  ]);
  const categoryCounts = await Promise.all(
    categories.slice(0, 9).map(async (category) => ({
      category,
      count: (await getJobsByCategory(category.slug)).length,
    })),
  );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-paper">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),transparent_35%)]" />
        <SealBadge
          size={420}
          tone="paper"
          className="seal-watermark absolute -right-24 -top-24 pointer-events-none hidden md:block"
        />
        <Container className="relative py-14 md:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-gold-light mb-3">
            হালনাগাদ: {formatBanglaDate("2026-08-15")}
          </p>
          <h1 className="font-display text-3xl md:text-[44px] font-bold leading-tight max-w-2xl mb-4">
            বাংলাদেশের সরকারি চাকরির তথ্য, এক জায়গায়
          </h1>
          <p className="text-paper/85 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
            নতুন সার্কুলার, আবেদনের শেষ তারিখ, পরীক্ষার নোটিশ, বিভাগভিত্তিক সুযোগ ও অফিসিয়াল উৎস —
            সবকিছু সাজানো হয়েছে দ্রুত খোঁজার জন্য, যাতে আপনি নির্ভরযোগ্যভাবে উপযুক্ত চাকরিটি খুঁজে পান।
          </p>
          <SearchBar />

          {/* <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-white/10 pt-8">
            <p className="w-full font-mono text-xs uppercase tracking-widest text-paper/70 sm:w-auto sm:pr-4">
              মোবাইল অ্যাপ নামান
            </p>
            <a
              href="#"
              className="flex items-center gap-2.5 rounded-xl bg-ink px-4 py-2 text-paper transition-all hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M3.6 20.4l11.4-11.4-4.2-4.2L3.6 20.4zM16.5 7.5L4.5 19.5 2 22l19-11L16.5 7.5zM2.8 3.6L16.2 17l4.3-4.3L2.8 3.6z" />
              </svg>
              <div className="text-left">
                <p className="text-[9px] uppercase leading-none text-paper/70 tracking-wide">Get it on</p>
                <p className="text-sm font-semibold leading-tight">Google Play</p>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-2.5 rounded-xl bg-ink px-4 py-2 text-paper transition-all hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M16.4 14.5c-.1-3.2 2.6-4.8 2.7-4.8-1.5-2.2-3.8-2.5-4.6-2.6-2-.2-3.8 1.2-4.8 1.2-1 0-2.5-1.1-4.2-1.1-2.2 0-4.2 1.3-5.3 3.2-2.3 4-1.6 9.8.6 13 1.1 1.6 2.3 3.3 4 3.2 1.6-.1 2.3-1.1 4.2-1.1 1.9 0 2.5 1.1 4.2 1.1 1.7.1 2.8-1.7 3.8-3.3 1.2-1.7 1.7-3.4 1.7-3.5-.1-.1-2.2-.8-2.3-3.3zM14.9 5.3c.9-1 1.5-2.5 1.3-3.9-1.2.1-2.8.8-3.7 1.8-.8.9-1.4 2.4-1.2 3.8 1.4.1 2.8-.7 3.6-1.7z" />
              </svg>
              <div className="text-left">
                <p className="text-[9px] uppercase leading-none text-paper/70 tracking-wide">Download on the</p>
                <p className="text-sm font-semibold leading-tight">App Store</p>
              </div>
            </a>
          </div> */}
        </Container>
      </section>

      {/* Quick filters */}
      <section aria-label="দ্রুত ফিল্টার" className="border-b border-hairline bg-subtle">
        <Container className="py-4">
          <div className="flex flex-wrap gap-2.5">
            {QUICK_FILTERS.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="text-sm font-medium bg-white border border-hairline rounded-full px-4 py-2 text-ink/80 hover:border-primary hover:text-primary transition-colors"
              >
                {f.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <div className="grid lg:grid-cols-[1fr_340px] gap-10">
          {/* Main Content: Jobs */}
          <div className="space-y-16">
            {/* Latest jobs */}
            <section aria-labelledby="latest-heading">
              <SectionHeading
                eyebrow="সদ্য প্রকাশিত"
                title="নতুন সার্কুলার"
                href="/latest-jobs"
                linkLabel="সব দেখুন"
              />
              <div className="grid grid-cols-1 gap-4">
                {latestJobs.map((job) => (
                  <JobCard key={job.slug} job={job} />
                ))}
              </div>
            </section>

            {/* Closing soon */}
            <section aria-labelledby="closing-heading">
              <SectionHeading
                eyebrow="দ্রুত আবেদন করুন"
                title="শেষ হচ্ছে শীঘ্রই"
                href="/closing-soon"
                linkLabel="সব দেখুন"
              />
              <div className="grid grid-cols-1 gap-4">
                {closingSoonJobs.map((job) => (
                  <JobCard key={job.slug} job={job} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-10 lg:pl-4">
            {/* Exam notices */}
            <section aria-labelledby="notices-heading">
              <SectionHeading
                eyebrow="প্রবেশপত্র ও ফলাফল"
                title="পরীক্ষার নোটিশ"
                href="/exam-notices"
                linkLabel="সব দেখুন"
              />
              <div className="flex flex-col gap-3">
                {examNotices.slice(0, 5).map((n) => (
                  <Link
                    key={n.slug}
                    href={`/exam-notices/${n.slug}`}
                    className="block bg-white border border-hairline rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slateblue">
                      {n.type === "admit-card" ? "প্রবেশপত্র" : n.type === "result" ? "ফলাফল" : "সময়সূচি"}
                    </span>
                    <h3 className="font-display font-semibold text-ink mt-0.5 mb-1 leading-snug">{n.title}</h3>
                    <p className="text-xs text-ink/55">{n.organization} · {formatBanglaDate(n.publishDate)}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Categories */}
            <section aria-labelledby="categories-heading">
              <SectionHeading
                eyebrow="জনপ্রিয়"
                title="ক্যাটাগরি"
                href="/categories"
                linkLabel="সব দেখুন"
              />
              <div className="flex flex-col gap-3">
                {categoryCounts.map(({ category, count }) => (
                  <CategoryCard key={category.slug} category={category} count={count} />
                ))}
              </div>
            </section>
          </aside>
        </div>
        {/* Trust */}
        <TrustSection />

        {/* FAQ */}
        <section aria-labelledby="faq-heading">
          <SectionHeading eyebrow="সচরাচর জিজ্ঞাসা" title="প্রশ্নোত্তর" />
          <FaqAccordion items={FAQS} />
        </section>

        {/* CTA */}
        <section className="bg-primary rounded-card text-paper text-center py-10 px-6">
          <h2 className="font-display text-2xl font-semibold mb-2">সব সরকারি চাকরি ব্রাউজ করুন</h2>
          <p className="text-paper/80 mb-6 max-w-lg mx-auto">
            ক্যাটাগরি, এলাকা ও শিক্ষাগত যোগ্যতা অনুযায়ী ফিল্টার করে আপনার উপযুক্ত চাকরিটি খুঁজে নিন।
          </p>
          <Link
            href="/jobs"
            className="inline-block bg-gold hover:bg-gold-light text-ink font-semibold rounded-md px-7 py-3 transition-colors"
          >
            সব চাকরি দেখুন
          </Link>
        </section>
      </Container>
    </>
  );
}
