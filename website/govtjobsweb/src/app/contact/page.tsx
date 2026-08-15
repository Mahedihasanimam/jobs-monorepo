import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "যোগাযোগ",
  description: "ভুল তথ্য সংশোধন, মতামত বা প্রশ্নের জন্য বিডি সরকারি চাকরির সাথে যোগাযোগ করুন।",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Container className="py-8 max-w-2xl">
      <Breadcrumbs items={[{ label: "হোম", href: "/" }, { label: "যোগাযোগ", href: "/contact" }]} />

      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mt-4 mb-3">যোগাযোগ</h1>
      <p className="text-ink/70 leading-relaxed mb-8">
        কোনো বিজ্ঞপ্তিতে ভুল তথ্য চোখে পড়লে, সংশোধনের অনুরোধ বা যেকোনো মতামত জানাতে নিচের মাধ্যমে
        যোগাযোগ করুন। সাধারণত ১-২ কার্যদিবসের মধ্যে উত্তর দেওয়া হয়।
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-hairline rounded-card p-5">
          <h2 className="text-xs font-mono uppercase tracking-wide text-ink/50 mb-1.5">ইমেইল</h2>
          <a href="mailto:info@bdsorkarichakri.com" className="text-primary font-semibold hover:underline">
            info@bdsorkarichakri.com
          </a>
        </div>
        <div className="bg-white border border-hairline rounded-card p-5">
          <h2 className="text-xs font-mono uppercase tracking-wide text-ink/50 mb-1.5">প্রতিক্রিয়ার সময়</h2>
          <p className="text-ink font-semibold">১-২ কার্যদিবস</p>
        </div>
      </div>

      <form className="bg-white border border-hairline rounded-card p-5 space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wide text-ink/55 mb-1.5">
            নাম
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-hairline px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wide text-ink/55 mb-1.5">
            ইমেইল
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-hairline px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-xs font-mono uppercase tracking-wide text-ink/55 mb-1.5">
            বার্তা
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="w-full rounded-md border border-hairline px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          />
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-paper font-semibold rounded-md px-6 py-2.5 text-sm transition-colors"
        >
          বার্তা পাঠান
        </button>
        <p className="text-xs text-ink/45">
          এই ফর্মটি একটি ডেমো — প্রোডাকশনে যুক্ত করার আগে এটিকে আপনার ইমেইল বা ফর্ম-হ্যান্ডলিং সার্ভিসের
          সাথে সংযুক্ত করতে হবে।
        </p>
      </form>
    </Container>
  );
}
