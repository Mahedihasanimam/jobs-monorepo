import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "শর্তাবলি",
  description: "বিডি সরকারি চাকরি ব্যবহারের শর্তাবলি এবং দায়বদ্ধতা সংক্রান্ত তথ্য।",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <Container className="py-8 max-w-2xl">
      <Breadcrumbs items={[{ label: "হোম", href: "/" }, { label: "শর্তাবলি", href: "/terms" }]} />
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mt-4 mb-2">শর্তাবলি</h1>
      <p className="text-xs text-ink/50 font-mono mb-8">সর্বশেষ হালনাগাদ: ১৫ আগস্ট ২০২৬</p>

      <div className="space-y-6 text-ink/75 leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">১. সেবার প্রকৃতি</h2>
          <p>
            বিডি সরকারি চাকরি একটি স্বাধীন তথ্য সংকলক (aggregator)। এটি কোনো সরকারি প্রতিষ্ঠান নয় এবং
            কোনো নিয়োগ প্রক্রিয়ায় সরাসরি সম্পৃক্ত নয়।
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">২. তথ্যের দায়বদ্ধতা</h2>
          <p>
            আমরা প্রতিটি বিজ্ঞপ্তি যথাসাধ্য যাচাই করে প্রকাশ করি, তবে কোনো অনিচ্ছাকৃত ভুল বা বিলম্বজনিত
            তথ্যের জন্য দায়বদ্ধ থাকব না। চূড়ান্ত সিদ্ধান্তের আগে সবসময় মূল অফিসিয়াল সূত্র যাচাই করুন।
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">৩. ব্যবহারকারীর দায়িত্ব</h2>
          <p>
            ওয়েবসাইট ব্যবহারকারীদের প্রত্যাশা করা হয় যে তারা প্রাপ্ত তথ্য যাচাই করে সিদ্ধান্ত নেবেন এবং
            আবেদন প্রক্রিয়ায় সংশ্লিষ্ট দপ্তরের নির্দেশনা অনুসরণ করবেন।
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">৪. কনটেন্টের পরিবর্তন</h2>
          <p>
            আমরা যেকোনো সময় ওয়েবসাইটের কনটেন্ট, বৈশিষ্ট্য বা এই শর্তাবলি পরিবর্তন করার অধিকার রাখি।
          </p>
        </section>
      </div>
    </Container>
  );
}
