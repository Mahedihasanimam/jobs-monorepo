"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { JobCard } from "@/components/JobCard";
import { fetchSavedJobs } from "./actions";
import { Job } from "@/lib/types";

const STORAGE_KEY = "govtjobs_saved_circulars";

export default function SavedPage() {
    const [savedJobs, setSavedJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadSavedJobs() {
            try {
                const raw = window.localStorage.getItem(STORAGE_KEY);
                const parsed = raw ? (JSON.parse(raw) as string[]) : [];
                if (parsed.length > 0) {
                    const jobs = await fetchSavedJobs(parsed);
                    setSavedJobs(jobs);
                }
            } catch {
                setSavedJobs([]);
            } finally {
                setIsLoading(false);
            }
        }
        loadSavedJobs();
    }, []);

    return (
        <Container className="py-8">
            <div className="mb-6">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary/70">সংরক্ষিত</p>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mt-2">
                    সংরক্ষিত সার্কুলার
                </h1>
            </div>

            {isLoading ? (
                <div className="bg-white border border-hairline rounded-card p-10 text-center shadow-card">
                    <p className="font-display text-xl font-semibold text-ink mb-2">লোড হচ্ছে...</p>
                </div>
            ) : savedJobs.length === 0 ? (
                <div className="bg-white border border-hairline rounded-card p-10 text-center shadow-card">
                    <p className="font-display text-xl font-semibold text-ink mb-2">কোনো সার্কুলার সংরক্ষিত নেই</p>
                    <p className="text-sm text-ink/65 mb-6">
                        আপনি যে চাকরিগুলো পছন্দ করেছেন, সেগুলো এখানে সংরক্ষণ হয়ে যাবে।
                    </p>
                    <Link
                        href="/jobs"
                        className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-paper"
                    >
                        চাকরি খুঁজুন
                    </Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedJobs.map((job) => (
                        <JobCard key={job.slug} job={job} />
                    ))}
                </div>
            )}
        </Container>
    );
}
