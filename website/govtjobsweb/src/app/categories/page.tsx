import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryCard } from "@/components/CategoryCard";
import { getCategories, getJobsByCategory } from "@/lib/data";

export const metadata: Metadata = {
  title: "চাকরির ক্যাটাগরি",
  description:
    "রেলওয়ে, ব্যাংক, শিক্ষা, স্বাস্থ্য, প্রতিরক্ষা ও অন্যান্য ক্যাটাগরি অনুযায়ী বাংলাদেশের সরকারি চাকরির বিজ্ঞপ্তি ব্রাউজ করুন।",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => ({
      category,
      count: (await getJobsByCategory(category.slug)).length,
    })),
  );

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "হোম", href: "/" }, { label: "ক্যাটাগরি", href: "/categories" }]} />
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mt-3 mb-2">
        ক্যাটাগরি অনুযায়ী চাকরি খুঁজুন
      </h1>
      <p className="text-ink/65 max-w-2xl mb-8">
        প্রতিটি ক্যাটাগরির নিজস্ব পাতায় সংশ্লিষ্ট দপ্তরের সব সরকারি চাকরির বিজ্ঞপ্তি একত্রে পাবেন।
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesWithCounts.map(({ category, count }) => (
          <CategoryCard key={category.slug} category={category} count={count} />
        ))}
      </div>
    </Container>
  );
}
