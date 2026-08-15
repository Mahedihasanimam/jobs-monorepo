import Link from "next/link";
import { Category } from "@/lib/types";
import { SealBadge } from "./SealBadge";

export function CategoryCard({ category, count }: { category: Category; count: number }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex items-center gap-3.5 bg-white border border-hairline rounded-card p-4 shadow-card hover:shadow-cardHover hover:border-primary/40 transition-all"
    >
      <SealBadge size={34} tone="green" />
      <div className="min-w-0">
        <p className="font-display font-semibold text-ink group-hover:text-primary truncate">
          {category.name}
        </p>
        <p className="text-xs text-ink/55 font-mono">{count}টি বিজ্ঞপ্তি</p>
      </div>
    </Link>
  );
}
