import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { getClosingSoonJobs } from "@/lib/data";

export const metadata: Metadata = {
  title: "শেষ হচ্ছে শীঘ্রই এমন সরকারি চাকরি",
  description:
    "আবেদনের শেষ তারিখ ঘনিয়ে আসা সরকারি চাকরির বিজ্ঞপ্তির তালিকা। শেষ মুহূর্তে সুযোগ মিস করতে না চাইলে এই তালিকা নিয়মিত দেখুন।",
  alternates: { canonical: "/closing-soon" },
};

export default async function ClosingSoonPage() {
  const jobs = await getClosingSoonJobs(undefined, 30);

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "হোম", href: "/" }, { label: "শেষ হচ্ছে শীঘ্রই", href: "/closing-soon" }]} />
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mt-3 mb-2">
        শেষ হচ্ছে শীঘ্রই
      </h1>
      <p className="text-ink/65 max-w-2xl mb-8">
        নিচের বিজ্ঞপ্তিগুলোর আবেদনের শেষ তারিখ আগামী ৩০ দিনের মধ্যে। শেষ তারিখ অনুযায়ী সাজানো — যেগুলোর
        সময় সবচেয়ে কম বাকি, সেগুলো আগে দেখানো হয়েছে।
      </p>
      {jobs.length === 0 ? (
        <p className="text-ink/60">এই মুহূর্তে শীঘ্রই শেষ হচ্ছে এমন কোনো বিজ্ঞপ্তি নেই।</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.slug} job={job} />
          ))}
        </div>
      )}
    </Container>
  );
}
