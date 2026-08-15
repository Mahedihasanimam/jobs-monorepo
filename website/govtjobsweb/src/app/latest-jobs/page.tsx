import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { getLatestJobs } from "@/lib/data";

export const metadata: Metadata = {
  title: "নতুন সরকারি চাকরির সার্কুলার",
  description:
    "বাংলাদেশে সদ্য প্রকাশিত সরকারি চাকরির সার্কুলার ও নিয়োগ বিজ্ঞপ্তি প্রকাশের তারিখ অনুযায়ী তালিকাভুক্ত। প্রতিদিনের নতুন সরকারি চাকরির খবর এখানে পাবেন।",
  alternates: { canonical: "/latest-jobs" },
};

export default async function LatestJobsPage() {
  const jobs = await getLatestJobs();

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "হোম", href: "/" }, { label: "নতুন সার্কুলার", href: "/latest-jobs" }]} />
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mt-3 mb-2">
        নতুন সার্কুলার
      </h1>
      <p className="text-ink/65 max-w-2xl mb-8">
        সবচেয়ে সাম্প্রতিক প্রকাশিত সরকারি চাকরির বিজ্ঞপ্তি — প্রকাশের তারিখ অনুযায়ী নতুন থেকে পুরনো ক্রমে।
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobCard key={job.slug} job={job} />
        ))}
      </div>
    </Container>
  );
}
