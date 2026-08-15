import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SealBadge } from "@/components/SealBadge";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে",
  description:
    "বিডি সরকারি চাকরি কীভাবে কাজ করে এবং কেন বাংলাদেশের সরকারি চাকরিপ্রার্থীদের জন্য এটি একটি নির্ভরযোগ্য তথ্যভাণ্ডার, তা জানুন।",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Container className="py-8 max-w-2xl">
      <Breadcrumbs items={[{ label: "হোম", href: "/" }, { label: "আমাদের সম্পর্কে", href: "/about" }]} />

      <div className="flex items-center gap-3 mt-4 mb-4">
        <SealBadge size={40} />
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">আমাদের সম্পর্কে</h1>
      </div>

      <div className="prose-like space-y-5 text-ink/75 leading-relaxed">
        <p>
          বিডি সরকারি চাকরি একটি স্বাধীন তথ্য সংকলক (aggregator) প্ল্যাটফর্ম, যার লক্ষ্য বাংলাদেশের
          বিভিন্ন সরকারি দপ্তর, মন্ত্রণালয়, ব্যাংক ও প্রতিষ্ঠানের প্রকাশিত নিয়োগ বিজ্ঞপ্তি একত্রে,
          সহজবোধ্য ও সুশৃঙ্খলভাবে উপস্থাপন করা।
        </p>
        <p>
          প্রতিদিন শত শত সরকারি বিজ্ঞপ্তি বিভিন্ন ওয়েবসাইট ও পত্রিকায় প্রকাশিত হয় — যা খুঁজে বের করা
          সময়সাপেক্ষ ও কষ্টসাধ্য। আমরা এই তথ্যগুলো একত্র করে, ক্যাটাগরি ও শিক্ষাগত যোগ্যতা অনুযায়ী
          সাজিয়ে উপস্থাপন করি, যাতে চাকরিপ্রার্থীরা কম সময়ে সঠিক তথ্য খুঁজে পান।
        </p>
        <h2 className="font-display text-xl font-semibold text-ink pt-2">আমরা কী করি না</h2>
        <p>
          আমরা কোনো নিয়োগ প্রক্রিয়া পরিচালনা করি না, কোনো ফি সংগ্রহ করি না, এবং কোনো সরকারি দপ্তরের
          প্রতিনিধিত্ব করি না। প্রতিটি বিজ্ঞপ্তির বিস্তারিত পাতায় মূল অফিসিয়াল সূত্রের লিংক দেওয়া থাকে —
          চূড়ান্ত আবেদন সবসময় সেই মূল সূত্র থেকেই করতে হবে।
        </p>
        <h2 className="font-display text-xl font-semibold text-ink pt-2">তথ্যের নির্ভুলতা</h2>
        <p>
          আমরা প্রতিটি বিজ্ঞপ্তি প্রকাশের আগে যথাসাধ্য যাচাই করি, তবে যেকোনো গুরুত্বপূর্ণ সিদ্ধান্তের
          আগে — বিশেষ করে আবেদনের শেষ তারিখ ও যোগ্যতার শর্ত — সরাসরি অফিসিয়াল বিজ্ঞপ্তি পত্র দেখে
          নিশ্চিত হওয়ার অনুরোধ থাকবে।
        </p>
      </div>
    </Container>
  );
}
