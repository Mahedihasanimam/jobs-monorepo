import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি",
  description: "বিডি সরকারি চাকরি কীভাবে দর্শনার্থীদের তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করে, তার বিস্তারিত।",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <Container className="py-8 max-w-2xl">
      <Breadcrumbs items={[{ label: "হোম", href: "/" }, { label: "গোপনীয়তা নীতি", href: "/privacy-policy" }]} />
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mt-4 mb-2">গোপনীয়তা নীতি</h1>
      <p className="text-xs text-ink/50 font-mono mb-8">সর্বশেষ হালনাগাদ: ১৫ আগস্ট ২০২৬</p>

      <div className="space-y-6 text-ink/75 leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">১. আমরা কী তথ্য সংগ্রহ করি</h2>
          <p>
            আমরা সাধারণত ওয়েবসাইট ব্যবহারের পরিসংখ্যান (যেমন কোন পাতাগুলো বেশি দেখা হয়েছে) এবং যোগাযোগ
            ফর্মের মাধ্যমে স্বেচ্ছায় প্রদত্ত তথ্য (নাম, ইমেইল, বার্তা) সংগ্রহ করি।
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">২. তথ্যের ব্যবহার</h2>
          <p>
            সংগৃহীত তথ্য শুধুমাত্র ওয়েবসাইটের মান উন্নয়ন, আপনার প্রশ্নের উত্তর দেওয়া এবং প্রাসঙ্গিক
            তথ্য প্রদানের জন্য ব্যবহৃত হয়। আমরা কোনো তৃতীয় পক্ষের কাছে ব্যক্তিগত তথ্য বিক্রি করি না।
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">৩. কুকি (Cookies)</h2>
          <p>
            ওয়েবসাইটের কার্যকারিতা ও ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে সীমিত পরিসরে কুকি ব্যবহার করা
            হতে পারে। আপনি চাইলে ব্রাউজার সেটিংস থেকে কুকি নিষ্ক্রিয় করতে পারেন।
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">৪. বহিরাগত লিংক</h2>
          <p>
            আমাদের ওয়েবসাইটে বিভিন্ন সরকারি দপ্তরের অফিসিয়াল ওয়েবসাইটের লিংক দেওয়া থাকে। সেসব
            ওয়েবসাইটের গোপনীয়তা নীতির জন্য আমরা দায়ী নই।
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">৫. যোগাযোগ</h2>
          <p>এই নীতি সম্পর্কে কোনো প্রশ্ন থাকলে info@bdsorkarichakri.com ঠিকানায় যোগাযোগ করুন।</p>
        </section>
      </div>
    </Container>
  );
}
