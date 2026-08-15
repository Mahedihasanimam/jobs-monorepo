export type EmploymentType = "স্থায়ী" | "অস্থায়ী" | "চুক্তিভিত্তিক" | "প্রশিক্ষণার্থী";

export type EducationLevel =
  | "এসএসসি"
  | "এইচএসসি"
  | "ডিপ্লোমা"
  | "স্নাতক"
  | "স্নাতকোত্তর";

export interface Category {
  slug: string;
  name: string; // Bangla
  nameEn: string;
  description: string; // long-form, category-specific copy
  icon: string; // simple text/emoji-free identifier used by SealBadge variants
}

export interface Job {
  slug: string;
  title: string;
  titleEn: string;
  organization: string;
  logoUrl?: string;
  categorySlug: string;
  location: string;
  educationLevel: EducationLevel;
  employmentType: EmploymentType;
  vacancies: number;
  circularNo: string;
  publishDate: string; // ISO
  deadline: string; // ISO
  applyMethod: string;
  sourceUrl: string;
  sourceName: string;
  summary: string;
  ageLimit: string;
  salaryRange: string;
  applicationFee: string;
  circularUrl?: string;
  applyUrl?: string;
  educationFull?: string;
  experience?: string;
  eligibleApplicants?: string;
}

export type NoticeType = "admit-card" | "result" | "schedule";

export interface ExamNotice {
  slug: string;
  title: string;
  organization: string;
  type: NoticeType;
  publishDate: string;
  relatedJobSlug?: string;
  summary: string;
  sourceUrl: string;
  circularUrl?: string;
}
