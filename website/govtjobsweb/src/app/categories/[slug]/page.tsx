import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { SealBadge } from "@/components/SealBadge";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getCategories, getCategoryBySlug, getJobsByCategory } from "@/lib/data";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};
  const title = `${category.name} নিয়োগ বিজ্ঞপ্তি`;
  const description = `${category.name} ক্যাটাগরির সব সরকারি চাকরির বিজ্ঞপ্তি একত্রে দেখুন। ${category.description.slice(0, 90)}…`;
  return {
    title,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const categoryJobs = await getJobsByCategory(category.slug);

  const faqs = [
    {
      question: `${category.name} ক্যাটাগরিতে কতটি বিজ্ঞপ্তি সক্রিয় আছে?`,
      answer: `বর্তমানে ${category.name} ক্যাটাগরিতে ${categoryJobs.length}টি সক্রিয় নিয়োগ বিজ্ঞপ্তি তালিকাভুক্ত আছে। নতুন বিজ্ঞপ্তি প্রকাশের সাথে সাথে এই তালিকা হালনাগাদ হয়।`,
    },
    {
      question: `${category.name} সংক্রান্ত চাকরির আবেদন কোথায় করব?`,
      answer:
        "প্রতিটি বিজ্ঞপ্তির বিস্তারিত পাতায় সরাসরি মূল অফিসিয়াল সূত্রের লিংক দেওয়া থাকে, যেখান থেকে নির্ভুলভাবে আবেদন করা যাবে।",
    },
  ];

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { label: "হোম", href: "/" },
          { label: "ক্যাটাগরি", href: "/categories" },
          { label: category.name, href: `/categories/${category.slug}` },
        ]}
      />

      <div className="flex items-center gap-3 mt-3 mb-3">
        <SealBadge size={40} />
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
          {category.name} নিয়োগ বিজ্ঞপ্তি
        </h1>
      </div>
      <p className="text-ink/70 max-w-2xl leading-relaxed mb-8">{category.description}</p>

      {categoryJobs.length === 0 ? (
        <div className="bg-white border border-hairline rounded-card p-10 text-center mb-10">
          <p className="font-display text-lg font-semibold text-ink mb-1">
            এই মুহূর্তে {category.name} ক্যাটাগরিতে কোনো সক্রিয় বিজ্ঞপ্তি নেই
          </p>
          <p className="text-sm text-ink/60">নতুন বিজ্ঞপ্তি প্রকাশিত হলে এখানে দেখানো হবে।</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {categoryJobs.map((job) => (
            <JobCard key={job.slug} job={job} />
          ))}
        </div>
      )}

      <section>
        <h2 className="font-display text-lg font-semibold text-ink mb-3">সচরাচর জিজ্ঞাসা</h2>
        <FaqAccordion items={faqs} />
      </section>
    </Container>
  );
}
