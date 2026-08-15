import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SealBadge } from "@/components/SealBadge";

interface SearchParams {
    url?: string;
    title?: string;
    applyUrl?: string;
}

export const metadata: Metadata = {
    title: "সার্কুলার PDF",
    description: "চাকরির অফিসিয়াল বিজ্ঞপ্তির প্রিভিউ, ডাউনলোড এবং অফিসিয়াল সোর্স লিংক।",
    alternates: { canonical: "/pdf" },
};

export default function PdfPage({ searchParams }: { searchParams: SearchParams }) {
    const url = searchParams.url?.trim();
    const title = searchParams.title?.trim() || "চাকরির বিজ্ঞপ্তি";
    if (!url) notFound();
    const downloadUrl = url;

    return (
        <Container className="py-8">
            <Breadcrumbs items={[{ label: "হোম", href: "/" }, { label: "PDF", href: "/pdf" }]} />

            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
                <section>
                    <div className="mb-4 rounded-[22px] border border-[#dbe6df] bg-white p-5 shadow-card">
                        <div className="flex items-center gap-3">
                            <SealBadge size={42} />
                            <div>
                                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary/70">অফিসিয়াল সার্কুলার</p>
                                <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <a href={downloadUrl} download className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-paper">
                                PDF ডাউনলোড
                            </a>
                            <a href={downloadUrl} target="_blank" rel="noopener noreferrer nofollow" className="rounded-md border border-primary/20 bg-white px-5 py-3 text-sm font-semibold text-primary">
                                নতুন ট্যাবে খুলুন
                            </a>
                            {searchParams.applyUrl ? (
                                <a href={searchParams.applyUrl} target="_blank" rel="noopener noreferrer nofollow" className="rounded-md bg-[#0a4b39] px-5 py-3 text-sm font-semibold text-paper">
                                    আবেদন / সোর্স
                                </a>
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-[22px] border border-[#dbe6df] bg-white p-4 shadow-card">
                        <div className="aspect-[210/297] overflow-hidden rounded-xl border border-[#edf1ee] bg-[#f4f7f5]">
                            <iframe
                                title={title}
                                src={`/api/pdf?url=${encodeURIComponent(downloadUrl)}`}
                                className="h-full w-full"
                            />
                        </div>
                    </div>
                </section>

                <aside className="h-fit space-y-4 lg:sticky lg:top-24">
                    <div className="rounded-card border border-hairline bg-white p-5">
                        <h2 className="font-display text-lg font-semibold text-ink mb-3">দ্রুত তথ্য</h2>
                        <p className="text-sm text-ink/65 leading-relaxed">
                            এখানে বিজ্ঞপ্তির পূর্ণাঙ্গ PDF প্রিভিউ দেখুন, ডাউনলোড করুন, এবং অফিসিয়াল উৎসে যান।
                        </p>
                    </div>
                    <Link href="/jobs" className="block rounded-card border border-hairline bg-white p-5 hover:border-primary/40">
                        <p className="text-xs text-ink/55 mb-1">আরও চাকরি</p>
                        <p className="font-display font-semibold text-primary">সব সরকারি চাকরি ব্রাউজ করুন →</p>
                    </Link>
                </aside>
            </div>
        </Container>
    );
}
