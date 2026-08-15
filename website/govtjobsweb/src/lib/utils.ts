import { Job } from "./types";

const REFERENCE_NOW = new Date("2026-08-15T00:00:00Z").getTime();

export function formatBanglaDate(iso: string): string {
  const months = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  ];
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const d = new Date(iso);
  const toBn = (n: number) =>
    String(n)
      .split("")
      .map((c) => banglaDigits[Number(c)])
      .join("");
  return `${toBn(d.getDate())} ${months[d.getMonth()]} ${toBn(d.getFullYear())}`;
}

export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  return Math.ceil((target - REFERENCE_NOW) / (1000 * 60 * 60 * 24));
}

export function isClosingSoon(job: Job, withinDays = 7): boolean {
  const d = daysUntil(job.deadline);
  return d >= 0 && d <= withinDays;
}

export function isExpired(job: Job): boolean {
  return daysUntil(job.deadline) < 0;
}

export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function addDaysISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
