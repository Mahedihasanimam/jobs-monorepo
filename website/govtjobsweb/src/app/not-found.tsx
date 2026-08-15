import Link from "next/link";
import { Container } from "@/components/Container";
import { SealBadge } from "@/components/SealBadge";

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <SealBadge size={56} className="mx-auto mb-5" />
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-2">
        পাতাটি খুঁজে পাওয়া যায়নি
      </h1>
      <p className="text-ink/60 mb-6">
        যে পাতাটি খুঁজছেন সেটি সরানো হয়েছে অথবা এই ঠিকানায় নেই।
      </p>
      <Link
        href="/jobs"
        className="inline-block bg-primary hover:bg-primary-dark text-paper font-semibold rounded-md px-6 py-3 transition-colors"
      >
        সব চাকরি দেখুন
      </Link>
    </Container>
  );
}
