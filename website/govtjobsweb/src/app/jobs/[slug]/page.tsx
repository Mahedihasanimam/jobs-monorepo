import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { SealBadge } from "@/components/SealBadge";
import { getCategoryBySlug, getJobBySlug, getRelatedJobs, getAllJobSlugs } from "@/lib/data";
import { formatBanglaDate, isExpired } from "@/lib/utils";

const SITE_URL = "https://bdsorkarichakri.com";

export async function generateStaticParams() {
  const slugs = await getAllJobSlugs();
  return slugs;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);
  if (!job) return {};

  const title = `${job.title} — ${job.organization} নিয়োগ বিজ্ঞপ্তি ${new Date(job.publishDate).getFullYear()}`;
  const description = `${job.organization}-এ ${job.title} পদে নিয়োগ। শূন্য পদ ${job.vacancies}টি, শিক্ষাগত যোগ্যতা ${job.educationLevel}, আবেদনের শেষ তারিখ ${formatBanglaDate(job.deadline)}।`;

  return {
    title,
    description,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  const job = await getJobBySlug(params.slug);
  if (!job) notFound();

  const category = await getCategoryBySlug(job.categorySlug);
  const related = await getRelatedJobs(job);
  const expired = isExpired(job);
  const previewUrl = job.circularUrl || (job.sourceUrl.endsWith(".pdf") ? job.sourceUrl : `${job.sourceUrl.replace(/\/$/, "")}/circular.pdf`);
  const applyUrl = job.applyUrl || job.sourceUrl;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.titleEn,
    description: job.summary,
    identifier: {
      "@type": "PropertyValue",
      name: job.organization,
      value: job.circularNo,
    },
    datePosted: job.publishDate,
    validThrough: job.deadline,
    employmentType: job.employmentType === "স্থায়ী" ? "FULL_TIME" : "OTHER",
    hiringOrganization: {
      "@type": "Organization",
      name: job.organization,
      sameAs: job.sourceUrl,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "BD" },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "BDT",
      value: { "@type": "QuantitativeValue", value: job.salaryRange, unitText: "MONTH" },
    },
    totalJobOpenings: job.vacancies,
    directApply: false,
    url: `${SITE_URL}/jobs/${job.slug}`,
  };

  return (
    <Container className="py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs
        items={[
          { label: "হোম", href: "/" },
          { label: "সব চাকরি", href: "/jobs" },
          ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []),
          { label: job.title, href: `/jobs/${job.slug}` },
        ]}
      />

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 mt-4">
        <article>
          <header className="mb-6 overflow-hidden rounded-[22px] border border-[#dbe6df] bg-white shadow-card">
            <div className="flex items-start gap-4 border-b border-[#edf1ee] bg-[#f8fbf9] p-5 md:p-6">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-primary-soft">
                <SealBadge size={42} />
              </div>
              <div className="min-w-0 flex-1">
                {expired && (
                  <p className="mb-2 inline-flex rounded-full border border-ink/10 bg-ink/5 px-3 py-1 text-xs font-mono font-semibold text-ink/60">
                    আবেদনের সময়সীমা শেষ
                  </p>
                )}
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary/70">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                <h1 className="mt-2 font-display text-2xl font-bold leading-snug text-ink md:text-4xl">
                  {job.title}
                </h1>
                <p className="mt-2 text-lg font-semibold text-primary">{job.organization}</p>
                <p className="text-sm text-ink/55 font-mono">সার্কুলার নং: {job.circularNo}</p>
              </div>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-3 md:p-6">
              <MetaTile label="প্রকাশের তারিখ" value={formatBanglaDate(job.publishDate)} />
              <MetaTile label="শেষ তারিখ" value={formatBanglaDate(job.deadline)} emphasis />
              <MetaTile label="শূন্য পদ" value={`${job.vacancies}টি`} />
            </div>
          </header>

          <section className="mb-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-2">সংক্ষিপ্ত বিবরণ</h2>
            <p className="text-ink/75 leading-relaxed whitespace-pre-wrap">{job.summary}</p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-3">বিজ্ঞপ্তির বিস্তারিত তথ্য</h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 bg-white border border-hairline rounded-card p-5">
              <DetailRow label="প্রতিষ্ঠান" value={job.organization} />
              <DetailRow label="ক্যাটাগরি" value={category?.name ?? "—"} />
              <DetailRow label="কর্মস্থল" value={job.location} />
              <DetailRow label="পদের ধরন" value={job.employmentType} />
              <DetailRow label="শূন্য পদ" value={`${job.vacancies}টি`} />
              <DetailRow label="শিক্ষাগত যোগ্যতা" value={job.educationFull || job.educationLevel} />
              {job.experience ? <DetailRow label="অভিজ্ঞতা" value={job.experience} /> : null}
              <DetailRow label="বয়সসীমা" value={job.ageLimit} />
              <DetailRow label="বেতন স্কেল" value={job.salaryRange} />
              <DetailRow label="আবেদন ফি" value={job.applicationFee} />
              {job.eligibleApplicants ? <DetailRow label="কারা আবেদন করতে পারবেন" value={job.eligibleApplicants} /> : null}
              <DetailRow label="প্রকাশের তারিখ" value={formatBanglaDate(job.publishDate)} />
              <DetailRow label="আবেদনের শেষ তারিখ" value={formatBanglaDate(job.deadline)} emphasis />
            </dl>
          </section>

          <section className="mb-8 rounded-card border border-[#dbe6df] bg-white p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <SealBadge size={26} />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold text-ink mb-1">আবেদন ও অফিসিয়াল লিংক</h2>
                <p className="text-sm text-ink/65 mb-4">
                  নিচের বাটন থেকে বিজ্ঞপ্তির প্রিভিউ দেখুন, ডাউনলোড করুন, অথবা অফিসিয়াল সোর্সে যান।
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/pdf?url=${encodeURIComponent(previewUrl)}&title=${encodeURIComponent(job.title)}&applyUrl=${encodeURIComponent(applyUrl)}`}
                    className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-paper"
                  >
                    PDF প্রিভিউ
                  </Link>
                  <a
                    href={previewUrl}
                    download
                    className="inline-flex items-center rounded-md border border-primary/20 bg-white px-5 py-3 text-sm font-semibold text-primary"
                  >
                    PDF ডাউনলোড
                  </a>
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center rounded-md bg-[#0a4b39] px-5 py-3 text-sm font-semibold text-paper"
                  >
                    আবেদন / অফিসিয়াল সাইট
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8 bg-subtle border border-hairline rounded-card p-5 flex items-start gap-4">
            <SealBadge size={36} />
            <div>
              <h2 className="font-display font-semibold text-ink mb-1">মূল অফিসিয়াল সূত্র</h2>
              <p className="text-sm text-ink/65 mb-3">
                সম্পূর্ণ বিজ্ঞপ্তি ও আবেদন করতে অনুগ্রহ করে সরাসরি অফিসিয়াল ওয়েবসাইট দেখুন।
              </p>
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-block bg-primary hover:bg-primary-dark text-paper font-semibold rounded-md px-5 py-2.5 text-sm transition-colors"
              >
                {job.sourceName}-এ দেখুন ↗
              </a>
            </div>
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold text-ink mb-3">সম্পর্কিত চাকরি</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map((r) => (
                  <JobCard key={r.slug} job={r} />
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="bg-white border border-hairline rounded-card p-5">
            <h2 className="font-display font-semibold text-ink mb-3">দ্রুত তথ্য</h2>
            <ul className="text-sm text-ink/70 space-y-2">
              <li className="flex justify-between"><span>শেষ তারিখ</span><span className="font-semibold text-primary">{formatBanglaDate(job.deadline)}</span></li>
              <li className="flex justify-between"><span>শূন্য পদ</span><span className="font-semibold">{job.vacancies}</span></li>
              <li className="flex justify-between"><span>যোগ্যতা</span><span className="font-semibold">{job.educationLevel}</span></li>
              <li className="flex justify-between"><span>বেতন</span><span className="font-semibold">{job.salaryRange}</span></li>
            </ul>
          </div>

          <div className="bg-white border border-hairline rounded-card p-5">
            <h2 className="font-display font-semibold text-ink mb-3">করণীয়</h2>
            <div className="space-y-3">
              <a href={`/pdf?url=${encodeURIComponent(previewUrl)}&title=${encodeURIComponent(job.title)}`} className="block rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-paper">
                PDF দেখুন
              </a>
              <a href={previewUrl} download className="block rounded-md border border-primary/20 px-4 py-3 text-center text-sm font-semibold text-primary">
                ডাউনলোড করুন
              </a>
              <a href={applyUrl} target="_blank" rel="noopener noreferrer nofollow" className="block rounded-md bg-[#0a4b39] px-4 py-3 text-center text-sm font-semibold text-paper">
                আবেদন করুন
              </a>
            </div>
          </div>

          {category && (
            <Link
              href={`/categories/${category.slug}`}
              className="block bg-white border border-hairline rounded-card p-5 hover:border-primary/40"
            >
              <p className="text-xs text-ink/55 mb-1">আরও দেখুন</p>
              <p className="font-display font-semibold text-primary">{category.name} সম্পর্কিত সব চাকরি →</p>
            </Link>
          )}
        </aside>
      </div>
    </Container>
  );
}

function DetailRow({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-mono uppercase tracking-wide text-ink/50 mb-0.5">{label}</dt>
      <dd className={`text-sm ${emphasis ? "font-semibold text-primary" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

function MetaTile({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="rounded-xl border border-[#edf1ee] bg-[#f8fbf9] p-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-ink/45">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${emphasis ? "text-primary" : "text-ink"}`}>{value}</p>
    </div>
  );
}
