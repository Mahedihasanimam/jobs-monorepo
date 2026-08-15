import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SealBadge } from "@/components/SealBadge";
import { getAllNoticeSlugs, getJobBySlug, getNoticeBySlug } from "@/lib/data";
import { formatBanglaDate } from "@/lib/utils";



const TYPE_LABEL: Record<string, string> = {
  "admit-card": "প্রবেশপত্র প্রকাশ",
  result: "ফলাফল প্রকাশ",
  schedule: "সময়সূচি প্রকাশ",
};

export async function generateStaticParams() {
  const slugs = await getAllNoticeSlugs();
  return slugs;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const notice = await getNoticeBySlug(params.slug);
  if (!notice) return {};
  return {
    title: notice.title,
    description: notice.summary,
    alternates: { canonical: `/exam-notices/${notice.slug}` },
  };
}

export default async function ExamNoticeDetailPage({ params }: { params: { slug: string } }) {
  console.log("Loading notice for slug:", params.slug);
  const notice = await getNoticeBySlug(params.slug);
  console.log("Notice found:", notice ? notice.title : "NULL");
  if (!notice) notFound();

  const relatedJob = notice.relatedJobSlug ? await getJobBySlug(notice.relatedJobSlug) : undefined;

  return (
    <Container className="py-8 max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "হোম", href: "/" },
          { label: "পরীক্ষার নোটিশ", href: "/exam-notices" },
          { label: notice.title, href: `/exam-notices/${notice.slug}` },
        ]}
      />

      <div className="flex items-center gap-3 mt-4 mb-3">
        <SealBadge size={36} />
        <span className="text-xs font-mono uppercase tracking-wide text-slateblue">
          {TYPE_LABEL[notice.type]}
        </span>
      </div>

      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-2 leading-snug">
        {notice.title}
      </h1>
      <p className="text-primary font-semibold mb-1">{notice.organization}</p>
      <p className="text-sm text-ink/50 font-mono mb-6">{formatBanglaDate(notice.publishDate)}</p>

      <p className="text-ink/75 leading-relaxed mb-8">{notice.summary}</p>

      <section className="mb-8 rounded-card border border-[#dbe6df] bg-white p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <SealBadge size={26} />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold text-ink mb-1">অফিসিয়াল নোটিশ</h2>
            <p className="text-sm text-ink/65 mb-4">
              নিচের বাটন থেকে বিজ্ঞপ্তির প্রিভিউ দেখুন, ডাউনলোড করুন, অথবা অফিসিয়াল সোর্সে যান।
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/pdf?url=${encodeURIComponent(notice.circularUrl || notice.sourceUrl)}&title=${encodeURIComponent(notice.title)}`}
                className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-paper"
              >
                ফুলস্ক্রিন PDF
              </Link>
              <a
                href={notice.circularUrl || notice.sourceUrl}
                target="_blank"
                download
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-5 py-3 text-sm font-semibold text-primary"
              >
                PDF ডাউনলোড
              </a>
              <a
                href={notice.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center rounded-md border border-hairline bg-white px-5 py-3 text-sm font-semibold text-ink shadow-sm hover:border-primary/40"
              >
                অফিসিয়াল ওয়েবসাইট ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">নোটিশের প্রিভিউ</h2>
        <div className="rounded-[22px] border border-[#dbe6df] bg-white p-4 shadow-card">
          <div className="aspect-[210/297] w-full overflow-hidden rounded-xl border border-[#edf1ee] bg-[#f4f7f5]">
            <iframe
              title={notice.title}
              src={`/api/pdf?url=${encodeURIComponent(notice.circularUrl || notice.sourceUrl)}`}
              className="h-full w-full"
              style={{ border: "none" }}
            />
          </div>
        </div>
      </section>

      {relatedJob && (
        <a
          href={`/jobs/${relatedJob.slug}`}
          className="block bg-white border border-hairline rounded-card p-5 hover:border-primary/40"
        >
          <p className="text-xs text-ink/55 mb-1">সংশ্লিষ্ট চাকরির বিজ্ঞপ্তি</p>
          <p className="font-display font-semibold text-primary">{relatedJob.title} — {relatedJob.organization} →</p>
        </a>
      )}
    </Container>
  );
}
