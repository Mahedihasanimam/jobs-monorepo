import Image from "next/image";
import Link from "next/link";
import { Job } from "@/lib/types";
import { formatBanglaDate, daysUntil } from "@/lib/utils";
import { SaveCircularButton } from "@/components/SaveCircularButton";

export function JobCard({ job }: { job: Job }) {
  const remaining = daysUntil(job.deadline);
  const urgent = remaining >= 0 && remaining <= 7;

  return (
    <article className="group relative overflow-hidden rounded-[18px] border border-[#dfe7e0] bg-[#fbfcfa] p-4 transition-all hover:border-[#bfd2c6] hover:bg-white md:p-5">
      <Link
        href={`/jobs/${job.slug}`}
        aria-label={`${job.title} - ${job.organization} বিস্তারিত দেখুন`}
        className="absolute inset-0 z-10"
      />

      <div className="relative z-20 mb-3 flex items-center justify-between gap-3 border-b border-[#edf1ee] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dfe7e0] bg-[#eef5f0]">
            <Image
              src={job.logoUrl || "/govt-emblem.png"}
              alt={`${job.organization} লোগো`}
              width={36}
              height={36}
              className="h-8 w-8 object-contain"
            />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-ink/45">Official source</p>
            <p className="text-xs font-semibold text-primary">{job.sourceName}</p>
          </div>
        </div>

        {urgent && (
          <span className="shrink-0 rounded-full border border-[#d7b46a] bg-[#faf1dd] px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.08em] text-[#8c6a1d]">
            {remaining === 0 ? "আজই শেষ দিন" : `বাকি ${remaining} দিন`}
          </span>
        )}
      </div>

      <div className="relative z-20 space-y-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-display text-[1.15rem] font-bold leading-snug text-ink group-hover:text-primary md:text-[1.3rem] break-words">
              {job.title}
            </h3>
            <p className="text-sm font-semibold text-ink/70">{job.organization}</p>
          </div>
          <span className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-primary">
            {job.circularNo}
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-ink/68 break-words">{job.summary}</p>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-ink/70 md:grid-cols-4">
          <div className="rounded-lg bg-[#f2f6f3] p-2.5">
            <dt className="text-[9px] uppercase tracking-[0.12em] text-ink/45">এলাকা</dt>
            <dd className="mt-1 font-medium text-ink">{job.location}</dd>
          </div>
          <div className="rounded-lg bg-[#f2f6f3] p-2.5">
            <dt className="text-[9px] uppercase tracking-[0.12em] text-ink/45">যোগ্যতা</dt>
            <dd className="mt-1 font-medium text-ink">{job.educationLevel}</dd>
          </div>
          <div className="rounded-lg bg-[#f2f6f3] p-2.5">
            <dt className="text-[9px] uppercase tracking-[0.12em] text-ink/45">পদ</dt>
            <dd className="mt-1 font-medium text-ink">{job.vacancies}টি</dd>
          </div>
          <div className="rounded-lg bg-[#f2f6f3] p-2.5">
            <dt className="text-[9px] uppercase tracking-[0.12em] text-ink/45">ধরন</dt>
            <dd className="mt-1 font-medium text-ink">{job.employmentType}</dd>
          </div>
        </div>

        <div className="grid gap-2 rounded-xl border border-[#edf1ee] bg-[#f8faf8] p-3 text-xs text-ink/65 sm:grid-cols-3">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-ink/45">বেতন স্কেল</p>
            <p className="mt-1 font-semibold text-ink">{job.salaryRange}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-ink/45">আবেদন ফি</p>
            <p className="mt-1 font-semibold text-ink">{job.applicationFee}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-ink/45">শেষ তারিখ</p>
            <p className="mt-1 font-semibold text-primary">{formatBanglaDate(job.deadline)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#edf1ee] pt-3 text-xs text-ink/60">
          <span>প্রকাশ: {formatBanglaDate(job.publishDate)}</span>
          <span className="font-semibold text-primary">শেষ: {formatBanglaDate(job.deadline)}</span>
        </div>

        <div className="relative z-20 flex items-center justify-between gap-3 pt-1">
          <Link
            href={`/jobs/${job.slug}`}
            className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
          >
            বিস্তারিত দেখুন →
          </Link>
          <SaveCircularButton job={job} compact />
        </div>
      </div>
    </article>
  );
}
