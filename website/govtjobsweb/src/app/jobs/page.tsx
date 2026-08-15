import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FilterBar } from "@/components/FilterBar";
import { JobCard } from "@/components/JobCard";
import { getJobsPaginated } from "@/lib/data";

export const metadata: Metadata = {
  title: "সব সরকারি চাকরির বিজ্ঞপ্তি",
  description:
    "পদের নাম, প্রতিষ্ঠান, ক্যাটাগরি, এলাকা ও শিক্ষাগত যোগ্যতা অনুযায়ী ফিল্টার করে বাংলাদেশের সব সরকারি চাকরির বিজ্ঞপ্তি খুঁজুন।",
  alternates: { canonical: "/jobs" },
};

interface SearchParams {
  q?: string;
  category?: string;
  location?: string;
  education?: string;
  type?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 9;

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, category, location, education, type, sort } = searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const { jobs: pageJobs, total: totalItems } = await getJobsPaginated({
    q,
    category,
    location,
    education,
    type,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "হোম", href: "/" }, { label: "সব চাকরি", href: "/jobs" }]} />

      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mt-3 mb-1">
        সব সরকারি চাকরির বিজ্ঞপ্তি
      </h1>
      <p className="text-sm text-ink/60 mb-6">
        মোট {totalItems}টি বিজ্ঞপ্তি পাওয়া গেছে {q && `— "${q}" অনুসন্ধানে`}
      </p>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <aside>
          <FilterBar defaults={{ q, category, location, education, type, sort }} />
        </aside>

        <div>
          {pageJobs.length === 0 ? (
            <div className="bg-white border border-hairline rounded-card p-10 text-center">
              <p className="font-display text-lg font-semibold text-ink mb-1">কোনো বিজ্ঞপ্তি পাওয়া যায়নি</p>
              <p className="text-sm text-ink/60">অনুগ্রহ করে ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {pageJobs.map((job) => (
                  <JobCard key={job.slug} job={job} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  aria-label="পৃষ্ঠা নেভিগেশন"
                  className="flex items-center justify-center gap-2 mt-8"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const params = new URLSearchParams();
                    if (q) params.set("q", q);
                    if (category) params.set("category", category);
                    if (location) params.set("location", location);
                    if (education) params.set("education", education);
                    if (type) params.set("type", type);
                    if (sort) params.set("sort", sort);
                    if (p > 1) params.set("page", String(p));
                    const href = `/jobs${params.toString() ? `?${params.toString()}` : ""}`;
                    return (
                      <a
                        key={p}
                        href={href}
                        aria-current={p === page ? "page" : undefined}
                        className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-mono border ${
                          p === page
                            ? "bg-primary text-paper border-primary"
                            : "bg-white text-ink/70 border-hairline hover:border-primary"
                        }`}
                      >
                        {p}
                      </a>
                    );
                  })}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
