"use client";

import { useEffect, useState } from "react";
import { Job } from "@/lib/types";

const STORAGE_KEY = "govtjobs_saved_circulars";

export function SaveCircularButton({ job, compact = false }: { job: Job; compact?: boolean }) {
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            const savedIds = raw ? (JSON.parse(raw) as string[]) : [];
            setSaved(savedIds.includes(job.slug));
        } catch {
            setSaved(false);
        }
    }, [job.slug]);

    const toggle = () => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            const current = raw ? (JSON.parse(raw) as string[]) : [];
            const next = current.includes(job.slug)
                ? current.filter((slug) => slug !== job.slug)
                : [...current, job.slug];

            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            setSaved(next.includes(job.slug));
        } catch {
            // localStorage may be unavailable in some restricted contexts
        }
    };

    return (
        <button
            type="button"
            onClick={toggle}
            className={[
                "inline-flex items-center justify-center rounded-md border font-medium transition-colors",
                compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
                saved
                    ? "border-primary bg-primary text-paper"
                    : "border-hairline bg-white text-ink hover:border-primary hover:text-primary",
            ].join(" ")}
            aria-label={saved ? "এই সার্কুলার সংরক্ষণ থেকে সরান" : "এই সার্কুলার সংরক্ষণ করুন"}
        >
            {saved ? "সংরক্ষিত" : "সংরক্ষণ করুন"}
        </button>
    );
}
