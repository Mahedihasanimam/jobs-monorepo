import { SealBadge } from "./SealBadge";

const POINTS = [
  {
    title: "যাচাইকৃত সূত্র",
    body: "প্রতিটি বিজ্ঞপ্তি প্রকাশের আগে সংশ্লিষ্ট দপ্তরের অফিসিয়াল ওয়েবসাইট বা বিজ্ঞপ্তি পত্র থেকে যাচাই করা হয়।",
  },
  {
    title: "মূল উৎসের লিংক",
    body: "প্রতিটি চাকরির বিস্তারিত পাতায় মূল সরকারি ওয়েবসাইট বা আবেদন লিংক সরাসরি দেওয়া থাকে।",
  },
  {
    title: "নিয়মিত হালনাগাদ",
    body: "নতুন সার্কুলার, প্রবেশপত্র ও ফলাফল প্রকাশের সাথে সাথে তালিকা প্রতিদিন হালনাগাদ করা হয়।",
  },
];

export function TrustSection() {
  return (
    <div className="bg-subtle border border-hairline rounded-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <SealBadge size={40} />
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            শুধু অফিসিয়াল সূত্রের তথ্য
          </h2>
          <p className="text-sm text-ink/60">আমরা কোনো তথ্য নিজে থেকে তৈরি করি না</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {POINTS.map((p) => (
          <div key={p.title}>
            <h3 className="font-semibold text-ink text-sm mb-1.5">{p.title}</h3>
            <p className="text-sm text-ink/65 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
