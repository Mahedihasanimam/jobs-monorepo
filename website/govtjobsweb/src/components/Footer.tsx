import Link from "next/link";
import { SealBadge } from "./SealBadge";
import { categories } from "@/lib/data";

export function Footer() {
  return (
    <footer className="bg-primary-dark text-paper/85 mt-16">
      <div className="container-page py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <SealBadge size={30} tone="paper" />
            <span className="font-display text-base font-bold text-paper">বাংলাদেশ সরকারি চাকরি</span>
          </div>
          <p className="text-sm text-paper/65 leading-relaxed">
            সরকারি vacancy, circulars, Notice and official notices are compiled in a clean, searchable format for quick access.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-paper mb-3 font-mono uppercase tracking-wide">
            দ্রুত লিংক
          </h3>
          <ul className="space-y-2 text-sm text-paper/70">
            <li><Link href="/jobs" className="hover:text-gold-light">সব চাকরি</Link></li>
            <li><Link href="/latest-jobs" className="hover:text-gold-light">নতুন সার্কুলার</Link></li>
            <li><Link href="/closing-soon" className="hover:text-gold-light">শেষ হচ্ছে শীঘ্রই</Link></li>
            <li><Link href="/exam-notices" className="hover:text-gold-light">পরীক্ষার নোটিশ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-paper mb-3 font-mono uppercase tracking-wide">
            জনপ্রিয় ক্যাটাগরি
          </h3>
          <ul className="space-y-2 text-sm text-paper/70">
            {categories.slice(0, 4).map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className="hover:text-gold-light">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-paper mb-3 font-mono uppercase tracking-wide">
            সাইট তথ্য
          </h3>
          <ul className="space-y-2 text-sm text-paper/70">
            <li><Link href="/about" className="hover:text-gold-light">আমাদের সম্পর্কে</Link></li>
            <li><Link href="/faq" className="hover:text-gold-light">সচরাচর জিজ্ঞাসা</Link></li>
            <li><Link href="/contact" className="hover:text-gold-light">যোগাযোগ</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-gold-light">গোপনীয়তা নীতি</Link></li>
            <li><Link href="/terms" className="hover:text-gold-light">শর্তাবলি</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-page py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-paper/55">
          <p>© ২০২৬ বাংলাদেশ সরকারি চাকরি। সব তথ্য অফিসিয়াল বিজ্ঞপ্তি ও দপ্তরীয় সূত্র থেকে সংগ্রহ করা হয়।</p>
          <p>আবেদনের আগে মূল বিজ্ঞপ্তি যাচাই করুন।</p>
        </div>
      </div>
    </footer>
  );
}
